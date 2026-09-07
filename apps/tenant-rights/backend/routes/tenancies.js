const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/tenancies
router.get('/', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const total = await pool.query('SELECT COUNT(*) FROM tenancies WHERE user_id=$1', [req.user.id]);
    const result = await pool.query(
      'SELECT * FROM tenancies WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
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

// POST /api/tenancies
router.post('/', [
  body('property_address').notEmpty(),
  body('state').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { landlord_name, property_address, state, monthly_rent, lease_start, lease_end } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tenancies (user_id, landlord_name, property_address, state, monthly_rent, lease_start, lease_end)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, landlord_name, property_address, state, monthly_rent, lease_start, lease_end]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tenancies/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenancies WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tenancy not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/tenancies/:id
router.put('/:id', async (req, res) => {
  const { landlord_name, property_address, state, monthly_rent, lease_start, lease_end, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tenancies SET
        landlord_name=COALESCE($1,landlord_name),
        property_address=COALESCE($2,property_address),
        state=COALESCE($3,state),
        monthly_rent=COALESCE($4,monthly_rent),
        lease_start=COALESCE($5,lease_start),
        lease_end=COALESCE($6,lease_end),
        status=COALESCE($7,status)
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [landlord_name, property_address, state, monthly_rent, lease_start, lease_end, status, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tenancy not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/tenancies/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM tenancies WHERE id=$1 AND user_id=$2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tenancy not found' });
    res.json({ message: 'Tenancy deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/tenancies/:id/issues
router.get('/:id/issues', async (req, res) => {
  try {
    const t = await pool.query('SELECT id FROM tenancies WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (t.rows.length === 0) return res.status(404).json({ error: 'Tenancy not found' });
    const result = await pool.query('SELECT * FROM issues WHERE tenancy_id=$1 ORDER BY created_at DESC', [req.params.id]);
    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/tenancies/:id/issues
router.post('/:id/issues', [
  body('issue_type').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const t = await pool.query('SELECT id FROM tenancies WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    if (t.rows.length === 0) return res.status(404).json({ error: 'Tenancy not found' });

    const { issue_type, description, reported_date } = req.body;
    const result = await pool.query(
      'INSERT INTO issues (tenancy_id, issue_type, description, reported_date) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.params.id, issue_type, description, reported_date || new Date().toISOString().split('T')[0]]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
