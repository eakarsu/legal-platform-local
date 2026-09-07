// International planning: tax-optimized planning for multi-national
// families.
const express = require('express');
const router = express.Router();
const { callOpenRouter } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// rough top inheritance/estate rates
const TAX_RATES = { US: 0.40, UK: 0.40, JP: 0.55, FR: 0.45, DE: 0.30, CA: 0.0, AU: 0.0, IT: 0.04, IN: 0.0, SG: 0.0 };

// POST /api/international-planning/treaty { jurisdictions:[country_codes], net_worth_usd }
router.post('/treaty', aiRateLimiter, async (req, res) => {
  try {
    const { jurisdictions = [], net_worth_usd } = req.body || {};
    if (!Array.isArray(jurisdictions) || !jurisdictions.length || !net_worth_usd) return res.status(400).json({ error: 'jurisdictions[] + net_worth_usd required' });
    const exposure = jurisdictions.map(j => ({ jurisdiction: j, top_rate: TAX_RATES[j] ?? 0.25, estimated_tax_usd: Math.round(Number(net_worth_usd) * (TAX_RATES[j] ?? 0.25)) }));
    let advice = null;
    try {
      advice = await callOpenRouter([
        { role: 'system', content: 'Given multi-jurisdictional estate exposure, suggest treaty-based mitigations and recommended next steps.' },
        { role: 'user', content: JSON.stringify(exposure) },
      ]);
    } catch {}
    return res.json({ jurisdictions, exposure, advice });
  } catch (e) {
    return res.status(500).json({ error: 'treaty analysis failed' });
  }
});

module.exports = router;
