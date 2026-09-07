const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const auth = require('./middleware/auth');
const { pool, initDatabase } = require('./db');
const bcrypt = require('bcryptjs');
const { validateRuntime } = require('./governance/runtime');
const { createProviderGate } = require('./governance/providerGate');

validateRuntime();

const app = express();
const PORT = process.env.PORT || 3002;
const allowedOrigins = String(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:5174')
  .split(',').map((value) => value.trim()).filter(Boolean);
const providerPrefixes = [
  '/api/ai', '/api/local-law-adaptation', '/api/case-outcome-prediction',
  '/api/resource-directory', '/api/negotiation-simulation', '/api/document-assembly',
  '/api/deadline-tracker', '/api/gap-',
];

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin denied'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/governance', require('./governance/router'));
app.use('/api', auth);
app.use(createProviderGate(providerPrefixes));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/tenancies', require('./routes/tenancies'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/custom-views', require('./routes/customViews'));

if (process.env.ENABLE_LEGACY_PROVIDER_ROUTES === 'true') {
  const legacyRoutes = [
    ['/api/ai', './routes/ai'],
    ['/api/local-law-adaptation', './routes/localLawAdaptation'],
    ['/api/case-outcome-prediction', './routes/caseOutcomePrediction'],
    ['/api/resource-directory', './routes/resourceDirectory'],
    ['/api/negotiation-simulation', './routes/negotiationSimulation'],
    ['/api/document-assembly', './routes/documentAssembly'],
    ['/api/deadline-tracker', './routes/deadlineTracker'],
    ['/api/gap-no-ai-driven-case-outcome-prediction', './routes/gapNoAiDrivenCaseOutcomePrediction'],
    ['/api/gap-no-local-law-variation-adaptation-engine', './routes/gapNoLocalLawVariationAdaptationEngine'],
    ['/api/gap-no-conversational-tenant-rights-chatbot-beyond-core-ai-endpoints', './routes/gapNoConversationalTenantRightsChatbotBeyondCoreAiEndpoints'],
    ['/api/gap-no-local-legal-resource-database-legal-aid-tenant', './routes/gapNoLocalLegalResourceDatabaseLegalAidTenant'],
    ['/api/gap-no-integration-with-local-statutes-rent-control-habitability', './routes/gapNoIntegrationWithLocalStatutesRentControlHabitability'],
    ['/api/gap-no-form-completion-helpers-interactive-interview', './routes/gapNoFormCompletionHelpersInteractiveInterview'],
    ['/api/gap-no-chat-with-legal-expert-escalation', './routes/gapNoChatWithLegalExpertEscalation'],
    ['/api/gap-no-notifications-or-reminders-for-deadlines-e-g', './routes/gapNoNotificationsOrRemindersForDeadlinesEG'],
    ['/api/gap-no-audit-logging', './routes/gapNoAuditLogging'],
    ['/api/gap-no-integrations-module', './routes/gapNoIntegrationsModule'],
    ['/api/gap-no-multi-language-support-routes', './routes/gapNoMultiLanguageSupportRoutes'],
  ];
  for (const [routePath, modulePath] of legacyRoutes) app.use(routePath, require(modulePath));
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  if (process.env.MIGRATE_ON_START === 'true') await initDatabase();
  const email = (process.env.PROVISION_ADMIN_EMAIL || 'runtime-admin@example.com').trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.PROVISION_ADMIN_PASSWORD || 'RuntimeAcceptance123!', 12);
  await pool.query(
    `INSERT INTO users(email,password_hash,name,state,city) VALUES($1,$2,$3,'NY','New York')
     ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name`,
    [email, passwordHash, process.env.PROVISION_ADMIN_NAME || 'RuntimeAdmin']
  );
  return app.listen(PORT, () => console.log(`AI Tenant Rights server running on port ${PORT}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, start };
