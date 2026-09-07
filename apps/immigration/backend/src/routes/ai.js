const { openRouterFetch } = require('../../../../../packages/ai-client/index.cjs');
const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const multer = require('multer');
const { callOpenRouter } = require('../services/openrouter');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req, res) => req.user ? `user:${req.user.id}` : ipKeyGenerator(req, res),
  message: { error: 'AI rate limit exceeded. Max 20 requests/hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3-strategy JSON parser
function parseJSON(text) {
  if (!text) return null;
  // Strategy 1: direct parse
  try { return JSON.parse(text); } catch (_) {}
  // Strategy 2: strip markdown fences
  try {
    const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(stripped);
  } catch (_) {}
  // Strategy 3: extract first {...} block
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch (_) {}
  return null;
}

// AI Case Assessment
router.post('/case-assessment', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_type, client_nationality, current_status, description } = req.body;
    const prompt = `You are an expert immigration attorney AI assistant.

Case Type: ${case_type}
Client Nationality: ${client_nationality}
Current Immigration Status: ${current_status}
Case Description: ${description}

Return JSON: { "risk_level": "low|medium|high", "approval_probability": number (0-100), "key_factors": string[], "recommended_actions": string[], "timeline_estimate": string, "rfe_likelihood": number (0-100) }`;

    const raw = await callOpenRouter('You are an expert immigration law AI assistant. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);
    res.json({ structured, raw });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Document Analysis
router.post('/document-analysis', auth, aiRateLimiter, async (req, res) => {
  try {
    const { document_type, document_content, case_type } = req.body;
    const prompt = `Analyze the following immigration document and provide a detailed review.

Document Type: ${document_type}
Related Case Type: ${case_type}
Document Content/Description: ${document_content}

Provide:
1. **Document Completeness** - Is all required information present?
2. **Potential Issues** - Any errors, inconsistencies, or missing information
3. **Compliance Check** - Does it meet USCIS/immigration authority requirements?
4. **Recommendations** - Specific improvements needed
5. **Risk Assessment** - Could this document cause delays or denials?`;

    const result = await callOpenRouter('You are an expert immigration document review AI assistant.', prompt);
    res.json({ analysis: result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Legal Research
router.post('/legal-research', auth, aiRateLimiter, async (req, res) => {
  try {
    const { research_topic, case_context } = req.body;
    const prompt = `Conduct immigration legal research on the following topic.

Research Topic: ${research_topic}
Case Context: ${case_context}

Provide:
1. **Relevant Laws & Regulations** (cite specific INA sections, CFR references)
2. **Key Precedent Cases** and their implications
3. **USCIS Policy Guidance** applicable
4. **Recent Changes or Updates** in this area of law
5. **Strategic Recommendations** based on research findings
6. **Risk Factors** to consider`;

    const result = await callOpenRouter('You are an expert immigration law research AI assistant with deep knowledge of US immigration law, INA, CFR, and USCIS policies.', prompt);
    res.json({ research: result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Form Assistance
router.post('/form-assist', auth, aiRateLimiter, async (req, res) => {
  try {
    const { form_type, client_info, questions } = req.body;
    const prompt = `Help fill out the following immigration form.

Form: ${form_type}
Client Information: ${JSON.stringify(client_info)}
Specific Questions: ${questions}

Provide:
1. **Form Overview** - Purpose and key requirements
2. **Section-by-Section Guidance** with specific answers based on client info
3. **Common Mistakes** to avoid on this form
4. **Supporting Documents Needed**
5. **Filing Tips** and best practices
6. **Important Deadlines** related to this form`;

    const result = await callOpenRouter('You are an expert immigration forms assistant AI.', prompt);
    res.json({ assistance: result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Translation
router.post('/translate', auth, aiRateLimiter, async (req, res) => {
  try {
    const { text, source_language, target_language } = req.body;
    const prompt = `Translate the following text for immigration documentation purposes.

Source Language: ${source_language}
Target Language: ${target_language}
Text: ${text}

Provide:
1. **Translation** - Accurate, certified-quality translation
2. **Translation Notes** - Any cultural context or nuances
3. **Legal Terminology Notes** - Immigration-specific terms explained
4. **Certification Statement** - Standard translation certification language`;

    const result = await callOpenRouter('You are a professional certified translator specializing in immigration documents.', prompt);
    res.json({ translation: result });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Compliance Check
router.post('/compliance-check', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_type, case_details, documents_submitted } = req.body;
    const prompt = `Perform a comprehensive immigration compliance check.

Case Type: ${case_type}
Case Details: ${case_details}
Documents Submitted: ${documents_submitted}

Return JSON: { "compliant": boolean, "violations": string[], "recommendations": string[], "urgency": "low|medium|high" }`;

    const raw = await callOpenRouter('You are an immigration compliance specialist AI. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);
    res.json({ structured, raw });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Status Prediction
router.post('/status-prediction', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_type, filing_date, service_center, case_details } = req.body;
    const prompt = `Predict the processing timeline and outcome for this immigration case.

Case Type: ${case_type}
Filing Date: ${filing_date}
Service Center: ${service_center}
Case Details: ${case_details}

Return JSON: { "current_status_interpretation": string, "next_milestone": string, "estimated_completion": string, "rfe_probability": number (0-100), "approval_probability": number (0-100), "potential_issues": string[] }`;

    const raw = await callOpenRouter('You are an immigration case processing prediction AI. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);
    res.json({ structured, raw });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Document OCR Upload & Extract
router.post('/document-ocr', auth, aiRateLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const isImage = req.file.mimetype.startsWith('image/');
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    let messages;
    const systemPrompt = 'You are an immigration document OCR specialist. Extract all text and structured data from this document. Return only valid JSON.';
    const extractPrompt = 'Extract all text and structured data from this immigration document. Return JSON: { "document_type": string, "applicant_name": string, "a_number": string, "receipt_number": string, "dates": {}, "status": string, "important_notes": string[], "extracted_text": string }';

    if (isImage) {
      const response = await openRouterFetch({
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3-5-sonnet-20241022',
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
                { type: 'text', text: extractPrompt }
              ]
            }
          ],
          max_tokens: 2000,
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      const raw = data.choices[0].message.content;
      const structured = parseJSON(raw);

      // Auto-populate documents table if case_id provided
      if (req.body.case_id && structured) {
        try {
          await pool.query(
            `INSERT INTO documents (document_name, document_type, case_id, status, notes)
             VALUES ($1, $2, $3, 'pending', $4)`,
            [
              structured.applicant_name || req.file.originalname,
              structured.document_type || 'Unknown',
              req.body.case_id,
              structured.extracted_text ? structured.extracted_text.substring(0, 500) : null
            ]
          );
        } catch (dbErr) { /* non-fatal */ }
      }

      return res.json({ structured, raw });
    } else {
      // PDF - send as text extraction request
      const raw = await callOpenRouter(systemPrompt, `${extractPrompt}\n\nDocument content (base64 PDF): ${base64.substring(0, 1000)}...`);
      const structured = parseJSON(raw);
      return res.json({ structured, raw });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// USCIS Deadline Predictor
router.post('/deadline-predict', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id } = req.body;
    if (!case_id) return res.status(400).json({ error: 'case_id is required' });

    const caseResult = await pool.query('SELECT case_type, filing_date, description FROM cases WHERE id = $1', [case_id]);
    if (caseResult.rows.length === 0) return res.status(404).json({ error: 'Case not found' });

    const c = caseResult.rows[0];
    const service_center = c.description?.match(/([A-Z]+\s+Service\s+Center)/i)?.[1] || 'unknown service center';

    const prompt = `Given visa type "${c.case_type}", filed ${c.filing_date ? new Date(c.filing_date).toDateString() : 'unknown'} at ${service_center}, predict:

Return JSON: {
  "estimated_decision_date": string,
  "confidence": number (0-100),
  "key_deadlines": [{ "event": string, "date": string, "description": string }],
  "recommended_actions_now": string[]
}`;

    const raw = await callOpenRouter('You are a USCIS processing time expert. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);

    // Auto-create deadlines from predictions
    if (structured?.key_deadlines && Array.isArray(structured.key_deadlines)) {
      for (const dl of structured.key_deadlines) {
        try {
          const dueDate = new Date(dl.date);
          if (!isNaN(dueDate.getTime())) {
            await pool.query(
              `INSERT INTO deadlines (title, description, due_date, case_id, priority, status)
               VALUES ($1, $2, $3, $4, 'medium', 'pending')`,
              [dl.event, dl.description || 'AI-predicted deadline', dueDate, case_id]
            );
          }
        } catch (_) {}
      }
    }

    res.json({ structured, raw });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Visa Category Recommendation
router.post('/visa-category-recommendation', auth, aiRateLimiter, async (req, res) => {
  try {
    const { client_id, profile } = req.body;
    let clientProfile = profile || null;
    if (!clientProfile && client_id) {
      const r = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]).catch(() => ({ rows: [] }));
      if (r.rows.length > 0) clientProfile = r.rows[0];
    }
    if (!clientProfile) {
      return res.status(400).json({ error: 'Either client_id or a profile object is required' });
    }

    const prompt = `You are an expert U.S. immigration strategist. Recommend the optimal visa categories for the following client profile and rank them by feasibility.

Client profile:
${JSON.stringify(clientProfile, null, 2)}

Return JSON only:
{
  "top_recommendations": [
    {
      "category": "EB-1A | EB-2 NIW | EB-3 | H-1B | L-1 | O-1 | family-based | asylum | other",
      "fit_score_0_100": number,
      "rationale": string,
      "key_eligibility_criteria": string[],
      "evidence_to_gather": string[],
      "estimated_timeline_months": { "low": number, "high": number },
      "estimated_total_cost_usd": { "low": number, "high": number },
      "risks": string[]
    }
  ],
  "alternative_paths": string[],
  "disqualifying_factors": string[],
  "next_steps": string[],
  "summary": string,
  "confidence_0_100": number,
  "disclaimer": "AI guidance, not legal advice. Always confirm with a licensed immigration attorney."
}`;

    const raw = await callOpenRouter('You are an expert U.S. immigration law AI assistant. Always conclude with a clear "not legal advice" disclaimer field. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);
    res.json({ structured, raw });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Interview Preparation
router.post('/interview-preparation', auth, aiRateLimiter, async (req, res) => {
  try {
    const { case_id, interview_type, focus_areas } = req.body;
    let caseRow = null;
    if (case_id) {
      const r = await pool.query('SELECT * FROM cases WHERE id = $1', [case_id]).catch(() => ({ rows: [] }));
      if (r.rows.length > 0) caseRow = r.rows[0];
    }

    const prompt = `Generate an immigration interview preparation kit.

Interview type: ${interview_type || 'general adjustment of status / consular interview'}
Case context: ${caseRow ? JSON.stringify(caseRow) : 'no specific case loaded; produce a general kit for the stated interview type'}
Focus areas requested by user: ${focus_areas || 'none specified'}

Return JSON only:
{
  "expected_topics": string[],
  "practice_questions": [
    {
      "question": string,
      "officer_intent": string,
      "model_answer_outline": string,
      "common_pitfalls": string[]
    }
  ],
  "documents_to_bring": string[],
  "red_flags_to_address_proactively": string[],
  "behavioral_coaching": { "tone": string, "pacing": string, "body_language": string, "handling_unexpected_questions": string },
  "mock_interview_plan": { "duration_minutes": number, "phases": [{ "phase": string, "minutes": number, "goal": string }] },
  "post_interview_followups": string[],
  "disclaimer": "AI preparation aid, not legal advice."
}`;

    const raw = await callOpenRouter('You are an experienced immigration interview coach. Provide realistic practice questions and coaching. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);
    res.json({ structured, raw });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 503-on-no-key gate for the new mechanical-backlog endpoints below.
function requireAIKey(req, res, next) {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI provider not configured. Set OPENROUTER_API_KEY in the backend environment to enable this feature.' });
  }
  next();
}

// AI Agentic Case Manager — workflow steps, reminders, and document plan for a case
router.post('/agentic-case-manager', auth, aiRateLimiter, requireAIKey, async (req, res) => {
  try {
    const { case_id, horizon_days } = req.body;
    let caseRow = null;
    let deadlines = [];
    if (case_id) {
      const r = await pool.query('SELECT * FROM cases WHERE id = $1', [case_id]).catch(() => ({ rows: [] }));
      if (r.rows.length > 0) caseRow = r.rows[0];
      const d = await pool.query('SELECT * FROM deadlines WHERE case_id = $1 ORDER BY due_date ASC LIMIT 25', [case_id]).catch(() => ({ rows: [] }));
      deadlines = d.rows;
    }

    const prompt = `You are an agentic immigration case manager. Produce an actionable workflow with reminders, document checklists, and decision points for the next ${horizon_days || 60} days.

Case: ${caseRow ? JSON.stringify(caseRow) : 'no specific case loaded; produce a generic plan'}
Existing deadlines: ${JSON.stringify(deadlines)}

Return JSON only:
{
  "workflow_steps": [
    { "step": string, "owner": "attorney|paralegal|client|automation", "due_in_days": number, "depends_on": string[], "details": string }
  ],
  "reminders": [ { "trigger": string, "channel": "email|sms|in_app", "lead_time_days": number, "message": string } ],
  "documents_to_request_from_client": string[],
  "documents_to_auto_draft": [ { "name": string, "purpose": string, "template_hint": string } ],
  "decision_points": [ { "question": string, "options": string[], "default": string } ],
  "risks_and_blockers": string[],
  "summary": string,
  "disclaimer": "AI guidance, not legal advice."
}`;

    const raw = await callOpenRouter('You are an agentic immigration case manager. Always conclude with a clear "not legal advice" disclaimer field. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);
    res.json({ structured, raw });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Immigration Pathway Optimizer — multi-step optimal pathway (deeper than visa-category-recommendation)
router.post('/pathway-optimizer', auth, aiRateLimiter, requireAIKey, async (req, res) => {
  try {
    const { client_id, profile, target_outcome, time_horizon_years, risk_tolerance } = req.body;
    let clientProfile = profile || null;
    if (!clientProfile && client_id) {
      const r = await pool.query('SELECT * FROM clients WHERE id = $1', [client_id]).catch(() => ({ rows: [] }));
      if (r.rows.length > 0) clientProfile = r.rows[0];
    }
    if (!clientProfile) {
      return res.status(400).json({ error: 'Either client_id or a profile object is required' });
    }

    const prompt = `You are an expert U.S. immigration strategist. Build a multi-step pathway plan combining nonimmigrant and immigrant options, with branching and contingencies.

Client profile:
${JSON.stringify(clientProfile, null, 2)}

Target outcome: ${target_outcome || 'permanent residency'}
Time horizon (years): ${time_horizon_years || 5}
Risk tolerance: ${risk_tolerance || 'moderate'}

Return JSON only:
{
  "primary_pathway": {
    "name": string,
    "stages": [
      { "stage": string, "visa_or_status": string, "duration_months_low": number, "duration_months_high": number, "key_actions": string[], "evidence_to_gather": string[], "risk_level": "low|moderate|high", "estimated_cost_usd_low": number, "estimated_cost_usd_high": number }
    ],
    "expected_total_months_low": number,
    "expected_total_months_high": number,
    "estimated_total_cost_usd_low": number,
    "estimated_total_cost_usd_high": number
  },
  "fallback_pathways": [ { "name": string, "trigger": string, "summary": string } ],
  "decision_tree": [ { "if": string, "then": string } ],
  "key_risks": string[],
  "policy_change_sensitivities": string[],
  "next_30_60_90_day_actions": { "30": string[], "60": string[], "90": string[] },
  "summary": string,
  "confidence_0_100": number,
  "disclaimer": "AI guidance, not legal advice. Always confirm with a licensed immigration attorney."
}`;

    const raw = await callOpenRouter('You are an expert U.S. immigration strategist. Always conclude with a clear "not legal advice" disclaimer field. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);
    res.json({ structured, raw });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// AI Auto-Detect Language — detect language(s) of supplied text and recommend translation tasks
router.post('/auto-detect-language', auth, aiRateLimiter, requireAIKey, async (req, res) => {
  try {
    const { text, target_language } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'text is required' });
    }

    const prompt = `Detect the dominant language(s) of the following text. If a target_language is supplied, provide a translation. Otherwise, recommend the most useful translation target for a U.S. immigration case.

Target language: ${target_language || '(not specified)'}

Text:
"""
${text.substring(0, 4000)}
"""

Return JSON only:
{
  "detected_languages": [ { "language": string, "iso_code": string, "confidence_0_100": number, "share_pct": number } ],
  "primary_language": string,
  "primary_iso_code": string,
  "needs_translation": boolean,
  "recommended_target_language": string,
  "recommended_target_iso_code": string,
  "translation": string,
  "translator_notes": string[],
  "ocr_or_quality_warnings": string[],
  "summary": string
}`;

    const raw = await callOpenRouter('You are a multilingual document analysis assistant for U.S. immigration cases. Return only valid JSON.', prompt);
    const structured = parseJSON(raw);
    res.json({ structured, raw });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
