const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT co.*, c.case_number, cl.first_name || ' ' || cl.last_name as client_name FROM compliance co LEFT JOIN cases c ON co.case_id = c.id LEFT JOIN clients cl ON co.client_id = cl.id ORDER BY co.created_at DESC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT co.*, c.case_number, cl.first_name || ' ' || cl.last_name as client_name FROM compliance co LEFT JOIN cases c ON co.case_id = c.id LEFT JOIN clients cl ON co.client_id = cl.id WHERE co.id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Compliance check not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { check_type, case_id, client_id, status, result: checkResult, notes } = req.body;
    const r = await pool.query(
      'INSERT INTO compliance (check_type, case_id, client_id, status, result, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [check_type, case_id, client_id, status || 'pending', checkResult, notes]
    );
    res.status(201).json(r.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { check_type, case_id, client_id, status, result: checkResult, notes } = req.body;
    const r = await pool.query(
      'UPDATE compliance SET check_type=$1, case_id=$2, client_id=$3, status=$4, result=$5, notes=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [check_type, case_id, client_id, status, checkResult, notes, req.params.id]
    );
    res.json(r.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM compliance WHERE id = $1', [req.params.id]);
    res.json({ message: 'Compliance check deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
