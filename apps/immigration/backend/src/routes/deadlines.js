const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM deadlines');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT d.*, c.case_number, cl.first_name || ' ' || cl.last_name as client_name
       FROM deadlines d LEFT JOIN cases c ON d.case_id = c.id LEFT JOIN clients cl ON c.client_id = cl.id
       ORDER BY d.due_date ASC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    if (!req.query.page && !req.query.limit) {
      return res.json(result.rows);
    }
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT d.*, c.case_number FROM deadlines d LEFT JOIN cases c ON d.case_id = c.id WHERE d.id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Deadline not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, due_date, case_id, priority, status } = req.body;
    const result = await pool.query(
      'INSERT INTO deadlines (title, description, due_date, case_id, priority, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [title, description, due_date, case_id, priority || 'medium', status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, due_date, case_id, priority, status } = req.body;
    const result = await pool.query(
      'UPDATE deadlines SET title=$1, description=$2, due_date=$3, case_id=$4, priority=$5, status=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [title, description, due_date, case_id, priority, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM deadlines WHERE id = $1', [req.params.id]);
    res.json({ message: 'Deadline deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
