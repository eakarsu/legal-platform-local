// Family meeting coordinator: schedule and prepare materials for family
// meetings.
const express = require('express');
const pool = require('../db');
const router = express.Router();

// POST /api/family-meeting-coordinator/schedule { date, attendees:[{name,email,role}], agenda:[...], notes? }
router.post('/schedule', async (req, res) => {
  try {
    const { date, attendees = [], agenda = [], notes } = req.body || {};
    if (!date || !attendees.length) return res.status(400).json({ error: 'date + attendees required' });
    try {
      const r = await pool.query(`INSERT INTO family_meetings (user_id, scheduled_for, attendees, agenda, notes, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id`, [req.user?.id, new Date(date), JSON.stringify(attendees), JSON.stringify(agenda), notes || null]);
      return res.json({ id: r.rows[0].id, date, attendees: attendees.length });
    } catch (e) {
      return res.status(500).json({ error: 'family_meetings table missing' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'schedule failed' });
  }
});

// GET /api/family-meeting-coordinator/upcoming
router.get('/upcoming', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM family_meetings WHERE user_id = $1 AND scheduled_for >= NOW() ORDER BY scheduled_for ASC LIMIT 25`, [req.user?.id]).catch(() => ({ rows: [] }));
    return res.json({ count: r.rows.length, meetings: r.rows });
  } catch (e) {
    return res.status(500).json({ error: 'lookup failed' });
  }
});

module.exports = router;
