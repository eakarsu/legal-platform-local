import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyItem = { invoice_number: '', client_id: '', case_id: '', amount: '', status: 'pending', due_date: '', description: '', payment_method: '' };
const billStatuses = ['pending', 'paid', 'partial', 'overdue', 'waived', 'cancelled'];
const paymentMethods = ['credit_card', 'bank_transfer', 'wire_transfer', 'check', 'cash', 'pro_bono', 'pending'];

function Billing() {
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  const load = () => {
    api.get(`/billing?page=${page}&limit=${limit}`).then(r => {
      if (r.data.data) { setItems(r.data.data); setTotalPages(r.data.pagination?.totalPages || 1); }
      else { setItems(Array.isArray(r.data) ? r.data : []); }
    }).catch(() => {});
    api.get('/cases').then(r => setCases(Array.isArray(r.data) ? r.data : r.data.data || [])).catch(() => {});
    api.get('/clients').then(r => setClients(Array.isArray(r.data) ? r.data : r.data.data || [])).catch(() => {});
  };
  useEffect(() => { load(); }, [page]);

  const getBadgeClass = (s) => ({ pending: 'badge-warning', paid: 'badge-success', partial: 'badge-info', overdue: 'badge-danger', waived: 'badge-secondary', cancelled: 'badge-secondary' }[s] || 'badge-secondary');

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyItem); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ invoice_number: selected.invoice_number, client_id: selected.client_id || '', case_id: selected.case_id || '', amount: selected.amount, status: selected.status, due_date: selected.due_date?.split('T')[0] || '', description: selected.description || '', payment_method: selected.payment_method || '' });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/billing/${selected.id}`, form); setToast({ message: 'Invoice updated', type: 'success' }); }
      else { await api.post('/billing', form); setToast({ message: 'Invoice created', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: 'Error saving', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/billing/${selected.id}`); setToast({ message: 'Invoice deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const paidAmount = items.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div><h1>Billing</h1><p>Manage invoices and payments</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Invoice</button></div>
      </div>

      <div className="stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon card-icon blue"><i className="fa-solid fa-file-invoice-dollar"></i></div>
          <div className="stat-info"><h3>${totalAmount.toLocaleString()}</h3><p>Total Billed</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon green"><i className="fa-solid fa-check-circle"></i></div>
          <div className="stat-info"><h3>${paidAmount.toLocaleString()}</h3><p>Total Collected</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon card-icon orange"><i className="fa-solid fa-hourglass-half"></i></div>
          <div className="stat-info"><h3>${(totalAmount - paidAmount).toLocaleString()}</h3><p>Outstanding</p></div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Client</th><th>Case</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Payment</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.invoice_number}</td>
                <td>{item.client_name || '—'}</td>
                <td>{item.case_number || '—'}</td>
                <td style={{ fontWeight: 600 }}>${parseFloat(item.amount).toLocaleString()}</td>
                <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status}</span></td>
                <td>{item.due_date ? new Date(item.due_date).toLocaleDateString() : '—'}</td>
                <td>{item.payment_method?.replace('_', ' ') || '—'}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7}><div className="empty-state"><i className="fa-solid fa-file-invoice-dollar"></i><h3>No invoices yet</h3></div></td></tr>}
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
            <div className="modal-header"><h2>Invoice Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Invoice Number</label><span>{selected.invoice_number}</span></div>
                <div className="detail-field"><label>Client</label><span>{selected.client_name || '—'}</span></div>
                <div className="detail-field"><label>Case</label><span>{selected.case_number || '—'}</span></div>
                <div className="detail-field"><label>Amount</label><span style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>${parseFloat(selected.amount).toLocaleString()}</span></div>
                <div className="detail-field"><label>Status</label><span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status}</span></div>
                <div className="detail-field"><label>Due Date</label><span>{selected.due_date ? new Date(selected.due_date).toLocaleDateString() : '—'}</span></div>
                <div className="detail-field"><label>Payment Method</label><span>{selected.payment_method?.replace('_', ' ') || '—'}</span></div>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Invoice' : 'New Invoice'} onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Invoice Number</label><input value={form.invoice_number} onChange={e => setForm({...form, invoice_number: e.target.value})} required /></div>
          <div className="form-group"><label>Amount ($)</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Client</label><select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
          <div className="form-group"><label>Case</label><select value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})}><option value="">Select case...</option>{cases.map(c => <option key={c.id} value={c.id}>{c.case_number}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{billStatuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="form-group"><label>Payment Method</label><select value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}><option value="">Select method...</option>{paymentMethods.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Due Date</label><input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Billing;
