import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyVisa = { visa_type: '', client_id: '', status: 'pending', application_date: '', expiry_date: '', embassy: '', notes: '' };
const visaTypes = ['H-1B', 'H-4', 'H-4 EAD', 'L-1A', 'L-1B', 'L-2', 'E-2', 'E-3', 'O-1', 'O-1B', 'F-1', 'F-1 STEM OPT', 'J-1', 'B-1/B-2', 'TN', 'DACA', 'TPS', 'Asylum', 'U Visa', 'T Visa', 'EB-1', 'EB-2 NIW', 'EB-3', 'EB-5', 'K-1'];
const visaStatuses = ['pending', 'approved', 'denied', 'expired', 'revoked', 'withdrawn'];

function Visas() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(emptyVisa);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    api.get('/visas').then(r => setItems(r.data)).catch(() => {});
    api.get('/clients').then(r => setClients(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const getBadgeClass = (s) => {
    const m = { pending: 'badge-warning', approved: 'badge-success', denied: 'badge-danger', expired: 'badge-secondary', revoked: 'badge-danger', withdrawn: 'badge-secondary' };
    return m[s] || 'badge-secondary';
  };

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyVisa); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ visa_type: selected.visa_type, client_id: selected.client_id || '', status: selected.status, application_date: selected.application_date?.split('T')[0] || '', expiry_date: selected.expiry_date?.split('T')[0] || '', embassy: selected.embassy || '', notes: selected.notes || '' });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/visas/${selected.id}`, form); setToast({ message: 'Visa updated', type: 'success' }); }
      else { await api.post('/visas', form); setToast({ message: 'Visa created', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: 'Error saving visa', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/visas/${selected.id}`); setToast({ message: 'Visa deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Visa Applications</h1><p>Track visa applications and statuses</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Visa Application</button></div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Visa Type</th><th>Client</th><th>Status</th><th>Application Date</th><th>Expiry Date</th><th>Embassy</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.visa_type}</td>
                <td>{item.client_name || '—'}</td>
                <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span></td>
                <td>{item.application_date ? new Date(item.application_date).toLocaleDateString() : '—'}</td>
                <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : '—'}</td>
                <td>{item.embassy || '—'}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6}><div className="empty-state"><i className="fa-solid fa-passport"></i><h3>No visa applications yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showDetail && selected && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h2>Visa Application Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Visa Type</label><span>{selected.visa_type}</span></div>
                <div className="detail-field"><label>Client</label><span>{selected.client_name || '—'}</span></div>
                <div className="detail-field"><label>Status</label><span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status}</span></div>
                <div className="detail-field"><label>Application Date</label><span>{selected.application_date ? new Date(selected.application_date).toLocaleDateString() : '—'}</span></div>
                <div className="detail-field"><label>Expiry Date</label><span>{selected.expiry_date ? new Date(selected.expiry_date).toLocaleDateString() : '—'}</span></div>
                <div className="detail-field"><label>Embassy</label><span>{selected.embassy || '—'}</span></div>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Visa Application' : 'New Visa Application'} onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Visa Type</label><select value={form.visa_type} onChange={e => setForm({...form, visa_type: e.target.value})} required><option value="">Select type...</option>{visaTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Client</label><select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{visaStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Embassy</label><input value={form.embassy} onChange={e => setForm({...form, embassy: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Application Date</label><input type="date" value={form.application_date} onChange={e => setForm({...form, application_date: e.target.value})} /></div>
          <div className="form-group"><label>Expiry Date</label><input type="date" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} /></div>
        </div>
        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Visas;
