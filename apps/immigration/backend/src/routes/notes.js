const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT n.*, c.case_number, u.full_name as author_name FROM notes n LEFT JOIN cases c ON n.case_id = c.id LEFT JOIN users u ON n.author_id = u.id ORDER BY n.created_at DESC");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT n.*, c.case_number, u.full_name as author_name FROM notes n LEFT JOIN cases c ON n.case_id = c.id LEFT JOIN users u ON n.author_id = u.id WHERE n.id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { case_id, title, content, note_type } = req.body;
    const result = await pool.query(
      'INSERT INTO notes (case_id, title, content, note_type, author_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [case_id, title, content, note_type || 'general', req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { case_id, title, content, note_type } = req.body;
    const result = await pool.query(
      'UPDATE notes SET case_id=$1, title=$2, content=$3, note_type=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
      [case_id, title, content, note_type, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
    res.json({ message: 'Note deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
