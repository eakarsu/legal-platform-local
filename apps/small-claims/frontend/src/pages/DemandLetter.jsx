import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const s = {
  back: { color: '#2b6cb0', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 800 },
  h1: { fontSize: 24, fontWeight: 700, color: '#1a365d', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 28 },
  btn: { background: '#2b6cb0', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginRight: 12 },
  pdfBtn: { background: '#38a169', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  result: { marginTop: 28 },
  subject: { fontWeight: 700, fontSize: 16, color: '#1a365d', marginBottom: 16 },
  body: { background: '#f7fafc', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#2d3748', fontSize: 14 },
  legal: { marginTop: 16, background: '#ebf8ff', borderRadius: 8, padding: 14, border: '1px solid #bee3f8' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
};

export default function DemandLetter() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/demand-letter', { case_id: id });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate demand letter');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={`/cases/${id}`} style={s.back}>← Back to Case</Link>
      <div style={s.card}>
        <h1 style={s.h1}>📨 Demand Letter Generator</h1>
        <p style={s.sub}>Generate a professional pre-litigation demand letter based on your case facts.</p>
        {error && <div style={s.err}>{error}</div>}
        <button style={s.btn} onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : result ? 'Regenerate Letter' : 'Generate Demand Letter'}
        </button>

        {result && (
          <div style={s.result}>
            <div style={s.subject}>{result.subject}</div>
            <div style={{ fontSize: 13, color: '#718096', marginBottom: 12 }}>
              Demand Amount: <strong style={{ color: '#2b6cb0' }}>${Number(result.demand_amount || 0).toLocaleString()}</strong>
            </div>
            <div style={s.body}>{result.body}</div>
            <div style={s.legal}>
              <strong style={{ fontSize: 13 }}>Legal Basis:</strong>
              <p style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>{result.legal_basis}</p>
            </div>
            <div style={{ marginTop: 20 }}>
              <button style={s.pdfBtn} onClick={() => window.open(`/api/documents/${result.id}/pdf`, '_blank')}>
                Download PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
