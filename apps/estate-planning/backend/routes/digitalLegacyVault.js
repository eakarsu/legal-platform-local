// Digital legacy management: store important messages, photos, credentials
// in a vault (encrypted at rest).
const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const router = express.Router();

const VAULT_KEY = process.env.VAULT_ENCRYPTION_KEY; // TODO: configure credentials (32 bytes base64)

function encrypt(plaintext) {
  if (!VAULT_KEY) throw new Error('VAULT_ENCRYPTION_KEY missing');
  const key = Buffer.from(VAULT_KEY, 'base64');
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(String(plaintext), 'utf8'), c.final()]);
  const tag = c.getAuthTag();
  return `${iv.toString('base64')}.${tag.toString('base64')}.${enc.toString('base64')}`;
}

function decrypt(token) {
  if (!VAULT_KEY) throw new Error('VAULT_ENCRYPTION_KEY missing');
  const [ivB, tagB, encB] = token.split('.');
  const key = Buffer.from(VAULT_KEY, 'base64');
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB, 'base64'));
  d.setAuthTag(Buffer.from(tagB, 'base64'));
  return Buffer.concat([d.update(Buffer.from(encB, 'base64')), d.final()]).toString('utf8');
}

// POST /api/digital-legacy-vault/items { label, content, kind:'note'|'credential'|'message' }
router.post('/items', async (req, res) => {
  try {
    const { label, content, kind = 'note' } = req.body || {};
    if (!label || !content) return res.status(400).json({ error: 'label + content required' });
    if (!VAULT_KEY) return res.status(503).json({ error: 'VAULT_ENCRYPTION_KEY missing' });
    const enc = encrypt(content);
    try {
      const r = await pool.query(`INSERT INTO vault_items (user_id, label, kind, content_enc, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id`, [req.user?.id, label, kind, enc]);
      return res.json({ id: r.rows[0].id, label, kind });
    } catch (e) {
      return res.status(500).json({ error: 'vault_items table missing' });
    }
  } catch (e) {
    return res.status(500).json({ error: 'add failed', detail: e.message });
  }
});

// GET /api/digital-legacy-vault/items/:id (decrypted)
router.get('/items/:id', async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM vault_items WHERE id = $1 AND user_id = $2`, [req.params.id, req.user?.id]);
    if (!r.rows[0]) return res.status(404).json({ error: 'not found' });
    const item = r.rows[0];
    return res.json({ id: item.id, label: item.label, kind: item.kind, content: decrypt(item.content_enc) });
  } catch (e) {
    return res.status(500).json({ error: 'lookup failed', detail: e.message });
  }
});

module.exports = router;
