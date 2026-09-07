import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyCase = { case_number: '', case_type: '', client_id: '', status: 'open', priority: 'medium', description: '', filing_date: '', deadline: '' };
const caseTypes = ['H-1B Petition', 'H-1B Transfer', 'H-1B Amendment', 'L-1A Extension', 'L-1B Petition', 'E-2 Treaty Investor', 'F-1 to H-1B Change of Status', 'DACA Renewal', 'Asylum Application', 'TPS Re-registration', 'O-1 Extraordinary Ability', 'EB-2 NIW', 'EB-3', 'U Visa Petition', 'VAWA', 'Family-Based I-130', 'Naturalization N-400', 'F-1 Reinstatement', 'F-1 STEM OPT Extension', 'B-1/B-2 Extension'];
const statuses = ['open', 'in_progress', 'pending_review', 'approved', 'denied', 'closed'];
const priorities = ['urgent', 'high', 'medium', 'low'];

function Cases() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(emptyCase);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const load = () => {
    api.get(`/cases?page=${page}&limit=${limit}`).then(r => {
      if (r.data.data) { setItems(r.data.data); setTotalPages(r.data.pagination?.totalPages || 1); }
      else { setItems(Array.isArray(r.data) ? r.data : []); }
    }).catch(() => {});
    api.get('/clients').then(r => setClients(Array.isArray(r.data) ? r.data : r.data.data || [])).catch(() => {});
  };

  useEffect(() => { load(); }, [page]);

  const getBadgeClass = (status) => {
    const map = { open: 'badge-info', in_progress: 'badge-primary', pending_review: 'badge-warning', approved: 'badge-success', denied: 'badge-danger', closed: 'badge-secondary' };
    return map[status] || 'badge-secondary';
  };

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };

  const handleNew = () => { setForm(emptyCase); setEditing(false); setShowModal(true); };

  const handleEdit = () => {
    setForm({
      case_number: selected.case_number, case_type: selected.case_type, client_id: selected.client_id || '',
      status: selected.status, priority: selected.priority, description: selected.description || '',
      filing_date: selected.filing_date?.split('T')[0] || '', deadline: selected.deadline?.split('T')[0] || ''
    });
    setEditing(true);
    setShowDetail(false);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.put(`/cases/${selected.id}`, form);
        setToast({ message: 'Case updated successfully', type: 'success' });
      } else {
        await api.post('/cases', form);
        setToast({ message: 'Case created successfully', type: 'success' });
      }
      setShowModal(false);
      load();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Error saving case', type: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/cases/${selected.id}`);
      setToast({ message: 'Case deleted successfully', type: 'success' });
      setShowDelete(false);
      setShowDetail(false);
      setSelected(null);
      load();
    } catch (err) {
      setToast({ message: 'Error deleting case', type: 'error' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Cases</h1><p>Manage immigration cases</p></div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Case</button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr><th>Case #</th><th>Type</th><th>Client</th><th>Status</th><th>Priority</th><th>Filing Date</th><th>Deadline</th></tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.case_number}</td>
                <td>{item.case_type}</td>
                <td>{item.client_name || '—'}</td>
                <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status?.replace('_', ' ')}</span></td>
                <td><span className={`priority-${item.priority}`}>{item.priority}</span></td>
                <td>{item.filing_date ? new Date(item.filing_date).toLocaleDateString() : '—'}</td>
                <td>{item.deadline ? new Date(item.deadline).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7}><div className="empty-state"><i className="fa-solid fa-briefcase"></i><h3>No cases yet</h3></div></td></tr>}
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
            <div className="modal-header">
              <h2>Case Details</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Case Number</label><span>{selected.case_number}</span></div>
                <div className="detail-field"><label>Case Type</label><span>{selected.case_type}</span></div>
                <div className="detail-field"><label>Client</label><span>{selected.client_name || '—'}</span></div>
                <div className="detail-field"><label>Status</label><span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status?.replace('_', ' ')}</span></div>
                <div className="detail-field"><label>Priority</label><span className={`priority-${selected.priority}`}>{selected.priority}</span></div>
                <div className="detail-field"><label>Filing Date</label><span>{selected.filing_date ? new Date(selected.filing_date).toLocaleDateString() : '—'}</span></div>
                <div className="detail-field"><label>Deadline</label><span>{selected.deadline ? new Date(selected.deadline).toLocaleDateString() : '—'}</span></div>
                <div className="detail-field"><label>Created</label><span>{new Date(selected.created_at).toLocaleDateString()}</span></div>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Case' : 'New Case'} onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Case Number</label><input value={form.case_number} onChange={e => setForm({...form, case_number: e.target.value})} required /></div>
          <div className="form-group"><label>Case Type</label><select value={form.case_type} onChange={e => setForm({...form, case_type: e.target.value})} required><option value="">Select type...</option>{caseTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Client</label><select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Priority</label><select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          <div className="form-group"><label>Filing Date</label><input type="date" value={form.filing_date} onChange={e => setForm({...form, filing_date: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Deadline</label><input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
      </Modal>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Cases;
