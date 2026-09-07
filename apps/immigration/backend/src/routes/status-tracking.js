const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT s.*, c.case_number, cl.first_name || ' ' || cl.last_name as client_name FROM status_tracking s LEFT JOIN cases c ON s.case_id = c.id LEFT JOIN clients cl ON c.client_id = cl.id ORDER BY s.changed_at DESC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT s.*, c.case_number FROM status_tracking s LEFT JOIN cases c ON s.case_id = c.id WHERE s.id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Status record not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { case_id, old_status, new_status, notes, changed_by } = req.body;
    const result = await pool.query(
      'INSERT INTO status_tracking (case_id, old_status, new_status, notes, changed_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [case_id, old_status, new_status, notes, changed_by || req.user.id]
    );
    if (new_status) {
      await pool.query('UPDATE cases SET status = $1, updated_at = NOW() WHERE id = $2', [new_status, case_id]);
    }
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { case_id, old_status, new_status, notes } = req.body;
    const result = await pool.query(
      'UPDATE status_tracking SET case_id=$1, old_status=$2, new_status=$3, notes=$4 WHERE id=$5 RETURNING *',
      [case_id, old_status, new_status, notes, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM status_tracking WHERE id = $1', [req.params.id]);
    res.json({ message: 'Status record deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
