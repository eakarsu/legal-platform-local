import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Reports() {
  const [stats, setStats] = useState(null);
  const [caseStats, setCaseStats] = useState([]);
  const [revenue, setRevenue] = useState([]);

  useEffect(() => {
    api.get('/reports/dashboard').then(r => setStats(r.data)).catch(() => {});
    api.get('/reports/case-stats').then(r => setCaseStats(r.data)).catch(() => {});
    api.get('/reports/revenue').then(r => setRevenue(r.data)).catch(() => {});
  }, []);

  const totalCases = stats?.cases?.reduce((sum, c) => sum + parseInt(c.count), 0) || 0;
  const totalRevenue = stats?.billing?.reduce((sum, b) => sum + parseFloat(b.total || 0), 0) || 0;
  const paidRevenue = stats?.billing?.find(b => b.status === 'paid')?.total || 0;

  const casesByType = {};
  caseStats.forEach(cs => {
    if (!casesByType[cs.case_type]) casesByType[cs.case_type] = {};
    casesByType[cs.case_type][cs.status] = parseInt(cs.count);
  });

  return (
    <div>
      <div className="page-header">
        <div><h1>Reports & Analytics</h1><p>Overview of practice performance</p></div>
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
          <div className="stat-icon card-icon teal"><i className="fa-solid fa-dollar-sign"></i></div>
          <div className="stat-info"><h3>${parseFloat(totalRevenue).toLocaleString()}</h3><p>Total Revenue</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon orange"><i className="fa-solid fa-clock"></i></div>
          <div className="stat-info"><h3>{stats?.upcoming_deadlines || 0}</h3><p>Upcoming Deadlines</p></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Cases by Status</h3>
          {stats?.cases?.map(c => (
            <div key={c.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ textTransform: 'capitalize' }}>{c.status?.replace('_', ' ')}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 100, height: 6, background: 'var(--bg-dark)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(parseInt(c.count) / totalCases * 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }}></div>
                </div>
                <span style={{ fontWeight: 700, minWidth: 30, textAlign: 'right' }}>{c.count}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Revenue by Status</h3>
          {stats?.billing?.map(b => (
            <div key={b.status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ textTransform: 'capitalize' }}>{b.status}</span>
              <span style={{ fontWeight: 700, color: b.status === 'paid' ? 'var(--success)' : 'var(--text-primary)' }}>${parseFloat(b.total || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Visa Application Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {stats?.visas?.map(v => (
            <div key={v.status} style={{ background: 'var(--bg-dark)', padding: 16, borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-light)' }}>{v.count}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{v.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Cases by Type</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Case Type</th><th>Open</th><th>In Progress</th><th>Pending</th><th>Approved</th><th>Total</th></tr></thead>
          <tbody>
            {Object.entries(casesByType).map(([type, statuses]) => {
              const total = Object.values(statuses).reduce((s, v) => s + v, 0);
              return (
                <tr key={type}>
                  <td style={{ fontWeight: 600 }}>{type}</td>
                  <td>{statuses.open || 0}</td>
                  <td>{statuses.in_progress || 0}</td>
                  <td>{statuses.pending_review || 0}</td>
                  <td>{statuses.approved || 0}</td>
                  <td style={{ fontWeight: 700 }}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;
