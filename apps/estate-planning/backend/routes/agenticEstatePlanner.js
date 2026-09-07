// Agentic estate planner: NL prompt → comprehensive estate plan with
// tax-minimised structure.
const express = require('express');
const pool = require('../db');
const { callOpenRouter } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

// POST /api/agentic-estate-planner/plan { profile:{net_worth,marital_status,kids,state} }
router.post('/plan', aiRateLimiter, async (req, res) => {
  try {
    const profile = req.body?.profile;
    if (!profile) return res.status(400).json({ error: 'profile required' });
    const system = 'You are a senior estate planner. Output JSON {"strategy":"...","instruments":["will","revocable_trust","ILIT"],"tax_minimisation":["..."],"action_items":["..."]}.';
    let parsed;
    try {
      const raw = await callOpenRouter([{ role: 'system', content: system }, { role: 'user', content: JSON.stringify(profile) }]);
      try { parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw); } catch { parsed = { raw }; }
    } catch (e) {
      return res.status(503).json({ error: 'LLM unavailable', detail: e.message });
    }
    try {
      await pool.query(`INSERT INTO estate_plans (user_id, profile, payload, created_at) VALUES ($1,$2,$3,NOW())`, [req.user?.id, JSON.stringify(profile), JSON.stringify(parsed)]);
    } catch {}
    return res.json({ profile, plan: parsed });
  } catch (e) {
    return res.status(500).json({ error: 'plan failed' });
  }
});

module.exports = router;
