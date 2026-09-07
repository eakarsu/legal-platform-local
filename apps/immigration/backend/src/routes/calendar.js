/*
 * routes/calendar.js — Apply pass 5
 *
 * Mechanical (no-LLM) ICS export for case deadlines. Audit (batch_04 §29)
 * flagged: "missing non-AI features → no client portal / status tracking"
 * and "custom #1 — agentic case manager (deadline reminders)".
 *
 * GET /api/calendar/deadlines.ics  — RFC 5545 ICS feed of upcoming deadlines
 *                                    (caller-scoped via JWT)
 *
 * No third-party calls. No new schema. Reads existing `deadlines` table.
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

function escapeIcs(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function toIcsDate(d) {
  // Floating UTC date-time YYYYMMDDTHHmmssZ
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}${pad(dt.getUTCSeconds())}Z`;
}

router.get('/deadlines.ics', auth, async (req, res) => {
  try {
    const days = Math.min(365, Math.max(7, parseInt(req.query.days, 10) || 90));
    const result = await pool.query(
      `SELECT * FROM deadlines
       WHERE due_date IS NOT NULL
         AND due_date >= NOW()
         AND due_date <= NOW() + INTERVAL '${days} days'
       ORDER BY due_date ASC
       LIMIT 500`,
    );

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AIImmigrationCaseManager//Apply5//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];
    const stamp = toIcsDate(new Date());
    for (const d of result.rows) {
      const start = toIcsDate(d.due_date);
      if (!start) continue;
      const uid = `deadline-${d.id}@aiimmigration`;
      const summary = `Immigration deadline: ${d.deadline_type || d.title || 'review case'}`;
      const description = `Case ${d.case_id || ''} — ${d.description || ''}. Informational; not legal advice.`;
      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${start}`,
        `DTEND:${start}`,
        `SUMMARY:${escapeIcs(summary)}`,
        `DESCRIPTION:${escapeIcs(description)}`,
        'END:VEVENT',
      );
    }
    lines.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="immigration-deadlines.ics"`);
    res.send(lines.join('\r\n'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
