import React, { useState } from 'react';

export default function FilingTemplatePDF() {
  const [form, setForm] = useState({
    jurisdiction: 'California',
    plaintiff: '',
    defendant: '',
    amount: '',
    facts: '',
  });
  const [status, setStatus] = useState('');

  async function download() {
    setStatus('Generating...');
    try {
      const token = localStorage.getItem('token');
      const qs = new URLSearchParams(form).toString();
      const res = await fetch(`/api/custom-views/filing-template.pdf?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`PDF request failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filing-template-${form.jurisdiction}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      setStatus('Downloaded.');
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  }

  const ip = { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e0', borderRadius: 6, marginBottom: 10, fontSize: 13 };

  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 12px', color: '#1a365d' }}>Filing Template (PDF)</h3>
      <label style={{ fontSize: 12, fontWeight: 600 }}>Jurisdiction</label>
      <input style={ip} value={form.jurisdiction} onChange={e => setForm({ ...form, jurisdiction: e.target.value })} />
      <label style={{ fontSize: 12, fontWeight: 600 }}>Plaintiff</label>
      <input style={ip} value={form.plaintiff} onChange={e => setForm({ ...form, plaintiff: e.target.value })} />
      <label style={{ fontSize: 12, fontWeight: 600 }}>Defendant</label>
      <input style={ip} value={form.defendant} onChange={e => setForm({ ...form, defendant: e.target.value })} />
      <label style={{ fontSize: 12, fontWeight: 600 }}>Amount</label>
      <input style={ip} type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
      <label style={{ fontSize: 12, fontWeight: 600 }}>Facts</label>
      <textarea style={{ ...ip, minHeight: 80 }} value={form.facts} onChange={e => setForm({ ...form, facts: e.target.value })} />
      <button onClick={download} style={{
        background: '#2b6cb0', color: '#fff', border: 'none', padding: '10px 16px',
        borderRadius: 6, cursor: 'pointer', fontWeight: 600,
      }}>Download Filing PDF</button>
      {status && <div style={{ marginTop: 8, fontSize: 12, color: '#4a5568' }}>{status}</div>}
    </div>
  );
}
