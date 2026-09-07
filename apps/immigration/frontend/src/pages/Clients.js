import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyClient = { first_name: '', last_name: '', email: '', phone: '', nationality: '', date_of_birth: '', passport_number: '', current_status: '', address: '' };

function Clients() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState(emptyClient);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const load = () => {
    api.get(`/clients?page=${page}&limit=${limit}`).then(r => {
      if (r.data.data) { setItems(r.data.data); setTotalPages(r.data.pagination?.totalPages || 1); }
      else { setItems(Array.isArray(r.data) ? r.data : []); }
    }).catch(() => {});
  };
  useEffect(() => { load(); }, [page]);

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyClient); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ first_name: selected.first_name, last_name: selected.last_name, email: selected.email || '', phone: selected.phone || '', nationality: selected.nationality || '', date_of_birth: selected.date_of_birth?.split('T')[0] || '', passport_number: selected.passport_number || '', current_status: selected.current_status || '', address: selected.address || '' });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/clients/${selected.id}`, form); setToast({ message: 'Client updated', type: 'success' }); }
      else { await api.post('/clients', form); setToast({ message: 'Client created', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: err.response?.data?.error || 'Error', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/clients/${selected.id}`); setToast({ message: 'Client deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Clients</h1><p>Manage client profiles</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Client</button></div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Nationality</th><th>Status</th><th>Passport</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.first_name} {item.last_name}</td>
                <td>{item.email || '—'}</td><td>{item.phone || '—'}</td><td>{item.nationality || '—'}</td>
                <td><span className="badge badge-info">{item.current_status || '—'}</span></td>
                <td>{item.passport_number || '—'}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6}><div className="empty-state"><i className="fa-solid fa-users"></i><h3>No clients yet</h3></div></td></tr>}
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
            <div className="modal-header"><h2>Client Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>First Name</label><span>{selected.first_name}</span></div>
                <div className="detail-field"><label>Last Name</label><span>{selected.last_name}</span></div>
                <div className="detail-field"><label>Email</label><span>{selected.email || '—'}</span></div>
                <div className="detail-field"><label>Phone</label><span>{selected.phone || '—'}</span></div>
                <div className="detail-field"><label>Nationality</label><span>{selected.nationality || '—'}</span></div>
                <div className="detail-field"><label>Date of Birth</label><span>{selected.date_of_birth ? new Date(selected.date_of_birth).toLocaleDateString() : '—'}</span></div>
                <div className="detail-field"><label>Passport Number</label><span>{selected.passport_number || '—'}</span></div>
                <div className="detail-field"><label>Immigration Status</label><span className="badge badge-info">{selected.current_status || '—'}</span></div>
                <div className="detail-field full-width"><label>Address</label><p>{selected.address || '—'}</p></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-danger" onClick={() => { setShowDetail(false); setShowDelete(true); }}><i className="fa-solid fa-trash"></i> Delete</button>
              <button className="btn btn-primary" onClick={handleEdit}><i className="fa-solid fa-pen"></i> Edit</button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Client' : 'New Client'} onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>First Name</label><input value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} required /></div>
          <div className="form-group"><label>Last Name</label><input value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Nationality</label><input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} /></div>
          <div className="form-group"><label>Date of Birth</label><input type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Passport Number</label><input value={form.passport_number} onChange={e => setForm({...form, passport_number: e.target.value})} /></div>
          <div className="form-group"><label>Immigration Status</label><input value={form.current_status} onChange={e => setForm({...form, current_status: e.target.value})} placeholder="e.g. H-1B, F-1, etc." /></div>
        </div>
        <div className="form-group"><label>Address</label><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Clients;
