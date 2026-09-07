// Custom Views (Estate Views) — VIZ + NON-VIZ surfaces over estate data.
// 4 endpoints:
//   GET  /api/custom-views/asset-distribution            -> donut chart data
//   GET  /api/custom-views/heir-allocation               -> heatmap (asset x heir)
//   GET  /api/custom-views/will-trust-summary            -> PDF-ready will/trust summary payload
//   GET  /api/custom-views/allocation-rules              -> list distribution rules
//   POST /api/custom-views/allocation-rules              -> create rule
//   PUT  /api/custom-views/allocation-rules/:id          -> update rule
//   DELETE /api/custom-views/allocation-rules/:id        -> delete rule
//
// The CRUD-style rules endpoints share a single base path; the task counts the
// "allocation-rules" surface as a single endpoint with full CRUD verbs, giving
// us four logical endpoints in total.

const express = require('express');
const pool = require('../db');

const router = express.Router();

// ------------------------------------------------------------------
// One-time table ensure (additive, IF NOT EXISTS).
// ------------------------------------------------------------------
let _tableReady = false;
async function ensureTable() {
  if (_tableReady) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_view_allocation_rules (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        asset_label VARCHAR(255) NOT NULL,
        heir_name VARCHAR(255) NOT NULL,
        allocation_pct DECIMAL(6,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    _tableReady = true;
  } catch (e) {
    console.error('[custom-views] ensureTable error:', e.message);
  }
}

router.use(async (req, res, next) => {
  await ensureTable();
  next();
});

function userId(req) {
  return (req.user && req.user.id) || null;
}

// ------------------------------------------------------------------
// 1) VIZ: Asset distribution donut chart
//    -> { slices: [{ label, value, pct }], total }
// ------------------------------------------------------------------
router.get('/asset-distribution', async (req, res) => {
  try {
    const uid = userId(req);
    const slices = [];

    const da = await pool.query(
      `SELECT asset_type AS label, COALESCE(SUM(value_estimate),0)::float AS value
       FROM digital_assets WHERE user_id = $1 GROUP BY asset_type`,
      [uid]
    );
    da.rows.forEach((r) => slices.push({ label: r.label || 'unknown', value: Number(r.value) || 0, bucket: 'digital' }));

    try {
      const pr = await pool.query(
        `SELECT property_type AS label, COALESCE(SUM(estimated_value),0)::float AS value
         FROM properties WHERE user_id = $1 GROUP BY property_type`,
        [uid]
      );
      pr.rows.forEach((r) => slices.push({ label: r.label || 'property', value: Number(r.value) || 0, bucket: 'property' }));
    } catch (_) { /* properties table optional */ }

    try {
      const ins = await pool.query(
        `SELECT policy_type AS label, COALESCE(SUM(coverage_amount),0)::float AS value
         FROM insurance_policies WHERE user_id = $1 GROUP BY policy_type`,
        [uid]
      );
      ins.rows.forEach((r) => slices.push({ label: r.label || 'insurance', value: Number(r.value) || 0, bucket: 'insurance' }));
    } catch (_) { /* optional */ }

    const filtered = slices.filter((s) => s.value > 0);
    const total = filtered.reduce((acc, s) => acc + s.value, 0);
    const withPct = filtered.map((s) => ({
      ...s,
      pct: total > 0 ? Number(((s.value / total) * 100).toFixed(2)) : 0,
    }));

    res.json({ slices: withPct, total: Number(total.toFixed(2)), generated_at: new Date().toISOString() });
  } catch (e) {
    console.error('[custom-views] asset-distribution:', e);
    res.status(500).json({ error: 'failed', detail: e.message });
  }
});

// ------------------------------------------------------------------
// 2) VIZ: Heir allocation heatmap (asset x heir)
//    -> { assets: [...], heirs: [...], matrix: number[][] }
// ------------------------------------------------------------------
router.get('/heir-allocation', async (req, res) => {
  try {
    const uid = userId(req);

    // Heirs come from beneficiaries table (full_name).
    const benRows = (await pool.query(
      `SELECT id, full_name, COALESCE(share_percentage,0)::float AS share
       FROM beneficiaries WHERE user_id = $1 ORDER BY full_name`,
      [uid]
    )).rows;
    const heirs = benRows.map((b) => b.full_name).filter(Boolean);

    // Assets: top-N digital_assets + named rule assets.
    const assetRows = (await pool.query(
      `SELECT asset_name, COALESCE(value_estimate,0)::float AS value, beneficiary
       FROM digital_assets WHERE user_id = $1 ORDER BY value_estimate DESC NULLS LAST LIMIT 12`,
      [uid]
    )).rows;
    const assets = assetRows.map((a) => a.asset_name);

    const ruleRows = (await pool.query(
      `SELECT asset_label, heir_name, allocation_pct::float AS pct
       FROM custom_view_allocation_rules WHERE user_id = $1`,
      [uid]
    )).rows;

    // Add rule-only asset labels so the matrix reflects manual rules too.
    ruleRows.forEach((r) => {
      if (r.asset_label && !assets.includes(r.asset_label)) assets.push(r.asset_label);
      if (r.heir_name && !heirs.includes(r.heir_name)) heirs.push(r.heir_name);
    });

    // Build matrix [assets.length][heirs.length] of allocation pct.
    const matrix = assets.map((aLabel) =>
      heirs.map((hName) => {
        const rule = ruleRows.find((r) => r.asset_label === aLabel && r.heir_name === hName);
        if (rule) return Number(rule.pct) || 0;

        // Fall back to beneficiary string on the asset row.
        const asset = assetRows.find((a) => a.asset_name === aLabel);
        if (asset && asset.beneficiary && asset.beneficiary === hName) return 100;

        // Fall back to beneficiary global share %.
        const ben = benRows.find((b) => b.full_name === hName);
        return ben ? Number(ben.share) || 0 : 0;
      })
    );

    res.json({ assets, heirs, matrix, generated_at: new Date().toISOString() });
  } catch (e) {
    console.error('[custom-views] heir-allocation:', e);
    res.status(500).json({ error: 'failed', detail: e.message });
  }
});

// ------------------------------------------------------------------
// 3) NON-VIZ: Will / trust summary (PDF-ready payload)
// ------------------------------------------------------------------
router.get('/will-trust-summary', async (req, res) => {
  try {
    const uid = userId(req);
    const wills = (await pool.query(
      `SELECT id, title, testator_name, executor_name, status, witness_1, witness_2, updated_at
       FROM wills WHERE user_id = $1 ORDER BY updated_at DESC NULLS LAST`,
      [uid]
    )).rows;

    let trusts = [];
    try {
      trusts = (await pool.query(
        `SELECT id, trust_name, trust_type, grantor_name, trustee_name, status, updated_at
         FROM trusts WHERE user_id = $1 ORDER BY updated_at DESC NULLS LAST`,
        [uid]
      )).rows;
    } catch (_) { /* optional */ }

    let beneficiaries = [];
    try {
      beneficiaries = (await pool.query(
        `SELECT full_name, relationship, share_percentage FROM beneficiaries WHERE user_id = $1 ORDER BY full_name`,
        [uid]
      )).rows;
    } catch (_) { /* optional */ }

    const totalShare = beneficiaries.reduce((acc, b) => acc + (Number(b.share_percentage) || 0), 0);

    const summary = {
      title: 'Will & Trust Summary',
      generated_at: new Date().toISOString(),
      counts: { wills: wills.length, trusts: trusts.length, beneficiaries: beneficiaries.length },
      wills,
      trusts,
      beneficiaries,
      share_total_pct: Number(totalShare.toFixed(2)),
      share_balanced: Math.abs(totalShare - 100) < 0.01,
      narrative: [
        `This estate has ${wills.length} will document(s) and ${trusts.length} trust(s) on file.`,
        `${beneficiaries.length} beneficiar${beneficiaries.length === 1 ? 'y' : 'ies'} are designated with a combined share of ${totalShare.toFixed(2)}%.`,
        Math.abs(totalShare - 100) < 0.01
          ? 'Allocation is balanced at 100%.'
          : `Allocation is unbalanced (${totalShare.toFixed(2)}%) — recommend rebalancing distribution rules.`,
      ].join(' '),
    };

    res.json(summary);
  } catch (e) {
    console.error('[custom-views] will-trust-summary:', e);
    res.status(500).json({ error: 'failed', detail: e.message });
  }
});

// ------------------------------------------------------------------
// 4) NON-VIZ: Allocation rules editor — CRUD on asset->heir % rules.
// ------------------------------------------------------------------
router.get('/allocation-rules', async (req, res) => {
  try {
    const uid = userId(req);
    const r = await pool.query(
      `SELECT id, asset_label, heir_name, allocation_pct::float AS allocation_pct, notes, created_at, updated_at
       FROM custom_view_allocation_rules WHERE user_id = $1 ORDER BY asset_label, heir_name`,
      [uid]
    );
    res.json({ rules: r.rows });
  } catch (e) {
    console.error('[custom-views] allocation-rules GET:', e);
    res.status(500).json({ error: 'failed', detail: e.message });
  }
});

router.post('/allocation-rules', async (req, res) => {
  try {
    const uid = userId(req);
    const { asset_label, heir_name, allocation_pct, notes } = req.body || {};
    if (!asset_label || !heir_name) {
      return res.status(400).json({ error: 'asset_label and heir_name are required' });
    }
    const pct = Number(allocation_pct);
    const safePct = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    const r = await pool.query(
      `INSERT INTO custom_view_allocation_rules (user_id, asset_label, heir_name, allocation_pct, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, asset_label, heir_name, allocation_pct::float AS allocation_pct, notes`,
      [uid, asset_label, heir_name, safePct, notes || null]
    );
    res.json(r.rows[0]);
  } catch (e) {
    console.error('[custom-views] allocation-rules POST:', e);
    res.status(500).json({ error: 'failed', detail: e.message });
  }
});

router.put('/allocation-rules/:id', async (req, res) => {
  try {
    const uid = userId(req);
    const id = parseInt(req.params.id, 10);
    const { asset_label, heir_name, allocation_pct, notes } = req.body || {};
    const pct = Number(allocation_pct);
    const safePct = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
    const r = await pool.query(
      `UPDATE custom_view_allocation_rules
       SET asset_label = COALESCE($1, asset_label),
           heir_name = COALESCE($2, heir_name),
           allocation_pct = $3,
           notes = $4,
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING id, asset_label, heir_name, allocation_pct::float AS allocation_pct, notes`,
      [asset_label || null, heir_name || null, safePct, notes || null, id, uid]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'not found' });
    res.json(r.rows[0]);
  } catch (e) {
    console.error('[custom-views] allocation-rules PUT:', e);
    res.status(500).json({ error: 'failed', detail: e.message });
  }
});

router.delete('/allocation-rules/:id', async (req, res) => {
  try {
    const uid = userId(req);
    const id = parseInt(req.params.id, 10);
    const r = await pool.query(
      `DELETE FROM custom_view_allocation_rules WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, uid]
    );
    if (!r.rows[0]) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true, id: r.rows[0].id });
  } catch (e) {
    console.error('[custom-views] allocation-rules DELETE:', e);
    res.status(500).json({ error: 'failed', detail: e.message });
  }
});

module.exports = router;
