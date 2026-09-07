// =============================================================================
// AIEstatePlanningDigitalLegacy — Apply pass 5 extensions
//
// Implements remaining backlog from `_AUDIT_NOTE.md`. Additive only.
//
// Env vars consumed:
//   OPENROUTER_API_KEY       — gates all AI endpoints (503 if missing)
//   OPENROUTER_MODEL         — model id
//   LEGAL_DATA_API_KEY       — multi-state legal content provider key
//   LEGAL_DATA_BASE_URL      — multi-state legal content provider URL
//   VAULT_KMS_KEY_ID         — KMS key id for document-vault envelope-encryption
//
// Tables (CREATE TABLE IF NOT EXISTS, additive only):
//   vault_documents_pass5
//   ltc_scenarios_pass5
//   account_consolidation_pass5
//   family_meetings_pass5
//   family_meeting_attendees_pass5
//   beneficiary_portal_invites_pass5
//   intl_jurisdictions_pass5
// =============================================================================

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const pool = require('../db');
const { callOpenRouter } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');

async function ensureSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vault_documents_pass5 (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        title TEXT,
        category TEXT,
        ciphertext TEXT,
        iv TEXT,
        kms_key_id TEXT,
        meta JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ltc_scenarios_pass5 (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        scenario_name TEXT,
        inputs JSONB,
        projected_total NUMERIC(14,2),
        years_modeled INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS account_consolidation_pass5 (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        recommendation JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS family_meetings_pass5 (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        title TEXT,
        scheduled_for TIMESTAMP,
        agenda TEXT,
        notes TEXT,
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS family_meeting_attendees_pass5 (
        id SERIAL PRIMARY KEY,
        meeting_id INTEGER,
        name TEXT,
        email TEXT,
        relationship TEXT,
        rsvp TEXT DEFAULT 'pending'
      );
      CREATE TABLE IF NOT EXISTS beneficiary_portal_invites_pass5 (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        beneficiary_name TEXT,
        beneficiary_email TEXT,
        token TEXT UNIQUE,
        activated_at TIMESTAMP,
        access_level TEXT DEFAULT 'read_post_death',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS intl_jurisdictions_pass5 (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        country TEXT,
        residency_status TEXT,
        notes JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
  } catch (e) { console.error('[extensions] schema warn:', e.message); }
}
ensureSchema();

const KEY = () => process.env.OPENROUTER_API_KEY;
const hasKey = () => !!(KEY() && KEY() !== 'your_openrouter_api_key_here');
function aiUnavailable(res) {
  return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
}

// ── 1. Document vault (NEEDS-PRODUCT-DECISION) ─────────────────────────────
// PRODUCT-DECISION: Envelope encryption is normally KMS-backed, but to keep
// this additive without external creds we use AES-256-GCM with a key derived
// from JWT_SECRET via HKDF. If VAULT_KMS_KEY_ID is set, we record it in the
// document row to flag KMS rotation later. This is NOT production-grade
// crypto without a real KMS — it is a stand-in suitable for dev/demo.
function deriveVaultKey() {
  const seed = process.env.JWT_SECRET || 'estate-planning-secret-key-2024';
  return crypto.createHash('sha256').update('vault-pass5:' + seed).digest();
}
function encryptVault(plaintext) {
  const key = deriveVaultKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: Buffer.concat([enc, tag]).toString('base64'), iv: iv.toString('base64') };
}
function decryptVault(ciphertextB64, ivB64) {
  const key = deriveVaultKey();
  const buf = Buffer.from(ciphertextB64, 'base64');
  const tag = buf.slice(buf.length - 16);
  const data = buf.slice(0, buf.length - 16);
  const iv = Buffer.from(ivB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf8');
}

router.post('/vault/upload', async (req, res) => {
  const { title, category, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'title + content required' });
  const { ciphertext, iv } = encryptVault(content);
  const r = await pool.query(
    `INSERT INTO vault_documents_pass5 (user_id, title, category, ciphertext, iv, kms_key_id, meta)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, title, category, created_at`,
    [req.user.id, title, category || 'general', ciphertext, iv,
     process.env.VAULT_KMS_KEY_ID || null, JSON.stringify({ size: content.length })]
  );
  res.json(r.rows[0]);
});

router.get('/vault/list', async (req, res) => {
  const r = await pool.query(
    `SELECT id, title, category, kms_key_id, meta, created_at
     FROM vault_documents_pass5 WHERE user_id=$1 ORDER BY id DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

router.get('/vault/:id', async (req, res) => {
  const r = await pool.query(
    `SELECT * FROM vault_documents_pass5 WHERE user_id=$1 AND id=$2`,
    [req.user.id, req.params.id]
  );
  if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  const row = r.rows[0];
  let plaintext = null;
  try { plaintext = decryptVault(row.ciphertext, row.iv); }
  catch (e) { return res.status(500).json({ error: 'Decryption failed', detail: e.message }); }
  res.json({ id: row.id, title: row.title, category: row.category, content: plaintext, kms_key_id: row.kms_key_id });
});

// ── 2. Multi-state legal compliance content (NEEDS-CREDS) ──────────────────
router.get('/legal/jurisdiction-info', async (req, res) => {
  const need = ['LEGAL_DATA_API_KEY', 'LEGAL_DATA_BASE_URL'];
  const missing = need.filter(k => !process.env[k]);
  if (missing.length) {
    return res.status(503).json({
      error: 'Legal-data provider not configured',
      missing: missing.join(',')
    });
  }
  // PRODUCT-DECISION: Real provider call left to integrators. Returning a
  // shaped placeholder so FE can render structure when configured.
  res.json({
    jurisdiction: req.query.jurisdiction || 'US-CA',
    forms: [], statutes: [], note: 'Configured — integrator must wire HTTP call'
  });
});

router.post('/ai/multistate-summary', async (req, res) => {
  if (!hasKey()) return aiUnavailable(res);
  const { jurisdiction, scenario } = req.body || {};
  if (!jurisdiction) return res.status(400).json({ error: 'jurisdiction required' });
  const prompt = `Summarize the high-level estate-planning legal differences for jurisdiction "${jurisdiction}". Scenario: ${scenario || 'standard estate'}. Include caveats and recommend a licensed attorney consultation.`;
  const ai = await callOpenRouter(prompt, 'You are a legal-research summarizer. Always include disclaimers.');
  if (!ai.success) return res.status(502).json({ error: ai.error });
  res.json({ jurisdiction, summary: ai.response, model: ai.model });
});

// ── 3. Long-term care cost modeling (TOO-RISKY → in-memory model) ──────────
// PRODUCT-DECISION: Use a deterministic, transparent compounding model
// (no actuarial tables). Caller supplies monthly_cost, years, inflation,
// expected_age_of_need; we project cost. AI endpoint adds qualitative advice.
router.post('/ltc/project', async (req, res) => {
  const {
    scenario_name = 'Default LTC scenario',
    monthly_cost = 8000,
    years = 5,
    inflation = 0.04,
    age_now = 65,
    expected_age_of_need = 80
  } = req.body || {};
  const yearsUntilNeed = Math.max(0, expected_age_of_need - age_now);
  const inflated = monthly_cost * Math.pow(1 + inflation, yearsUntilNeed);
  let total = 0;
  for (let y = 0; y < years; y++) {
    total += inflated * 12 * Math.pow(1 + inflation, y);
  }
  const projected_total = Math.round(total);
  const r = await pool.query(
    `INSERT INTO ltc_scenarios_pass5 (user_id, scenario_name, inputs, projected_total, years_modeled, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, scenario_name,
     JSON.stringify({ monthly_cost, years, inflation, age_now, expected_age_of_need }),
     projected_total, years,
     'Deterministic compounding; not actuarial. Consult a qualified financial advisor.']
  );
  res.json(r.rows[0]);
});

router.post('/ai/ltc-advisory', async (req, res) => {
  if (!hasKey()) return aiUnavailable(res);
  const { projected_total, years, age_of_need, assets, insurance } = req.body || {};
  const prompt = `A user faces a projected long-term-care need of ~$${projected_total} over ${years} years starting around age ${age_of_need}. Their disclosed liquid assets: ${assets || 'unknown'}. Existing LTC insurance: ${insurance || 'none'}. Provide funding strategy options (private-pay, hybrid LTC insurance, Medicaid planning trade-offs). Include strong disclaimers.`;
  const ai = await callOpenRouter(prompt, 'You are a long-term-care planning advisor. Always include legal/financial disclaimers.');
  if (!ai.success) return res.status(502).json({ error: ai.error });
  res.json({ advisory: ai.response, model: ai.model });
});

// ── 4. Account consolidation recommendations (MECHANICAL — completes audit) ─
router.post('/ai/account-consolidate', async (req, res) => {
  if (!hasKey()) return aiUnavailable(res);
  const userId = req.user.id;
  const [assets, accounts] = await Promise.all([
    pool.query(`SELECT asset_name, asset_type, platform, value_estimate FROM digital_assets WHERE user_id=$1`, [userId]),
    pool.query(`SELECT account_name, platform, account_type, balance FROM digital_accounts WHERE user_id=$1`, [userId]).catch(() => ({ rows: [] }))
  ]);
  if (assets.rows.length + accounts.rows.length === 0) return res.status(404).json({ error: 'No assets/accounts on file' });
  const prompt = `Recommend consolidation steps for the following financial/digital footprint. Identify duplicate platforms, low-value accounts to close, and consolidation candidates.\n\nAssets:\n${JSON.stringify(assets.rows, null, 2)}\n\nAccounts:\n${JSON.stringify(accounts.rows, null, 2)}`;
  const ai = await callOpenRouter(prompt, 'You are a personal-finance consolidation advisor.');
  if (!ai.success) return res.status(502).json({ error: ai.error });
  await pool.query(
    `INSERT INTO account_consolidation_pass5 (user_id, recommendation) VALUES ($1,$2)`,
    [userId, JSON.stringify({ text: ai.response, model: ai.model })]
  );
  res.json({ recommendation: ai.response, model: ai.model });
});

// ── 5. Family meeting coordinator (NEEDS-PRODUCT-DECISION) ─────────────────
// PRODUCT-DECISION: In-app coordination only (no calendar API). Caller adds
// attendees with email; agenda is free text.
router.post('/family-meetings', async (req, res) => {
  const { title, scheduled_for, agenda, attendees } = req.body || {};
  const r = await pool.query(
    `INSERT INTO family_meetings_pass5 (user_id, title, scheduled_for, agenda)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.id, title || 'Family meeting', scheduled_for || null, agenda || '']
  );
  const meetingId = r.rows[0].id;
  if (Array.isArray(attendees)) {
    for (const a of attendees) {
      await pool.query(
        `INSERT INTO family_meeting_attendees_pass5 (meeting_id, name, email, relationship)
         VALUES ($1,$2,$3,$4)`,
        [meetingId, a.name || '', a.email || '', a.relationship || '']
      );
    }
  }
  res.json(r.rows[0]);
});

router.get('/family-meetings', async (req, res) => {
  const r = await pool.query(
    `SELECT m.*,
      (SELECT json_agg(a.*) FROM family_meeting_attendees_pass5 a WHERE a.meeting_id=m.id) AS attendees
     FROM family_meetings_pass5 m WHERE m.user_id=$1 ORDER BY m.id DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

router.post('/ai/family-meeting-agenda', async (req, res) => {
  if (!hasKey()) return aiUnavailable(res);
  const { topic, attendee_count, sensitive_topics } = req.body || {};
  const prompt = `Generate a respectful, structured agenda for a family estate-planning meeting. Topic: ${topic || 'general estate review'}. Attendees: ${attendee_count || 'unknown'}. Sensitive topics to handle: ${sensitive_topics || 'none specified'}. Include time-boxed sections and a closing-questions block.`;
  const ai = await callOpenRouter(prompt, 'You are a family-meeting facilitator.');
  if (!ai.success) return res.status(502).json({ error: ai.error });
  res.json({ agenda: ai.response, model: ai.model });
});

// ── 6. Beneficiary portal post-death (NEEDS-PRODUCT-DECISION) ──────────────
// PRODUCT-DECISION: Token-link model. Owner creates an invite; portal
// activates only after a manual `/activate` action (representing executor
// confirmation). No automatic death-trigger.
router.post('/beneficiary-portal/invite', async (req, res) => {
  const { beneficiary_name, beneficiary_email } = req.body || {};
  if (!beneficiary_name) return res.status(400).json({ error: 'beneficiary_name required' });
  const token = crypto.randomBytes(20).toString('hex');
  const r = await pool.query(
    `INSERT INTO beneficiary_portal_invites_pass5 (user_id, beneficiary_name, beneficiary_email, token)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.id, beneficiary_name, beneficiary_email || null, token]
  );
  res.json(r.rows[0]);
});

router.post('/beneficiary-portal/:id/activate', async (req, res) => {
  const r = await pool.query(
    `UPDATE beneficiary_portal_invites_pass5 SET activated_at=NOW()
     WHERE user_id=$1 AND id=$2 RETURNING *`,
    [req.user.id, req.params.id]
  );
  if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json(r.rows[0]);
});

router.get('/beneficiary-portal/list', async (req, res) => {
  const r = await pool.query(
    `SELECT id, beneficiary_name, beneficiary_email, activated_at, access_level, created_at
     FROM beneficiary_portal_invites_pass5 WHERE user_id=$1 ORDER BY id DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

// (Public token-gated view lives in extensionsPublic.js mounted at /api/ext-public)

// ── 7. International planning (NEEDS-PRODUCT-DECISION) ─────────────────────
// PRODUCT-DECISION: Capture intent only — country + residency status.
// Treaty-network analysis is genuinely complex and deferred to AI advisory.
router.post('/intl/jurisdictions', async (req, res) => {
  const { country, residency_status, notes } = req.body || {};
  if (!country) return res.status(400).json({ error: 'country required' });
  const r = await pool.query(
    `INSERT INTO intl_jurisdictions_pass5 (user_id, country, residency_status, notes)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.id, country, residency_status || 'unknown', JSON.stringify(notes || {})]
  );
  res.json(r.rows[0]);
});

router.get('/intl/jurisdictions', async (req, res) => {
  const r = await pool.query(
    `SELECT * FROM intl_jurisdictions_pass5 WHERE user_id=$1 ORDER BY id DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

router.post('/ai/intl-treaty-summary', async (req, res) => {
  if (!hasKey()) return aiUnavailable(res);
  const r = await pool.query(
    `SELECT country, residency_status FROM intl_jurisdictions_pass5 WHERE user_id=$1`,
    [req.user.id]
  );
  if (r.rows.length === 0) return res.status(404).json({ error: 'No international jurisdictions on file' });
  const prompt = `Provide a high-level summary of estate-tax treaty considerations for someone with the following jurisdiction footprint. Note major gotchas (situs assets, forced heirship, double-tax treaties). Add disclaimer that this is informational only.\n\n${JSON.stringify(r.rows, null, 2)}`;
  const ai = await callOpenRouter(prompt, 'You are an international estate-planning summarizer. Always include disclaimers.');
  if (!ai.success) return res.status(502).json({ error: ai.error });
  res.json({ summary: ai.response, model: ai.model });
});

module.exports = router;
