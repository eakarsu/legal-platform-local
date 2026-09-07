const { openRouterFetch } = require('../../../../packages/ai-client/index.cjs');
const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const parseAIJson = require('../middleware/parseAIJson');

const router = express.Router();
router.use(authMiddleware);

function ensureKey(res) {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({ error: 'AI service not configured (missing OPENROUTER_API_KEY)' });
    return false;
  }
  return true;
}

async function callOpenRouter(messages, maxTokens = 1500) {
  const res = await openRouterFetch({
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
      messages,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error: ${err}`);
  }
  return res.json();
}

async function persistResult(userId, endpoint, inputData, result) {
  await pool.query(
    'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1,$2,$3,$4)',
    [userId, endpoint, JSON.stringify(inputData), JSON.stringify(result)]
  );
}

// POST /api/ai/jurisdiction-check
router.post('/jurisdiction-check', aiRateLimiter, [
  body('state').notEmpty(),
  body('dispute_type').notEmpty(),
  body('claim_amount').isNumeric(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { state, dispute_type, claim_amount } = req.body;
  const prompt = `You are a legal expert on US small claims courts. Given the following information, determine if small claims court is appropriate and provide key details.

State: ${state}
Dispute Type: ${dispute_type}
Claim Amount: $${claim_amount}

Respond ONLY with a valid JSON object in this exact format:
{
  "is_appropriate": true,
  "claim_cap": 10000,
  "filing_fee": 75,
  "court_name": "Name of the small claims court",
  "sol_years": 3,
  "process_overview": "Brief overview of the filing process in this state"
}`;

  try {
    const aiData = await callOpenRouter([{ role: 'user', content: prompt }]);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    await persistResult(req.user.id, 'jurisdiction-check', { state, dispute_type, claim_amount }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/demand-letter
router.post('/demand-letter', aiRateLimiter, [
  body('case_id').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { case_id } = req.body;
  try {
    const caseResult = await pool.query('SELECT * FROM cases WHERE id=$1 AND user_id=$2', [case_id, req.user.id]);
    if (caseResult.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    const c = caseResult.rows[0];

    const userResult = await pool.query('SELECT name FROM users WHERE id=$1', [req.user.id]);
    const userName = userResult.rows[0]?.name || 'Plaintiff';

    const prompt = `You are a legal writing expert. Write a formal pre-litigation demand letter for a small claims case.

Plaintiff: ${userName}
Opposing Party: ${c.opposing_party || 'Defendant'}
Dispute Type: ${c.dispute_type}
Claim Amount: $${c.claim_amount}
State: ${c.jurisdiction_state}
Facts: ${c.facts || 'Not provided'}

Respond ONLY with a valid JSON object:
{
  "subject": "Re: Formal Demand for Payment",
  "body": "Full formal demand letter text here...",
  "legal_basis": "Brief statement of legal basis",
  "demand_amount": ${c.claim_amount}
}`;

    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2000);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    const saved = await pool.query(
      'INSERT INTO demand_letters (case_id, content, status) VALUES ($1,$2,$3) RETURNING *',
      [case_id, JSON.stringify(parsed), 'draft']
    );
    await persistResult(req.user.id, 'demand-letter', { case_id }, parsed);
    res.json({ ...parsed, id: saved.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/draft-complaint
router.post('/draft-complaint', aiRateLimiter, [
  body('case_id').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { case_id } = req.body;
  try {
    const caseResult = await pool.query('SELECT * FROM cases WHERE id=$1 AND user_id=$2', [case_id, req.user.id]);
    if (caseResult.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    const c = caseResult.rows[0];

    const userResult = await pool.query('SELECT name FROM users WHERE id=$1', [req.user.id]);
    const userName = userResult.rows[0]?.name || 'Plaintiff';

    const evidenceResult = await pool.query('SELECT exhibit_label, description FROM evidence_items WHERE case_id=$1', [case_id]);

    const prompt = `You are a legal document drafting expert. Draft a small claims court complaint form.

Plaintiff: ${userName}
Defendant: ${c.opposing_party || 'Defendant'}
Dispute Type: ${c.dispute_type}
Claim Amount: $${c.claim_amount}
State: ${c.jurisdiction_state}
County: ${c.jurisdiction_county || 'N/A'}
Facts: ${c.facts || 'Not provided'}
Evidence: ${evidenceResult.rows.map(e => `${e.exhibit_label}: ${e.description}`).join(', ') || 'None listed'}

Respond ONLY with a valid JSON object:
{
  "title": "Small Claims Complaint",
  "plaintiff_statement": "Full plaintiff information statement",
  "defendant_info": "Defendant information section",
  "claim_description": "Detailed description of the claim",
  "relief_sought": "What the plaintiff is asking the court to award",
  "exhibits": ["List of exhibit labels"]
}`;

    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2500);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    const saved = await pool.query(
      'INSERT INTO documents (case_id, doc_type, content) VALUES ($1,$2,$3) RETURNING *',
      [case_id, 'complaint', JSON.stringify(parsed)]
    );
    await persistResult(req.user.id, 'draft-complaint', { case_id }, parsed);
    res.json({ ...parsed, id: saved.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/hearing-prep
router.post('/hearing-prep', aiRateLimiter, [
  body('case_id').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { case_id, user_answers } = req.body;
  try {
    const caseResult = await pool.query('SELECT * FROM cases WHERE id=$1 AND user_id=$2', [case_id, req.user.id]);
    if (caseResult.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    const c = caseResult.rows[0];

    const prompt = `You are a judge and opposing party in a small claims court hearing simulator. Generate realistic questions and provide coaching.

Case Details:
Dispute Type: ${c.dispute_type}
Claim Amount: $${c.claim_amount}
State: ${c.jurisdiction_state}
Facts: ${c.facts || 'Not provided'}
${user_answers ? `Plaintiff's Previous Answers: ${JSON.stringify(user_answers)}` : ''}

Respond ONLY with a valid JSON object:
{
  "judge_questions": ["Question 1", "Question 2", "Question 3"],
  "opposing_questions": ["Cross-question 1", "Cross-question 2"],
  "your_responses": ["Suggested response to judge Q1", "Suggested response to judge Q2", "Suggested response to judge Q3"],
  "score": 85,
  "coaching_tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2000);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    const saved = await pool.query(
      'INSERT INTO hearing_sessions (case_id, questions_asked, ai_feedback, score) VALUES ($1,$2,$3,$4) RETURNING *',
      [case_id, JSON.stringify({ judge: parsed.judge_questions, opposing: parsed.opposing_questions }), JSON.stringify(parsed.coaching_tips), parsed.score]
    );
    await persistResult(req.user.id, 'hearing-prep', { case_id }, parsed);
    res.json({ ...parsed, session_id: saved.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// GET /api/documents/:id/pdf
router.get('/documents/:id/pdf', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, c.user_id FROM documents d JOIN cases c ON d.case_id = c.id WHERE d.id=$1 AND c.user_id=$2`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });

    const doc = result.rows[0];
    const content = typeof doc.content === 'string' ? JSON.parse(doc.content) : doc.content;

    const PDFDocument = require('pdfkit');
    const pdf = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="document-${doc.id}.pdf"`);
    pdf.pipe(res);

    pdf.fontSize(18).font('Helvetica-Bold').text(content.title || doc.doc_type, { align: 'center' });
    pdf.moveDown();

    if (content.plaintiff_statement) {
      pdf.fontSize(12).font('Helvetica-Bold').text('Plaintiff:');
      pdf.font('Helvetica').text(content.plaintiff_statement);
      pdf.moveDown();
    }
    if (content.defendant_info) {
      pdf.font('Helvetica-Bold').text('Defendant:');
      pdf.font('Helvetica').text(content.defendant_info);
      pdf.moveDown();
    }
    if (content.claim_description) {
      pdf.font('Helvetica-Bold').text('Claim:');
      pdf.font('Helvetica').text(content.claim_description);
      pdf.moveDown();
    }
    if (content.relief_sought) {
      pdf.font('Helvetica-Bold').text('Relief Sought:');
      pdf.font('Helvetica').text(content.relief_sought);
      pdf.moveDown();
    }
    if (content.body) {
      pdf.font('Helvetica').text(content.body);
    }

    pdf.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'PDF generation failed' });
  }
});

// POST /api/ai/evidence-organizer
router.post('/evidence-organizer', aiRateLimiter, async (req, res) => {
  try {
    const { case_id, evidence_items, claim_summary } = req.body || {};
    if (!Array.isArray(evidence_items) || evidence_items.length === 0) {
      return res.status(400).json({ error: 'evidence_items array is required' });
    }
    const prompt = `You are a small-claims evidence-organization assistant for pro se litigants. Organize evidence for clarity at hearing. Respond ONLY in JSON.

Case summary: ${claim_summary || ''}
Evidence items:
${JSON.stringify(evidence_items, null, 2)}

Return JSON: {organized_exhibits:[{exhibit_letter,description,supports_element_of_claim,recommended_presentation_order,how_to_authenticate,objections_to_anticipate:[]}], gaps_in_evidence:[{element,suggested_evidence_to_obtain}], hearsay_warnings:[], chain_of_custody_notes:[], summary}.`;
    const aiRes = await callOpenRouter([
      { role: 'system', content: 'Always respond in valid JSON.' },
      { role: 'user', content: prompt }
    ]);
    const content = aiRes.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistResult(req.user.id, 'evidence-organizer', { case_id, count: evidence_items.length }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/settlement-calculator
router.post('/settlement-calculator', aiRateLimiter, async (req, res) => {
  try {
    const { state, dispute_type, claim_amount, facts, defendant_position, prior_offers } = req.body || {};
    if (!state || !claim_amount) return res.status(400).json({ error: 'state and claim_amount required' });
    const prompt = `You are a settlement-valuation AI for US small-claims matters. Estimate likely award and settlement range; explicitly note this is informational only and not legal advice. Respond ONLY in JSON.

State: ${state}
Dispute type: ${dispute_type || ''}
Claim amount: $${claim_amount}
Facts: ${facts || ''}
Defendant position: ${defendant_position || ''}
Prior offers: ${JSON.stringify(prior_offers || [])}

Return JSON: {disclaimer, expected_award_range:{low,likely,high}, win_probability:0-1, settlement_range:{floor,target,ceiling}, key_strengths:[], key_weaknesses:[], counter_offer_strategy:[], walk_away_threshold, factors_increasing_value:[], factors_decreasing_value:[], summary}.`;
    const aiRes = await callOpenRouter([
      { role: 'system', content: 'Always respond in valid JSON. Include a "disclaimer" field stating this is informational only.' },
      { role: 'user', content: prompt }
    ]);
    const content = aiRes.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistResult(req.user.id, 'settlement-calculator', { state, dispute_type, claim_amount }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/court-procedure-checklist
router.post('/court-procedure-checklist', aiRateLimiter, async (req, res) => {
  try {
    const { state, county, dispute_type } = req.body || {};
    if (!state) return res.status(400).json({ error: 'state required' });
    const prompt = `You are a US small-claims procedural-checklist AI. Generate a jurisdiction-specific checklist; mark items where rules vary. Respond ONLY in JSON.

State: ${state}
County: ${county || 'unspecified'}
Dispute type: ${dispute_type || ''}

Return JSON: {disclaimer, jurisdiction:"state[/county]", filing_phase:[{step,detail,deadline_or_timing,form_or_fee_hint}], service_phase:[{step,detail}], hearing_prep_phase:[{step,detail}], hearing_day_phase:[{step,detail}], post_judgment_phase:[{step,detail}], items_with_high_local_variation:[], official_resources_to_check:[{name,note}], summary}.`;
    const aiRes = await callOpenRouter([
      { role: 'system', content: 'Always respond in valid JSON. Include a "disclaimer" that the checklist is informational only and the user should verify with the local clerk.' },
      { role: 'user', content: prompt }
    ]);
    const content = aiRes.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistResult(req.user.id, 'court-procedure-checklist', { state, county, dispute_type }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/witness-statement-guide — Apply pass 4: prep witness statements
router.post('/witness-statement-guide', aiRateLimiter, async (req, res) => {
  if (!ensureKey(res)) return;
  try {
    const { case_id, dispute_type, facts, witness_role, witness_known_facts } = req.body || {};
    if (!dispute_type && !facts) {
      return res.status(400).json({ error: 'dispute_type or facts required' });
    }
    const prompt = `You are a small-claims witness-preparation AI for pro se litigants. Help draft a neutral, factual witness statement and identify foundational issues. Respond ONLY in JSON.

Dispute type: ${dispute_type || ''}
Facts of case: ${facts || ''}
Witness role: ${witness_role || 'unspecified'}
What this witness knows / observed: ${witness_known_facts || ''}

Return JSON: {disclaimer, suggested_statement_outline:[{section,prompt,sample_phrasing}], key_topics_to_cover:[], topics_to_avoid:[], hearsay_risks:[], foundation_questions:[], cross_examination_likely:[{question,how_to_handle}], best_evidence_to_attach:[], summary}.`;
    const aiRes = await callOpenRouter([
      { role: 'system', content: 'Always respond in valid JSON. Include a "disclaimer" stating this is informational only and not legal advice.' },
      { role: 'user', content: prompt }
    ]);
    const content = aiRes.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistResult(req.user.id, 'witness-statement-guide', { case_id, dispute_type, witness_role }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/appeal-assessment — Apply pass 4: assess appeal viability
router.post('/appeal-assessment', aiRateLimiter, async (req, res) => {
  if (!ensureKey(res)) return;
  try {
    const { case_id, state, dispute_type, judgment_amount, ruling_summary, alleged_errors, deadline_known } = req.body || {};
    if (!state || !ruling_summary) {
      return res.status(400).json({ error: 'state and ruling_summary required' });
    }
    const prompt = `You are a small-claims appellate-assessment AI. Help a pro se litigant evaluate whether an appeal is realistic; appeal procedure varies by state. Respond ONLY in JSON.

State: ${state}
Dispute type: ${dispute_type || ''}
Judgment amount: $${judgment_amount || 'unspecified'}
Ruling summary: ${ruling_summary}
Alleged errors: ${alleged_errors || ''}
Deadline already known to user: ${deadline_known || 'no'}

Return JSON: {disclaimer, appeal_advisability:"recommended|consider|discouraged", typical_deadline_days, common_filing_fee_range, grounds_assessment:[{alleged_error,strength:"strong|moderate|weak",rationale}], procedural_steps:[{step,detail}], evidence_needed_for_appeal:[], cost_benefit_summary, alternatives_to_appeal:[{option,explanation}], jurisdiction_high_variation_flags:[], summary}.`;
    const aiRes = await callOpenRouter([
      { role: 'system', content: 'Always respond in valid JSON. Include a "disclaimer" stating this is informational only and the user should verify deadlines with the local clerk and consult an attorney.' },
      { role: 'user', content: prompt }
    ], 2000);
    const content = aiRes.choices?.[0]?.message?.content || '';
    const parsed = parseAIJson(content) || { raw: content };
    await persistResult(req.user.id, 'appeal-assessment', { case_id, state, dispute_type, judgment_amount }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

module.exports = router;
