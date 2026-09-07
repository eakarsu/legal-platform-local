import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const emptyItem = { check_type: '', case_id: '', client_id: '', status: 'pending', result: '', notes: '' };
const checkTypes = ['LCA Compliance', 'DACA Eligibility', 'F-1 Status Verification', 'L-1A Qualifying Relationship', 'H-1B Wage Compliance', 'E-2 Investment Substantiality', 'H-4 EAD Eligibility', 'Nonimmigrant Intent', 'Asylum Filing Deadline', 'TPS Eligibility', 'Full Course Load', 'U Visa Certification', 'Specialty Occupation', 'Advanced Degree', 'Extraordinary Ability', 'E-Verify Enrollment'];
const compStatuses = ['pending', 'compliant', 'non_compliant', 'needs_review'];

function Compliance() {
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
    api.get('/compliance').then(r => setItems(r.data)).catch(() => {});
    api.get('/cases').then(r => setCases(r.data)).catch(() => {});
    api.get('/clients').then(r => setClients(r.data)).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const getBadgeClass = (s) => ({ pending: 'badge-warning', compliant: 'badge-success', non_compliant: 'badge-danger', needs_review: 'badge-info' }[s] || 'badge-secondary');

  const handleRowClick = (item) => { setSelected(item); setShowDetail(true); };
  const handleNew = () => { setForm(emptyItem); setEditing(false); setShowModal(true); };
  const handleEdit = () => {
    setForm({ check_type: selected.check_type, case_id: selected.case_id || '', client_id: selected.client_id || '', status: selected.status, result: selected.result || '', notes: selected.notes || '' });
    setEditing(true); setShowDetail(false); setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) { await api.put(`/compliance/${selected.id}`, form); setToast({ message: 'Compliance check updated', type: 'success' }); }
      else { await api.post('/compliance', form); setToast({ message: 'Compliance check created', type: 'success' }); }
      setShowModal(false); load();
    } catch (err) { setToast({ message: 'Error saving', type: 'error' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/compliance/${selected.id}`); setToast({ message: 'Compliance check deleted', type: 'success' }); setShowDelete(false); setShowDetail(false); setSelected(null); load(); }
    catch (err) { setToast({ message: 'Error deleting', type: 'error' }); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Compliance</h1><p>Immigration compliance checks</p></div>
        <div className="page-actions"><button className="btn btn-primary" onClick={handleNew}><i className="fa-solid fa-plus"></i> New Compliance Check</button></div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Check Type</th><th>Case</th><th>Client</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td style={{ fontWeight: 600 }}>{item.check_type}</td>
                <td>{item.case_number || '—'}</td>
                <td>{item.client_name || '—'}</td>
                <td><span className={`badge ${getBadgeClass(item.status)}`}>{item.status?.replace('_', ' ')}</span></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4}><div className="empty-state"><i className="fa-solid fa-shield-halved"></i><h3>No compliance checks yet</h3></div></td></tr>}
          </tbody>
        </table>
      </div>

      {showDetail && selected && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header"><h2>Compliance Check Details</h2><button className="modal-close" onClick={() => setShowDetail(false)}><i className="fa-solid fa-xmark"></i></button></div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-field"><label>Check Type</label><span>{selected.check_type}</span></div>
                <div className="detail-field"><label>Status</label><span className={`badge ${getBadgeClass(selected.status)}`}>{selected.status?.replace('_', ' ')}</span></div>
                <div className="detail-field"><label>Case</label><span>{selected.case_number || '—'}</span></div>
                <div className="detail-field"><label>Client</label><span>{selected.client_name || '—'}</span></div>
                <div className="detail-field full-width"><label>Result</label><p>{selected.result || '—'}</p></div>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Compliance Check' : 'New Compliance Check'} onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Check Type</label><select value={form.check_type} onChange={e => setForm({...form, check_type: e.target.value})} required><option value="">Select type...</option>{checkTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>{compStatuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Case</label><select value={form.case_id} onChange={e => setForm({...form, case_id: e.target.value})}><option value="">Select case...</option>{cases.map(c => <option key={c.id} value={c.id}>{c.case_number}</option>)}</select></div>
          <div className="form-group"><label>Client</label><select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})}><option value="">Select client...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}</select></div>
        </div>
        <div className="form-group"><label>Result</label><textarea value={form.result} onChange={e => setForm({...form, result: e.target.value})} /></div>
        <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default Compliance;
