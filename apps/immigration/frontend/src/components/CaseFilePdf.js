import React, { useEffect, useState } from 'react';
import api from '../services/api';

function CaseFilePdf() {
  const [cases, setCases] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.get('/cases?page=1&limit=50').then(r => {
      const list = r.data.data || (Array.isArray(r.data) ? r.data : []);
      setCases(list);
      if (list[0]) setSelectedId(list[0].id);
    }).catch(() => {});
  }, []);

  const downloadPdf = async () => {
    if (!selectedId) return;
    setStatus('Generating...');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/custom-views/case-file-pdf/${selectedId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `case-${selectedId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus('Downloaded.');
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>Case File PDF Export</h3>
      <p style={{ color: '#666', fontSize: 13 }}>Generate a downloadable case file as PDF.</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{ padding: 8, border: '1px solid #d1d5db', borderRadius: 4, minWidth: 240 }}
          data-testid="pdf-case-select"
        >
          <option value="">Select a case...</option>
          {cases.map(c => (
            <option key={c.id} value={c.id}>
              {c.case_number} — {c.case_type}
            </option>
          ))}
        </select>
        <button
          onClick={downloadPdf}
          disabled={!selectedId}
          style={{
            background: '#3b82f6',
            color: '#fff',
            border: 0,
            padding: '8px 14px',
            borderRadius: 4,
            cursor: selectedId ? 'pointer' : 'not-allowed',
          }}
        >
          Download PDF
        </button>
      </div>
      {status && <div style={{ marginTop: 8, fontSize: 13, color: '#475569' }}>{status}</div>}
    </div>
  );
}

export default CaseFilePdf;
