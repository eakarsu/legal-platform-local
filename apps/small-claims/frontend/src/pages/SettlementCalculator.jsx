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
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box', fontFamily: 'inherit' },
  btn: { background: '#2b6cb0', color: 'white', padding: '10px 24px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  disclaimer: { fontSize: 12, color: '#92400e', background: '#fef3c7', padding: '10px 14px', borderRadius: 8, marginTop: 12 },
};

export default function SettlementCalculator() {
  const { id } = useParams();
  const [claimAmount, setClaimAmount] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [weaknessesText, setWeaknessesText] = useState('');
  const [opponentPosition, setOpponentPosition] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!claimAmount) { setError('Claim amount is required.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const strengths = strengthsText.split('\n').map(s => s.trim()).filter(Boolean);
      const weaknesses = weaknessesText.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/ai/settlement-calculator', {
        case_id: id,
        claim_amount: Number(claimAmount),
        strengths,
        weaknesses,
        opponent_position: opponentPosition,
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
        <h1 style={s.h1}>Settlement Calculator</h1>
        <p style={{ color: '#4a5568' }}>Informational settlement range with explicit disclaimer.</p>
      </div>

      <form onSubmit={handleSubmit} style={s.card}>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Claim amount ($) *</label>
          <input type="number" min="0" step="0.01" style={s.input} value={claimAmount} onChange={e => setClaimAmount(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Case strengths (one per line)</label>
          <textarea style={s.textarea} rows={4} value={strengthsText} onChange={e => setStrengthsText(e.target.value)} placeholder={'Signed contract\nText admissions\nThird-party witness'} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Case weaknesses (one per line)</label>
          <textarea style={s.textarea} rows={4} value={weaknessesText} onChange={e => setWeaknessesText(e.target.value)} placeholder={'Statute of limitations close\nNo independent witness\nPartial payment received'} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Opponent's position (if known)</label>
          <textarea style={s.textarea} rows={3} value={opponentPosition} onChange={e => setOpponentPosition(e.target.value)} placeholder="e.g. denies all claims, willing to pay $500 to avoid hearing" />
        </div>

        {error && <div style={s.err}>{error}</div>}

        <button type="submit" style={s.btn} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Settlement Range'}
        </button>
      </form>

      {result && (
        <div style={s.card}>
          <h2>Settlement Analysis</h2>
          {result.disclaimer && <div style={s.disclaimer}>{result.disclaimer}</div>}
          <pre style={{ background: '#f7fafc', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Layout>
  );
}
