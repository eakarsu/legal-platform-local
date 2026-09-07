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
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', minHeight: 100 },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  resultBox: { background: '#f7fafc', borderRadius: 8, padding: 16, marginTop: 20 },
  pre: { whiteSpace: 'pre-wrap', fontSize: 13, color: '#1a202c', overflow: 'auto' },
};

export default function LegalExpertChat() {
  const [topic, setTopic] = useState('');
  const [stateField, setStateField] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await api.post('/ai/legal-expert-chat', { topic, state: stateField, urgency });
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.error || 'Request failed';
      const missing = err.response?.data?.missing;
      setError(status === 503 && missing ? `${detail} (missing env: ${missing})` : detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Link to="/" style={s.back}>&larr; Back to Dashboard</Link>
      <div style={s.card}>
        <h1 style={s.h1}>Live Legal Expert Chat</h1>
        <p style={s.sub}>
          Connect with a vetted live legal expert. Requires <code>LEGAL_EXPERT_CHAT_API_KEY</code>; returns 503 with the
          missing env var name when not configured.
        </p>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Topic *</label>
            <textarea style={s.textarea} required value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., 30-day eviction notice received without cause" />
          </div>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>State (2-letter)</label>
              <input style={s.input} value={stateField} onChange={(e) => setStateField(e.target.value)} placeholder="CA" />
            </div>
            <div>
              <label style={s.label}>Urgency</label>
              <select style={s.input} value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="normal">normal</option>
                <option value="high">high</option>
                <option value="emergency">emergency</option>
              </select>
            </div>
          </div>
          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Connecting...' : 'Request Expert'}
          </button>
        </form>
        {error && <div style={{ ...s.err, marginTop: 18 }}>{error}</div>}
        {result && (
          <div style={s.resultBox}>
            <h3 style={{ marginBottom: 12 }}>Response</h3>
            <pre style={s.pre}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </Layout>
  );
}
