const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { authenticateToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const aiNewRoutes = require('./routes/aiNew');
const dashboardRoutes = require('./routes/dashboard');
const createCrudRouter = require('./routes/crud');
const pool = require('./db');

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;

// CORS - use CLIENT_URL env var; allow common localhost dev ports too.
const _allowedOrigins = new Set([
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3055',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3055',
].filter(Boolean));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (_allowedOrigins.has(origin)) return cb(null, true);
    return cb(null, false);
  },
}));
app.use(express.json({ limit: '10mb' }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

// Run one-time DB migrations on startup
async function runMigrations() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(100)
    `);
    console.log('Migration: jurisdiction column ensured on users table.');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}
runMigrations();

// Public routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Protected routes
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/ai', authenticateToken, aiNewRoutes);
// Apply pass 5 wave-1 — agentic-plan + digital-vault-audit
app.use('/api/ai', authenticateToken, require('./routes/aiNew2'));
// Apply pass 5 — additive backlog (vault, LTC, multistate, etc.)
const extRoutes = require('./routes/extensions');
const extPublic = require('./routes/extensionsPublic');
app.use('/api/ext-public', extPublic); // token-only, no JWT
app.use('/api/ext', authenticateToken, extRoutes);

// Estate Health Score endpoint
app.get('/api/estate-health-score', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [wills, digitalAssets, beneficiaries, properties, insurancePolicies, trusts] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM wills WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM digital_assets WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM beneficiaries WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM properties WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM insurance_policies WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) FROM trusts WHERE user_id = $1', [userId]),
    ]);

    const counts = {
      wills: parseInt(wills.rows[0].count),
      digital_assets: parseInt(digitalAssets.rows[0].count),
      beneficiaries: parseInt(beneficiaries.rows[0].count),
      properties: parseInt(properties.rows[0].count),
      insurance_policies: parseInt(insurancePolicies.rows[0].count),
      trusts: parseInt(trusts.rows[0].count),
    };

    // Score breakdown: each category weighted out of ~17 points each (6 categories = 100)
    const weights = {
      wills: { max: 20, label: 'Wills' },
      beneficiaries: { max: 20, label: 'Beneficiaries' },
      digital_assets: { max: 15, label: 'Digital Assets' },
      properties: { max: 15, label: 'Properties' },
      insurance_policies: { max: 15, label: 'Insurance Policies' },
      trusts: { max: 15, label: 'Trusts' },
    };

    const breakdown = {};
    let totalScore = 0;

    Object.keys(weights).forEach(key => {
      const count = counts[key];
      const { max, label } = weights[key];
      // Score: 0 = 0 pts, 1 = 60% of max, 2+ = 80%, 3+ = 100%
      let pts = 0;
      if (count >= 3) pts = max;
      else if (count === 2) pts = Math.round(max * 0.8);
      else if (count === 1) pts = Math.round(max * 0.6);

      totalScore += pts;
      breakdown[key] = { label, count, score: pts, max_score: max };
    });

    const score = Math.min(100, totalScore);

    // Generate improvement tips
    const tips = [];
    if (counts.wills === 0) tips.push('Create at least one will to establish your estate plan foundation.');
    if (counts.beneficiaries === 0) tips.push('Add beneficiaries to specify who inherits your assets.');
    if (counts.digital_assets === 0) tips.push('Document your digital assets (crypto, online accounts, subscriptions).');
    if (counts.properties === 0) tips.push('Add your properties to ensure real estate is included in your plan.');
    if (counts.insurance_policies === 0) tips.push('Add insurance policies to protect your beneficiaries.');
    if (counts.trusts === 0) tips.push('Consider setting up a trust for more flexible asset distribution.');
    if (tips.length === 0) tips.push('Your estate plan is comprehensive. Review documents annually to keep them current.');

    res.json({
      score,
      breakdown,
      improvement_tips: tips,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Estate health score error:', err);
    res.status(500).json({ error: 'Failed to compute estate health score.', message: err.message });
  }
});

// Document upload endpoint
app.post('/api/documents/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { title, document_type, description, tags } = req.body;
    const file_path = req.file.path;
    const file_size = req.file.size;

    const result = await pool.query(
      `INSERT INTO documents (user_id, title, document_type, description, file_path, file_size, tags, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') RETURNING *`,
      [
        req.user.id,
        title || req.file.originalname,
        document_type || 'general',
        description || null,
        file_path,
        file_size,
        tags || null,
      ]
    );

    res.status(201).json({
      message: 'File uploaded successfully.',
      document: result.rows[0],
    });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: 'Failed to upload document.', message: err.message });
  }
});

// Notifications due endpoint
app.get('/api/notifications/due', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch pending notifications where scheduled_date <= NOW()
    const dueResult = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND status = 'pending' AND scheduled_date <= NOW()
       ORDER BY scheduled_date ASC`,
      [userId]
    );

    if (dueResult.rows.length > 0) {
      const dueIds = dueResult.rows.map(n => n.id);
      await pool.query(
        `UPDATE notifications SET status = 'sent', sent_date = NOW()
         WHERE id = ANY($1)`,
        [dueIds]
      );
    }

    res.json({
      due_notifications: dueResult.rows,
      count: dueResult.rows.length,
      processed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Notifications due error:', err);
    res.status(500).json({ error: 'Failed to fetch due notifications.', message: err.message });
  }
});

// CRUD routes
app.use('/api/wills', authenticateToken, createCrudRouter('wills', [
  'title', 'testator_name', 'status', 'content', 'ai_suggestions', 'executor_name', 'witness_1', 'witness_2'
]));
app.use('/api/digital-assets', authenticateToken, createCrudRouter('digital_assets', [
  'asset_name', 'asset_type', 'platform', 'value_estimate', 'access_info', 'beneficiary', 'notes', 'status'
]));
app.use('/api/beneficiaries', authenticateToken, createCrudRouter('beneficiaries', [
  'full_name', 'relationship', 'email', 'phone', 'address', 'share_percentage', 'notes', 'status'
]));
app.use('/api/notifications', authenticateToken, createCrudRouter('notifications', [
  'beneficiary_id', 'notification_type', 'subject', 'message', 'trigger_event', 'status', 'scheduled_date', 'sent_date'
]));
app.use('/api/documents', authenticateToken, createCrudRouter('documents', [
  'title', 'document_type', 'description', 'file_path', 'file_size', 'is_encrypted', 'tags', 'status'
]));
app.use('/api/power-of-attorney', authenticateToken, createCrudRouter('power_of_attorney', [
  'title', 'poa_type', 'principal_name', 'agent_name', 'powers_granted', 'ai_content', 'effective_date', 'expiration_date', 'status'
]));
app.use('/api/trusts', authenticateToken, createCrudRouter('trusts', [
  'trust_name', 'trust_type', 'grantor_name', 'trustee_name', 'beneficiary_names', 'assets_description', 'ai_recommendations', 'status'
]));
app.use('/api/healthcare-directives', authenticateToken, createCrudRouter('healthcare_directives', [
  'title', 'directive_type', 'principal_name', 'healthcare_agent', 'wishes', 'ai_content', 'conditions', 'status'
]));
app.use('/api/insurance-policies', authenticateToken, createCrudRouter('insurance_policies', [
  'policy_name', 'policy_type', 'provider', 'policy_number', 'coverage_amount', 'premium_amount', 'beneficiary', 'start_date', 'end_date', 'status'
]));
app.use('/api/properties', authenticateToken, createCrudRouter('properties', [
  'property_name', 'property_type', 'address', 'estimated_value', 'mortgage_balance', 'ownership_type', 'beneficiary', 'notes', 'status'
]));
app.use('/api/legacy-messages', authenticateToken, createCrudRouter('legacy_messages', [
  'title', 'recipient_name', 'recipient_email', 'message_content', 'ai_enhanced_content', 'delivery_trigger', 'delivery_date', 'status'
]));
app.use('/api/estate-timeline', authenticateToken, createCrudRouter('estate_timeline', [
  'title', 'description', 'milestone_type', 'due_date', 'completed_date', 'priority', 'status'
]));
app.use('/api/executor-tasks', authenticateToken, createCrudRouter('executor_tasks', [
  'title', 'description', 'assigned_to', 'category', 'priority', 'due_date', 'completed_date', 'status'
]));
app.use('/api/digital-accounts', authenticateToken, createCrudRouter('digital_accounts', [
  'account_name', 'account_type', 'platform', 'username', 'email_associated', 'action_on_death', 'designated_contact', 'notes', 'status'
]));
app.use('/api/agentic-estate-planner', authenticateToken, require('./routes/agenticEstatePlanner'));
app.use('/api/digital-legacy-vault', authenticateToken, require('./routes/digitalLegacyVault'));
app.use('/api/ai-drafted-documents', authenticateToken, require('./routes/aiDraftedDocuments'));
app.use('/api/family-meeting-coordinator', authenticateToken, require('./routes/familyMeetingCoordinator'));
app.use('/api/life-expectancy-planner', authenticateToken, require('./routes/lifeExpectancyPlanner'));
app.use('/api/beneficiary-portal', require('./routes/beneficiaryPortal'));
app.use('/api/international-planning', authenticateToken, require('./routes/internationalPlanning'));
app.use('/api/executor-access-packet', authenticateToken, require('./routes/executorAccessPacket'));

// Custom Views (Estate Views) — VIZ + NON-VIZ surfaces. Mounted BEFORE 404/error.
app.use('/api/custom-views', authenticateToken, require('./routes/customViews'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});


// === Batch 03 Gaps & Frontend Mounts ===
try {
  const _batch03 = require('./routes/batch03Gaps');
  if (typeof authenticateToken === 'function') app.use('/api', authenticateToken, _batch03);
  else app.use('/api', _batch03);
} catch (_e) { /* batch03 gap routes optional */ }

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
