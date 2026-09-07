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

export default function EvidenceOrganizer() {
  const { id } = useParams();
  const [claimSummary, setClaimSummary] = useState('');
  const [exhibitsText, setExhibitsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const exhibits = exhibitsText.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/ai/evidence-organizer', {
        case_id: id,
        claim_summary: claimSummary,
        exhibits,
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
        <h1 style={s.h1}>Evidence Organizer</h1>
        <p style={{ color: '#4a5568' }}>Exhibit ordering, authentication tips, hearsay/objection warnings, gap finder.</p>
      </div>

      <form onSubmit={handleSubmit} style={s.card}>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Claim summary</label>
          <textarea style={s.textarea} rows={4} value={claimSummary} onChange={e => setClaimSummary(e.target.value)} placeholder="Briefly: who did what, when, harm, amount..." />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={s.label}>Exhibits (one per line)</label>
          <textarea style={s.textarea} rows={8} value={exhibitsText} onChange={e => setExhibitsText(e.target.value)} placeholder={'e.g.\nReceipt for repair, $325, dated 2024-03-12\nText messages from defendant 2024-03-01 to 2024-03-15\nPhotos of damaged item'} />
        </div>

        {error && <div style={s.err}>{error}</div>}

        <button type="submit" style={s.btn} disabled={loading}>
          {loading ? 'Organizing...' : 'Organize Evidence'}
        </button>
      </form>

      {result && (
        <div style={s.card}>
          <h2>Organization</h2>
          {result.disclaimer && <div style={s.disclaimer}>{result.disclaimer}</div>}
          <pre style={{ background: '#f7fafc', padding: 12, borderRadius: 6, whiteSpace: 'pre-wrap', overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Layout>
  );
}
