const { openRouterFetch } = require('../../../../packages/ai-client/index.cjs');
// ============================================================
// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated Gap-feature endpoints (lean v0).
// TODO: configure credentials (set OPENROUTER_API_KEY).
// ============================================================
const express = require('express');
const router = express.Router();

let _gfReady = false;
async function ensureGapTable(pool) {
  if (_gfReady || !pool) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS gap_features (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(120) NOT NULL,
      user_id INT,
      input JSONB,
      output JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);
    _gfReady = true;
  } catch (_) { /* tolerant of missing DB */ }
}

async function callAI(prompt) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { ok: false, status: 503, error: 'AI service unavailable. Set OPENROUTER_API_KEY (TODO: configure credentials).' };
  try {
    const r = await openRouterFetch({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800,
      }),
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return { ok: r.ok, status: r.status, text, raw: data };
  } catch (e) {
    return { ok: false, status: 500, error: String(e.message || e) };
  }
}

function buildHandler(slug, label, hint) {
  return async (req, res) => {
    const body = req.body || {};
    const userId = req.user?.id || null;
    const prompt = `Feature: ${label}\nContext hint: ${hint}\nUser input:\n${JSON.stringify(body, null, 2)}\n\nProduce a concise, actionable response.`;
    const ai = await callAI(prompt);
    try {
      const pool = req.app.locals.pool || req.app.get('pool') || null;
      if (pool) {
        await ensureGapTable(pool);
        await pool.query('INSERT INTO gap_features(slug, user_id, input, output) VALUES ($1,$2,$3,$4)',
          [slug, userId, body, { text: ai.text || ai.error || null }]);
      }
    } catch (_) { /* tolerant */ }
    if (!ai.ok) return res.status(ai.status || 500).json({ error: ai.error || ai.text || `Upstream error (${ai.status})`, slug });
    res.json({ slug, label, result: ai.text });
  };
}

router.post('/gap-no-tax-minimisation-planner-state-aware', buildHandler('gap-ai-no-tax-minimisation-planner-state-aware', 'No tax-minimisation planner (state-aware)', 'No tax-minimisation planner (state-aware)'));
router.post('/gap-no-beneficiary-suitability-assessor', buildHandler('gap-ai-no-beneficiary-suitability-assessor', 'No beneficiary-suitability assessor', 'No beneficiary-suitability assessor'));
router.post('/gap-no-account-consolidation-recommender', buildHandler('gap-ai-no-account-consolidation-recommender', 'No account-consolidation recommender', 'No account-consolidation recommender'));
router.post('/gap-no-webhooks-no-advisor-system-push', buildHandler('gap-non-no-webhooks-no-advisor-system-push', 'No webhooks (no advisor system push)', 'No webhooks (no advisor system push)'));
router.post('/gap-limited-integration-no-brokerage-bank-account-aggregation', buildHandler('gap-non-limited-integration-no-brokerage-bank-account-aggregation', 'Limited integration (no brokerage/bank-account aggregation)', 'Limited integration (no brokerage/bank-account aggregation)'));
router.post('/gap-no-payment-processing-for-filing-fees', buildHandler('gap-non-no-payment-processing-for-filing-fees', 'No payment processing for filing fees', 'No payment processing for filing fees'));
router.post('/gap-no-multi-state-compliance-lookups', buildHandler('gap-non-no-multi-state-compliance-lookups', 'No multi-state compliance lookups', 'No multi-state compliance lookups'));
router.post('/gap-no-video-message-scheduling-for-legacy-letters', buildHandler('gap-non-no-video-message-scheduling-for-legacy-letters', 'No video-message scheduling for legacy letters', 'No video-message scheduling for legacy letters'));

module.exports = router;
