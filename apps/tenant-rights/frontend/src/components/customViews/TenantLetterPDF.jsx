import React, { useState } from 'react';
import api from '../../api.js';

const inp = { width: '100%', padding: '8px 10px', border: '1px solid #cbd5e0', borderRadius: 6, fontSize: 13, marginBottom: 10 };

export default function TenantLetterPDF() {
  const [form, setForm] = useState({
    tenant_name: 'Alex Tenant',
    landlord_name: 'ACME Properties LLC',
    property_address: '123 Main St, Apt 4B',
    state: 'CA',
    subject: 'Request to Repair Habitability Issue',
    body: 'I am writing to formally request repairs to the heating system in my unit, which has been non-functional since the start of this month. Per state habitability law, please address this within 14 days.',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  function set(k, v) { setForm({ ...form, [k]: v }); }

  async function generate() {
    setLoading(true);
    setStatus('');
    try {
      const res = await api.post('/custom-views/tenant-letter-pdf', form, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-letter-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('PDF downloaded successfully');
    } catch (e) {
      setStatus('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h3 style={{ color: '#276749', marginTop: 0, marginBottom: 12 }}>Tenant Letter PDF Generator</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600 }}>Tenant Name</label>
          <input style={inp} value={form.tenant_name} onChange={e => set('tenant_name', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600 }}>Landlord Name</label>
          <input style={inp} value={form.landlord_name} onChange={e => set('landlord_name', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600 }}>Property Address</label>
          <input style={inp} value={form.property_address} onChange={e => set('property_address', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600 }}>State</label>
          <input style={inp} value={form.state} onChange={e => set('state', e.target.value)} />
        </div>
      </div>
      <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600 }}>Subject</label>
      <input style={inp} value={form.subject} onChange={e => set('subject', e.target.value)} />
      <label style={{ fontSize: 12, color: '#4a5568', fontWeight: 600 }}>Body</label>
      <textarea style={{ ...inp, minHeight: 120, fontFamily: 'inherit' }} value={form.body} onChange={e => set('body', e.target.value)} />
      <button
        onClick={generate}
        disabled={loading}
        style={{ background: '#276749', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
      >{loading ? 'Generating...' : 'Generate PDF'}</button>
      {status && <div style={{ marginTop: 12, fontSize: 13, color: status.includes('Failed') ? '#c53030' : '#276749' }}>{status}</div>}
    </div>
  );
}
