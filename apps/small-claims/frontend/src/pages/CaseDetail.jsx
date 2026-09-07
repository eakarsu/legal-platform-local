import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const STATUS_COLORS = { draft: '#a0aec0', active: '#3182ce', filed: '#38a169', closed: '#718096' };

const s = {
  header: { marginBottom: 28 },
  h1: { fontSize: 26, fontWeight: 700, color: '#1a365d', marginBottom: 8 },
  badge: { display: 'inline-block', padding: '3px 12px', borderRadius: 20, color: 'white', fontSize: 13, fontWeight: 600, marginLeft: 12 },
  meta: { color: '#718096', fontSize: 14, marginBottom: 4 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  actionCard: { background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textDecoration: 'none', color: 'inherit', display: 'block', textAlign: 'center' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionTitle: { fontWeight: 600, color: '#1a365d', fontSize: 14 },
  actionSub: { color: '#718096', fontSize: 12, marginTop: 4 },
  factsCard: { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 },
  factsTitle: { fontWeight: 700, color: '#1a365d', marginBottom: 12 },
  factsTxt: { color: '#4a5568', lineHeight: 1.7, whiteSpace: 'pre-wrap' },
  statusRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 },
  select: { padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: 'white', fontSize: 13 },
  saveBtn: { padding: '6px 14px', background: '#38a169', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};

const ACTIONS = [
  { to: 'jurisdiction', icon: '🗺️', title: 'Jurisdiction Check', sub: 'Verify venue & limits' },
  { to: 'demand-letter', icon: '📨', title: 'Demand Letter', sub: 'Generate pre-suit letter' },
  { to: 'complaint', icon: '📋', title: 'Draft Complaint', sub: 'Court filing document' },
  { to: 'hearing-prep', icon: '🎤', title: 'Hearing Prep', sub: 'Mock Q&A simulator' },
  { to: 'deadlines', icon: '📅', title: 'Deadlines', sub: 'Track important dates' },
  { to: 'evidence', icon: '🗂️', title: 'Evidence Locker', sub: 'Upload & organize files' },
];

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cases/${id}`)
      .then(r => { setCaseData(r.data); setStatus(r.data.status); })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus() {
    await api.put(`/cases/${id}`, { status });
    setCaseData(prev => ({ ...prev, status }));
  }

  async function deleteCase() {
    if (!confirm('Delete this case? This cannot be undone.')) return;
    await api.delete(`/cases/${id}`);
    navigate('/');
  }

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (!caseData) return <Layout><p>Case not found.</p></Layout>;

  return (
    <Layout>
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={s.h1}>
              {caseData.dispute_type}
              <span style={{ ...s.badge, background: STATUS_COLORS[caseData.status] || '#a0aec0' }}>{caseData.status}</span>
            </h1>
            <div style={s.meta}>vs. {caseData.opposing_party || 'Unknown'} — {caseData.jurisdiction_state} {caseData.jurisdiction_county && `(${caseData.jurisdiction_county})`}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2b6cb0', marginTop: 6 }}>${Number(caseData.claim_amount).toLocaleString()}</div>
          </div>
          <button onClick={deleteCase} style={{ padding: '8px 16px', background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: 8, cursor: 'pointer' }}>Delete Case</button>
        </div>
        <div style={{ ...s.statusRow, marginTop: 16 }}>
          <span style={{ fontSize: 13, color: '#718096' }}>Status:</span>
          <select style={s.select} value={status} onChange={e => setStatus(e.target.value)}>
            {['draft','active','filed','closed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button style={s.saveBtn} onClick={updateStatus}>Update</button>
        </div>
      </div>

      <div style={s.grid}>
        {ACTIONS.map(a => (
          <Link key={a.to} to={`/cases/${id}/${a.to}`} style={s.actionCard}>
            <div style={s.actionIcon}>{a.icon}</div>
            <div style={s.actionTitle}>{a.title}</div>
            <div style={s.actionSub}>{a.sub}</div>
          </Link>
        ))}
      </div>

      {caseData.facts && (
        <div style={s.factsCard}>
          <div style={s.factsTitle}>Case Facts</div>
          <div style={s.factsTxt}>{caseData.facts}</div>
        </div>
      )}
    </Layout>
  );
}
