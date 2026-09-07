const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const pool = require('./config/database');
// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_visa_category_recommendation_engine = require('../routes/gap-no-visa-category-recommendation-engine');
const route_gap_no_interview_preparation_ai = require('../routes/gap-no-interview-preparation-ai');
const route_gap_no_multilingual_translation_routing = require('../routes/gap-no-multilingual-translation-routing');
const route_gap_no_rfe_auto_response_drafter = require('../routes/gap-no-rfe-auto-response-drafter');
const route_gap_no_client_portal_status_tracking_documen = require('../routes/gap-no-client-portal-status-tracking-documen');
const route_gap_limited_uscis_integration_only_stubs_in = require('../routes/gap-limited-uscis-integration-only-stubs-in');
const route_gap_no_document_vault_with_field_level = require('../routes/gap-no-document-vault-with-field-level');
const route_gap_no_e_signature_integration = require('../routes/gap-no-e-signature-integration');
const route_gap_limited_notifications_module_0_explicit_ = require('../routes/gap-limited-notifications-module-0-explicit-');
const route_gap_no_webhook_surface_for_case_event = require('../routes/gap-no-webhook-surface-for-case-event');
const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Create audit_log table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action TEXT,
    entity_type TEXT,
    entity_id INTEGER,
    ip_address TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
  )
`).catch(e => console.error('audit_log table creation error:', e.message));

// Audit logging middleware
async function auditLog(req, res, next) {
  res.on('finish', async () => {
    if (res.statusCode < 400 && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      try {
        await pool.query(
          'INSERT INTO audit_log (user_id, action, entity_type, entity_id, ip_address, timestamp) VALUES ($1,$2,$3,$4,$5,NOW())',
          [req.user?.id, req.method, req.path.split('/')[2] || req.path.split('/')[1], req.params?.id ? parseInt(req.params.id) : null, req.ip]
        );
      } catch (e) {}
    }
  });
  next();
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', auditLog, require('./routes/cases'));
app.use('/api/clients', auditLog, require('./routes/clients'));
app.use('/api/documents', auditLog, require('./routes/documents'));
app.use('/api/visas', auditLog, require('./routes/visas'));
app.use('/api/deadlines', auditLog, require('./routes/deadlines'));
app.use('/api/billing', auditLog, require('./routes/billing'));
app.use('/api/notes', auditLog, require('./routes/notes'));
app.use('/api/forms', auditLog, require('./routes/forms'));
app.use('/api/compliance', auditLog, require('./routes/compliance'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/status-tracking', require('./routes/status-tracking'));
app.use('/api/audit-log', require('./routes/audit-log'));
// Apply pass 5 — additive
app.use('/api/integrations', require('./routes/integrations'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/interview-prep', require('./routes/interviewPrep'));
app.use('/api/rfe-responder', require('./routes/rfeAutoResponder'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));


app.use('/api/gap-no-visa-category-recommendation-engine', route_gap_no_visa_category_recommendation_engine);
app.use('/api/gap-no-interview-preparation-ai', route_gap_no_interview_preparation_ai);
app.use('/api/gap-no-multilingual-translation-routing', route_gap_no_multilingual_translation_routing);
app.use('/api/gap-no-rfe-auto-response-drafter', route_gap_no_rfe_auto_response_drafter);
app.use('/api/gap-no-client-portal-status-tracking-documen', route_gap_no_client_portal_status_tracking_documen);
app.use('/api/gap-limited-uscis-integration-only-stubs-in', route_gap_limited_uscis_integration_only_stubs_in);
app.use('/api/gap-no-document-vault-with-field-level', route_gap_no_document_vault_with_field_level);
app.use('/api/gap-no-e-signature-integration', route_gap_no_e_signature_integration);
app.use('/api/gap-limited-notifications-module-0-explicit-', route_gap_limited_notifications_module_0_explicit_);
app.use('/api/gap-no-webhook-surface-for-case-event', route_gap_no_webhook_surface_for_case_event);

// Custom Views (mounted before 404 handler)
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/uscis-receipt-notice-tracker', auditLog, require('./routes/uscisReceiptNoticeTracker'));

// 404 handler (must remain after all route mounts)
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
