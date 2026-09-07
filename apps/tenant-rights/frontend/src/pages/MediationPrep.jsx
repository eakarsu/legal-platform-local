import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const PRIORITY_COLORS = { high: '#e53e3e', medium: '#d69e2e', low: '#718096' };

const s = {
  back: { color: '#276749', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 850 },
  h1: { fontSize: 24, fontWeight: 700, color: '#276749', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 28 },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  section: { marginBottom: 28 },
  sectionTitle: { fontWeight: 700, fontSize: 16, color: '#1a202c', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' },
  openingBox: { background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 8, padding: 16, lineHeight: 1.7, color: '#276749', fontSize: 14 },
  tpCard: { background: 'white', borderRadius: 8, padding: 14, marginBottom: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  tpPoint: { fontWeight: 600, fontSize: 14, color: '#1a202c', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'center' },
  priorityBadge: { padding: '2px 8px', borderRadius: 20, color: 'white', fontSize: 10, fontWeight: 700 },
  tpFacts: { fontSize: 13, color: '#718096', lineHeight: 1.5 },
  resCard: { background: '#f7fafc', borderRadius: 8, padding: 14, marginBottom: 8, border: '1px solid #e2e8f0' },
  resItem: { fontWeight: 600, fontSize: 14, color: '#276749', marginBottom: 4 },
  resRationale: { fontSize: 13, color: '#718096' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { padding: '8px 0', borderBottom: '1px solid #f0f0f0', color: '#4a5568', fontSize: 13, display: 'flex', gap: 8 },
  nonNeg: { background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 6, padding: '8px 12px', marginBottom: 8, color: '#c53030', fontSize: 13 },
  closing: { background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: 8, padding: 16, color: '#2b6cb0', lineHeight: 1.7, fontSize: 14 },
};

export default function MediationPrep() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/mediation-prep', { tenancy_id: id });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate mediation prep');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={`/tenancies/${id}`} style={s.back}>← Back to Tenancy</Link>
      <div style={s.card}>
        <h1 style={s.h1}>🤝 Mediation Prep</h1>
        <p style={s.sub}>Get AI-generated talking points and proposed resolution terms for your landlord dispute mediation.</p>
        {error && <div style={s.err}>{error}</div>}
        <button style={s.btn} onClick={generate} disabled={loading}>
          {loading ? 'Preparing...' : result ? 'Regenerate' : 'Generate Mediation Strategy'}
        </button>

        {result && (
          <div style={{ marginTop: 32 }}>
            {result.opening_statement && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Opening Statement</div>
                <div style={s.openingBox}>{result.opening_statement}</div>
              </div>
            )}

            {result.talking_points?.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Talking Points</div>
                {result.talking_points.map((tp, i) => (
                  <div key={i} style={s.tpCard}>
                    <div style={s.tpPoint}>
                      {tp.point}
                      <span style={{ ...s.priorityBadge, background: PRIORITY_COLORS[tp.priority] || '#718096' }}>{tp.priority}</span>
                    </div>
                    {tp.supporting_facts && <div style={s.tpFacts}>{tp.supporting_facts}</div>}
                  </div>
                ))}
              </div>
            )}

            {result.proposed_resolutions?.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Proposed Resolution Terms</div>
                {result.proposed_resolutions.map((r, i) => (
                  <div key={i} style={s.resCard}>
                    <div style={s.resItem}>{r.item}</div>
                    {r.rationale && <div style={s.resRationale}>{r.rationale}</div>}
                  </div>
                ))}
              </div>
            )}

            {result.concession_areas?.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Areas You Can Negotiate</div>
                <ul style={s.list}>
                  {result.concession_areas.map((c, i) => (
                    <li key={i} style={s.listItem}><span>~</span>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.non_negotiables?.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Non-Negotiables</div>
                {result.non_negotiables.map((n, i) => (
                  <div key={i} style={s.nonNeg}>✕ {n}</div>
                ))}
              </div>
            )}

            {result.closing_strategy && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Closing Strategy</div>
                <div style={s.closing}>{result.closing_strategy}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
