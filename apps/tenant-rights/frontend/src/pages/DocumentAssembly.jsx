import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const s = {
  back: { color: '#276749', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  card: { background: 'white', borderRadius: 12, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 900 },
  h1: { fontSize: 24, fontWeight: 700, color: '#276749', marginBottom: 8 },
  sub: { color: '#718096', fontSize: 14, marginBottom: 28 },
  formRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 14 },
  label: { display: 'block', fontSize: 13, color: '#4a5568', marginBottom: 6, fontWeight: 600 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: 8, fontSize: 14 },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e0', borderRadius: 8, fontSize: 14, fontFamily: 'inherit' },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  resultBox: { background: '#f7fafc', borderRadius: 8, padding: 16, marginTop: 20 },
  pre: { whiteSpace: 'pre-wrap', fontSize: 13, color: '#1a202c', overflow: 'auto' },
};

const tryParse = (v) => { if (!v || !v.trim()) return undefined; try { return JSON.parse(v); } catch { return v; } };

export default function DocumentAssembly() {
  const [form, setForm] = useState({
    document_type: 'demand_letter_for_repairs',
    jurisdiction: '',
    tenant_info: '',
    landlord_info: '',
    facts: '',
    tenancy_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const payload = {
        document_type: form.document_type,
      };
      if (form.jurisdiction.trim()) payload.jurisdiction = form.jurisdiction;
      const ti = tryParse(form.tenant_info); if (ti !== undefined) payload.tenant_info = ti;
      const li = tryParse(form.landlord_info); if (li !== undefined) payload.landlord_info = li;
      if (form.facts.trim()) payload.facts = form.facts;
      if (form.tenancy_id.trim()) payload.tenancy_id = form.tenancy_id;
      const res = await api.post('/ai/document-assembly', payload);
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || 'Failed to assemble document';
      setError(status === 503 ? `AI service unavailable (503): ${msg}` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Link to="/" style={s.back}>&larr; Back to Dashboard</Link>
      <div style={s.card}>
        <h1 style={s.h1}>Document Assembly</h1>
        <p style={s.sub}>Auto-fill a tenant document or form (e.g., demand letter, security-deposit dispute, repair request).</p>

        <form onSubmit={handleSubmit}>
          <div style={s.formRow}>
            <div>
              <label style={s.label}>Document Type *</label>
              <input style={s.input} type="text" required value={form.document_type} onChange={(e) => handleChange('document_type', e.target.value)}
                placeholder="demand_letter_for_repairs, security_deposit_demand, ..." />
            </div>
            <div>
              <label style={s.label}>Jurisdiction</label>
              <input style={s.input} type="text" value={form.jurisdiction} onChange={(e) => handleChange('jurisdiction', e.target.value)} placeholder="e.g. Oakland, CA" />
            </div>
            <div>
              <label style={s.label}>Tenancy ID (optional)</label>
              <input style={s.input} type="text" value={form.tenancy_id} onChange={(e) => handleChange('tenancy_id', e.target.value)} placeholder="attaches result to tenancy" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Tenant Info (JSON or text)</label>
            <textarea style={s.textarea} rows={3} value={form.tenant_info} onChange={(e) => handleChange('tenant_info', e.target.value)}
              placeholder='{"name":"Jane Doe","address":"123 Main St #4"}' />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Landlord Info (JSON or text)</label>
            <textarea style={s.textarea} rows={3} value={form.landlord_info} onChange={(e) => handleChange('landlord_info', e.target.value)}
              placeholder='{"name":"Acme LLC","mailing_address":"PO Box 7"}' />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={s.label}>Facts</label>
            <textarea style={s.textarea} rows={5} value={form.facts} onChange={(e) => handleChange('facts', e.target.value)}
              placeholder="Describe what happened (timeline, written notices given, repair issues...)" />
          </div>

          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
            {loading ? 'Assembling...' : 'Assemble Document'}
          </button>
        </form>

        {error && <div style={{ ...s.err, marginTop: 18 }}>{error}</div>}

        {result && (
          <div style={s.resultBox}>
            <h3 style={{ marginBottom: 12 }}>{result.title || 'Assembled Document'}</h3>
            {result.filled_document && (
              <pre style={{ ...s.pre, background: 'white', padding: 12, borderRadius: 6, marginBottom: 12 }}>{result.filled_document}</pre>
            )}
            <details>
              <summary style={{ cursor: 'pointer', color: '#4a5568', fontSize: 13 }}>Show full JSON</summary>
              <pre style={s.pre}>{JSON.stringify(result, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </Layout>
  );
}
