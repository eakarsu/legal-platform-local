const { openRouterFetch } = require('../../../../packages/ai-client/index.cjs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');
const parseAIJson = require('../middleware/parseAIJson');

const router = express.Router();
router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/cases
router.get('/', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const total = await pool.query('SELECT COUNT(*) FROM cases WHERE user_id=$1', [req.user.id]);
    const result = await pool.query(
      'SELECT * FROM cases WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, limit, offset]
    );
    res.json({
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total: Number(total.rows[0].count) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cases
router.post('/', [
  body('dispute_type').notEmpty(),
  body('jurisdiction_state').notEmpty(),
  body('claim_amount').isNumeric(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { dispute_type, jurisdiction_state, jurisdiction_county, claim_amount, opposing_party, facts } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO cases (user_id, dispute_type, jurisdiction_state, jurisdiction_county, claim_amount, opposing_party, facts)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, dispute_type, jurisdiction_state, jurisdiction_county, claim_amount, opposing_party, facts]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cases/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cases WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/cases/:id
router.put('/:id', async (req, res) => {
  const { dispute_type, jurisdiction_state, jurisdiction_county, claim_amount, opposing_party, facts, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cases SET dispute_type=COALESCE($1,dispute_type), jurisdiction_state=COALESCE($2,jurisdiction_state),
       jurisdiction_county=COALESCE($3,jurisdiction_county), claim_amount=COALESCE($4,claim_amount),
       opposing_party=COALESCE($5,opposing_party), facts=COALESCE($6,facts), status=COALESCE($7,status)
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [dispute_type, jurisdiction_state, jurisdiction_county, claim_amount, opposing_party, facts, status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cases/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cases WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    res.json({ message: 'Case deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cases/:id/evidence — multer upload + AI classification
router.post('/:id/evidence', upload.single('file'), async (req, res) => {
  try {
    const caseRow = await pool.query('SELECT * FROM cases WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (caseRow.rows.length === 0) return res.status(404).json({ error: 'Case not found' });

    const { description } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // Count existing evidence for exhibit label
    const countResult = await pool.query('SELECT COUNT(*) FROM evidence_items WHERE case_id=$1', [req.params.id]);
    const exhibitNum = Number(countResult.rows[0].count) + 1;
    const exhibit_label = `Exhibit ${String.fromCharCode(64 + exhibitNum)}`;

    // AI classification
    let ai_classification = 'general document';
    try {
      const prompt = `Classify this evidence file for a small claims court case.
File name: ${file.originalname}
File type: ${file.mimetype}
Description: ${description || 'None provided'}
Respond with a single JSON object: {"classification": "photo|contract|receipt|invoice|correspondence|medical_record|bank_statement|other", "relevance": "high|medium|low", "notes": "brief note"}`;

      const aiRes = await openRouterFetch({
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
        }),
      });
      const aiData = await aiRes.json();
      const parsed = parseAIJson(aiData.choices?.[0]?.message?.content);
      if (parsed?.classification) ai_classification = parsed.classification;
    } catch (_) {}

    const result = await pool.query(
      `INSERT INTO evidence_items (case_id, exhibit_label, file_path, file_type, description, ai_classification)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, exhibit_label, file.path, file.mimetype, description, ai_classification]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cases/:id/evidence
router.get('/:id/evidence', async (req, res) => {
  try {
    const caseRow = await pool.query('SELECT id FROM cases WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (caseRow.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    const result = await pool.query('SELECT * FROM evidence_items WHERE case_id=$1 ORDER BY created_at', [req.params.id]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cases/:id/deadlines
router.get('/:id/deadlines', async (req, res) => {
  try {
    const caseRow = await pool.query('SELECT id FROM cases WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (caseRow.rows.length === 0) return res.status(404).json({ error: 'Case not found' });
    const result = await pool.query('SELECT * FROM deadlines WHERE case_id=$1 ORDER BY due_date', [req.params.id]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cases/:id/deadlines
router.post('/:id/deadlines', [
  body('deadline_type').notEmpty(),
  body('due_date').isISO8601(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const caseRow = await pool.query('SELECT id FROM cases WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (caseRow.rows.length === 0) return res.status(404).json({ error: 'Case not found' });

    const { deadline_type, due_date, description } = req.body;
    const result = await pool.query(
      'INSERT INTO deadlines (case_id, deadline_type, due_date, description) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, deadline_type, due_date, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
