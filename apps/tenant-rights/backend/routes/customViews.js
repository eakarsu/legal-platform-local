const express = require('express');
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');
const { pool } = require('../db');

const router = express.Router();

// In-memory store for state regulation rules (seeded)
let regulationRules = [
  { id: 1, state: 'CA', category: 'Rent Control', rule: 'Annual rent increase capped at 5% + CPI (max 10%)', citation: 'AB 1482', updated: '2026-05-01' },
  { id: 2, state: 'NY', category: 'Habitability', rule: 'Landlords must maintain heat at 68F (day) / 62F (night)', citation: 'NYC Admin Code 27-2029', updated: '2026-04-15' },
  { id: 3, state: 'TX', category: 'Eviction', rule: '3-day notice to vacate required before filing eviction', citation: 'TX Prop Code 24.005', updated: '2026-03-20' },
  { id: 4, state: 'FL', category: 'Security Deposit', rule: 'Return deposit within 15 days or written notice within 30', citation: 'FL Stat 83.49', updated: '2026-02-10' },
  { id: 5, state: 'WA', category: 'Notice', rule: '14-day pay-or-vacate notice required for nonpayment', citation: 'RCW 59.12.030', updated: '2026-01-25' },
];
let nextRuleId = 6;

// Seed sample case/violation data for visualizations (in-memory)
const sampleCases = [
  { state: 'CA', violation: 'Habitability', status: 'open' },
  { state: 'CA', violation: 'Habitability', status: 'resolved' },
  { state: 'CA', violation: 'Rent Increase', status: 'pending' },
  { state: 'CA', violation: 'Eviction', status: 'open' },
  { state: 'NY', violation: 'Habitability', status: 'open' },
  { state: 'NY', violation: 'Habitability', status: 'open' },
  { state: 'NY', violation: 'Security Deposit', status: 'resolved' },
  { state: 'NY', violation: 'Eviction', status: 'pending' },
  { state: 'TX', violation: 'Eviction', status: 'open' },
  { state: 'TX', violation: 'Eviction', status: 'open' },
  { state: 'TX', violation: 'Notice Violation', status: 'resolved' },
  { state: 'FL', violation: 'Security Deposit', status: 'pending' },
  { state: 'FL', violation: 'Security Deposit', status: 'open' },
  { state: 'FL', violation: 'Habitability', status: 'resolved' },
  { state: 'WA', violation: 'Notice Violation', status: 'open' },
  { state: 'WA', violation: 'Rent Increase', status: 'resolved' },
];

// 1) VIZ: Case status chart - aggregate by status (with overlay of DB tenancies)
router.get('/case-status-chart', auth, async (req, res) => {
  try {
    const buckets = { open: 0, pending: 0, resolved: 0 };
    sampleCases.forEach(c => { buckets[c.status] = (buckets[c.status] || 0) + 1; });

    // Pull live tenancy statuses if any exist for the user
    try {
      const r = await pool.query(
        "SELECT status, COUNT(*)::int AS n FROM tenancies WHERE user_id=$1 GROUP BY status",
        [req.user.id]
      );
      r.rows.forEach(row => {
        const k = (row.status || 'open').toLowerCase();
        const mapped = k === 'active' ? 'open' : k;
        buckets[mapped] = (buckets[mapped] || 0) + parseInt(row.n, 10);
      });
    } catch (_) { /* table may be missing in fresh installs */ }

    const series = Object.entries(buckets).map(([status, count]) => ({ status, count }));
    const total = series.reduce((s, x) => s + x.count, 0);
    res.json({ series, total, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'case-status-chart failed' });
  }
});

// 2) VIZ: Violation type heatmap (violation x state)
router.get('/violation-heatmap', auth, async (req, res) => {
  try {
    const states = Array.from(new Set(sampleCases.map(c => c.state))).sort();
    const violations = Array.from(new Set(sampleCases.map(c => c.violation))).sort();
    const matrix = violations.map(v => {
      const row = { violation: v };
      states.forEach(s => {
        row[s] = sampleCases.filter(c => c.violation === v && c.state === s).length;
      });
      return row;
    });
    res.json({ states, violations, matrix, generated_at: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'violation-heatmap failed' });
  }
});

// 3) NON-VIZ: Tenant letter PDF generation
router.post('/tenant-letter-pdf', auth, async (req, res) => {
  try {
    const {
      tenant_name = 'Tenant',
      landlord_name = 'Landlord',
      property_address = '[Property Address]',
      subject = 'Notice Regarding Tenancy',
      body = 'This letter serves as formal written notice.',
      state = 'CA',
    } = req.body || {};

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="tenant-letter-${Date.now()}.pdf"`);

    const doc = new PDFDocument({ size: 'LETTER', margin: 56 });
    doc.pipe(res);

    doc.fontSize(18).fillColor('#276749').text('Tenant Rights Advisor', { align: 'right' });
    doc.fontSize(10).fillColor('#666').text(new Date().toLocaleDateString(), { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(11).fillColor('#000').text(`From: ${tenant_name}`);
    doc.text(`To: ${landlord_name}`);
    doc.text(`Property: ${property_address}`);
    doc.text(`Jurisdiction: ${state}`);
    doc.moveDown();
    doc.fontSize(14).fillColor('#276749').text(`Re: ${subject}`);
    doc.moveDown();
    doc.fontSize(11).fillColor('#000').text(body, { align: 'justify', lineGap: 4 });
    doc.moveDown(2);
    doc.text('Sincerely,');
    doc.moveDown();
    doc.text(tenant_name);
    doc.moveDown(2);
    doc.fontSize(8).fillColor('#999').text(
      'Generated by AI Tenant Rights Advisor. This letter is informational and not legal advice.',
      { align: 'center' }
    );

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: 'tenant-letter-pdf failed' });
  }
});

// 4) NON-VIZ: State regulation rules editor (CRUD)
router.get('/regulation-rules', auth, (req, res) => {
  try {
    const { state } = req.query;
    let out = regulationRules;
    if (state) out = out.filter(r => r.state.toUpperCase() === String(state).toUpperCase());
    res.json({ rules: out, count: out.length });
  } catch (err) {
    res.status(500).json({ error: 'list regulation rules failed' });
  }
});

router.post('/regulation-rules', auth, (req, res) => {
  try {
    const { state, category, rule, citation } = req.body || {};
    if (!state || !category || !rule) {
      return res.status(400).json({ error: 'state, category, and rule are required' });
    }
    const created = {
      id: nextRuleId++,
      state: String(state).toUpperCase(),
      category,
      rule,
      citation: citation || '',
      updated: new Date().toISOString().slice(0, 10),
    };
    regulationRules.push(created);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'create regulation rule failed' });
  }
});

router.put('/regulation-rules/:id', auth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const idx = regulationRules.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    const { state, category, rule, citation } = req.body || {};
    regulationRules[idx] = {
      ...regulationRules[idx],
      ...(state ? { state: String(state).toUpperCase() } : {}),
      ...(category ? { category } : {}),
      ...(rule ? { rule } : {}),
      ...(citation !== undefined ? { citation } : {}),
      updated: new Date().toISOString().slice(0, 10),
    };
    res.json(regulationRules[idx]);
  } catch (err) {
    res.status(500).json({ error: 'update regulation rule failed' });
  }
});

router.delete('/regulation-rules/:id', auth, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const before = regulationRules.length;
    regulationRules = regulationRules.filter(r => r.id !== id);
    if (regulationRules.length === before) return res.status(404).json({ error: 'not found' });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: 'delete regulation rule failed' });
  }
});

module.exports = router;
