import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const SEVERITY_COLORS = { high: '#e53e3e', medium: '#d69e2e', low: '#718096' };
const SEVERITY_BG = { high: '#fff5f5', medium: '#fffbeb', low: '#f7fafc' };
const SEVERITY_BORDER = { high: '#fed7d7', medium: '#fef3c7', low: '#e2e8f0' };
const RISK_COLORS = { high: '#e53e3e', medium: '#d69e2e', low: '#276749' };

const s = {
  back: { color: '#276749', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 850 },
  h1: { fontSize: 24, fontWeight: 700, color: '#276749', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 24 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4a5568' },
  textarea: { width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, minHeight: 200, resize: 'vertical', fontFamily: 'monospace', marginBottom: 16 },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  riskBadge: { display: 'inline-block', padding: '4px 14px', borderRadius: 20, color: 'white', fontWeight: 700, fontSize: 14 },
  clauseCard: { borderRadius: 8, padding: 16, marginBottom: 12 },
  clauseText: { fontWeight: 600, fontSize: 13, marginBottom: 6 },
  clauseIssue: { fontSize: 13, color: '#4a5568', marginBottom: 4 },
  clauseStatute: { fontSize: 12, color: '#718096', fontStyle: 'italic' },
  severityBadge: { display: 'inline-block', padding: '2px 8px', borderRadius: 20, color: 'white', fontSize: 11, fontWeight: 700, float: 'right' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  rec: { background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 8, padding: 12, marginBottom: 8, color: '#276749', fontSize: 13 },
};

export default function LeaseAnalyzer() {
  const { id } = useParams();
  const [tenancy, setTenancy] = useState(null);
  const [leaseText, setLeaseText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tenancies/${id}`).then(r => setTenancy(r.data));
  }, [id]);

  async function analyze() {
    if (leaseText.trim().length < 50) { setError('Please paste at least 50 characters of lease text'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/lease-analyzer', {
        lease_text: leaseText,
        state: tenancy?.state || 'California',
        tenancy_id: id,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={`/tenancies/${id}`} style={s.back}>← Back to Tenancy</Link>
      <div style={s.card}>
        <h1 style={s.h1}>📜 Lease Analyzer</h1>
        <p style={s.sub}>Paste your lease agreement text to identify illegal or problematic clauses under {tenancy?.state || 'your state'} law.</p>

        {!result && (
          <>
            {error && <div style={s.err}>{error}</div>}
            <label style={s.label}>Paste Lease Text</label>
            <textarea style={s.textarea} value={leaseText} onChange={e => setLeaseText(e.target.value)} placeholder="Paste your full lease agreement here..." />
            <button style={s.btn} onClick={analyze} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Lease'}
            </button>
          </>
        )}

        {result && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 20, background: '#f7fafc', borderRadius: 10 }}>
              <div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 4 }}>Overall Risk Level</div>
                <div style={{ ...s.riskBadge, background: RISK_COLORS[result.overall_risk] || '#718096' }}>
                  {result.overall_risk?.toUpperCase()} RISK
                </div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 13, color: '#718096' }}>
                <span><strong style={{ color: '#e53e3e' }}>{result.illegal_clauses?.length || 0}</strong> illegal</span>
                <span><strong style={{ color: '#d69e2e' }}>{result.concerning_clauses?.length || 0}</strong> concerning</span>
              </div>
            </div>

            {result.illegal_clauses?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a202c', marginBottom: 12 }}>Illegal Clauses</div>
                {result.illegal_clauses.map((c, i) => (
                  <div key={i} style={{ ...s.clauseCard, background: SEVERITY_BG[c.severity] || '#fff5f5', border: `1px solid ${SEVERITY_BORDER[c.severity] || '#fed7d7'}` }}>
                    <span style={{ ...s.severityBadge, background: SEVERITY_COLORS[c.severity] || '#e53e3e' }}>{c.severity}</span>
                    <div style={s.clauseText}>"{c.clause_text}"</div>
                    <div style={s.clauseIssue}>Issue: {c.issue}</div>
                    {c.statute && <div style={s.clauseStatute}>Statute: {c.statute}</div>}
                  </div>
                ))}
              </div>
            )}

            {result.concerning_clauses?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a202c', marginBottom: 12 }}>Concerning Clauses</div>
                {result.concerning_clauses.map((c, i) => (
                  <div key={i} style={{ ...s.clauseCard, background: '#fffbeb', border: '1px solid #fef3c7' }}>
                    <span style={{ ...s.severityBadge, background: '#d69e2e' }}>watch</span>
                    <div style={s.clauseText}>"{c.clause_text}"</div>
                    <div style={s.clauseIssue}>{c.issue}</div>
                  </div>
                ))}
              </div>
            )}

            {result.recommendations?.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a202c', marginBottom: 12 }}>Recommendations</div>
                {result.recommendations.map((r, i) => <div key={i} style={s.rec}>✓ {r}</div>)}
              </div>
            )}

            <button style={{ ...s.btn, marginTop: 20, background: '#718096' }} onClick={() => setResult(null)}>
              Analyze Different Lease
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
