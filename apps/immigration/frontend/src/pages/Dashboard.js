import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const featureCards = [
  { path: '/cases', icon: 'fa-solid fa-briefcase', color: 'blue', title: 'Cases', desc: 'Manage immigration cases' },
  { path: '/clients', icon: 'fa-solid fa-users', color: 'green', title: 'Clients', desc: 'Client directory & profiles' },
  { path: '/documents', icon: 'fa-solid fa-file-alt', color: 'purple', title: 'Documents', desc: 'Document management' },
  { path: '/visas', icon: 'fa-solid fa-passport', color: 'orange', title: 'Visa Applications', desc: 'Track visa applications' },
  { path: '/forms', icon: 'fa-solid fa-file-lines', color: 'cyan', title: 'Forms', desc: 'Immigration forms' },
  { path: '/deadlines', icon: 'fa-solid fa-clock', color: 'red', title: 'Deadlines', desc: 'Important deadlines' },
  { path: '/billing', icon: 'fa-solid fa-file-invoice-dollar', color: 'teal', title: 'Billing', desc: 'Invoices & payments' },
  { path: '/notes', icon: 'fa-solid fa-sticky-note', color: 'pink', title: 'Notes', desc: 'Case notes & memos' },
  { path: '/compliance', icon: 'fa-solid fa-shield-halved', color: 'amber', title: 'Compliance', desc: 'Compliance checks' },
  { path: '/status-tracking', icon: 'fa-solid fa-route', color: 'indigo', title: 'Status Tracking', desc: 'Track case status changes' },
  { path: '/ai', icon: 'fa-solid fa-robot', color: 'emerald', title: 'AI Assistant', desc: 'AI-powered analysis tools' },
  { path: '/reports', icon: 'fa-solid fa-chart-bar', color: 'rose', title: 'Reports', desc: 'Analytics & reporting' },
];

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/dashboard').then(res => setStats(res.data)).catch(() => {});
  }, []);

  const getCaseCount = (status) => {
    if (!stats?.cases) return 0;
    const found = stats.cases.find(c => c.status === status);
    return found ? parseInt(found.count) : 0;
  };

  const totalCases = stats?.cases?.reduce((sum, c) => sum + parseInt(c.count), 0) || 0;
  const totalRevenue = stats?.billing?.reduce((sum, b) => sum + parseFloat(b.total || 0), 0) || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to AI Immigration Case Manager</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon card-icon blue"><i className="fa-solid fa-briefcase"></i></div>
          <div className="stat-info"><h3>{totalCases}</h3><p>Total Cases</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon green"><i className="fa-solid fa-users"></i></div>
          <div className="stat-info"><h3>{stats?.total_clients || 0}</h3><p>Total Clients</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon orange"><i className="fa-solid fa-clock"></i></div>
          <div className="stat-info"><h3>{stats?.upcoming_deadlines || 0}</h3><p>Upcoming Deadlines</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon teal"><i className="fa-solid fa-dollar-sign"></i></div>
          <div className="stat-info"><h3>${totalRevenue.toLocaleString()}</h3><p>Total Revenue</p></div>
        </div>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>Features</h2>
      <div className="dashboard-grid">
        {featureCards.map((card) => (
          <div key={card.path} className="dashboard-card" onClick={() => navigate(card.path)}>
            <div className={`card-icon ${card.color}`}><i className={card.icon}></i></div>
            <h3>{card.title}</h3>
            <p className="card-desc">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
