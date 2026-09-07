import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const STATUS_COLORS = { active: '#276749', expired: '#718096', terminated: '#e53e3e', notice: '#d69e2e' };

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  h1: { fontSize: 28, fontWeight: 700, color: '#276749' },
  newBtn: { background: '#276749', color: 'white', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 },
  card: { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textDecoration: 'none', color: 'inherit', display: 'block' },
  cardTitle: { fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#276749' },
  meta: { fontSize: 13, color: '#718096', marginBottom: 3 },
  rent: { fontSize: 22, fontWeight: 700, color: '#276749', marginBottom: 6 },
  badge: { display: 'inline-block', padding: '2px 10px', borderRadius: 20, color: 'white', fontSize: 12, fontWeight: 600, marginTop: 10 },
  empty: { textAlign: 'center', padding: '80px 20px', color: '#718096' },
  tools: { marginTop: 40 },
  toolsTitle: { fontSize: 20, fontWeight: 700, color: '#276749', marginBottom: 16 },
  toolGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
  toolCard: { background: 'white', borderRadius: 10, padding: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textDecoration: 'none', color: 'inherit', textAlign: 'center' },
  toolIcon: { fontSize: 28, marginBottom: 6 },
  toolTitle: { fontWeight: 600, fontSize: 13, color: '#276749' },
};

export default function Dashboard() {
  const [tenancies, setTenancies] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get(`/tenancies?page=${page}&limit=20`)
      .then(r => { setTenancies(r.data.data); setPagination(r.data.pagination); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Layout>
      <div style={s.header}>
        <h1 style={s.h1}>My Tenancies</h1>
        <Link to="/tenancies/new" style={s.newBtn}>+ Add Tenancy</Link>
      </div>

      {loading ? <p>Loading...</p> : tenancies.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🏠</p>
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No tenancies yet</p>
          <p>Add your rental to get AI-powered tenant rights guidance.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {tenancies.map(t => (
            <Link key={t.id} to={`/tenancies/${t.id}`} style={s.card}>
              {t.monthly_rent && <div style={s.rent}>${Number(t.monthly_rent).toLocaleString()}/mo</div>}
              <div style={s.cardTitle}>{t.property_address}</div>
              <div style={s.meta}>{t.state}</div>
              {t.landlord_name && <div style={s.meta}>Landlord: {t.landlord_name}</div>}
              {t.lease_start && <div style={s.meta}>Lease: {new Date(t.lease_start).toLocaleDateString()} — {t.lease_end ? new Date(t.lease_end).toLocaleDateString() : 'Month-to-month'}</div>}
              <div style={{ ...s.badge, background: STATUS_COLORS[t.status] || '#718096' }}>{t.status}</div>
            </Link>
          ))}
        </div>
      )}

      {pagination.total > pagination.limit && (
        <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }}>Previous</button>
          <span style={{ padding: '8px 16px', color: '#718096' }}>Page {page}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={tenancies.length < pagination.limit} style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }}>Next</button>
        </div>
      )}

      <div style={s.tools}>
        <div style={s.toolsTitle}>AI Tools (Select a tenancy first)</div>
        <div style={s.toolGrid}>
          {[
            { icon: '📜', title: 'Lease Analyzer', sub: 'Find illegal clauses' },
            { icon: '📋', title: 'Notice Generator', sub: 'Legal demand notices' },
            { icon: '🛡️', title: 'Eviction Defense', sub: 'Fight eviction notices' },
            { icon: '💰', title: 'Rent Increase Check', sub: 'Is your increase legal?' },
            { icon: '🤝', title: 'Mediation Prep', sub: 'Landlord dispute prep' },
            { icon: '⚠️', title: 'Issue Tracker', sub: 'Log rental problems' },
          ].map(t => (
            <div key={t.title} style={s.toolCard}>
              <div style={s.toolIcon}>{t.icon}</div>
              <div style={s.toolTitle}>{t.title}</div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 2 }}>{t.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
