const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM clients');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      'SELECT * FROM clients ORDER BY created_at DESC LIMIT $1 OFFSET $2',
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
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Client not found' });

    // PII access log
    try {
      await pool.query(
        'INSERT INTO audit_log (user_id, action, entity_type, entity_id, ip_address) VALUES ($1,$2,$3,$4,$5)',
        [req.user?.id, 'READ_CLIENT_PII', 'clients', req.params.id, req.ip]
      );
    } catch (_) {}

    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  const { first_name, last_name, email, phone, nationality, date_of_birth, passport_number, current_status, address } = req.body;
  if (!first_name) return res.status(400).json({ error: 'name (first_name) is required' });
  try {
    const result = await pool.query(
      'INSERT INTO clients (first_name, last_name, email, phone, nationality, date_of_birth, passport_number, current_status, address) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [first_name, last_name, email, phone, nationality, date_of_birth, passport_number, current_status, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, nationality, date_of_birth, passport_number, current_status, address } = req.body;
    const result = await pool.query(
      'UPDATE clients SET first_name=$1, last_name=$2, email=$3, phone=$4, nationality=$5, date_of_birth=$6, passport_number=$7, current_status=$8, address=$9, updated_at=NOW() WHERE id=$10 RETURNING *',
      [first_name, last_name, email, phone, nationality, date_of_birth, passport_number, current_status, address, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM clients WHERE id = $1', [req.params.id]);
    res.json({ message: 'Client deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
