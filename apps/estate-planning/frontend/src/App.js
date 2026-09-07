import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import './index.css';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CrudPage from './pages/CrudPage';
import AIAdvisor from './pages/AIAdvisor';
import AIReports from './pages/AIReports';
import Batch03Features from './pages/Batch03Features';

import Extensions from './pages/Extensions'; // Apply pass 5
import CustomViewsPage from './pages/CustomViewsPage';
import ExecutorAccessPacket from './pages/ExecutorAccessPacket';

import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

const features = [
  { key: 'wills', path: '/wills', label: 'Will Drafting', icon: '📜', color: 'var(--accent)', api: '/wills', ai: true,
    columns: ['title', 'testator_name', 'status', 'executor_name'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'testator_name', label: 'Testator Name', type: 'text', required: true },
      { name: 'executor_name', label: 'Executor Name', type: 'text' },
      { name: 'witness_1', label: 'Witness 1', type: 'text' },
      { name: 'witness_2', label: 'Witness 2', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'review', 'archived'] },
      { name: 'content', label: 'Content', type: 'textarea' },
    ],
    aiAction: 'will-draft', aiLabel: 'AI Draft Will',
    aiFields: ['title', 'testator_name', 'executor_name', 'content']
  },
  { key: 'digital-assets', path: '/digital-assets', label: 'Digital Assets', icon: '💎', color: 'var(--purple)', api: '/digital-assets', ai: true,
    columns: ['asset_name', 'asset_type', 'platform', 'value_estimate', 'status'],
    fields: [
      { name: 'asset_name', label: 'Asset Name', type: 'text', required: true },
      { name: 'asset_type', label: 'Type', type: 'select', options: ['cryptocurrency', 'digital_collectible', 'subscription', 'email_account', 'cloud_storage', 'code_repository', 'domain', 'social_media', 'cloud_service', 'investment', 'payment'], required: true },
      { name: 'platform', label: 'Platform', type: 'text' },
      { name: 'value_estimate', label: 'Estimated Value ($)', type: 'number' },
      { name: 'access_info', label: 'Access Information', type: 'text' },
      { name: 'beneficiary', label: 'Beneficiary', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'archived'] },
    ],
    aiAction: 'analyze-assets', aiLabel: 'AI Analyze Portfolio', aiGlobal: true
  },
  { key: 'beneficiaries', path: '/beneficiaries', label: 'Beneficiaries', icon: '👥', color: 'var(--success)', api: '/beneficiaries',
    columns: ['full_name', 'relationship', 'email', 'share_percentage', 'status'],
    fields: [
      { name: 'full_name', label: 'Full Name', type: 'text', required: true },
      { name: 'relationship', label: 'Relationship', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'share_percentage', label: 'Share %', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ]
  },
  { key: 'notifications', path: '/notifications', label: 'Notifications', icon: '🔔', color: 'var(--warning)', api: '/notifications',
    columns: ['subject', 'notification_type', 'trigger_event', 'status', 'scheduled_date'],
    fields: [
      { name: 'notification_type', label: 'Type', type: 'select', options: ['email', 'sms'], required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'trigger_event', label: 'Trigger Event', type: 'select', options: ['plan_update', 'annual_review', 'document_expiry', 'beneficiary_change', 'signing_reminder', 'valuation_update', 'document_ready', 'policy_renewal', 'contact_verify', 'asset_alert', 'directive_review', 'executor_notify', 'message_scheduled', 'tax_document', 'milestone'] },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'sent', 'failed'] },
      { name: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
    ]
  },
  { key: 'documents', path: '/documents', label: 'Document Vault', icon: '🔒', color: 'var(--cyan)', api: '/documents',
    columns: ['title', 'document_type', 'file_size', 'is_encrypted', 'status'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'document_type', label: 'Type', type: 'select', options: ['will', 'trust', 'poa', 'directive', 'insurance', 'deed', 'identity', 'tax', 'business', 'title', 'beneficiary', 'legal', 'financial'], required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'file_path', label: 'File Path', type: 'text' },
      { name: 'file_size', label: 'File Size', type: 'text' },
      { name: 'is_encrypted', label: 'Encrypted', type: 'select', options: ['true', 'false'] },
      { name: 'tags', label: 'Tags (comma-separated)', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'archived'] },
    ]
  },
  { key: 'power-of-attorney', path: '/power-of-attorney', label: 'Power of Attorney', icon: '⚖️', color: 'var(--orange)', api: '/power-of-attorney', ai: true,
    columns: ['title', 'poa_type', 'agent_name', 'status'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'poa_type', label: 'Type', type: 'select', options: ['general', 'financial', 'healthcare', 'limited', 'springing', 'durable', 'special', 'business', 'childcare', 'military'], required: true },
      { name: 'principal_name', label: 'Principal', type: 'text' },
      { name: 'agent_name', label: 'Agent', type: 'text' },
      { name: 'powers_granted', label: 'Powers Granted', type: 'textarea' },
      { name: 'effective_date', label: 'Effective Date', type: 'date' },
      { name: 'expiration_date', label: 'Expiration Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'archived'] },
    ],
    aiAction: 'generate-poa', aiLabel: 'AI Generate POA',
    aiFields: ['poa_type', 'principal_name', 'agent_name', 'powers_granted', 'effective_date']
  },
  { key: 'trusts', path: '/trusts', label: 'Trust Planning', icon: '🏦', color: 'var(--pink)', api: '/trusts', ai: true,
    columns: ['trust_name', 'trust_type', 'trustee_name', 'status'],
    fields: [
      { name: 'trust_name', label: 'Trust Name', type: 'text', required: true },
      { name: 'trust_type', label: 'Type', type: 'select', options: ['revocable_living', 'irrevocable', 'charitable', 'special_needs', 'pet', 'spendthrift', 'irrevocable_life', 'qtip', 'generation_skip', 'land', 'business', 'medicaid', 'blind', 'totten', 'dynasty'], required: true },
      { name: 'grantor_name', label: 'Grantor', type: 'text' },
      { name: 'trustee_name', label: 'Trustee', type: 'text' },
      { name: 'beneficiary_names', label: 'Beneficiaries', type: 'text' },
      { name: 'assets_description', label: 'Assets Description', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'review', 'archived'] },
    ],
    aiAction: 'trust-plan', aiLabel: 'AI Trust Plan',
    aiFields: ['trust_name', 'trust_type', 'grantor_name', 'trustee_name', 'beneficiary_names', 'assets_description']
  },
  { key: 'healthcare-directives', path: '/healthcare-directives', label: 'Healthcare Directives', icon: '🏥', color: 'var(--danger)', api: '/healthcare-directives', ai: true,
    columns: ['title', 'directive_type', 'healthcare_agent', 'status'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'directive_type', label: 'Type', type: 'select', options: ['advance_directive', 'dnr', 'living_will', 'mental_health', 'organ_donation', 'pain_management', 'nutrition', 'ventilator', 'dialysis', 'hospice', 'religious', 'pediatric', 'travel', 'dementia', 'emergency'], required: true },
      { name: 'principal_name', label: 'Principal', type: 'text' },
      { name: 'healthcare_agent', label: 'Healthcare Agent', type: 'text' },
      { name: 'wishes', label: 'Wishes', type: 'textarea' },
      { name: 'conditions', label: 'Conditions', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'archived'] },
    ],
    aiAction: 'healthcare-directive', aiLabel: 'AI Draft Directive',
    aiFields: ['directive_type', 'principal_name', 'healthcare_agent', 'wishes', 'conditions']
  },
  { key: 'insurance-policies', path: '/insurance-policies', label: 'Insurance Policies', icon: '🛡️', color: 'var(--success)', api: '/insurance-policies',
    columns: ['policy_name', 'policy_type', 'provider', 'coverage_amount', 'status'],
    fields: [
      { name: 'policy_name', label: 'Policy Name', type: 'text', required: true },
      { name: 'policy_type', label: 'Type', type: 'select', options: ['term_life', 'whole_life', 'homeowners', 'auto', 'health', 'disability', 'umbrella', 'long_term_care', 'business', 'dental', 'vision', 'flood', 'rider', 'professional', 'travel'], required: true },
      { name: 'provider', label: 'Provider', type: 'text' },
      { name: 'policy_number', label: 'Policy Number', type: 'text' },
      { name: 'coverage_amount', label: 'Coverage ($)', type: 'number' },
      { name: 'premium_amount', label: 'Monthly Premium ($)', type: 'number' },
      { name: 'beneficiary', label: 'Beneficiary', type: 'text' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'expired', 'cancelled'] },
    ]
  },
  { key: 'properties', path: '/properties', label: 'Properties & Real Estate', icon: '🏠', color: 'var(--orange)', api: '/properties',
    columns: ['property_name', 'property_type', 'estimated_value', 'ownership_type', 'status'],
    fields: [
      { name: 'property_name', label: 'Property Name', type: 'text', required: true },
      { name: 'property_type', label: 'Type', type: 'select', options: ['residential', 'vacation', 'investment', 'commercial', 'land', 'agricultural', 'industrial', 'international'], required: true },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'estimated_value', label: 'Estimated Value ($)', type: 'number' },
      { name: 'mortgage_balance', label: 'Mortgage Balance ($)', type: 'number' },
      { name: 'ownership_type', label: 'Ownership Type', type: 'text' },
      { name: 'beneficiary', label: 'Beneficiary', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'sold', 'pending'] },
    ]
  },
  { key: 'legacy-messages', path: '/legacy-messages', label: 'Legacy Messages', icon: '💌', color: 'var(--pink)', api: '/legacy-messages', ai: true,
    columns: ['title', 'recipient_name', 'delivery_trigger', 'status'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'recipient_name', label: 'Recipient Name', type: 'text' },
      { name: 'recipient_email', label: 'Recipient Email', type: 'email' },
      { name: 'message_content', label: 'Message', type: 'textarea' },
      { name: 'delivery_trigger', label: 'Delivery Trigger', type: 'select', options: ['upon_death', 'specific_date', 'life_event', 'annual', 'emergency'] },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'scheduled', 'sent'] },
    ],
    aiAction: 'enhance-message', aiLabel: 'AI Enhance Message',
    aiFields: ['recipient_name', 'message_content', 'delivery_trigger']
  },
  { key: 'estate-timeline', path: '/estate-timeline', label: 'Estate Timeline', icon: '📅', color: 'var(--cyan)', api: '/estate-timeline',
    columns: ['title', 'milestone_type', 'due_date', 'priority', 'status'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'milestone_type', label: 'Type', type: 'select', options: ['document', 'inventory', 'legal', 'review', 'update', 'valuation', 'personal', 'business', 'financial', 'audit', 'meeting', 'technical'] },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed'] },
    ]
  },
  { key: 'executor-tasks', path: '/executor-tasks', label: 'Executor Dashboard', icon: '📋', color: 'var(--accent)', api: '/executor-tasks',
    columns: ['title', 'assigned_to', 'category', 'priority', 'status'],
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
      { name: 'category', label: 'Category', type: 'select', options: ['administrative', 'government', 'financial', 'property', 'inventory', 'legal', 'distribution', 'tax', 'digital'] },
      { name: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed'] },
    ]
  },
  { key: 'digital-accounts', path: '/digital-accounts', label: 'Digital Account Guardian', icon: '🔐', color: 'var(--purple)', api: '/digital-accounts',
    columns: ['account_name', 'account_type', 'platform', 'action_on_death', 'status'],
    fields: [
      { name: 'account_name', label: 'Account Name', type: 'text', required: true },
      { name: 'account_type', label: 'Type', type: 'select', options: ['email', 'social_media', 'professional', 'shopping', 'technology', 'cloud_storage', 'website', 'communication', 'financial', 'gaming'], required: true },
      { name: 'platform', label: 'Platform', type: 'text' },
      { name: 'username', label: 'Username', type: 'text' },
      { name: 'email_associated', label: 'Associated Email', type: 'email' },
      { name: 'action_on_death', label: 'Action on Death', type: 'select', options: ['memorialize', 'delete', 'transfer', 'close', 'deactivate', 'maintain'] },
      { name: 'designated_contact', label: 'Designated Contact', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ]
  },
];

const navSections = [
  { title: 'AI-Powered', items: features.filter(f => f.ai) },
  { title: 'Management', items: features.filter(f => !f.ai) },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Estate Planning AI</h1>
        <p>Digital Legacy Platform</p>
      </div>
      <div className="sidebar-nav">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
          <span>📊</span> Dashboard
        </Link>
        <Link to="/ai-advisor" className={location.pathname === '/ai-advisor' ? 'active' : ''}>
          <span>🤖</span> AI Estate Advisor
        </Link>
        <Link to="/ai-reports" className={location.pathname === '/ai-reports' ? 'active' : ''}>
          <span>📑</span> AI Reports
        </Link>
        <Link to="/extensions" className={location.pathname === '/extensions' ? 'active' : ''}>
          <span>🧩</span> Extensions
        </Link>
        <Link to="/custom-views" className={location.pathname === '/custom-views' ? 'active' : ''}>
          <span>🗂️</span> Estate Views
        </Link>
        <Link to="/executor-access-packet" className={location.pathname === '/executor-access-packet' ? 'active' : ''}>
          <span>🗝️</span> Executor Packet
        </Link>
        {navSections.map(section => (
          <React.Fragment key={section.title}>
            <div className="nav-section">{section.title}</div>
            {section.items.map(f => (
              <Link key={f.key} to={f.path} className={location.pathname === f.path ? 'active' : ''}>
                <span>{f.icon}</span> {f.label}
              </Link>
            ))}
          </React.Fragment>
        ))}
      </div>
      <div className="sidebar-footer">
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {user.full_name || 'User'}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
          Logout
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<ProtectedRoute><CodexCustomVizFeature /></ProtectedRoute>} />
        <Route path="/codex/operations" element={<ProtectedRoute><CodexOperationsFeature /></ProtectedRoute>} />

          <Route path="/batch03" element={<Batch03Features />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><Dashboard features={features} /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai-advisor" element={
          <ProtectedRoute>
            <AppLayout><AIAdvisor /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/ai-reports" element={
          <ProtectedRoute>
            <AppLayout><AIReports /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/extensions" element={
          <ProtectedRoute>
            <AppLayout><Extensions /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/custom-views" element={
          <ProtectedRoute>
            <AppLayout><CustomViewsPage /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/executor-access-packet" element={
          <ProtectedRoute>
            <AppLayout><ExecutorAccessPacket /></AppLayout>
          </ProtectedRoute>
        } />
        {features.map(f => (
          <Route key={f.key} path={f.path} element={
            <ProtectedRoute>
              <AppLayout><CrudPage feature={f} /></AppLayout>
            </ProtectedRoute>
          } />
        ))}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
