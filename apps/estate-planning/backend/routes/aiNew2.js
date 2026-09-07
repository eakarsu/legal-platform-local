/**
 * /backend/routes/aiNew2.js
 *
 * Apply pass 5 wave-1 — additive AI endpoints.
 *
 *   POST /api/ai/agentic-plan        — multi-step estate plan synthesizing
 *                                      assets, beneficiaries, properties,
 *                                      insurance, trusts, and jurisdiction.
 *   POST /api/ai/digital-vault-audit — surveys vault contents (per documents
 *                                      + digital_accounts tables) and
 *                                      identifies access-risk / orphans.
 *
 * Pattern matches `aiNew.js`: 503 on missing key, JWT-bearer auth (mounted
 * with `authenticateToken` in server.js), rate-limited via `aiRateLimiter`.
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const { callOpenRouter } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');

router.use(aiRateLimiter);

function require503(res) {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(503).json({
      error: 'AI service unavailable. Set OPENROUTER_API_KEY on the backend and restart.',
    });
    return false;
  }
  return true;
}

async function getJurisdiction(userId) {
  try {
    const r = await pool.query('SELECT jurisdiction FROM users WHERE id = $1', [userId]);
    return r.rows[0]?.jurisdiction || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// POST /api/ai/agentic-plan
// Orchestrates a comprehensive plan from the user's existing data.
// Body: { goal?: string, risk_tolerance?: 'low'|'medium'|'high' }
// ---------------------------------------------------------------------------
router.post('/agentic-plan', async (req, res) => {
  try {
    if (!require503(res)) return;
    const userId = req.user.id;
    const { goal = 'comprehensive estate plan', risk_tolerance = 'medium' } = req.body || {};

    const jurisdiction = await getJurisdiction(userId);
    const [wills, ben, props, ins, trusts, da] = await Promise.all([
      pool.query('SELECT title, status, executor_name FROM wills WHERE user_id = $1', [userId]),
      pool.query('SELECT full_name, relationship, share_percentage, status FROM beneficiaries WHERE user_id = $1', [userId]),
      pool.query('SELECT property_name, property_type, estimated_value, mortgage_balance, beneficiary FROM properties WHERE user_id = $1', [userId]),
      pool.query('SELECT policy_name, policy_type, coverage_amount, beneficiary FROM insurance_policies WHERE user_id = $1', [userId]),
      pool.query('SELECT trust_name, trust_type, beneficiary_names FROM trusts WHERE user_id = $1', [userId]),
      pool.query('SELECT asset_name, asset_type, value_estimate, beneficiary FROM digital_assets WHERE user_id = $1', [userId]),
    ]);

    const totalAssets = [
      ...props.rows.map(p => parseFloat(p.estimated_value || 0) - parseFloat(p.mortgage_balance || 0)),
      ...da.rows.map(d => parseFloat(d.value_estimate || 0)),
      ...ins.rows.map(i => parseFloat(i.coverage_amount || 0)),
    ].reduce((a, b) => a + b, 0);

    const summary = {
      jurisdiction: jurisdiction || 'unknown',
      total_estate_estimate: Math.round(totalAssets),
      counts: {
        wills: wills.rows.length,
        beneficiaries: ben.rows.length,
        properties: props.rows.length,
        insurance_policies: ins.rows.length,
        trusts: trusts.rows.length,
        digital_assets: da.rows.length,
      },
      risk_tolerance,
      goal,
    };

    const sysPrompt = `You are a senior estate planning advisor. Produce a multi-phase action plan as JSON. Be jurisdiction-aware (${jurisdiction || 'United States generic'}). DO NOT provide specific legal/financial advice without disclaimers.`;
    const userPrompt = `User goal: ${goal}
Risk tolerance: ${risk_tolerance}
Estate snapshot: ${JSON.stringify(summary)}
Wills: ${JSON.stringify(wills.rows).slice(0, 1500)}
Beneficiaries: ${JSON.stringify(ben.rows).slice(0, 1500)}
Properties: ${JSON.stringify(props.rows).slice(0, 1500)}
Insurance: ${JSON.stringify(ins.rows).slice(0, 1500)}
Trusts: ${JSON.stringify(trusts.rows).slice(0, 1500)}

Return JSON:
{
  "phases": [{"phase": "0-30 days", "actions": [{"step": "...", "rationale": "...", "priority": "high|medium|low"}]}],
  "tax_considerations": ["..."],
  "beneficiary_recommendations": ["..."],
  "document_gaps": ["..."],
  "disclaimer": "This is a planning aid, not legal advice. Consult a licensed attorney."
}`;

    const result = await callOpenRouter(sysPrompt, userPrompt);

    // Persist into ai_analyses if table exists
    try {
      await pool.query(
        `CREATE TABLE IF NOT EXISTS ai_analyses (
           id SERIAL PRIMARY KEY,
           user_id INTEGER,
           analysis_type VARCHAR(100),
           content TEXT,
           created_at TIMESTAMP DEFAULT NOW()
         )`
      );
      await pool.query(
        `INSERT INTO ai_analyses (user_id, analysis_type, content) VALUES ($1, $2, $3)`,
        [userId, 'agentic-plan', typeof result === 'string' ? result : JSON.stringify(result)]
      );
    } catch (_) {}

    res.json({ summary, plan: result, jurisdiction, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[agentic-plan]', err);
    if (/OPENROUTER_API_KEY/i.test(err.message)) {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// POST /api/ai/digital-vault-audit
// Reviews documents + digital_accounts for access-risk / orphan accounts.
// Body: {} (queries authenticated user data)
// ---------------------------------------------------------------------------
router.post('/digital-vault-audit', async (req, res) => {
  try {
    if (!require503(res)) return;
    const userId = req.user.id;

    const [docs, accts] = await Promise.all([
      pool.query('SELECT title, document_type, description, tags, status FROM documents WHERE user_id = $1', [userId]),
      pool.query('SELECT account_name, account_type, platform, action_on_death, designated_contact, status FROM digital_accounts WHERE user_id = $1', [userId]),
    ]);

    const counts = {
      documents: docs.rows.length,
      digital_accounts: accts.rows.length,
      orphan_accounts: accts.rows.filter(a => !a.action_on_death && !a.designated_contact).length,
    };

    const sysPrompt = `You are a digital legacy specialist. Identify access risks and orphan accounts.`;
    const userPrompt = `Vault snapshot: ${JSON.stringify(counts)}
Documents: ${JSON.stringify(docs.rows).slice(0, 2500)}
Digital accounts: ${JSON.stringify(accts.rows).slice(0, 2500)}

Return JSON:
{
  "orphan_accounts": [{"account_name": "...", "issue": "no designated contact / no action_on_death"}],
  "access_risks": ["..."],
  "recommended_actions": [{"action": "...", "priority": "high|medium|low"}],
  "disclaimer": "Audit aid only — does not replace estate counsel advice."
}`;

    const result = await callOpenRouter(sysPrompt, userPrompt);
    res.json({ counts, audit: result, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error('[digital-vault-audit]', err);
    if (/OPENROUTER_API_KEY/i.test(err.message)) {
      return res.status(503).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
