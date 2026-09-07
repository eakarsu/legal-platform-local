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
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, color: 'white' },
};

const outcomeColors = {
  tenant_wins: '#276749',
  landlord_wins: '#c53030',
  settlement: '#d69e2e',
  mixed: '#3182ce',
};

export default function CaseOutcome() {
  const [form, setForm] = useState({
    state: '',
    jurisdiction: '',
    evidence_strength: 'medium',
    case_summary: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const res = await api.post('/ai/case-outcome', form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to predict outcome');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Link to="/" style={s.back}>&larr; Back to Dashboard</Link>
      <div style={s.card}>
        <h1 style={s.h1}>Case Outcome Predictor</h1>
        <p style={s.sub}>AI predicts the likely outcome of an eviction defense or tenant-landlord dispute.</p>

        <form onSubmit={handleSubmit}>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>State *</label>
              <input style={s.input} type="text" required value={form.state} onChange={(e) => handleChange('state', e.target.value)} placeholder="e.g. CA" />
            </div>
            <div>
              <label style={s.label}>Jurisdiction (city/county)</label>
              <input style={s.input} type="text" value={form.jurisdiction} onChange={(e) => handleChange('jurisdiction', e.target.value)} placeholder="e.g. Oakland" />
            </div>
            <div>
              <label style={s.label}>Evidence Strength</label>
              <select style={s.input} value={form.evidence_strength} onChange={(e) => handleChange('evidence_strength', e.target.value)}>
                <option value="weak">Weak</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Case Summary * (min 30 chars)</label>
            <textarea style={s.textarea} rows={6} required minLength={30}
              value={form.case_summary} onChange={(e) => handleChange('case_summary', e.target.value)}
              placeholder="Describe the dispute, timeline, key facts, evidence available..." />
          </div>

          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Predicting...' : 'Predict Outcome'}
          </button>
        </form>

        {error && <div style={{ ...s.err, marginTop: 18 }}>{error}</div>}

        {result && (
          <div style={s.resultBox}>
            <h3 style={{ marginBottom: 12 }}>
              Outcome Prediction
              {result.predicted_outcome && (
                <span style={{ ...s.badge, background: outcomeColors[result.predicted_outcome] || '#718096', marginLeft: 12 }}>
                  {String(result.predicted_outcome).replace(/_/g, ' ')}
                </span>
              )}
            </h3>
            {typeof result.tenant_win_probability_pct === 'number' && (
              <p style={{ fontSize: 14, color: '#4a5568', marginBottom: 10 }}>
                <strong>Tenant Win Probability:</strong> {result.tenant_win_probability_pct}%
              </p>
            )}
            <pre style={s.pre}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </Layout>
  );
}
