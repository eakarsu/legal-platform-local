// Interview preparation AI with practice questions, answer review, and
// coaching feedback.
// Audit: batch_04.md / AIImmigrationCaseManager / Custom Feature Suggestions #2
const express = require('express');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const pool = require('../config/database');

const router = express.Router();
router.use(auth);

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/interview-prep/generate { case_id, interview_type? }
router.post('/generate', async (req, res) => {
  try {
    const { case_id, interview_type = 'AOS_485', language = 'English' } = req.body || {};
    if (!case_id) return res.status(400).json({ error: 'case_id required' });

    let caseRow = null, client = null;
    try {
      const r = await pool.query(`SELECT * FROM cases WHERE id = $1`, [case_id]);
      caseRow = r.rows[0] || null;
      if (caseRow) {
        const cr = await pool.query(`SELECT * FROM clients WHERE id = $1`, [caseRow.client_id]);
        client = cr.rows[0] || null;
      }
    } catch (_) {}

    const systemPrompt = `You are an immigration-attorney interview-prep coach. Produce realistic practice
questions, recommended answer structures (without coaching to lie), red-flag pitfalls, and a confidence-building
script. Return STRICT JSON only.`;

    const userPrompt = `Interview type: ${interview_type} (e.g., AOS_485, naturalization_N400, asylum, marriage_K1, consular)
Preferred language: ${language}
Case: ${JSON.stringify(caseRow)}
Client: ${JSON.stringify(client)}

Return JSON:
{
  "summary": "...",
  "practice_questions": [
    { "category": "biographic|eligibility|admissibility|relationship|employment|other", "question": "string", "ideal_answer_structure": "string", "red_flag_responses": ["..."], "follow_up_questions_officer_may_ask": ["..."] }
  ],
  "documents_to_bring": ["..."],
  "courtroom_etiquette_tips": ["..."],
  "anxiety_management_script": "string",
  "language_assistance_recommendations": ["..."],
  "disclaimer": "Practice material; never instructs the client to misrepresent facts."
}`;

    const raw = await callOpenRouter(systemPrompt, userPrompt);
    const parsed = parseJSON(raw);

    try {
      await pool.query(
        `INSERT INTO ai_results (user_id, case_id, analysis_type, payload, created_at)
         VALUES ($1,$2,$3,$4,NOW())`,
        [req.user.id, case_id, 'interview_prep', JSON.stringify(parsed)]
      ).catch(() => {});
    } catch (_) {}

    res.json({ case_id, interview_type, prep: parsed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/case/:id', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, analysis_type, payload, created_at FROM ai_results
       WHERE case_id = $1 AND analysis_type = 'interview_prep' ORDER BY created_at DESC LIMIT 10`,
      [req.params.id]
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
