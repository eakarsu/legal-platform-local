import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const s = {
  back: { color: '#2b6cb0', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 850 },
  h1: { fontSize: 24, fontWeight: 700, color: '#1a365d', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 28 },
  btn: { background: '#2b6cb0', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  scoreBox: { background: 'linear-gradient(135deg, #1a365d, #2b6cb0)', borderRadius: 12, padding: 24, color: 'white', textAlign: 'center', marginBottom: 28 },
  scoreNum: { fontSize: 56, fontWeight: 700 },
  scoreLabel: { fontSize: 14, opacity: 0.8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontWeight: 700, fontSize: 16, color: '#1a365d', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 },
  qCard: { background: '#f7fafc', borderRadius: 8, padding: 14, marginBottom: 10, border: '1px solid #e2e8f0' },
  qText: { color: '#2d3748', fontSize: 14, fontWeight: 500, marginBottom: 6 },
  aText: { color: '#4a5568', fontSize: 13, lineHeight: 1.6, borderLeft: '3px solid #3182ce', paddingLeft: 10, marginTop: 8 },
  tip: { background: '#fffbeb', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #fef3c7', color: '#92400e', fontSize: 13, display: 'flex', gap: 8 },
  opposingQ: { background: '#fff5f5', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #fed7d7', color: '#c53030', fontSize: 14 },
};

export default function HearingPrep() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/hearing-prep', { case_id: id });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate hearing prep');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={`/cases/${id}`} style={s.back}>← Back to Case</Link>
      <div style={s.card}>
        <h1 style={s.h1}>🎤 Hearing Prep Simulator</h1>
        <p style={s.sub}>AI plays judge and opposing party, asks you questions, and scores your readiness.</p>
        {error && <div style={s.err}>{error}</div>}
        <button style={s.btn} onClick={generate} disabled={loading}>
          {loading ? 'Preparing...' : result ? 'Run Again' : 'Start Hearing Prep'}
        </button>

        {result && (
          <div style={{ marginTop: 28 }}>
            <div style={s.scoreBox}>
              <div style={s.scoreNum}>{result.score}<span style={{ fontSize: 24 }}>/100</span></div>
              <div style={s.scoreLabel}>Hearing Readiness Score</div>
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}>👨‍⚖️ Judge's Questions & Suggested Responses</div>
              {result.judge_questions?.map((q, i) => (
                <div key={i} style={s.qCard}>
                  <div style={s.qText}>Q: {q}</div>
                  {result.your_responses?.[i] && <div style={s.aText}>Suggested: {result.your_responses[i]}</div>}
                </div>
              ))}
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}>⚔️ Opposing Party Questions</div>
              {result.opposing_questions?.map((q, i) => (
                <div key={i} style={s.opposingQ}>Q: {q}</div>
              ))}
            </div>

            <div style={s.section}>
              <div style={s.sectionTitle}>💡 Coaching Tips</div>
              {result.coaching_tips?.map((tip, i) => (
                <div key={i} style={s.tip}>
                  <span>💡</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
