import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const s = {
  back: { color: '#2b6cb0', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  header: { marginBottom: 20 },
  h1: { fontSize: 24, fontWeight: 700, color: '#1a365d' },
  card: { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 20 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' },
  btn: { background: '#2b6cb0', color: 'white', padding: '10px 24px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  disclaimer: { fontSize: 12, color: '#92400e', background: '#fef3c7', padding: '10px 14px', borderRadius: 8, marginTop: 12 },
};

export default function CourtProcedureChecklist() {
  const { id } = useParams();
  const [state, setState] = useState('');
  const [county, setCounty] = useState('');
  const [claimType, setClaimType] = useState('contract');
  const [stage, setStage] = useState('all');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!state.trim()) { setError('State / jurisdiction is required.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post('/ai/court-procedure-checklist', {
        case_id: id,
        state,
        county,
        claim_type: claimType,
        stage,
      });
      setResult(res.data?.result || res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={id ? `/cases/${id}` : '/'} style={s.back}>← Back</Link>
      <div style={s.header}>
        <h1 style={s.h1}>Court Procedure Checklist</h1>
        <p style={{ color: '#4a5568' }}>Jurisdiction-specific checklist (filing → service → hearing → post-judgment).</p>
      </div>

      <form onSubmit={handleSubmit} style={s.card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={s.label}>State *</label>
            <input style={s.input} value={state} onChange={e => setState(e.target.value)} placeholder="e.g. California" required />
          </div>
          <div>
            <label style={s.label}>County (optional)</label>
            <input style={s.input} value={county} onChange={e => setCounty(e.target.value)} placeholder="e.g. Alameda" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={s.label}>Claim type</label>
            <select style={s.input} value={claimType} onChange={e => setClaimType(e.target.value)}>
              <option value="contract">Contract</option>
              <option value="property_damage">Property Damage</option>
              <option value="security_deposit">Security Deposit</option>
              <option value="services_not_rendered">Services Not Rendered</option>
              <option value="loan">Personal Loan</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Stage</label>
            <select style={s.input} value={stage} onChange={e => setStage(e.target.value)}>
              <option value="all">All stages</option>
              <option value="pre_filing">Pre-filing</option>
              <option value="filing">Filing</option>
              <option value="service">Service of Process</option>
              <option value="hearing">Hearing</option>
              <option value="post_judgment">Post-judgment</option>
            </select>
          </div>
        </div>

        {error && <div style={s.err}>{error}</div>}

        <button type="submit" style={s.btn} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Checklist'}
        </button>
      </form>

      {result && (
        <div style={s.card}>
          <h2>Checklist</h2>
          {result.disclaimer && <div style={s.disclaimer}>{result.disclaimer}</div>}
          <pre style={{ background: '#f7fafc', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Layout>
  );
}
