import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const NOTICE_TYPES = [
  'Repair and Deduct Notice', 'Security Deposit Return Demand',
  'Habitability Complaint', 'Retaliation Notice', 'Privacy Violation Notice',
  'Illegal Entry Notice', 'Rent Withholding Notice', 'Lease Violation Notice',
  'Right to Cure Notice', 'Move-Out Notice (30-day)', 'Move-Out Notice (60-day)'
];

const s = {
  back: { color: '#276749', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 800 },
  h1: { fontSize: 24, fontWeight: 700, color: '#276749', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 28 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4a5568' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 16, background: 'white' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, minHeight: 100, resize: 'vertical', marginBottom: 16, fontFamily: 'inherit' },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginRight: 12 },
  pdfBtn: { background: '#2b6cb0', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  result: { marginTop: 28 },
  noticeTitle: { fontSize: 20, fontWeight: 700, color: '#276749', marginBottom: 16, textAlign: 'center', paddingBottom: 16, borderBottom: '2px solid #e2e8f0' },
  body: { background: '#f7fafc', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: 1.8, color: '#2d3748', fontSize: 13 },
  infoRow: { display: 'flex', gap: 16, marginTop: 16 },
  infoBadge: { background: '#ebf8ff', color: '#2b6cb0', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
};

export default function NoticeGenerator() {
  const { id } = useParams();
  const [tenancy, setTenancy] = useState(null);
  const [noticeType, setNoticeType] = useState('');
  const [context, setContext] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tenancies/${id}`).then(r => setTenancy(r.data));
  }, [id]);

  async function generate() {
    if (!noticeType) { setError('Please select a notice type'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/notice-generator', {
        tenancy_id: id,
        notice_type: noticeType,
        additional_context: context,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate notice');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <Link to={`/tenancies/${id}`} style={s.back}>← Back to Tenancy</Link>
      <div style={s.card}>
        <h1 style={s.h1}>📋 Notice Generator</h1>
        <p style={s.sub}>Generate a legally-correct formal notice letter for your landlord.</p>
        {error && <div style={s.err}>{error}</div>}

        <label style={s.label}>Notice Type *</label>
        <select style={s.select} value={noticeType} onChange={e => setNoticeType(e.target.value)}>
          <option value="">Select notice type...</option>
          {NOTICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={s.label}>Additional Context (optional)</label>
        <textarea style={s.textarea} value={context} onChange={e => setContext(e.target.value)} placeholder="E.g. leak reported on Jan 5, not fixed after 30 days..." />

        <button style={s.btn} onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : result ? 'Regenerate' : 'Generate Notice'}
        </button>

        {result && (
          <div style={s.result}>
            <div style={s.noticeTitle}>{result.notice_title}</div>
            <div style={s.body}>{result.content}</div>
            <div style={s.infoRow}>
              {result.statutory_basis && <div style={s.infoBadge}>Law: {result.statutory_basis}</div>}
              {result.deadline_days && <div style={s.infoBadge}>{result.deadline_days}-day deadline</div>}
              {result.send_method && <div style={s.infoBadge}>Send via: {result.send_method}</div>}
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
