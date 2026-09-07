// RFE auto-detector monitoring USCIS tracking and drafting evidence-backed
// responses.
// Audit: batch_04.md / AIImmigrationCaseManager / Custom Feature Suggestions #4
// TODO: configure credentials USCIS_API_KEY
const express = require('express');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const pool = require('../config/database');

const router = express.Router();
router.use(auth);

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/rfe-responder/draft { case_id, rfe_text, evidence_summary? }
router.post('/draft', async (req, res) => {
  try {
    const { case_id, rfe_text, evidence_summary } = req.body || {};
    if (!case_id || !rfe_text) return res.status(400).json({ error: 'case_id and rfe_text required' });

    let caseRow = null, documents = { rows: [] };
    try {
      const r = await pool.query(`SELECT * FROM cases WHERE id = $1`, [case_id]);
      caseRow = r.rows[0] || null;
    } catch (_) {}
    try {
      documents = await pool.query(
        `SELECT id, title, document_type FROM documents WHERE case_id = $1 LIMIT 50`,
        [case_id]
      );
    } catch (_) {}

    const systemPrompt = `You are an immigration attorney's RFE (Request for Evidence) response drafter.
Identify each specific evidence request, map it to existing case documents, and draft an organized response
with cover letter, exhibit list, and brief argument. Return STRICT JSON only.`;

    const userPrompt = `Case: ${JSON.stringify(caseRow)}
RFE text (truncated to 8000): ${rfe_text.slice(0, 8000)}
Evidence summary supplied: ${evidence_summary || 'use available case documents'}
Existing case documents: ${JSON.stringify(documents.rows)}

Return JSON:
{
  "summary": "...",
  "evidence_requests": [
    { "request": "string", "mapped_documents": [{ "id": 0, "title": "string" }], "gap": "string", "additional_evidence_to_gather": ["..."] }
  ],
  "cover_letter_draft": "string (formal, 2-3 paragraphs)",
  "exhibit_list": [{ "tab": "A", "description": "string", "page_count_estimate": 0 }],
  "brief_argument": "string",
  "deadline_advice": "string",
  "filing_checklist": ["..."],
  "disclaimer": "Attorney must review and finalize; do not submit AI draft as-is."
}`;

    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseJSON(raw);

    try {
      await pool.query(
        `INSERT INTO ai_results (user_id, case_id, analysis_type, payload, created_at)
         VALUES ($1,$2,$3,$4,NOW())`,
        [req.user.id, case_id, 'rfe_response', JSON.stringify(parsed)]
      ).catch(() => {});
    } catch (_) {}

    res.json({ case_id, response: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', (_req, res) => {
  res.json({ uscis_api: !!process.env.USCIS_API_KEY });
});

module.exports = router;
