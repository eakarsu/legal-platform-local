import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyItem = { case_id: '', title: '', content: '', note_type: 'general' };
const noteTypes = ['general', 'consultation', 'deadline', 'analysis', 'strategy', 'evidence', 'concern', 'preparation', 'update', 'filing', 'compliance'];

function Notes() {
  const [items, setItems] = useState([]);
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    api.get('/notes').then(r => setItems(r.data)).catch(() => {});
    api.get('/cases').then(r => setCases(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const getBadgeClass = (t) => ({ general: 'badge-secondary', consultation: 'badge-info', deadline: 'badge-danger', analysis: 'badge-primary', strategy: 'badge-warning', update: 'badge-success' }[t] || 'badge-secondary');

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyItem); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ case_id: selected.case_id || '', title: selected.title, content: selected.content || '', note_type: selected.note_type });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/notes/${selected.id}`, form); setToast({ message: 'Note updated', type: 'success' }); }
      else { await api.post('/notes', form); setToast({ message: 'Note created', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: 'Error saving', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/notes/${selected.id}`); setToast({ message: 'Note deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Notes</h1><p>Case notes and communications</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Note</button></div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Case</th><th>Type</th><th>Author</th><th>Date</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.title}</td>
                <td>{item.case_number || '—'}</td>
                <td><span className={`badge ${getBadgeClass(item.note_type)}`}>{item.note_type}</span></td>
                <td>{item.author_name || '—'}</td>
                <td>{new Date(item.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5}><div className="empty-state"><i className="fa-solid fa-sticky-note"></i><h3>No notes yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showDetail && selected && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h2>Note Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Title</label><span>{selected.title}</span></div>
                <div className="detail-field"><label>Type</label><span className={`badge ${getBadgeClass(selected.note_type)}`}>{selected.note_type}</span></div>
                <div className="detail-field"><label>Case</label><span>{selected.case_number || '—'}</span></div>
                <div className="detail-field"><label>Author</label><span>{selected.author_name || '—'}</span></div>
                <div className="detail-field"><label>Created</label><span>{new Date(selected.created_at).toLocaleDateString()}</span></div>
                <div className="detail-field full-width"><label>Content</label><p style={{ whiteSpace: 'pre-wrap' }}>{selected.content || '—'}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { setShowDetail(false); setShowDelete(true); }}><i className="fa-solid fa-trash"></i> Delete</button>
              <button className="btn btn-primary" onClick={handleEdit}><i className="fa-solid fa-pen"></i> Edit</button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Note' : 'New Note'} onSubmit={handleSubmit}>
        <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
        <div className="form-row">
          <div className="form-group"><label>Case</label><select value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})}><option value="">Select case...</option>{cases.map(c => <option key={c.id} value={c.id}>{c.case_number}</option>)}</select></div>
          <div className="form-group"><label>Type</label><select value={form.note_type} onChange={e => setForm({...form, note_type: e.target.value})}>{noteTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Content</label><textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} style={{ minHeight: 150 }} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Notes;
