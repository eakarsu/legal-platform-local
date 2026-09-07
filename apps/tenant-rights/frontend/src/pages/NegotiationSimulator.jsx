import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const s = {
  back: { color: '#276749', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 900 },
  h1: { fontSize: 24, fontWeight: 700, color: '#276749', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 28 },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 },
  label: { display: 'block', fontSize: 13, color: '#4a5568', marginBottom: 6, fontWeight: 600 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: 8, fontSize: 14 },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  resultBox: { background: '#f7fafc', borderRadius: 8, padding: 16, marginTop: 20 },
  pre: { whiteSpace: 'pre-wrap', fontSize: 13, color: '#1a202c', overflow: 'auto' },
};

export default function NegotiationSimulator() {
  const [form, setForm] = useState({
    topic: '',
    tenant_position: '',
    landlord_stance: '',
    jurisdiction: '',
    history: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await api.post('/ai/negotiation-simulator', form);
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || 'Failed to run simulation';
      setError(status === 503 ? `AI service unavailable (503): ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Link to="/" style={s.back}>&larr; Back to Dashboard</Link>
      <div style={s.card}>
        <h1 style={s.h1}>Negotiation Simulator</h1>
        <p style={s.sub}>Role-play a landlord-tenant negotiation to prepare your strategy and anticipate counter-arguments.</p>

        <form onSubmit={handleSubmit}>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>Topic *</label>
              <input style={s.input} type="text" required value={form.topic} onChange={(e) => handleChange('topic', e.target.value)} placeholder="rent reduction, repair demand, lease renewal" />
            </div>
            <div>
              <label style={s.label}>Jurisdiction</label>
              <input style={s.input} type="text" value={form.jurisdiction} onChange={(e) => handleChange('jurisdiction', e.target.value)} placeholder="e.g. Oakland, CA" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Tenant Position *</label>
            <textarea style={s.textarea} rows={3} required value={form.tenant_position} onChange={(e) => handleChange('tenant_position', e.target.value)}
              placeholder="What you want, why you believe you're entitled, and any leverage you have." />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Landlord Stance (optional)</label>
            <textarea style={s.textarea} rows={3} value={form.landlord_stance} onChange={(e) => handleChange('landlord_stance', e.target.value)}
              placeholder="What you expect them to argue or refuse." />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Prior Exchanges (optional)</label>
            <textarea style={s.textarea} rows={3} value={form.history} onChange={(e) => handleChange('history', e.target.value)}
              placeholder="Earlier emails, letters, or conversations summarized." />
          </div>

          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </form>

        {error && <div style={{ ...s.err, marginTop: 18 }}>{error}</div>}

        {result && (
          <div style={s.resultBox}>
            <h3 style={{ marginBottom: 12 }}>Simulation Result</h3>
            <pre style={s.pre}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </Layout>
  );
}
