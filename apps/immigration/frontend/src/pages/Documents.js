import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyDoc = { document_name: '', document_type: '', case_id: '', client_id: '', status: 'pending', file_path: '', notes: '' };
const docTypes = ['USCIS Form', 'DOL Form', 'Identity Document', 'Travel Document', 'Supporting Document', 'Employment Document', 'Education Document', 'Legal Document', 'Medical Document', 'Financial Document'];
const docStatuses = ['pending', 'submitted', 'verified', 'approved', 'rejected', 'completed'];

function Documents() {
  const [items, setItems] = useState([]);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [form, setForm] = useState(emptyDoc);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);

  // OCR state
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrCaseId, setOcrCaseId] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const fileInputRef = useRef(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const load = () => {
    api.get(`/documents?page=${page}&limit=${limit}`).then(r => {
      if (r.data.data) {
        setItems(r.data.data);
        setTotalPages(r.data.pagination?.totalPages || 1);
      } else {
        setItems(Array.isArray(r.data) ? r.data : []);
      }
    }).catch(() => {});
    api.get('/cases').then(r => setCases(Array.isArray(r.data) ? r.data : r.data.data || [])).catch(() => {});
    api.get('/clients').then(r => setClients(Array.isArray(r.data) ? r.data : r.data.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, [page]);

  const getBadgeClass = (s) => {
    const m = { pending: 'badge-warning', submitted: 'badge-info', verified: 'badge-primary', approved: 'badge-success', rejected: 'badge-danger', completed: 'badge-success' };
    return m[s] || 'badge-secondary';
  };

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyDoc); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ document_name: selected.document_name, document_type: selected.document_type || '', case_id: selected.case_id || '', client_id: selected.client_id || '', status: selected.status, file_path: selected.file_path || '', notes: selected.notes || '' });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/documents/${selected.id}`, form); setToast({ message: 'Document updated', type: 'success' }); }
      else { await api.post('/documents', form); setToast({ message: 'Document created', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: 'Error saving document', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/documents/${selected.id}`); setToast({ message: 'Document deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  const handleOCRUpload = async () => {
    if (!ocrFile) { setToast({ message: 'Please select a file', type: 'error' }); return; }
    setOcrLoading(true);
    setOcrResult(null);
    try {
      const formData = new FormData();
      formData.append('file', ocrFile);
      if (ocrCaseId) formData.append('case_id', ocrCaseId);

      const res = await api.post('/ai/document-ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setOcrResult(res.data);
    } catch (err) {
      if (err.response?.status === 429) {
        setToast({ message: 'AI request limit reached. Please wait.', type: 'error' });
      } else {
        setToast({ message: err.response?.data?.error || 'OCR extraction failed', type: 'error' });
      }
    }
    setOcrLoading(false);
  };

  const handleSaveOCRToCase = async () => {
    if (!ocrResult?.structured) { setToast({ message: 'No extracted data to save', type: 'error' }); return; }
    const s = ocrResult.structured;
    try {
      await api.post('/documents', {
        document_name: s.applicant_name || ocrFile?.name || 'Extracted Document',
        document_type: s.document_type || 'Unknown',
        case_id: ocrCaseId || null,
        status: 'pending',
        notes: s.extracted_text ? s.extracted_text.substring(0, 500) : null,
      });
      setToast({ message: 'Document saved to case', type: 'success' });
      setShowOCR(false);
      setOcrResult(null);
      setOcrFile(null);
      load();
    } catch (err) {
      setToast({ message: 'Error saving document', type: 'error' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Documents</h1><p>Manage case documents</p></div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowOCR(true)}>
            <i className="fa-solid fa-scanner"></i> Upload &amp; Extract
          </button>
          <button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Document</button>
        </div>
      </div>

      {/* OCR Upload Panel */}
      {showOCR && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3><i className="fa-solid fa-scanner" style={{ color: 'var(--primary-light)' }}></i> Upload &amp; Extract Document</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowOCR(false); setOcrResult(null); setOcrFile(null); }}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Document File (Image or PDF)</label>
              <input type="file" ref={fileInputRef} accept="image/*,.pdf" onChange={e => setOcrFile(e.target.files[0])} style={{ display: 'block', padding: '8px 0' }} />
              {ocrFile && <small style={{ color: 'var(--text-secondary)' }}>{ocrFile.name} ({(ocrFile.size / 1024).toFixed(1)} KB)</small>}
            </div>
            <div className="form-group">
              <label>Link to Case (optional)</label>
              <select value={ocrCaseId} onChange={e => setOcrCaseId(e.target.value)}>
                <option value="">Select case...</option>
                {cases.map(c => <option key={c.id} value={c.id}>{c.case_number}</option>)}
              </select>
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleOCRUpload} disabled={ocrLoading || !ocrFile}>
            {ocrLoading ? <><i className="fa-solid fa-spinner fa-spin"></i> Extracting...</> : <><i className="fa-solid fa-robot"></i> Extract with AI</>}
          </button>

          {ocrResult?.structured && (
            <div style={{ marginTop: 20, padding: 20, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <h4 style={{ marginBottom: 16 }}>Extracted Fields</h4>
              <div className="detail-grid">
                {ocrResult.structured.applicant_name && <div className="detail-field"><label>Applicant Name</label><span>{ocrResult.structured.applicant_name}</span></div>}
                {ocrResult.structured.document_type && <div className="detail-field"><label>Document Type</label><span>{ocrResult.structured.document_type}</span></div>}
                {ocrResult.structured.a_number && <div className="detail-field"><label>A-Number</label><span>{ocrResult.structured.a_number}</span></div>}
                {ocrResult.structured.receipt_number && <div className="detail-field"><label>Receipt Number</label><span>{ocrResult.structured.receipt_number}</span></div>}
                {ocrResult.structured.status && <div className="detail-field"><label>Status</label><span>{ocrResult.structured.status}</span></div>}
                {ocrResult.structured.important_notes?.length > 0 && (
                  <div className="detail-field full-width">
                    <label>Important Notes</label>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {ocrResult.structured.important_notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16 }}>
                <button className="btn btn-primary" onClick={handleSaveOCRToCase}>
                  <i className="fa-solid fa-floppy-disk"></i> Save to Case
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Document Name</th><th>Type</th><th>Case</th><th>Client</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.document_name}</td>
                <td>{item.document_type || '—'}</td>
                <td>{item.case_number || '—'}</td>
                <td>{item.client_name || '—'}</td>
                <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5}><div className="empty-state"><i className="fa-solid fa-file-alt"></i><h3>No documents yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ padding: '6px 12px', fontSize: 14 }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}

      {showDetail && selected && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h2>Document Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Document Name</label><span>{selected.document_name}</span></div>
                <div className="detail-field"><label>Type</label><span>{selected.document_type || '—'}</span></div>
                <div className="detail-field"><label>Case</label><span>{selected.case_number || '—'}</span></div>
                <div className="detail-field"><label>Client</label><span>{selected.client_name || '—'}</span></div>
                <div className="detail-field"><label>Status</label><span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status}</span></div>
                <div className="detail-field"><label>File Path</label><span>{selected.file_path || '—'}</span></div>
                <div className="detail-field full-width"><label>Notes</label><p>{selected.notes || '—'}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { setShowDetail(false); setShowDelete(true); }}><i className="fa-solid fa-trash"></i> Delete</button>
              <button className="btn btn-primary" onClick={handleEdit}><i className="fa-solid fa-pen"></i> Edit</button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Document' : 'New Document'} onSubmit={handleSubmit}>
        <div className="form-group"><label>Document Name</label><input value={form.document_name} onChange={e => setForm({...form, document_name: e.target.value})} required /></div>
        <div className="form-row">
          <div className="form-group"><label>Document Type</label><select value={form.document_type} onChange={e => setForm({...form, document_type: e.target.value})}><option value="">Select type...</option>{docTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{docStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Case</label><select value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})}><option value="">Select case...</option>{cases.map(c => <option key={c.id} value={c.id}>{c.case_number}</option>)}</select></div>
          <div className="form-group"><label>Client</label><select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
        </div>
        <div className="form-group"><label>File Path</label><input value={form.file_path} onChange={e => setForm({...form, file_path: e.target.value})} /></div>
        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Documents;
