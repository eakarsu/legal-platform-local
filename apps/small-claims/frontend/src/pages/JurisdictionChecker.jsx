import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const s = {
  back: { color: '#2b6cb0', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 700 },
  h1: { fontSize: 24, fontWeight: 700, color: '#1a365d', marginBottom: 24 },
  btn: { background: '#2b6cb0', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  result: { marginTop: 28 },
  resultCard: { background: '#f7fafc', borderRadius: 10, padding: 24, border: '1px solid #e2e8f0' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  stat: { background: 'white', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0' },
  statLabel: { fontSize: 12, color: '#718096', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 700, color: '#1a365d' },
  appropriate: { background: '#f0fff4', border: '1px solid #c6f6d5', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 },
  notAppropriate: { background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 10, padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 },
  overview: { color: '#4a5568', lineHeight: 1.7, fontSize: 14 },
};

export default function JurisdictionChecker() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/cases/${id}`).then(r => setCaseData(r.data));
  }, [id]);

  async function check() {
    if (!caseData) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/jurisdiction-check', {
        state: caseData.jurisdiction_state,
        dispute_type: caseData.dispute_type,
        claim_amount: caseData.claim_amount,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check jurisdiction');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={`/cases/${id}`} style={s.back}>← Back to Case</Link>
      <div style={s.card}>
        <h1 style={s.h1}>🗺️ Jurisdiction Check</h1>
        {caseData && (
          <p style={{ color: '#718096', marginBottom: 24, fontSize: 14 }}>
            Checking: {caseData.dispute_type} — ${Number(caseData.claim_amount).toLocaleString()} in {caseData.jurisdiction_state}
          </p>
        )}
        {error && <div style={{ background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}
        <button style={s.btn} onClick={check} disabled={loading || !caseData}>
          {loading ? 'Analyzing...' : 'Check Jurisdiction'}
        </button>

        {result && (
          <div style={s.result}>
            <div style={result.is_appropriate ? s.appropriate : s.notAppropriate}>
              <span style={{ fontSize: 28 }}>{result.is_appropriate ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>
                  {result.is_appropriate ? 'Small Claims Court is Appropriate' : 'Small Claims May Not Be Appropriate'}
                </div>
                <div style={{ color: '#4a5568', fontSize: 13, marginTop: 2 }}>Court: {result.court_name}</div>
              </div>
            </div>
            <div style={s.row}>
              <div style={s.stat}>
                <div style={s.statLabel}>Claim Cap</div>
                <div style={s.statValue}>${(result.claim_cap || 0).toLocaleString()}</div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>Filing Fee</div>
                <div style={s.statValue}>${result.filing_fee || 'Varies'}</div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>Statute of Limitations</div>
                <div style={s.statValue}>{result.sol_years} years</div>
              </div>
              <div style={s.stat}>
                <div style={s.statLabel}>Your Claim</div>
                <div style={{ ...s.statValue, color: caseData?.claim_amount <= result.claim_cap ? '#38a169' : '#e53e3e' }}>
                  ${Number(caseData?.claim_amount || 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div style={s.resultCard}>
              <div style={{ fontWeight: 600, marginBottom: 10, color: '#1a365d' }}>Process Overview</div>
              <div style={s.overview}>{result.process_overview}</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
