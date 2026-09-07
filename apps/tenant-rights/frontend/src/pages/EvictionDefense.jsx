import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const STRENGTH_COLORS = { strong: '#276749', moderate: '#d69e2e', weak: '#718096' };
const STRENGTH_BG = { strong: '#f0fff4', moderate: '#fffbeb', weak: '#f7fafc' };

const s = {
  back: { color: '#276749', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 850 },
  h1: { fontSize: 24, fontWeight: 700, color: '#276749', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 24 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4a5568' },
  textarea: { width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, minHeight: 200, resize: 'vertical', fontFamily: 'monospace', marginBottom: 16 },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontWeight: 700, fontSize: 16, color: '#1a202c', marginBottom: 14 },
  defenseCard: { borderRadius: 8, padding: 16, marginBottom: 10 },
  defenseTitle: { fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 },
  defenseExplanation: { fontSize: 13, color: '#4a5568', lineHeight: 1.6 },
  strengthBadge: { padding: '2px 8px', borderRadius: 20, color: 'white', fontSize: 11, fontWeight: 700 },
  deadlineBanner: { background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' },
  draftBox: { background: '#f7fafc', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#2d3748', fontSize: 13 },
  action: { background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 6, padding: 10, marginBottom: 8, color: '#276749', fontSize: 13 },
};

export default function EvictionDefense() {
  const { id } = useParams();
  const [tenancy, setTenancy] = useState(null);
  const [summonsText, setSummonsText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tenancies/${id}`).then(r => setTenancy(r.data));
  }, [id]);

  async function analyze() {
    if (summonsText.trim().length < 50) { setError('Please paste at least 50 characters of summons text'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/eviction-defense', {
        summons_text: summonsText,
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
        <h1 style={s.h1}>🛡️ Eviction Defense</h1>
        <p style={s.sub}>Paste your eviction summons to identify defenses and get a draft answer for court.</p>

        {!result && (
          <>
            {error && <div style={s.err}>{error}</div>}
            <label style={s.label}>Paste Eviction Summons Text</label>
            <textarea style={s.textarea} value={summonsText} onChange={e => setSummonsText(e.target.value)} placeholder="Paste the full text of the eviction summons or notice..." />
            <button style={s.btn} onClick={analyze} disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze & Build Defense'}
            </button>
          </>
        )}

        {result && (
          <div>
            {result.response_deadline && (
              <div style={s.deadlineBanner}>
                <span style={{ fontSize: 24 }}>⏰</span>
                <div>
                  <div style={{ fontWeight: 700 }}>Response Deadline</div>
                  <div style={{ color: '#4a5568', fontSize: 13 }}>{result.response_deadline}</div>
                </div>
              </div>
            )}

            <div style={s.section}>
              <div style={s.sectionTitle}>Identified Defenses</div>
              {result.identified_defenses?.map((d, i) => (
                <div key={i} style={{ ...s.defenseCard, background: STRENGTH_BG[d.strength] || '#f7fafc', border: `1px solid ${d.strength === 'strong' ? '#c6f6d5' : d.strength === 'moderate' ? '#fef3c7' : '#e2e8f0'}` }}>
                  <div style={s.defenseTitle}>
                    {d.defense}
                    <span style={{ ...s.strengthBadge, background: STRENGTH_COLORS[d.strength] || '#718096' }}>{d.strength}</span>
                  </div>
                  <div style={s.defenseExplanation}>{d.explanation}</div>
                </div>
              ))}
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}>Draft Answer for Court</div>
              <div style={s.draftBox}>{result.draft_answer}</div>
            </div>

            {result.recommended_actions?.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Recommended Actions</div>
                {result.recommended_actions.map((a, i) => <div key={i} style={s.action}>→ {a}</div>)}
              </div>
            )}

            <button style={{ ...s.btn, background: '#718096' }} onClick={() => setResult(null)}>
              Analyze Different Summons
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
