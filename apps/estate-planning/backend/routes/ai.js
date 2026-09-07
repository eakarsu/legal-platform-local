const express = require('express');
const pool = require('../db');
const {
  generateWillDraft,
  getEstateAdvice,
  generatePOA,
  generateTrustPlan,
  generateHealthcareDirective,
  enhanceLegacyMessage,
  analyzeDigitalAssets,
  generateEstateSummary,
  callOpenRouter,
} = require('../services/openrouter');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply rate limiter to all AI routes
router.use(aiRateLimiter);

// Helper: get user jurisdiction
async function getUserJurisdiction(userId) {
  try {
    const result = await pool.query('SELECT jurisdiction FROM users WHERE id = $1', [userId]);
    return result.rows[0]?.jurisdiction || null;
  } catch {
    return null;
  }
}

// Helper: build jurisdiction system prompt suffix
function jurisdictionSuffix(jurisdiction) {
  if (!jurisdiction) return '';
  return `\n\nIMPORTANT: Apply laws specific to ${jurisdiction}. Reference ${jurisdiction} witness requirements, notarization rules, and any jurisdiction-specific estate planning regulations.`;
}

// AI Will Drafting
router.post('/will-draft', async (req, res) => {
  try {
    const { testator_name, executor_name, title, content } = req.body;
    if (!testator_name) {
      return res.status(400).json({ error: 'testator_name is required.' });
    }

    const jurisdiction = await getUserJurisdiction(req.user.id);
    const bodyWithJurisdiction = { ...req.body };

    // Inject jurisdiction into openrouter call by calling it directly
    const systemPrompt = `You are an expert estate planning attorney AI assistant. Help draft will documents with proper legal language. Always include disclaimers that this is AI-generated and should be reviewed by a licensed attorney. Format your response with clear sections using markdown.${jurisdictionSuffix(jurisdiction)}`;
    const userPrompt = `Draft a will document with the following details:
- Testator: ${testator_name}
- Executor: ${executor_name || 'Not specified'}
- Title: ${title || 'Last Will and Testament'}
- Special Instructions: ${content || 'Standard provisions'}
Please create a comprehensive, professionally formatted will draft with standard clauses.`;

    const result = await callOpenRouter(systemPrompt, userPrompt);

    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'will_draft', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Estate Advice
router.post('/estate-advice', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'question is required.' });
    }

    const jurisdiction = await getUserJurisdiction(req.user.id);
    const questionWithJurisdiction = jurisdiction
      ? `${question}\n\n[Apply laws specific to ${jurisdiction}. Reference ${jurisdiction} witness requirements and notarization rules.]`
      : question;

    const result = await getEstateAdvice(questionWithJurisdiction);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'estate_advice', question, result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI POA Generation
router.post('/generate-poa', async (req, res) => {
  try {
    const { principal_name, agent_name, poa_type } = req.body;
    if (!principal_name || !agent_name) {
      return res.status(400).json({ error: 'principal_name and agent_name are required.' });
    }

    const jurisdiction = await getUserJurisdiction(req.user.id);
    const systemPrompt = `You are an expert legal document AI assistant specializing in Power of Attorney documents. Create professional POA drafts with proper legal language. Include disclaimers about attorney review. Format with clear sections using markdown.${jurisdictionSuffix(jurisdiction)}`;
    const userPrompt = `Draft a ${poa_type || 'General'} Power of Attorney with:
- Principal: ${principal_name}
- Agent: ${agent_name}
- Powers: ${req.body.powers_granted || 'Standard powers'}
- Effective Date: ${req.body.effective_date || 'Upon signing'}
Create a comprehensive POA document.`;

    const result = await callOpenRouter(systemPrompt, userPrompt);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'poa_generation', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Trust Planning
router.post('/trust-plan', async (req, res) => {
  try {
    const { trust_name, grantor_name, trustee_name } = req.body;
    if (!trust_name || !grantor_name || !trustee_name) {
      return res.status(400).json({ error: 'trust_name, grantor_name, and trustee_name are required.' });
    }

    const jurisdiction = await getUserJurisdiction(req.user.id);
    const systemPrompt = `You are an expert trust planning AI assistant. Help create trust documents and provide recommendations for trust structures. Always recommend professional legal review. Use clear markdown formatting.${jurisdictionSuffix(jurisdiction)}`;
    const userPrompt = `Create a trust plan for:
- Trust Type: ${req.body.trust_type || 'Revocable Living Trust'}
- Trust Name: ${trust_name}
- Grantor: ${grantor_name}
- Trustee: ${trustee_name}
- Beneficiaries: ${req.body.beneficiary_names || 'Not specified'}
- Assets: ${req.body.assets_description || 'Not specified'}
Provide a detailed trust document outline with recommendations.`;

    const result = await callOpenRouter(systemPrompt, userPrompt);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'trust_plan', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Healthcare Directive
router.post('/healthcare-directive', async (req, res) => {
  try {
    const { principal_name, directive_type } = req.body;
    if (!principal_name || !directive_type) {
      return res.status(400).json({ error: 'principal_name and directive_type are required.' });
    }

    const result = await generateHealthcareDirective(req.body);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'healthcare_directive', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Legacy Message Enhancement
router.post('/enhance-message', async (req, res) => {
  try {
    const { recipient_name, message_content } = req.body;
    if (!recipient_name || !message_content) {
      return res.status(400).json({ error: 'recipient_name and message_content are required.' });
    }

    const result = await enhanceLegacyMessage(req.body);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'legacy_message', JSON.stringify(req.body), result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Digital Asset Analysis
router.post('/analyze-assets', async (req, res) => {
  try {
    const assets = await pool.query(
      'SELECT asset_name, asset_type, platform, value_estimate, status FROM digital_assets WHERE user_id = $1',
      [req.user.id]
    );
    const result = await analyzeDigitalAssets(assets.rows);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'asset_analysis', 'Analyze digital assets portfolio', result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Estate Summary
router.post('/estate-summary', async (req, res) => {
  try {
    const [wills, assets, beneficiaries, properties, policies, trusts] = await Promise.all([
      pool.query('SELECT title, status FROM wills WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT asset_name, asset_type, value_estimate FROM digital_assets WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT full_name, relationship, share_percentage FROM beneficiaries WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT property_name, estimated_value FROM properties WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT policy_name, coverage_amount FROM insurance_policies WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT trust_name, trust_type, status FROM trusts WHERE user_id = $1', [req.user.id]),
    ]);

    const data = {
      wills: wills.rows,
      digital_assets: assets.rows,
      beneficiaries: beneficiaries.rows,
      properties: properties.rows,
      insurance_policies: policies.rows,
      trusts: trusts.rows,
    };

    const result = await generateEstateSummary(data);
    await pool.query(
      'INSERT INTO ai_chat_history (user_id, feature, prompt, response, model) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'estate_summary', 'Generate estate summary', result.content, result.model]
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get AI Chat History
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM ai_chat_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
