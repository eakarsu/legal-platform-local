const express = require('express');
const PDFDocument = require('pdfkit');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

// Light rate limiter scoped to the per-user view endpoints
const viewsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => (req.user && req.user.id) ? `u:${req.user.id}` : `ip:${req.ip}`,
  standardHeaders: true,
  legacyHeaders: false,
});

// Ensure procedural_rules table exists (idempotent), lazy on first request
let _ensured = false;
async function ensureSchema() {
  if (_ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS procedural_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      jurisdiction VARCHAR(120) NOT NULL,
      rule_title VARCHAR(255) NOT NULL,
      filing_fee NUMERIC(10,2) DEFAULT 0,
      service_fee NUMERIC(10,2) DEFAULT 0,
      max_claim_amount NUMERIC(12,2) DEFAULT 10000,
      notes TEXT,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  // Seed a couple of defaults the first time the table is empty
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM procedural_rules');
  if (rows[0].c === 0) {
    await pool.query(
      `INSERT INTO procedural_rules (jurisdiction, rule_title, filing_fee, service_fee, max_claim_amount, notes)
       VALUES
       ('California', 'Small Claims Filing — under $1,500', 30, 75, 10000, 'Plaintiff cannot be represented by an attorney at the hearing.'),
       ('California', 'Small Claims Filing — $1,500 to $5,000', 50, 75, 10000, 'Service must be completed at least 15 days before hearing.'),
       ('New York', 'Small Claims Filing — NYC', 15, 0, 10000, 'Personal service required; mailing service accepted with affidavit.'),
       ('Texas', 'Justice Court Filing', 54, 75, 20000, 'Defendant has 14 days to answer after service.')`
    );
  }
  _ensured = true;
}

router.use(authMiddleware, viewsLimiter, async (req, res, next) => {
  try { await ensureSchema(); next(); } catch (e) { next(e); }
});

// ---------- VIZ 1: Case Status Pipeline ----------
// GET /api/custom-views/case-pipeline -> { stages: [{ status, count }], total }
router.get('/case-pipeline', async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT COALESCE(status, 'draft') AS status, COUNT(*)::int AS count
      FROM cases
      WHERE user_id = $1
      GROUP BY COALESCE(status, 'draft')
    `;
    const { rows } = await pool.query(sql, [userId]);
    const order = ['draft', 'filed', 'served', 'hearing', 'judgment', 'collected', 'closed'];
    const map = Object.fromEntries(rows.map(r => [r.status, r.count]));
    const stages = order.map(s => ({ status: s, count: map[s] || 0 }));
    // Include any non-canonical statuses too
    rows.forEach(r => { if (!order.includes(r.status)) stages.push({ status: r.status, count: r.count }); });
    const total = stages.reduce((a, b) => a + b.count, 0);
    res.json({ stages, total });
  } catch (err) {
    console.error('case-pipeline error', err);
    res.status(500).json({ error: 'Failed to load case pipeline' });
  }
});

// ---------- VIZ 2: Court Schedule Heatmap ----------
// GET /api/custom-views/court-heatmap -> { courts: [...], dates: [...], cells: [{ court, date, count }] }
router.get('/court-heatmap', async (req, res) => {
  try {
    const userId = req.user.id;
    // Build a 14-day window of court hearing deadlines grouped by jurisdiction_county
    const sql = `
      SELECT COALESCE(c.jurisdiction_county, c.jurisdiction_state, 'Unknown') AS court,
             d.due_date::date AS date,
             COUNT(*)::int AS count
      FROM deadlines d
      JOIN cases c ON c.id = d.case_id
      WHERE c.user_id = $1
        AND d.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '13 days'
      GROUP BY court, d.due_date
      ORDER BY court, d.due_date
    `;
    const { rows } = await pool.query(sql, [userId]);
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const courtsSet = new Set(rows.map(r => r.court));
    // Always include at least a placeholder court so the grid renders
    if (courtsSet.size === 0) {
      courtsSet.add('No upcoming hearings');
    }
    const courts = Array.from(courtsSet);
    const cells = [];
    courts.forEach(court => {
      dates.forEach(date => {
        const hit = rows.find(r => r.court === court && r.date.toISOString().slice(0, 10) === date);
        cells.push({ court, date, count: hit ? hit.count : 0 });
      });
    });
    res.json({ courts, dates, cells });
  } catch (err) {
    console.error('court-heatmap error', err);
    res.status(500).json({ error: 'Failed to load court heatmap' });
  }
});

// ---------- NON-VIZ 1: Filing Template PDF ----------
// GET /api/custom-views/filing-template.pdf?jurisdiction=California&plaintiff=...&defendant=...&amount=...
router.get('/filing-template.pdf', async (req, res) => {
  try {
    const {
      jurisdiction = 'California',
      plaintiff = '',
      defendant = '',
      amount = '',
      facts = '',
    } = req.query;

    let fee = null;
    try {
      const r = await pool.query(
        `SELECT filing_fee, max_claim_amount FROM procedural_rules WHERE jurisdiction ILIKE $1 ORDER BY filing_fee ASC LIMIT 1`,
        [jurisdiction]
      );
      if (r.rows[0]) fee = r.rows[0];
    } catch (_) {}

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="filing-template-${jurisdiction}.pdf"`);

    const doc = new PDFDocument({ size: 'LETTER', margin: 54 });
    doc.pipe(res);

    doc.fontSize(18).fillColor('#1a365d').text('Small Claims Filing Template', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#444').text(`Jurisdiction: ${jurisdiction}`, { align: 'center' });
    doc.moveDown(1.2);

    doc.fontSize(13).fillColor('#000').text('Parties', { underline: true });
    doc.fontSize(11).text(`Plaintiff: ${plaintiff || '__________________________'}`);
    doc.text(`Defendant: ${defendant || '__________________________'}`);
    doc.moveDown();

    doc.fontSize(13).text('Claim', { underline: true });
    doc.fontSize(11).text(`Amount Sought: $${amount || '___________'}`);
    if (fee) {
      doc.text(`Statutory Filing Fee (per current rules): $${Number(fee.filing_fee).toFixed(2)}`);
      doc.text(`Jurisdictional Maximum: $${Number(fee.max_claim_amount).toFixed(2)}`);
    }
    doc.moveDown();

    doc.fontSize(13).text('Statement of Facts', { underline: true });
    doc.fontSize(11).text(facts || 'Provide a concise statement of the facts giving rise to the claim. Attach exhibits as appropriate.');
    doc.moveDown(2);

    doc.fontSize(13).text('Verification & Signature', { underline: true });
    doc.fontSize(11).text('I declare under penalty of perjury that the foregoing is true and correct.');
    doc.moveDown(2);
    doc.text('_______________________________________');
    doc.text('Signature of Plaintiff');
    doc.moveDown(0.5);
    doc.text('Date: ____________________');

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#777').text(
      'This template is an informational starting point and not legal advice. Verify current local rules before filing.',
      { align: 'center' }
    );

    doc.end();
  } catch (err) {
    console.error('filing-template error', err);
    if (!res.headersSent) res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// ---------- NON-VIZ 2: Procedural Rules Editor (CRUD) ----------
// GET list, POST create, PUT update, DELETE remove
router.get('/rules', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, jurisdiction, rule_title, filing_fee, service_fee, max_claim_amount, notes, updated_at
       FROM procedural_rules ORDER BY jurisdiction, rule_title`
    );
    res.json({ rules: rows });
  } catch (err) {
    console.error('rules list error', err);
    res.status(500).json({ error: 'Failed to list rules' });
  }
});

router.post('/rules', async (req, res) => {
  try {
    const { jurisdiction, rule_title, filing_fee = 0, service_fee = 0, max_claim_amount = 10000, notes = '' } = req.body || {};
    if (!jurisdiction || !rule_title) return res.status(400).json({ error: 'jurisdiction and rule_title required' });
    const { rows } = await pool.query(
      `INSERT INTO procedural_rules (jurisdiction, rule_title, filing_fee, service_fee, max_claim_amount, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [jurisdiction, rule_title, filing_fee, service_fee, max_claim_amount, notes]
    );
    res.status(201).json({ rule: rows[0] });
  } catch (err) {
    console.error('rules create error', err);
    res.status(500).json({ error: 'Failed to create rule' });
  }
});

router.put('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { jurisdiction, rule_title, filing_fee, service_fee, max_claim_amount, notes } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE procedural_rules SET
         jurisdiction = COALESCE($2, jurisdiction),
         rule_title = COALESCE($3, rule_title),
         filing_fee = COALESCE($4, filing_fee),
         service_fee = COALESCE($5, service_fee),
         max_claim_amount = COALESCE($6, max_claim_amount),
         notes = COALESCE($7, notes),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, jurisdiction, rule_title, filing_fee, service_fee, max_claim_amount, notes]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Rule not found' });
    res.json({ rule: rows[0] });
  } catch (err) {
    console.error('rules update error', err);
    res.status(500).json({ error: 'Failed to update rule' });
  }
});

router.delete('/rules/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const r = await pool.query('DELETE FROM procedural_rules WHERE id = $1', [id]);
    res.json({ deleted: r.rowCount });
  } catch (err) {
    console.error('rules delete error', err);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

module.exports = router;
