const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT v.*, cl.first_name || ' ' || cl.last_name as client_name FROM visa_applications v LEFT JOIN clients cl ON v.client_id = cl.id ORDER BY v.created_at DESC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT v.*, cl.first_name || ' ' || cl.last_name as client_name FROM visa_applications v LEFT JOIN clients cl ON v.client_id = cl.id WHERE v.id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Visa application not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { visa_type, client_id, status, application_date, expiry_date, embassy, notes } = req.body;
    const result = await pool.query(
      'INSERT INTO visa_applications (visa_type, client_id, status, application_date, expiry_date, embassy, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [visa_type, client_id, status || 'pending', application_date, expiry_date, embassy, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { visa_type, client_id, status, application_date, expiry_date, embassy, notes } = req.body;
    const result = await pool.query(
      'UPDATE visa_applications SET visa_type=$1, client_id=$2, status=$3, application_date=$4, expiry_date=$5, embassy=$6, notes=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [visa_type, client_id, status, application_date, expiry_date, embassy, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM visa_applications WHERE id = $1', [req.params.id]);
    res.json({ message: 'Visa application deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
