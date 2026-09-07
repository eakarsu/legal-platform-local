const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { action, entity_type, user_id } = req.query;

    let where = [];
    let params = [];
    let idx = 1;

    if (action) { where.push(`al.action ILIKE $${idx++}`); params.push(`%${action}%`); }
    if (entity_type) { where.push(`al.entity_type ILIKE $${idx++}`); params.push(`%${entity_type}%`); }
    if (user_id) { where.push(`al.user_id = $${idx++}`); params.push(parseInt(user_id)); }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_log al ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM audit_log al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.timestamp DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
