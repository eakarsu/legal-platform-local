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
  section: { marginBottom: 20 },
  sectionTitle: { fontWeight: 700, fontSize: 14, color: '#1a365d', marginBottom: 8 },
  sectionBody: { background: '#f7fafc', borderRadius: 8, padding: 16, border: '1px solid #e2e8f0', color: '#2d3748', lineHeight: 1.7, fontSize: 14 },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  docTitle: { fontSize: 20, fontWeight: 700, color: '#1a365d', textAlign: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #e2e8f0' },
};

export default function ComplaintDraft() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/draft-complaint', { case_id: id });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate complaint');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={`/cases/${id}`} style={s.back}>← Back to Case</Link>
      <div style={s.card}>
        <h1 style={s.h1}>📋 Complaint Draft</h1>
        <p style={s.sub}>Generate a court complaint document ready for filing.</p>
        {error && <div style={s.err}>{error}</div>}
        <button style={s.btn} onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : result ? 'Regenerate' : 'Draft Complaint'}
        </button>

        {result && (
          <div style={s.result}>
            <div style={s.docTitle}>{result.title}</div>
            {[
              ['Plaintiff', result.plaintiff_statement],
              ['Defendant', result.defendant_info],
              ['Claim Description', result.claim_description],
              ['Relief Sought', result.relief_sought],
            ].map(([title, body]) => body && (
              <div key={title} style={s.section}>
                <div style={s.sectionTitle}>{title}</div>
                <div style={s.sectionBody}>{body}</div>
              </div>
            ))}
            {result.exhibits?.length > 0 && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Exhibits</div>
                <div style={s.sectionBody}>{result.exhibits.join(', ')}</div>
              </div>
            )}
            <button style={s.pdfBtn} onClick={() => window.open(`/api/documents/${result.id}/pdf`, '_blank')}>
              Download PDF
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
