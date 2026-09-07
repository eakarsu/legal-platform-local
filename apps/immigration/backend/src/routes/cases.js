const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM cases');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT c.*, cl.first_name || ' ' || cl.last_name as client_name
       FROM cases c LEFT JOIN clients cl ON c.client_id = cl.id
       ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Support both paginated and legacy (no query params) clients
    if (!req.query.page && !req.query.limit) {
      return res.json(result.rows);
    }
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cl.first_name || ' ' || cl.last_name as client_name
       FROM cases c LEFT JOIN clients cl ON c.client_id = cl.id WHERE c.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Case not found' });

    // PII access log
    try {
      await pool.query(
        'INSERT INTO audit_log (user_id, action, entity_type, entity_id, ip_address) VALUES ($1,$2,$3,$4,$5)',
        [req.user?.id, 'READ_CASE', 'cases', req.params.id, req.ip]
      );
    } catch (_) {}

    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  const { case_number, case_type, client_id, status, priority, description, filing_date, deadline } = req.body;
  if (!client_id) return res.status(400).json({ error: 'client_id is required' });
  if (!case_type) return res.status(400).json({ error: 'case_type is required' });
  try {
    const result = await pool.query(
      'INSERT INTO cases (case_number, case_type, client_id, status, priority, description, filing_date, deadline, assigned_attorney_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [case_number, case_type, client_id, status || 'open', priority || 'medium', description, filing_date, deadline, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { case_number, case_type, client_id, status, priority, description, filing_date, deadline } = req.body;
    const result = await pool.query(
      'UPDATE cases SET case_number=$1, case_type=$2, client_id=$3, status=$4, priority=$5, description=$6, filing_date=$7, deadline=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [case_number, case_type, client_id, status, priority, description, filing_date, deadline, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cases WHERE id = $1', [req.params.id]);
    res.json({ message: 'Case deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
