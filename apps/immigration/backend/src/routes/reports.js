const express = require('express');
const pool = require('../config/database');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', auth, async (req, res) => {
  try {
    const [cases, clients, visas, deadlines, billing] = await Promise.all([
      pool.query("SELECT status, COUNT(*) as count FROM cases GROUP BY status"),
      pool.query("SELECT COUNT(*) as total FROM clients"),
      pool.query("SELECT status, COUNT(*) as count FROM visa_applications GROUP BY status"),
      pool.query("SELECT COUNT(*) as count FROM deadlines WHERE due_date <= NOW() + INTERVAL '7 days' AND status = 'pending'"),
      pool.query("SELECT status, SUM(amount) as total FROM billing GROUP BY status"),
    ]);
    res.json({
      cases: cases.rows,
      total_clients: clients.rows[0]?.total || 0,
      visas: visas.rows,
      upcoming_deadlines: deadlines.rows[0]?.count || 0,
      billing: billing.rows,
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/case-stats', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT case_type, status, COUNT(*) as count FROM cases GROUP BY case_type, status ORDER BY case_type");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/revenue', auth, async (req, res) => {
  try {
    const result = await pool.query("SELECT DATE_TRUNC('month', created_at) as month, SUM(amount) as revenue, status FROM billing GROUP BY month, status ORDER BY month DESC LIMIT 12");
    res.json(result.rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
