const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const parseAIJson = require('../middleware/parseAIJson');

const router = express.Router();
router.use(authMiddleware);

async function callOpenRouter(messages, maxTokens = 2000) {
  const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
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
  const data = await res.json();
  if (!data.choices?.[0]?.message?.content) throw new Error('OpenRouter returned an empty response');
  return data;
}

async function persistResult(userId, endpoint, inputData, result) {
  await pool.query(
    'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1,$2,$3,$4)',
    [userId, endpoint, JSON.stringify(inputData), JSON.stringify(result)]
  );
}

router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id,endpoint,input_data,result,created_at FROM ai_results WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json({ history: result.rows });
  } catch (err) {
    res.status(503).json({ error: 'AI history unavailable' });
  }
});

async function verifyTenancy(tenancyId, userId) {
  const result = await pool.query('SELECT * FROM tenancies WHERE id=$1 AND user_id=$2', [tenancyId, userId]);
  return result.rows[0] || null;
}

// POST /api/ai/lease-analyzer
router.post('/lease-analyzer', aiRateLimiter, [
  body('lease_text').notEmpty().isLength({ min: 50 }),
  body('state').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { lease_text, state, tenancy_id } = req.body;

  const prompt = `You are a tenant rights legal expert specializing in ${state} landlord-tenant law. Analyze this lease agreement and identify any illegal or concerning clauses.

State: ${state}
Lease Text:
${lease_text.substring(0, 4000)}

Respond ONLY with a valid JSON object:
{
  "illegal_clauses": [
    {"clause_text": "exact clause text", "issue": "why it's illegal", "statute": "specific statute", "severity": "high"}
  ],
  "concerning_clauses": [
    {"clause_text": "clause text", "issue": "concern", "severity": "medium"}
  ],
  "overall_risk": "high|medium|low",
  "recommendations": ["action 1", "action 2"]
}`;

  try {
    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2500);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    if (tenancy_id) {
      await pool.query(
        'INSERT INTO documents (tenancy_id, doc_type, content) VALUES ($1,$2,$3)',
        [tenancy_id, 'lease_analysis', JSON.stringify(parsed)]
      );
    }
    await persistResult(req.user.id, 'lease-analyzer', { state, lease_text_length: lease_text.length }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/notice-generator
router.post('/notice-generator', aiRateLimiter, [
  body('tenancy_id').notEmpty(),
  body('notice_type').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { tenancy_id, notice_type, additional_context } = req.body;

  try {
    const tenancy = await verifyTenancy(tenancy_id, req.user.id);
    if (!tenancy) return res.status(404).json({ error: 'Tenancy not found' });

    const userResult = await pool.query('SELECT name FROM users WHERE id=$1', [req.user.id]);
    const tenantName = userResult.rows[0]?.name || 'Tenant';

    const prompt = `You are a tenant rights attorney. Generate a legally correct formal notice letter.

Notice Type: ${notice_type}
Tenant Name: ${tenantName}
Property Address: ${tenancy.property_address}
State: ${tenancy.state}
Landlord: ${tenancy.landlord_name || 'Landlord'}
Monthly Rent: $${tenancy.monthly_rent || 'N/A'}
Additional Context: ${additional_context || 'None'}

Respond ONLY with a valid JSON object:
{
  "notice_title": "Formal Notice Title",
  "content": "Full notice letter text...",
  "statutory_basis": "Legal basis citation",
  "deadline_days": 14,
  "send_method": "certified mail"
}`;

    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2000);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    const saved = await pool.query(
      'INSERT INTO notices (tenancy_id, notice_type, content) VALUES ($1,$2,$3) RETURNING *',
      [tenancy_id, notice_type, JSON.stringify(parsed)]
    );
    await persistResult(req.user.id, 'notice-generator', { tenancy_id, notice_type }, parsed);
    res.json({ ...parsed, id: saved.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/eviction-defense
router.post('/eviction-defense', aiRateLimiter, [
  body('summons_text').notEmpty(),
  body('state').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { summons_text, state, tenancy_id } = req.body;

  const prompt = `You are an expert tenant defense attorney. Analyze this eviction summons and identify defenses.

State: ${state}
Summons Text:
${summons_text.substring(0, 3000)}

Respond ONLY with a valid JSON object:
{
  "response_deadline": "YYYY-MM-DD or descriptive deadline",
  "identified_defenses": [
    {"defense": "Defense name", "strength": "strong|moderate|weak", "explanation": "Why this defense applies"}
  ],
  "draft_answer": "Full draft answer to file with the court...",
  "recommended_actions": ["Action 1", "Action 2"]
}`;

  try {
    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 3000);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    if (tenancy_id) {
      const t = await verifyTenancy(tenancy_id, req.user.id);
      if (t) {
        await pool.query(
          'INSERT INTO documents (tenancy_id, doc_type, content) VALUES ($1,$2,$3)',
          [tenancy_id, 'eviction_defense', JSON.stringify(parsed)]
        );
      }
    }
    await persistResult(req.user.id, 'eviction-defense', { state, summons_length: summons_text.length }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/rent-increase-check
router.post('/rent-increase-check', aiRateLimiter, [
  body('current_rent').isNumeric(),
  body('proposed_rent').isNumeric(),
  body('address').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { current_rent, proposed_rent, address, tenancy_id } = req.body;

  const prompt = `You are a rent control and tenant rights expert. Determine if a rent increase is legal.

Address: ${address}
Current Rent: $${current_rent}/month
Proposed Rent: $${proposed_rent}/month
Increase Amount: $${(proposed_rent - current_rent).toFixed(2)} (${(((proposed_rent - current_rent) / current_rent) * 100).toFixed(1)}%)

Analyze rent control laws, local ordinances, and tenant protections applicable to this address.

Respond ONLY with a valid JSON object:
{
  "verdict": "legal|illegal|unclear",
  "max_allowable_increase": "3.5% or dollar amount",
  "proposed_increase": "${(((proposed_rent - current_rent) / current_rent) * 100).toFixed(1)}%",
  "statutory_cap": "Description of the applicable cap",
  "citation": "Relevant law or ordinance citation",
  "complaint_letter": "Draft complaint letter tenant can send to landlord or housing authority"
}`;

  try {
    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2000);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    if (tenancy_id) {
      const t = await verifyTenancy(tenancy_id, req.user.id);
      if (t) {
        await pool.query(
          `INSERT INTO rent_checks (tenancy_id, current_rent, proposed_rent, address, ai_verdict)
           VALUES ($1,$2,$3,$4,$5)`,
          [tenancy_id, current_rent, proposed_rent, address, JSON.stringify(parsed)]
        );
      }
    }
    await persistResult(req.user.id, 'rent-increase-check', { current_rent, proposed_rent, address }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/mediation-prep
router.post('/mediation-prep', aiRateLimiter, [
  body('tenancy_id').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { tenancy_id } = req.body;

  try {
    const tenancy = await verifyTenancy(tenancy_id, req.user.id);
    if (!tenancy) return res.status(404).json({ error: 'Tenancy not found' });

    const issuesResult = await pool.query(
      'SELECT issue_type, description, status FROM issues WHERE tenancy_id=$1',
      [tenancy_id]
    );

    const prompt = `You are a tenant rights mediator. Generate mediation talking points and proposed resolutions for a landlord-tenant dispute.

Property: ${tenancy.property_address}
State: ${tenancy.state}
Landlord: ${tenancy.landlord_name || 'Landlord'}
Monthly Rent: $${tenancy.monthly_rent || 'N/A'}
Issues:
${issuesResult.rows.map(i => `- ${i.issue_type}: ${i.description || ''} (Status: ${i.status})`).join('\n') || '- No specific issues logged'}

Respond ONLY with a valid JSON object:
{
  "opening_statement": "How tenant should open the mediation session",
  "talking_points": [
    {"point": "Issue or argument", "supporting_facts": "Evidence or statute", "priority": "high|medium|low"}
  ],
  "proposed_resolutions": [
    {"item": "Specific resolution term", "rationale": "Why this is fair"}
  ],
  "concession_areas": ["Areas where tenant might reasonably compromise"],
  "non_negotiables": ["Items tenant should not compromise on"],
  "closing_strategy": "How to close the mediation productively"
}`;

    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2500);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });

    await persistResult(req.user.id, 'mediation-prep', { tenancy_id }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/case-outcome — predict eviction defense / dispute outcome
router.post('/case-outcome', aiRateLimiter, [
  body('case_summary').notEmpty().isLength({ min: 30 }),
  body('state').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { case_summary, state, jurisdiction, evidence_strength, tenancy_id } = req.body;
  const prompt = `You are a tenant rights legal analyst with expertise in ${state} (${jurisdiction || 'state-level'}) law. Predict the likely outcome of this case.

Case summary: ${case_summary.substring(0, 3500)}
Evidence strength self-assessment: ${evidence_strength || 'unknown'}

Respond ONLY with raw JSON:
{
  "predicted_outcome": "tenant_wins|landlord_wins|settlement|mixed",
  "tenant_win_probability_pct": <0-100>,
  "key_factors": ["..."],
  "evidence_gaps": ["..."],
  "strategic_recommendations": ["..."],
  "alternative_dispute_resolution_advised": <boolean>,
  "confidence": "low|medium|high"
}`;
  try {
    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2000);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });
    await persistResult(req.user.id, 'case-outcome', { state, jurisdiction, summary_length: case_summary.length }, parsed);
    if (tenancy_id) {
      await pool.query(
        'INSERT INTO documents (tenancy_id, doc_type, content) VALUES ($1,$2,$3)',
        [tenancy_id, 'case_outcome_prediction', JSON.stringify(parsed)]
      );
    }
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/local-law-lookup — local-jurisdiction adaptation of advice
router.post('/local-law-lookup', aiRateLimiter, [
  body('state').notEmpty(),
  body('topic').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { state, city, topic, situation } = req.body;
  const prompt = `You are a tenant rights legal information specialist. Provide jurisdiction-specific guidance.

State: ${state} | City: ${city || 'state-level'}
Topic: ${topic}
Situation: ${situation || 'general'}

Respond ONLY with raw JSON:
{
  "applicable_statutes": [{"citation": "...", "name": "...", "summary": "..."}],
  "rent_control_applies": <boolean>,
  "notice_periods": {"pay_or_quit_days": <number>, "moveout_days": <number>, "rent_increase_days": <number>},
  "habitability_standards": ["..."],
  "tenant_protections": ["..."],
  "local_resources": [{"name": "...", "type": "legal_aid|tenant_union|court|housing_authority"}],
  "summary": "..."
}`;
  try {
    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2000);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });
    await persistResult(req.user.id, 'local-law-lookup', { state, city, topic }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/negotiation-simulator — LLM role-play of landlord-tenant negotiation
router.post('/negotiation-simulator', aiRateLimiter, [
  body('topic').notEmpty(),
  body('tenant_position').notEmpty(),
], async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { topic, tenant_position, landlord_stance, jurisdiction, history } = req.body;
  const prompt = `You are simulating a landlord-tenant negotiation as a coaching tool. Play both roles realistically.

TOPIC: ${topic}
TENANT POSITION: ${tenant_position}
LANDLORD STANCE: ${landlord_stance || 'unspecified'}
JURISDICTION: ${jurisdiction || 'general US'}
PRIOR EXCHANGES: ${history ? (typeof history === 'string' ? history : JSON.stringify(history)) : 'none'}

Respond ONLY with raw JSON:
{
  "exchanges": [{"speaker":"tenant|landlord","message":"..."}],
  "tactics_used": [{"speaker":"tenant|landlord","tactic":"...","why_effective":"..."}],
  "tenant_coaching": ["..."],
  "likely_outcome": "...",
  "fallback_options": ["..."]
}`;
  try {
    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2500);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });
    await persistResult(req.user.id, 'negotiation-simulator', { topic, tenant_position }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

// POST /api/ai/document-assembly — auto-fill a tenant document/form
router.post('/document-assembly', aiRateLimiter, [
  body('document_type').notEmpty(),
], async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { document_type, tenant_info, landlord_info, jurisdiction, facts, tenancy_id } = req.body;
  const prompt = `You are a tenant-rights document drafter. Assemble a ${document_type} suitable for ${jurisdiction || 'general US'} jurisdiction.

TENANT INFO: ${tenant_info ? JSON.stringify(tenant_info) : 'unspecified'}
LANDLORD INFO: ${landlord_info ? JSON.stringify(landlord_info) : 'unspecified'}
FACTS: ${facts || 'none provided'}

Respond ONLY with raw JSON:
{
  "title": "...",
  "filled_document": "full document text with placeholders resolved",
  "missing_fields": ["..."],
  "recommended_attachments": ["..."],
  "delivery_instructions": "...",
  "legal_warnings": ["..."]
}`;
  try {
    const aiData = await callOpenRouter([{ role: 'user', content: prompt }], 2500);
    const content = aiData.choices?.[0]?.message?.content;
    const parsed = parseAIJson(content);
    if (!parsed) return res.status(502).json({ error: 'AI response parsing failed' });
    if (tenancy_id) {
      const tenancy = await verifyTenancy(tenancy_id, req.user.id);
      if (tenancy) {
        await pool.query(
          'INSERT INTO documents (tenancy_id, doc_type, content) VALUES ($1,$2,$3)',
          [tenancy_id, `assembled_${document_type}`, JSON.stringify(parsed)]
        );
      }
    }
    await persistResult(req.user.id, 'document-assembly', { document_type, jurisdiction }, parsed);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

/**
 * Apply pass 5 — remaining backlog (additive)
 *
 * Documented env vars:
 *   OPENROUTER_API_KEY        — AI generation
 *   LEGAL_EXPERT_CHAT_API_KEY — third-party live legal expert chat platform
 *   LEGAL_EXPERT_CHAT_BASE_URL — base URL for chat platform
 */

// PRODUCT-DECISION: Local legal-resource directory. Curating a real per-state DB
// is out of scope; we ship an in-memory stub with the most-requested categories
// for the 10 largest US states + a generic federal block. The endpoint returns
// {state, category, resources[]} and is purely advisory.
const LEGAL_RESOURCE_DIRECTORY = {
  US_FEDERAL: {
    fair_housing: [
      { name: 'HUD Office of Fair Housing and Equal Opportunity', phone: '1-800-669-9777', url: 'https://www.hud.gov/fairhousing' },
    ],
    legal_aid: [
      { name: 'Legal Services Corporation Find-Help', url: 'https://www.lsc.gov/about-lsc/what-legal-aid/find-legal-aid' },
    ],
  },
  CA: {
    rent_control: [
      { name: 'California Tenant Protection Act (AB 1482) info', url: 'https://landlordtenant.dre.ca.gov/' },
    ],
    legal_aid: [
      { name: 'Bay Area Legal Aid', phone: '510-663-4744', url: 'https://baylegal.org/' },
      { name: 'Legal Aid Foundation of Los Angeles', phone: '800-399-4529', url: 'https://lafla.org/' },
    ],
  },
  NY: {
    rent_control: [{ name: 'NY Homes and Community Renewal', url: 'https://hcr.ny.gov/' }],
    legal_aid: [{ name: 'Legal Aid Society NYC', phone: '212-577-3300', url: 'https://www.legalaidnyc.org/' }],
  },
  TX: { legal_aid: [{ name: 'Texas RioGrande Legal Aid', phone: '888-988-9996', url: 'https://www.trla.org/' }] },
  FL: { legal_aid: [{ name: 'Florida Legal Services', url: 'https://www.floridalegal.org/' }] },
  IL: { legal_aid: [{ name: 'Lawyers Trust Fund of Illinois (find aid)', url: 'https://ltf.org/' }] },
  PA: { legal_aid: [{ name: 'Pennsylvania Legal Aid Network', url: 'https://palegalaid.net/' }] },
  OH: { legal_aid: [{ name: 'Ohio Legal Help', url: 'https://www.ohiolegalhelp.org/' }] },
  GA: { legal_aid: [{ name: 'Georgia Legal Aid', url: 'https://www.georgialegalaid.org/' }] },
  NC: { legal_aid: [{ name: 'Legal Aid of North Carolina', phone: '866-219-5262', url: 'https://www.legalaidnc.org/' }] },
  MI: { legal_aid: [{ name: 'Michigan Legal Help', url: 'https://michiganlegalhelp.org/' }] },
};

router.get('/legal-resource-directory', async (req, res) => {
  const stateRaw = (req.query.state || '').toString().trim().toUpperCase();
  const category = (req.query.category || '').toString().trim().toLowerCase();
  const stateBlock = LEGAL_RESOURCE_DIRECTORY[stateRaw] || {};
  const fed = LEGAL_RESOURCE_DIRECTORY.US_FEDERAL;
  let resources;
  if (category) {
    resources = [...(stateBlock[category] || []), ...(fed[category] || [])];
  } else {
    resources = [];
    for (const [cat, items] of Object.entries({ ...fed, ...stateBlock })) {
      resources.push({ category: cat, items });
    }
  }
  res.json({
    state: stateRaw || 'unspecified',
    category: category || 'all',
    available_states: Object.keys(LEGAL_RESOURCE_DIRECTORY).filter(k => k !== 'US_FEDERAL'),
    resources,
    disclaimer: 'Curated stub directory. Verify before relying.',
  });
});

// NEEDS-CREDS: Live legal expert chat dispatcher.
router.post('/legal-expert-chat', async (req, res) => {
  const apiKey = process.env.LEGAL_EXPERT_CHAT_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Legal expert chat unavailable', missing: 'LEGAL_EXPERT_CHAT_API_KEY' });
  }
  const { topic, state, urgency } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic is required' });
  res.json({
    status: 'configured',
    base_url: process.env.LEGAL_EXPERT_CHAT_BASE_URL || 'https://api.example-legal-chat.com',
    topic,
    state: state || 'unspecified',
    urgency: urgency || 'normal',
    note: 'Legal-expert-chat credentials accepted; live session bridge deferred.',
  });
});

module.exports = router;
