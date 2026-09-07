/*
 * routes/integrations.js — Apply pass 5
 *
 * 503-on-no-key stubs for immigration-specific integrations called out in
 * batch_04 §29 ("missing non-AI features" + "custom feature suggestions"
 * for AIImmigrationCaseManager).
 *
 * Legal disclaimer: nothing in this module constitutes legal advice. Output
 * is for case-management workflow integration only and must be reviewed by a
 * licensed immigration attorney.
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const LEGAL_DISCLAIMER = 'Informational only. Not legal advice. All actions must be reviewed by a licensed immigration attorney.';

function requireEnv(req, res, providerName, vars) {
  const missing = vars.filter((v) => !process.env[v] || String(process.env[v]).startsWith('your_'));
  if (missing.length) {
    res.status(503).json({
      error: 'integration_not_configured',
      provider: providerName,
      missing_env: missing,
      disclaimer: LEGAL_DISCLAIMER,
      message: `${providerName} not configured. Set ${missing.join(', ')} to enable.`,
    });
    return false;
  }
  return true;
}

// USCIS Case Status / Egov tracking
router.get('/uscis/case-status/:receipt', auth, (req, res) => {
  if (!requireEnv(req, res, 'USCIS', ['USCIS_API_BASE', 'USCIS_API_KEY'])) return;
  res.json({
    status: 'stub_with_creds',
    receipt: req.params.receipt,
    note: 'USCIS endpoint reachable; map case status codes to local schema.',
    disclaimer: LEGAL_DISCLAIMER,
  });
});

// Stripe — client billing
router.post('/stripe/charge', auth, (req, res) => {
  if (!requireEnv(req, res, 'Stripe', ['STRIPE_SECRET_KEY'])) return;
  res.json({ status: 'stub_with_creds', note: 'Stripe key present; implement PaymentIntent for retainer + filing fees.' });
});

// DocuSign — engagement letters / forms
router.post('/docusign/envelope', auth, (req, res) => {
  if (!requireEnv(req, res, 'DocuSign', ['DOCUSIGN_INTEGRATION_KEY', 'DOCUSIGN_ACCOUNT_ID', 'DOCUSIGN_PRIVATE_KEY'])) return;
  res.json({ status: 'stub_with_creds', note: 'DocuSign creds present; implement JWT auth + envelope creation.', disclaimer: LEGAL_DISCLAIMER });
});

// External translation (DeepL / Google) — supplements existing /api/ai/translate
router.post('/translation/external', auth, (req, res) => {
  if (!requireEnv(req, res, 'Translation', ['TRANSLATION_PROVIDER', 'TRANSLATION_API_KEY'])) return;
  res.json({ status: 'stub_with_creds', note: 'Translation provider configured; route bulk content here, retain LLM endpoint for nuance.' });
});

module.exports = router;
