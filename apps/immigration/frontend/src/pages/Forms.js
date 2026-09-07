import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyItem = { form_type: '', form_name: '', case_id: '', client_id: '', status: 'draft', notes: '' };
const formTypes = ['I-129', 'I-130', 'I-140', 'I-485', 'I-539', 'I-589', 'I-765', 'I-821', 'I-821D', 'I-918', 'N-400', 'DS-156E', 'DS-160', 'G-28', 'I-20', 'I-94'];
const formStatuses = ['draft', 'in_progress', 'review', 'filed', 'approved', 'denied'];

function Forms() {
  const [items, setItems] = useState([]);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    api.get('/forms').then(r => setItems(r.data)).catch(() => {});
    api.get('/cases').then(r => setCases(r.data)).catch(() => {});
    api.get('/clients').then(r => setClients(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const getBadgeClass = (s) => ({ draft: 'badge-secondary', in_progress: 'badge-info', review: 'badge-warning', filed: 'badge-primary', approved: 'badge-success', denied: 'badge-danger' }[s] || 'badge-secondary');

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyItem); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ form_type: selected.form_type, form_name: selected.form_name, case_id: selected.case_id || '', client_id: selected.client_id || '', status: selected.status, notes: selected.notes || '' });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/forms/${selected.id}`, form); setToast({ message: 'Form updated', type: 'success' }); }
      else { await api.post('/forms', form); setToast({ message: 'Form created', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: 'Error saving', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/forms/${selected.id}`); setToast({ message: 'Form deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Forms</h1><p>Immigration forms management</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Form</button></div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Form Type</th><th>Form Name</th><th>Case</th><th>Client</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.form_type}</td>
                <td>{item.form_name}</td>
                <td>{item.case_number || '—'}</td>
                <td>{item.client_name || '—'}</td>
                <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5}><div className="empty-state"><i className="fa-solid fa-file-lines"></i><h3>No forms yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showDetail && selected && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h2>Form Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Form Type</label><span>{selected.form_type}</span></div>
                <div className="detail-field"><label>Form Name</label><span>{selected.form_name}</span></div>
                <div className="detail-field"><label>Case</label><span>{selected.case_number || '—'}</span></div>
                <div className="detail-field"><label>Client</label><span>{selected.client_name || '—'}</span></div>
                <div className="detail-field"><label>Status</label><span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status}</span></div>
                <div className="detail-field"><label>Created</label><span>{new Date(selected.created_at).toLocaleDateString()}</span></div>
                {selected.data && Object.keys(selected.data).length > 0 && (
                  <div className="detail-field full-width"><label>Form Data</label>
                    <div style={{ background: 'var(--bg-dark)', padding: 16, borderRadius: 8, marginTop: 4 }}>
                      {Object.entries(selected.data).map(([k, v]) => (
                        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{k.replace(/_/g, ' ')}</span>
                          <span style={{ fontSize: 13 }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Form' : 'New Form'} onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Form Type</label><select value={form.form_type} onChange={e => setForm({...form, form_type: e.target.value})} required><option value="">Select type...</option>{formTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{formStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Form Name</label><input value={form.form_name} onChange={e => setForm({...form, form_name: e.target.value})} required /></div>
        <div className="form-row">
          <div className="form-group"><label>Case</label><select value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})}><option value="">Select case...</option>{cases.map(c => <option key={c.id} value={c.id}>{c.case_number}</option>)}</select></div>
          <div className="form-group"><label>Client</label><select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Forms;
