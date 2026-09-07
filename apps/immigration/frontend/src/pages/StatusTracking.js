import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyItem = { case_id: '', old_status: '', new_status: '', notes: '' };
const caseStatuses = ['open', 'in_progress', 'pending_review', 'approved', 'denied', 'closed'];

function StatusTracking() {
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
    api.get('/status-tracking').then(r => setItems(r.data)).catch(() => {});
    api.get('/cases').then(r => setCases(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const getBadgeClass = (s) => ({ open: 'badge-info', in_progress: 'badge-primary', pending_review: 'badge-warning', approved: 'badge-success', denied: 'badge-danger', closed: 'badge-secondary' }[s] || 'badge-secondary');

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyItem); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ case_id: selected.case_id || '', old_status: selected.old_status || '', new_status: selected.new_status || '', notes: selected.notes || '' });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/status-tracking/${selected.id}`, form); setToast({ message: 'Status record updated', type: 'success' }); }
      else { await api.post('/status-tracking', form); setToast({ message: 'Status change recorded', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: 'Error saving', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/status-tracking/${selected.id}`); setToast({ message: 'Status record deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Status Tracking</h1><p>Track case status changes over time</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> Record Status Change</button></div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Case</th><th>From Status</th><th>To Status</th><th>Notes</th><th>Changed At</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.case_number || '—'}</td>
                <td>{item.old_status ? <span className={`badge ${getBadgeClass(item.old_status)}`}>{item.old_status.replace('_', ' ')}</span> : '—'}</td>
                <td><span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="fa-solid fa-arrow-right" style={{ fontSize: 10 }}></i></span> <span className={`badge ${getBadgeClass(item.new_status)}`}>{item.new_status?.replace('_', ' ')}</span></td>
                <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notes || '—'}</td>
                <td>{new Date(item.changed_at).toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={5}><div className="empty-state"><i className="fa-solid fa-route"></i><h3>No status changes yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showDetail && selected && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h2>Status Change Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Case</label><span>{selected.case_number || '—'}</span></div>
                <div className="detail-field"><label>Changed At</label><span>{new Date(selected.changed_at).toLocaleString()}</span></div>
                <div className="detail-field"><label>Old Status</label><span className={`badge ${getBadgeClass(selected.old_status)}`}>{selected.old_status?.replace('_', ' ') || 'N/A'}</span></div>
                <div className="detail-field"><label>New Status</label><span className={`badge ${getBadgeClass(selected.new_status)}`}>{selected.new_status?.replace('_', ' ')}</span></div>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Status Record' : 'Record Status Change'} onSubmit={handleSubmit}>
        <div className="form-group"><label>Case</label><select value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})} required><option value="">Select case...</option>{cases.map(c => <option key={c.id} value={c.id}>{c.case_number} - {c.case_type}</option>)}</select></div>
        <div className="form-row">
          <div className="form-group"><label>Old Status</label><select value={form.old_status} onChange={e => setForm({...form, old_status: e.target.value})}><option value="">N/A</option>{caseStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></div>
          <div className="form-group"><label>New Status</label><select value={form.new_status} onChange={e => setForm({...form, new_status: e.target.value})} required>{caseStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default StatusTracking;
