import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard({ features }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats').then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cardData = [
    { key: 'wills', icon: '📜', label: 'Wills & Testaments', value: stats?.wills || 0, sub: 'Documents', color: 'var(--accent)', bg: 'var(--accent-light)' },
    { key: 'digital-assets', icon: '💎', label: 'Digital Assets', value: stats?.digital_assets?.count || 0, sub: `$${(stats?.digital_assets?.total_value || 0).toLocaleString()} total`, color: 'var(--purple)', bg: 'var(--purple-light)' },
    { key: 'beneficiaries', icon: '👥', label: 'Beneficiaries', value: stats?.beneficiaries || 0, sub: 'People', color: 'var(--success)', bg: 'var(--success-light)' },
    { key: 'documents', icon: '🔒', label: 'Document Vault', value: stats?.documents || 0, sub: 'Secured files', color: 'var(--cyan)', bg: 'var(--cyan-light)' },
    { key: 'properties', icon: '🏠', label: 'Properties', value: stats?.properties?.count || 0, sub: `$${(stats?.properties?.total_value || 0).toLocaleString()} value`, color: 'var(--orange)', bg: 'var(--orange-light)' },
    { key: 'insurance-policies', icon: '🛡️', label: 'Insurance Policies', value: stats?.insurance?.count || 0, sub: `$${(stats?.insurance?.total_coverage || 0).toLocaleString()} coverage`, color: 'var(--success)', bg: 'var(--success-light)' },
    { key: 'trusts', icon: '🏦', label: 'Trusts', value: stats?.trusts || 0, sub: 'Trust documents', color: 'var(--pink)', bg: 'var(--pink-light)' },
    { key: 'power-of-attorney', icon: '⚖️', label: 'Power of Attorney', value: '-', sub: 'Legal documents', color: 'var(--orange)', bg: 'var(--orange-light)' },
    { key: 'healthcare-directives', icon: '🏥', label: 'Healthcare Directives', value: '-', sub: 'Medical wishes', color: 'var(--danger)', bg: 'var(--danger-light)' },
    { key: 'legacy-messages', icon: '💌', label: 'Legacy Messages', value: '-', sub: 'Personal letters', color: 'var(--pink)', bg: 'var(--pink-light)' },
    { key: 'estate-timeline', icon: '📅', label: 'Estate Timeline', value: `${stats?.timeline?.completed || 0}/${stats?.timeline?.total || 0}`, sub: 'Milestones done', color: 'var(--cyan)', bg: 'var(--cyan-light)' },
    { key: 'executor-tasks', icon: '📋', label: 'Executor Tasks', value: `${stats?.executor_tasks?.completed || 0}/${stats?.executor_tasks?.total || 0}`, sub: 'Tasks completed', color: 'var(--accent)', bg: 'var(--accent-light)' },
    { key: 'notifications', icon: '🔔', label: 'Notifications', value: '-', sub: 'Alert system', color: 'var(--warning)', bg: 'var(--warning-light)' },
    { key: 'digital-accounts', icon: '🔐', label: 'Digital Accounts', value: '-', sub: 'Online accounts', color: 'var(--purple)', bg: 'var(--purple-light)' },
  ];

  if (loading) {
    return <div className="loading-spinner"><div className="spinner"></div>Loading dashboard...</div>;
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Welcome back, {user.full_name || 'User'}</h2>
          <p>Manage your estate plan and digital legacy</p>
        </div>
        <button className="btn btn-purple" onClick={() => navigate('/ai-advisor')}>
          🤖 AI Estate Advisor
        </button>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>${((stats?.properties?.total_value || 0) + (stats?.digital_assets?.total_value || 0)).toLocaleString()}</div>
          <div className="stat-label">Total Estate Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>${(stats?.insurance?.total_coverage || 0).toLocaleString()}</div>
          <div className="stat-label">Insurance Coverage</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--purple)' }}>{stats?.beneficiaries || 0}</div>
          <div className="stat-label">Total Beneficiaries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.documents || 0}</div>
          <div className="stat-label">Secured Documents</div>
        </div>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>All Features</h3>
      <div className="dashboard-grid">
        {cardData.map(card => (
          <div key={card.key} className="dashboard-card" onClick={() => navigate(`/${card.key}`)}
            style={{ borderTop: `3px solid ${card.color}` }}>
            <div className="card-icon" style={{ background: card.bg, color: card.color, fontSize: '28px' }}>
              {card.icon}
            </div>
            <h3>{card.label}</h3>
            <div className="card-value" style={{ color: card.color }}>{card.value}</div>
            <div className="card-label">{card.sub}</div>
            {features.find(f => f.key === card.key)?.ai && (
              <div className="card-badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>AI-Powered</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
