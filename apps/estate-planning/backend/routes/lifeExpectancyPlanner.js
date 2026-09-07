// Life expectancy planning: long-term care cost estimation, insurance
// recommendations.
const express = require('express');
const router = express.Router();

// US life expectancy at age X (rough actuarial)
function lifeExpectancyYears(age, sex = 'M') {
  const baseM = [78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58];
  const baseF = [82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62];
  const idx = Math.min(20, Math.max(0, Math.floor(age / 5)));
  const base = (sex === 'F' ? baseF : baseM)[idx];
  return Math.max(5, base - age);
}

// GET /api/life-expectancy-planner/cost?age=&sex=M|F&state=
router.get('/cost', (req, res) => {
  const age = Number(req.query.age) || 65;
  const sex = (req.query.sex || 'M').toUpperCase();
  const state = req.query.state || 'CA';
  const years = lifeExpectancyYears(age, sex);
  const annualLtcByState = { CA: 110000, NY: 120000, TX: 65000, FL: 75000, IL: 80000 };
  const annual = annualLtcByState[state] || 90000;
  const lifetimeMid = years > 70 ? 0 : Math.round(annual * Math.min(years, 5));
  const lifetimeHigh = years > 70 ? 0 : Math.round(annual * Math.min(years, 8));
  return res.json({
    age, sex, state,
    expected_years_remaining: years,
    annual_ltc_estimate_usd: annual,
    lifetime_cost_estimate: { mid_scenario_usd: lifetimeMid, high_scenario_usd: lifetimeHigh },
    insurance_recommendation: age < 65 ? 'consider_ltc_insurance' : 'self_funded_review',
  });
});

module.exports = router;
