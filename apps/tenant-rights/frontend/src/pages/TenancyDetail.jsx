import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const STATUS_COLORS = { active: '#276749', expired: '#718096', terminated: '#e53e3e', notice: '#d69e2e' };

const s = {
  header: { marginBottom: 28 },
  h1: { fontSize: 26, fontWeight: 700, color: '#276749', marginBottom: 8 },
  badge: { display: 'inline-block', padding: '3px 12px', borderRadius: 20, color: 'white', fontSize: 13, fontWeight: 600, marginLeft: 12 },
  meta: { color: '#718096', fontSize: 14, marginBottom: 4 },
  rent: { fontSize: 24, fontWeight: 700, color: '#276749', marginTop: 6 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  actionCard: { background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textDecoration: 'none', color: 'inherit', display: 'block', textAlign: 'center' },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionTitle: { fontWeight: 600, color: '#276749', fontSize: 14 },
  actionSub: { color: '#718096', fontSize: 12, marginTop: 4 },
  statusRow: { display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 },
  select: { padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 6, background: 'white', fontSize: 13 },
  saveBtn: { padding: '6px 14px', background: '#276749', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
};

const ACTIONS = [
  { to: 'lease-analyzer', icon: '📜', title: 'Lease Analyzer', sub: 'Find illegal clauses' },
  { to: 'notice', icon: '📋', title: 'Notice Generator', sub: 'Generate legal notices' },
  { to: 'eviction-defense', icon: '🛡️', title: 'Eviction Defense', sub: 'Fight eviction' },
  { to: 'rent-check', icon: '💰', title: 'Rent Increase Check', sub: 'Is it legal?' },
  { to: 'mediation', icon: '🤝', title: 'Mediation Prep', sub: 'Dispute resolution' },
  { to: 'issues', icon: '⚠️', title: 'Issue Tracker', sub: 'Log problems' },
];

export default function TenancyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenancy, setTenancy] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tenancies/${id}`)
      .then(r => { setTenancy(r.data); setStatus(r.data.status); })
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus() {
    await api.put(`/tenancies/${id}`, { status });
    setTenancy(prev => ({ ...prev, status }));
  }

  async function deleteTenancy() {
    if (!confirm('Delete this tenancy? This cannot be undone.')) return;
    await api.delete(`/tenancies/${id}`);
    navigate('/');
  }

  if (loading) return <Layout><p>Loading...</p></Layout>;
  if (!tenancy) return <Layout><p>Tenancy not found.</p></Layout>;

  return (
    <Layout>
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={s.h1}>
              {tenancy.property_address}
              <span style={{ ...s.badge, background: STATUS_COLORS[tenancy.status] || '#718096' }}>{tenancy.status}</span>
            </h1>
            <div style={s.meta}>{tenancy.state}</div>
            {tenancy.landlord_name && <div style={s.meta}>Landlord: {tenancy.landlord_name}</div>}
            {tenancy.lease_start && <div style={s.meta}>Lease: {new Date(tenancy.lease_start).toLocaleDateString()} — {tenancy.lease_end ? new Date(tenancy.lease_end).toLocaleDateString() : 'Month-to-month'}</div>}
            {tenancy.monthly_rent && <div style={s.rent}>${Number(tenancy.monthly_rent).toLocaleString()}/month</div>}
          </div>
          <button onClick={deleteTenancy} style={{ padding: '8px 16px', background: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7', borderRadius: 8, cursor: 'pointer' }}>Delete</button>
        </div>
        <div style={s.statusRow}>
          <span style={{ fontSize: 13, color: '#718096' }}>Status:</span>
          <select style={s.select} value={status} onChange={e => setStatus(e.target.value)}>
            {['active','expired','terminated','notice'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button style={s.saveBtn} onClick={updateStatus}>Update</button>
        </div>
      </div>

      <div style={s.grid}>
        {ACTIONS.map(a => (
          <Link key={a.to} to={`/tenancies/${id}/${a.to}`} style={s.actionCard}>
            <div style={s.actionIcon}>{a.icon}</div>
            <div style={s.actionTitle}>{a.title}</div>
            <div style={s.actionSub}>{a.sub}</div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
