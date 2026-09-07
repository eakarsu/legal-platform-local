// Beneficiary experience: portal for beneficiaries post-death, guidance on
// claiming assets.
const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const router = express.Router();

const TOKEN_SECRET = process.env.BENEFICIARY_TOKEN_SECRET || 'change-me'; // TODO: configure credentials

function signToken(payload, ttlDays = 30) {
  const expires = Date.now() + ttlDays * 86400000;
  const body = JSON.stringify({ ...payload, expires });
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('hex');
  return Buffer.from(body).toString('base64url') + '.' + sig;
}

function verifyToken(token) {
  try {
    const [b64, sig] = token.split('.');
    const body = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(JSON.stringify(body)).digest('hex');
    if (expected !== sig || body.expires < Date.now()) return null;
    return body;
  } catch { return null; }
}

// POST /api/beneficiary-portal/grant { beneficiary_email, estate_id } (auth required upstream)
router.post('/grant', async (req, res) => {
  const { beneficiary_email, estate_id } = req.body || {};
  if (!beneficiary_email || !estate_id) return res.status(400).json({ error: 'beneficiary_email + estate_id required' });
  const token = signToken({ beneficiary_email, estate_id });
  return res.json({ token, portal_url: `/beneficiary/${token}` });
});

// GET /api/beneficiary-portal/view?token=...
router.get('/view', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'token required' });
  const payload = verifyToken(token);
  if (!payload) return res.status(403).json({ error: 'invalid or expired token' });

  let assets = [], messages = [], steps = [];
  try { assets = (await pool.query(`SELECT label, kind FROM digital_accounts WHERE estate_id = $1`, [payload.estate_id])).rows; } catch {}
  try { messages = (await pool.query(`SELECT * FROM legacy_messages WHERE estate_id = $1 AND recipient_email = $2`, [payload.estate_id, payload.beneficiary_email])).rows; } catch {}
  steps = [
    'Obtain a certified copy of the death certificate.',
    'Contact the named executor or trustee.',
    'Submit claim forms to listed financial institutions.',
    'Verify identity with the platform when prompted.',
  ];
  return res.json({ beneficiary_email: payload.beneficiary_email, estate_id: payload.estate_id, assets, messages, next_steps: steps });
});

module.exports = router;
