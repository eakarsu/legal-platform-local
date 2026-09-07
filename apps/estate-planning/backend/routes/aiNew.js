const express = require('express');
const router = express.Router();
const pool = require('../db');
const { callOpenRouter } = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');

// Apply rate limiter to all AI routes in this file
router.use(aiRateLimiter);

// POST /api/ai/beneficiary-access-report
// Queries beneficiaries + their assigned assets/properties, generates inheritance summary
router.post('/beneficiary-access-report', async (req, res) => {
  try {
    const userId = req.user.id;

    const [beneficiaries, assets, properties, policies, trusts] = await Promise.all([
      pool.query(
        'SELECT * FROM beneficiaries WHERE user_id = $1 ORDER BY full_name',
        [userId]
      ),
      pool.query(
        'SELECT asset_name, asset_type, platform, value_estimate, beneficiary FROM digital_assets WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT property_name, property_type, address, estimated_value, beneficiary FROM properties WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT policy_name, policy_type, coverage_amount, beneficiary FROM insurance_policies WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT trust_name, trust_type, beneficiary_names FROM trusts WHERE user_id = $1',
        [userId]
      ),
    ]);

    if (beneficiaries.rows.length === 0) {
      return res.status(404).json({ error: 'No beneficiaries found for this user.' });
    }

    // Build per-beneficiary asset map
    const beneficiaryMap = {};
    beneficiaries.rows.forEach(b => {
      beneficiaryMap[b.full_name] = {
        info: b,
        digital_assets: [],
        properties: [],
        insurance_policies: [],
        trusts: [],
      };
    });

    assets.rows.forEach(a => {
      const key = a.beneficiary;
      if (key && beneficiaryMap[key]) beneficiaryMap[key].digital_assets.push(a);
    });
    properties.rows.forEach(p => {
      const key = p.beneficiary;
      if (key && beneficiaryMap[key]) beneficiaryMap[key].properties.push(p);
    });
    policies.rows.forEach(p => {
      const key = p.beneficiary;
      if (key && beneficiaryMap[key]) beneficiaryMap[key].insurance_policies.push(p);
    });
    // Trusts: match by name substring
    trusts.rows.forEach(t => {
      Object.keys(beneficiaryMap).forEach(name => {
        if (t.beneficiary_names && t.beneficiary_names.includes(name)) {
          beneficiaryMap[name].trusts.push(t);
        }
      });
    });

    const beneficiaryText = Object.values(beneficiaryMap).map(({ info, digital_assets, properties: props, insurance_policies: ins, trusts: trs }) => {
      const assetList = digital_assets.map(a => `    - ${a.asset_name} (${a.asset_type}, $${a.value_estimate || 0})`).join('\n') || '    None';
      const propList = props.map(p => `    - ${p.property_name} (${p.property_type}, $${p.estimated_value || 0})`).join('\n') || '    None';
      const insList = ins.map(i => `    - ${i.policy_name} (${i.policy_type}, coverage: $${i.coverage_amount || 0})`).join('\n') || '    None';
      const trList = trs.map(t => `    - ${t.trust_name} (${t.trust_type})`).join('\n') || '    None';

      return `**${info.full_name}** (${info.relationship})
  Share: ${info.share_percentage || 0}% | Contact: ${info.email || 'N/A'}
  Digital Assets:\n${assetList}
  Properties:\n${propList}
  Insurance Policies:\n${insList}
  Trusts:\n${trList}`;
    }).join('\n\n');

    const systemPrompt = `You are an expert estate planning attorney AI. Generate a comprehensive, per-beneficiary inheritance access report. The report should clearly outline what each beneficiary will receive, estimated total value, and any important notes or recommendations. Use professional markdown formatting.`;

    const userPrompt = `Generate a per-beneficiary inheritance summary report for the following beneficiaries and their assigned assets:

${beneficiaryText}

For each beneficiary, provide:
1. **Inheritance Summary** - What they receive and estimated total value
2. **Asset Breakdown** - Categorized list with values
3. **Share Equity Assessment** - Is the distribution fair/balanced?
4. **Access Considerations** - Any special steps needed to claim assets
5. **Recommendations** - Any gaps or actions to improve clarity`;

    const result = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      report: result.content,
      model: result.model,
      beneficiary_count: beneficiaries.rows.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Beneficiary access report error:', err);
    res.status(500).json({ error: 'Failed to generate beneficiary access report.', message: err.message });
  }
});

// POST /api/ai/legacy-message-schedule
// Queries legacy_messages, generates delivery timeline with personalization
router.post('/legacy-message-schedule', async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, title, recipient_name, recipient_email, message_content, ai_enhanced_content,
              delivery_trigger, delivery_date, status
       FROM legacy_messages
       WHERE user_id = $1
       ORDER BY delivery_date ASC NULLS LAST`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No legacy messages found.' });
    }

    const messagesText = result.rows.map(m => `- ID ${m.id}: "${m.title}"
  Recipient: ${m.recipient_name} (${m.recipient_email || 'no email'})
  Trigger: ${m.delivery_trigger || 'Not set'} | Delivery Date: ${m.delivery_date ? new Date(m.delivery_date).toLocaleDateString() : 'Not set'}
  Status: ${m.status}
  Preview: ${(m.ai_enhanced_content || m.message_content || '').substring(0, 150)}...`
    ).join('\n\n');

    const systemPrompt = `You are a compassionate AI legacy planning advisor. Analyze a collection of legacy messages and generate a comprehensive delivery timeline with personalization suggestions. Help ensure each message reaches the right person at the right moment. Use warm, professional markdown formatting.`;

    const userPrompt = `Generate a delivery timeline and personalization guide for these legacy messages:

${messagesText}

Please provide:
1. **Delivery Timeline Overview** - Chronological schedule of all messages
2. **Per-Message Analysis** - For each message: optimal delivery timing, personalization suggestions, and tone recommendations
3. **Trigger Event Mapping** - How each trigger event should be defined and monitored
4. **Gap Analysis** - Are there important recipients or life events missing?
5. **Personalization Opportunities** - Specific ways to make each message more impactful
6. **Technical Delivery Recommendations** - Best practices for ensuring delivery`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      schedule: aiResult.content,
      model: aiResult.model,
      message_count: result.rows.length,
      messages: result.rows,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Legacy message schedule error:', err);
    res.status(500).json({ error: 'Failed to generate legacy message schedule.', message: err.message });
  }
});

// POST /api/ai/estate-timeline-advisor
// Queries estate_timeline milestones, generates AI advice on overdue/at-risk milestones
router.post('/estate-timeline-advisor', async (req, res) => {
  try {
    const userId = req.user.id;

    const milestonesResult = await pool.query(
      `SELECT id, title, description, milestone_type, due_date, completed_date, priority, status
       FROM estate_timeline
       WHERE user_id = $1
       ORDER BY due_date ASC NULLS LAST`,
      [userId]
    );

    if (milestonesResult.rows.length === 0) {
      return res.status(404).json({ error: 'No estate timeline milestones found.' });
    }

    const now = new Date();
    const categorized = {
      overdue: [],
      at_risk: [],
      on_track: [],
      completed: [],
    };

    milestonesResult.rows.forEach(m => {
      if (m.status === 'completed' || m.completed_date) {
        categorized.completed.push(m);
      } else if (m.due_date) {
        const due = new Date(m.due_date);
        const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
        if (daysUntilDue < 0) {
          categorized.overdue.push({ ...m, days_overdue: Math.abs(daysUntilDue) });
        } else if (daysUntilDue <= 30) {
          categorized.at_risk.push({ ...m, days_until_due: daysUntilDue });
        } else {
          categorized.on_track.push({ ...m, days_until_due: daysUntilDue });
        }
      } else {
        categorized.on_track.push(m);
      }
    });

    const formatMilestones = (items) => items.map(m =>
      `  - [${m.priority || 'normal'} priority] ${m.title} (${m.milestone_type || 'general'})${m.days_overdue ? ` — OVERDUE by ${m.days_overdue} days` : ''}${m.days_until_due !== undefined ? ` — due in ${m.days_until_due} days` : ''}${m.due_date ? ` | Due: ${new Date(m.due_date).toLocaleDateString()}` : ''}`
    ).join('\n') || '  None';

    const systemPrompt = `You are an expert estate planning advisor AI. Analyze estate planning milestones and provide actionable guidance on overdue, at-risk, and upcoming tasks. Help the estate planner prioritize effectively and understand consequences of delays. Use clear, structured markdown formatting.`;

    const userPrompt = `Analyze these estate planning milestones and provide strategic advice:

OVERDUE (${categorized.overdue.length} milestones):
${formatMilestones(categorized.overdue)}

AT RISK - Due within 30 days (${categorized.at_risk.length} milestones):
${formatMilestones(categorized.at_risk)}

ON TRACK (${categorized.on_track.length} milestones):
${formatMilestones(categorized.on_track)}

COMPLETED (${categorized.completed.length} milestones):
${formatMilestones(categorized.completed)}

Please provide:
1. **Critical Alert Summary** - Immediate actions required
2. **Overdue Milestone Analysis** - For each overdue item: consequences, remediation steps, urgency
3. **At-Risk Milestone Guide** - How to complete each at-risk milestone before deadline
4. **Recommended Priority Order** - Sequenced action plan
5. **Completion Strategy** - Practical steps to get back on track
6. **Estate Planning Health Score** - Overall assessment based on milestone status`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      advice: aiResult.content,
      model: aiResult.model,
      summary: {
        total: milestonesResult.rows.length,
        overdue: categorized.overdue.length,
        at_risk: categorized.at_risk.length,
        on_track: categorized.on_track.length,
        completed: categorized.completed.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Estate timeline advisor error:', err);
    res.status(500).json({ error: 'Failed to generate estate timeline advice.', message: err.message });
  }
});

// POST /api/ai/tax-minimize
// Generates a state-aware tax minimization plan from user assets/properties/insurance/trusts
router.post('/tax-minimize', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({
        error: 'AI service unavailable. Set OPENROUTER_API_KEY on the backend and restart.',
      });
    }

    const userId = req.user.id;

    const [userRow, assets, properties, policies, trusts] = await Promise.all([
      pool.query('SELECT jurisdiction FROM users WHERE id = $1', [userId]),
      pool.query(
        'SELECT asset_name, asset_type, platform, value_estimate FROM digital_assets WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT property_name, property_type, estimated_value, mortgage_balance FROM properties WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT policy_name, policy_type, coverage_amount FROM insurance_policies WHERE user_id = $1',
        [userId]
      ),
      pool.query(
        'SELECT trust_name, trust_type, assets_description FROM trusts WHERE user_id = $1',
        [userId]
      ),
    ]);

    const jurisdiction = userRow.rows[0]?.jurisdiction || (req.body && req.body.jurisdiction) || null;

    const assetTotal = assets.rows.reduce((s, a) => s + (parseFloat(a.value_estimate) || 0), 0);
    const propertyTotal = properties.rows.reduce((s, p) => s + (parseFloat(p.estimated_value) || 0), 0);
    const mortgageTotal = properties.rows.reduce((s, p) => s + (parseFloat(p.mortgage_balance) || 0), 0);
    const insuranceTotal = policies.rows.reduce((s, p) => s + (parseFloat(p.coverage_amount) || 0), 0);

    if (
      assets.rows.length === 0 &&
      properties.rows.length === 0 &&
      policies.rows.length === 0 &&
      trusts.rows.length === 0
    ) {
      return res.status(404).json({ error: 'No assets, properties, insurance policies, or trusts found.' });
    }

    const inventory = `JURISDICTION: ${jurisdiction || 'Not specified'}

DIGITAL ASSETS (${assets.rows.length}, total ~$${assetTotal.toFixed(0)}):
${assets.rows.map(a => `- ${a.asset_name} (${a.asset_type}) ~$${a.value_estimate || 0}`).join('\n') || 'None'}

PROPERTIES (${properties.rows.length}, total ~$${propertyTotal.toFixed(0)}, mortgage ~$${mortgageTotal.toFixed(0)}):
${properties.rows.map(p => `- ${p.property_name} (${p.property_type}) value $${p.estimated_value || 0}, mortgage $${p.mortgage_balance || 0}`).join('\n') || 'None'}

INSURANCE POLICIES (${policies.rows.length}, coverage ~$${insuranceTotal.toFixed(0)}):
${policies.rows.map(p => `- ${p.policy_name} (${p.policy_type}) coverage $${p.coverage_amount || 0}`).join('\n') || 'None'}

TRUSTS (${trusts.rows.length}):
${trusts.rows.map(t => `- ${t.trust_name} (${t.trust_type}) — ${t.assets_description || 'no description'}`).join('\n') || 'None'}`;

    const systemPrompt = `You are an expert estate-tax planning AI assistant. Generate a comprehensive estate tax minimization plan, with jurisdiction-aware recommendations. Always include a disclaimer that this is AI-generated and must be reviewed by a licensed attorney and tax professional before action. Use clear markdown.${jurisdiction ? `\n\nIMPORTANT: Apply tax laws specific to ${jurisdiction}. Reference ${jurisdiction} estate, inheritance, gift, and generation-skipping transfer tax rules where applicable.` : ''}`;

    const userPrompt = `Produce a tax-minimization plan based on this estate inventory:

${inventory}

Please structure the plan as:
1. **Estate Snapshot** — totals, exposure summary
2. **Federal Tax Considerations** — applicable exemptions, brackets, GST
3. **Jurisdiction-Specific Considerations** — state estate/inheritance tax exposure for ${jurisdiction || 'the user\'s jurisdiction'}
4. **Recommended Strategies** — gifting, ILITs, QPRTs, charitable trusts, marital deduction, valuation discounts, step-up basis planning
5. **Trust Structuring Recommendations**
6. **Liquidity Planning** — covering taxes due
7. **Action Items & Timeline**
8. **Disclaimers**`;

    const result = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      plan: result.content,
      model: result.model,
      jurisdiction,
      summary: {
        asset_total: assetTotal,
        property_total: propertyTotal,
        mortgage_total: mortgageTotal,
        insurance_total: insuranceTotal,
        gross_estate_estimate: assetTotal + propertyTotal + insuranceTotal,
        trust_count: trusts.rows.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Tax minimize error:', err);
    res.status(500).json({ error: 'Failed to generate tax minimization plan.', message: err.message });
  }
});

// POST /api/ai/beneficiary-analyze
// Analyzes beneficiary suitability + flags
router.post('/beneficiary-analyze', async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(503).json({
        error: 'AI service unavailable. Set OPENROUTER_API_KEY on the backend and restart.',
      });
    }

    const userId = req.user.id;

    const beneficiaries = await pool.query(
      'SELECT full_name, relationship, email, phone, address, share_percentage, notes, status FROM beneficiaries WHERE user_id = $1',
      [userId]
    );

    if (beneficiaries.rows.length === 0) {
      return res.status(404).json({ error: 'No beneficiaries found.' });
    }

    const totalShare = beneficiaries.rows.reduce((s, b) => s + (parseFloat(b.share_percentage) || 0), 0);
    const missingContact = beneficiaries.rows.filter(b => !b.email && !b.phone).length;
    const missingShare = beneficiaries.rows.filter(b => !b.share_percentage).length;
    const inactive = beneficiaries.rows.filter(b => b.status && b.status !== 'active').length;

    const beneficiariesText = beneficiaries.rows.map(b =>
      `- **${b.full_name}** (${b.relationship || 'unspecified'})
  Share: ${b.share_percentage || 0}% | Email: ${b.email || 'missing'} | Phone: ${b.phone || 'missing'}
  Status: ${b.status || 'active'}
  Notes: ${b.notes || 'none'}`
    ).join('\n');

    const systemPrompt = `You are an expert estate planning advisor AI. Analyze a list of beneficiaries for suitability, completeness, and risk flags. Identify share allocation issues, missing contact info, conflict-of-interest indicators, and any concerns about beneficiary readiness or capacity. Use clear markdown with headers, tables, and a flagged-issues section. Always include a disclaimer that this is AI-generated guidance and must be reviewed by a licensed attorney.`;

    const userPrompt = `Analyze these beneficiaries:

${beneficiariesText}

CALCULATED METRICS:
- Total share allocated: ${totalShare.toFixed(2)}% (target: 100%)
- Beneficiaries with no contact info (no email and no phone): ${missingContact}
- Beneficiaries with no share percentage set: ${missingShare}
- Beneficiaries marked inactive/non-active: ${inactive}

Please provide:
1. **Per-Beneficiary Suitability Assessment** — for each, rate suitability (high/medium/low) and explain
2. **Share Allocation Analysis** — does total = 100%? if not, what's the gap and recommendation?
3. **Risk Flags** — missing contacts, conflict risks, age/capacity concerns, dependency issues, dispute risk
4. **Distribution Equity Review** — fairness of share split
5. **Recommendations** — concrete next steps
6. **Disclaimers**`;

    const result = await callOpenRouter(systemPrompt, userPrompt);

    res.json({
      analysis: result.content,
      model: result.model,
      summary: {
        beneficiary_count: beneficiaries.rows.length,
        total_share_pct: totalShare,
        missing_contact: missingContact,
        missing_share: missingShare,
        inactive,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Beneficiary analyze error:', err);
    res.status(500).json({ error: 'Failed to analyze beneficiaries.', message: err.message });
  }
});

module.exports = router;
