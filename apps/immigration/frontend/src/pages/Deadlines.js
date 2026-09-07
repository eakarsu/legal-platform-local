import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyItem = { title: '', description: '', due_date: '', case_id: '', priority: 'medium', status: 'pending' };
const priorities = ['urgent', 'high', 'medium', 'low'];
const statuses = ['pending', 'completed', 'overdue', 'cancelled'];

function Deadlines() {
  const [items, setItems] = useState([]);
  const [cases, setCases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(emptyItem);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const load = () => {
    api.get(`/deadlines?page=${page}&limit=${limit}`).then(r => {
      if (r.data.data) { setItems(r.data.data); setTotalPages(r.data.pagination?.totalPages || 1); }
      else { setItems(Array.isArray(r.data) ? r.data : []); }
    }).catch(() => {});
    api.get('/cases').then(r => setCases(Array.isArray(r.data) ? r.data : r.data.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, [page]);

  const isOverdue = (date) => new Date(date) < new Date() && date;
  const getBadgeClass = (s) => ({ pending: 'badge-warning', completed: 'badge-success', overdue: 'badge-danger', cancelled: 'badge-secondary' }[s] || 'badge-secondary');

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyItem); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ title: selected.title, description: selected.description || '', due_date: selected.due_date?.split('T')[0] || '', case_id: selected.case_id || '', priority: selected.priority, status: selected.status });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/deadlines/${selected.id}`, form); setToast({ message: 'Deadline updated', type: 'success' }); }
      else { await api.post('/deadlines', form); setToast({ message: 'Deadline created', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: 'Error saving', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/deadlines/${selected.id}`); setToast({ message: 'Deadline deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Deadlines</h1><p>Track important deadlines and due dates</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Deadline</button></div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Case</th><th>Due Date</th><th>Priority</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)} style={isOverdue(item.due_date) && item.status === 'pending' ? { borderLeft: '3px solid #ef4444' } : {}}>
                <td style={{ fontWeight: 600 }}>{item.title}</td>
                <td>{item.case_number || '—'}</td>
                <td style={isOverdue(item.due_date) && item.status === 'pending' ? { color: '#ef4444', fontWeight: 600 } : {}}>{item.due_date ? new Date(item.due_date).toLocaleDateString() : '—'}</td>
                <td><span className={`priority-${item.priority}`}>{item.priority}</span></td>
                <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5}><div className="empty-state"><i className="fa-solid fa-clock"></i><h3>No deadlines yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>

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
            <div className="modal-header"><h2>Deadline Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Title</label><span>{selected.title}</span></div>
                <div className="detail-field"><label>Case</label><span>{selected.case_number || '—'}</span></div>
                <div className="detail-field"><label>Due Date</label><span>{selected.due_date ? new Date(selected.due_date).toLocaleDateString() : '—'}</span></div>
                <div className="detail-field"><label>Priority</label><span className={`priority-${selected.priority}`}>{selected.priority}</span></div>
                <div className="detail-field"><label>Status</label><span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status}</span></div>
                <div className="detail-field"><label>Client</label><span>{selected.client_name || '—'}</span></div>
                <div className="detail-field full-width"><label>Description</label><p>{selected.description || '—'}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { setShowDetail(false); setShowDelete(true); }}><i className="fa-solid fa-trash"></i> Delete</button>
              <button className="btn btn-primary" onClick={handleEdit}><i className="fa-solid fa-pen"></i> Edit</button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Deadline' : 'New Deadline'} onSubmit={handleSubmit}>
        <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
        <div className="form-row">
          <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required /></div>
          <div className="form-group"><label>Case</label><select value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})}><option value="">Select case...</option>{cases.map(c => <option key={c.id} value={c.id}>{c.case_number}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Deadlines;
