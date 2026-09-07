require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { initDatabase } = require('./db');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/documents', require('./routes/documents'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Custom Views (must be mounted BEFORE the 404 / error handler)
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/judgment-collection-tracker', require('./routes/judgmentCollectionTracker'));

// AI feature: case-evaluation
app.use('/api/ai/case-evaluation', require('./routes/ai-case-evaluation'));

// === Gap Feature Routes (must be before 404 handler) ===
app.use('/api/gap-no-evidenceorganizer', require('./routes/gap-no-evidenceorganizer'));
app.use('/api/gap-no-witnessstatementguide', require('./routes/gap-no-witnessstatementguide'));
app.use('/api/gap-no-settlementcalculator-casevalue-estimator', require('./routes/gap-no-settlementcalculator-casevalue-estimator'));
app.use('/api/gap-no-courtprocedurechecklist-perjurisdiction', require('./routes/gap-no-courtprocedurechecklist-perjurisdiction'));
app.use('/api/gap-no-appealassessment', require('./routes/gap-no-appealassessment'));
app.use('/api/gap-no-case-tracking-beyond-crud-no-hearing-remi', require('./routes/gap-no-case-tracking-beyond-crud-no-hearing-remi'));
app.use('/api/gap-no-fee-schedule-lookup-filing-fees-by-court', require('./routes/gap-no-fee-schedule-lookup-filing-fees-by-court'));
app.use('/api/gap-no-statute-of-limitations-checker', require('./routes/gap-no-statute-of-limitations-checker'));
app.use('/api/gap-no-legal-citation-library', require('./routes/gap-no-legal-citation-library'));
app.use('/api/gap-no-efiling-integration-tyler-efiletexas', require('./routes/gap-no-efiling-integration-tyler-efiletexas'));
app.use('/api/gap-no-notificationscalendar-reminders', require('./routes/gap-no-notificationscalendar-reminders'));
app.use('/api/gap-no-payment-processing-for-court-fees', require('./routes/gap-no-payment-processing-for-court-fees'));
app.use('/api/gap-no-audit-log-rbac', require('./routes/gap-no-audit-log-rbac'));
// === End Gap Feature Routes ===

// 404 fallback for unmatched /api routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

async function start() {
  await initDatabase();
  app.listen(PORT, () => console.log(`AI Small Claims server running on port ${PORT}`));
}

start().catch(console.error);
