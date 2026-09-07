const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM billing');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT b.*, c.case_number, cl.first_name || ' ' || cl.last_name as client_name
       FROM billing b LEFT JOIN cases c ON b.case_id = c.id LEFT JOIN clients cl ON b.client_id = cl.id
       ORDER BY b.created_at DESC LIMIT $1 OFFSET $2`,
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
      `SELECT b.*, c.case_number, cl.first_name || ' ' || cl.last_name as client_name
       FROM billing b LEFT JOIN cases c ON b.case_id = c.id LEFT JOIN clients cl ON b.client_id = cl.id WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { invoice_number, client_id, case_id, amount, status, due_date, description, payment_method } = req.body;
    const result = await pool.query(
      'INSERT INTO billing (invoice_number, client_id, case_id, amount, status, due_date, description, payment_method) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [invoice_number, client_id, case_id, amount, status || 'pending', due_date, description, payment_method]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { invoice_number, client_id, case_id, amount, status, due_date, description, payment_method } = req.body;
    const result = await pool.query(
      'UPDATE billing SET invoice_number=$1, client_id=$2, case_id=$3, amount=$4, status=$5, due_date=$6, description=$7, payment_method=$8, updated_at=NOW() WHERE id=$9 RETURNING *',
      [invoice_number, client_id, case_id, amount, status, due_date, description, payment_method, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM billing WHERE id = $1', [req.params.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
