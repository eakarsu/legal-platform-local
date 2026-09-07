import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const VERDICT_STYLES = {
  legal: { bg: '#f0fff4', border: '#c6f6d5', color: '#276749', icon: '✅' },
  illegal: { bg: '#fff5f5', border: '#fed7d7', color: '#e53e3e', icon: '❌' },
  unclear: { bg: '#fffbeb', border: '#fef3c7', color: '#d69e2e', icon: '⚠️' },
};

const s = {
  back: { color: '#276749', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 750 },
  h1: { fontSize: 24, fontWeight: 700, color: '#276749', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 28 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4a5568' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 16, outline: 'none' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  verdictBox: { borderRadius: 12, padding: 24, marginBottom: 24, border: '2px solid' },
  verdictTitle: { fontSize: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 },
  stat: { background: '#f7fafc', borderRadius: 8, padding: 14, border: '1px solid #e2e8f0' },
  statLabel: { fontSize: 11, color: '#718096', marginBottom: 4, textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: 700, color: '#1a365d' },
  citation: { background: '#ebf8ff', borderRadius: 8, padding: 14, marginBottom: 16, border: '1px solid #bee3f8', fontSize: 13, color: '#2b6cb0' },
  letter: { background: '#f7fafc', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#2d3748', fontSize: 13 },
};

export default function RentIncreaseCheck() {
  const { id } = useParams();
  const [tenancy, setTenancy] = useState(null);
  const [form, setForm] = useState({ current_rent: '', proposed_rent: '', address: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tenancies/${id}`).then(r => {
      setTenancy(r.data);
      setForm(prev => ({
        ...prev,
        current_rent: r.data.monthly_rent || '',
        address: r.data.property_address || '',
      }));
    });
  }, [id]);

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });

  async function check() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/rent-increase-check', {
        current_rent: Number(form.current_rent),
        proposed_rent: Number(form.proposed_rent),
        address: form.address,
        tenancy_id: id,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Check failed');
    } finally {
      setLoading(false);
    }
  }

  const vs = result ? (VERDICT_STYLES[result.verdict] || VERDICT_STYLES.unclear) : null;

  return (
    <Layout>
      <Link to={`/tenancies/${id}`} style={s.back}>← Back to Tenancy</Link>
      <div style={s.card}>
        <h1 style={s.h1}>💰 Rent Increase Check</h1>
        <p style={s.sub}>Check if a proposed rent increase complies with local rent control laws and tenant protections.</p>
        {error && <div style={s.err}>{error}</div>}

        <div style={s.row}>
          <div>
            <label style={s.label}>Current Monthly Rent ($)</label>
            <input style={s.input} type="number" min="0" step="0.01" placeholder="1500" {...f('current_rent')} />
          </div>
          <div>
            <label style={s.label}>Proposed Monthly Rent ($)</label>
            <input style={s.input} type="number" min="0" step="0.01" placeholder="1700" {...f('proposed_rent')} />
          </div>
        </div>
        <label style={s.label}>Property Address</label>
        <input style={s.input} type="text" placeholder="Full address including city and state" {...f('address')} />
        <button style={s.btn} onClick={check} disabled={loading}>
          {loading ? 'Checking...' : 'Check Legality'}
        </button>

        {result && vs && (
          <div style={{ marginTop: 28 }}>
            <div style={{ ...s.verdictBox, background: vs.bg, borderColor: vs.border }}>
              <div style={{ ...s.verdictTitle, color: vs.color }}>
                <span style={{ fontSize: 28 }}>{vs.icon}</span>
                <span>Rent Increase is {result.verdict?.toUpperCase()}</span>
              </div>
              <div style={{ color: '#4a5568', fontSize: 14 }}>{result.statutory_cap}</div>
            </div>

            <div style={s.statsGrid}>
              <div style={s.stat}>
                <div style={s.statLabel}>Current Rent</div>
                <div style={s.statValue}>${Number(form.current_rent).toLocaleString()}</div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>Proposed Rent</div>
                <div style={{ ...s.statValue, color: result.verdict === 'illegal' ? '#e53e3e' : '#1a365d' }}>${Number(form.proposed_rent).toLocaleString()}</div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>Max Allowable</div>
                <div style={{ ...s.statValue, color: '#276749' }}>{result.max_allowable_increase}</div>
              </div>
            </div>

            {result.citation && (
              <div style={s.citation}>
                <strong>Legal Citation:</strong> {result.citation}
              </div>
            )}

            {result.complaint_letter && (
              <div>
                <div style={{ fontWeight: 700, marginBottom: 10, color: '#1a202c' }}>Draft Complaint Letter</div>
                <div style={s.letter}>{result.complaint_letter}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
