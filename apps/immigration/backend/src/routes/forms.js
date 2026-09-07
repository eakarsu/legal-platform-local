const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT f.*, c.case_number, cl.first_name || ' ' || cl.last_name as client_name FROM forms f LEFT JOIN cases c ON f.case_id = c.id LEFT JOIN clients cl ON f.client_id = cl.id ORDER BY f.created_at DESC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT f.*, c.case_number, cl.first_name || ' ' || cl.last_name as client_name FROM forms f LEFT JOIN cases c ON f.case_id = c.id LEFT JOIN clients cl ON f.client_id = cl.id WHERE f.id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Form not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { form_type, form_name, case_id, client_id, status, data, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO forms (form_type, form_name, case_id, client_id, status, data, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [form_type, form_name, case_id, client_id, status || 'draft', JSON.stringify(data || {}), notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { form_type, form_name, case_id, client_id, status, data, notes } = req.body;
    const result = await pool.query(
      'UPDATE forms SET form_type=$1, form_name=$2, case_id=$3, client_id=$4, status=$5, data=$6, notes=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [form_type, form_name, case_id, client_id, status, JSON.stringify(data || {}), notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM forms WHERE id = $1', [req.params.id]);
    res.json({ message: 'Form deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
