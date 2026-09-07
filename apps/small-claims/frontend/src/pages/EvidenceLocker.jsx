import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const TYPE_ICONS = { photo: '📷', contract: '📄', receipt: '🧾', invoice: '💼', correspondence: '✉️', medical_record: '🏥', bank_statement: '🏦', other: '📎' };

const s = {
  back: { color: '#2b6cb0', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  h1: { fontSize: 24, fontWeight: 700, color: '#1a365d' },
  uploadCard: { background: 'white', borderRadius: 12, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 28, border: '2px dashed #e2e8f0' },
  uploadTitle: { fontWeight: 700, color: '#1a365d', marginBottom: 16 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 },
  fileInput: { width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, background: 'white' },
  btn: { background: '#2b6cb0', color: 'white', padding: '10px 24px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  item: { background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  exhibit: { fontWeight: 700, color: '#2b6cb0', fontSize: 13, marginBottom: 8 },
  icon: { fontSize: 32, marginBottom: 8 },
  itemType: { fontSize: 12, color: '#718096', textTransform: 'capitalize', marginBottom: 4 },
  itemDesc: { color: '#4a5568', fontSize: 13, lineHeight: 1.5 },
  badge: { display: 'inline-block', background: '#ebf8ff', color: '#2b6cb0', padding: '2px 8px', borderRadius: 20, fontSize: 11, marginTop: 8, fontWeight: 600 },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  success: { background: '#f0fff4', color: '#38a169', padding: '10px 14px', borderRadius: 8, marginBottom: 16 },
  empty: { textAlign: 'center', padding: 40, color: '#718096' },
};

export default function EvidenceLocker() {
  const { id } = useParams();
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/cases/${id}/evidence`)
      .then(r => setEvidence(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function upload(e) {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('description', description);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/cases/${id}/evidence`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setEvidence(prev => [data, ...prev]);
      setFile(null);
      setDescription('');
      setMessage(`Uploaded as ${data.exhibit_label} — AI classified as: ${data.ai_classification}`);
      e.target.reset();
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Layout>
      <Link to={`/cases/${id}`} style={s.back}>← Back to Case</Link>
      <div style={s.header}>
        <h1 style={s.h1}>🗂️ Evidence Locker</h1>
      </div>

      <form style={s.uploadCard} onSubmit={upload}>
        <div style={s.uploadTitle}>Upload New Evidence</div>
        {error && <div style={s.err}>{error}</div>}
        {message && <div style={s.success}>{message}</div>}
        <div style={s.row}>
          <div>
            <label style={s.label}>File</label>
            <input style={s.fileInput} type="file" onChange={e => setFile(e.target.files[0])} />
          </div>
          <div>
            <label style={s.label}>Description</label>
            <input style={s.input} type="text" placeholder="What is this document?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <button type="submit" style={s.btn} disabled={uploading}>
          {uploading ? 'Uploading & Classifying...' : 'Upload Evidence'}
        </button>
      </form>

      {loading ? <p>Loading...</p> : evidence.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🗂️</p>
          <p>No evidence uploaded yet. Upload files to build your case.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {evidence.map(item => (
            <div key={item.id} style={s.item}>
              <div style={s.exhibit}>{item.exhibit_label}</div>
              <div style={s.icon}>{TYPE_ICONS[item.ai_classification] || '📎'}</div>
              <div style={s.itemType}>{item.file_type}</div>
              {item.description && <div style={s.itemDesc}>{item.description}</div>}
              <div style={s.badge}>AI: {item.ai_classification}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
