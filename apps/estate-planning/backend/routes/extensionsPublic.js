// Apply pass 5 — public beneficiary-portal view (token-gated, no JWT).
// Mounted at /api/ext-public. See extensions.js for owner-side routes.
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/beneficiary-portal/view/:token', async (req, res) => {
  const r = await pool.query(
    `SELECT * FROM beneficiary_portal_invites_pass5 WHERE token=$1`, [req.params.token]
  );
  if (r.rowCount === 0) return res.status(404).json({ error: 'Invalid token' });
  const inv = r.rows[0];
  if (!inv.activated_at) return res.status(403).json({ error: 'Portal not yet activated by executor' });
  res.json({
    beneficiary_name: inv.beneficiary_name,
    activated_at: inv.activated_at,
    access_level: inv.access_level
  });
});

module.exports = router;
