// AI-drafted documents: state-specific wills, trusts, POAs (lawyer review
// required).
const express = require('express');
const pool = require('../db');
const { callOpenRouter } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

const DOC_TYPES = ['will', 'revocable_trust', 'irrevocable_trust', 'durable_poa', 'medical_poa'];

// POST /api/ai-drafted-documents/draft { doc_type, state, beneficiaries:[{name,share}], assets?, special_instructions? }
router.post('/draft', aiRateLimiter, async (req, res) => {
  try {
    const { doc_type, state, beneficiaries, assets, special_instructions } = req.body || {};
    if (!doc_type || !state || !Array.isArray(beneficiaries)) return res.status(400).json({ error: 'doc_type, state, beneficiaries[] required' });
    if (!DOC_TYPES.includes(doc_type)) return res.status(400).json({ error: `doc_type must be one of ${DOC_TYPES.join(',')}` });

    const system = `Draft a ${doc_type} document for the U.S. state of ${state}. Include required clauses for that jurisdiction. Add a "LAWYER REVIEW REQUIRED" header.`;
    let body;
    try {
      body = await callOpenRouter([
        { role: 'system', content: system },
        { role: 'user', content: JSON.stringify({ beneficiaries, assets, special_instructions }) },
      ]);
    } catch (e) {
      return res.status(503).json({ error: 'LLM unavailable', detail: e.message });
    }
    try {
      await pool.query(`INSERT INTO drafted_documents (user_id, doc_type, state, payload, content, created_at) VALUES ($1,$2,$3,$4,$5,NOW())`, [req.user?.id, doc_type, state, JSON.stringify({ beneficiaries, assets, special_instructions }), body]);
    } catch {}
    return res.json({ doc_type, state, body, disclaimer: 'AI-generated draft. Must be reviewed and executed in accordance with state-specific formalities.' });
  } catch (e) {
    return res.status(500).json({ error: 'draft failed' });
  }
});

module.exports = router;
