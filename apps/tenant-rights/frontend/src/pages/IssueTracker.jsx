import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const ISSUE_TYPES = ['Maintenance/Repairs', 'Mold/Water Damage', 'Pest Infestation', 'Heat/AC Failure', 'Plumbing Issues', 'Electrical Problems', 'Security Issues', 'Noise Complaint', 'Illegal Entry', 'Harassment', 'Deposit Dispute', 'Lease Violation by Landlord', 'Rent Overcharge', 'Discrimination', 'Retaliation', 'Other'];
const STATUS_COLORS = { open: '#e53e3e', in_progress: '#d69e2e', resolved: '#276749', closed: '#718096' };

const s = {
  back: { color: '#276749', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  h1: { fontSize: 24, fontWeight: 700, color: '#276749' },
  addBtn: { background: '#276749', color: 'white', padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  form: { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 },
  formTitle: { fontWeight: 700, marginBottom: 16, color: '#276749' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 },
  select: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, background: 'white' },
  textarea: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' },
  saveBtn: { background: '#276749', color: 'white', padding: '8px 20px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  cancelBtn: { background: '#e2e8f0', color: '#4a5568', padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, marginLeft: 8 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: { background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: '4px solid' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  itemTitle: { fontWeight: 700, color: '#1a202c', fontSize: 15 },
  badge: { display: 'inline-block', padding: '2px 10px', borderRadius: 20, color: 'white', fontSize: 11, fontWeight: 600 },
  itemDesc: { color: '#718096', fontSize: 13, lineHeight: 1.5, marginBottom: 6 },
  itemDate: { fontSize: 12, color: '#a0aec0' },
  empty: { textAlign: 'center', padding: 40, color: '#718096' },
};

export default function IssueTracker() {
  const { id } = useParams();
  const [issues, setIssues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ issue_type: '', description: '', reported_date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tenancies/${id}/issues`)
      .then(r => setIssues(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function addIssue(e) {
    e.preventDefault();
    const res = await api.post(`/tenancies/${id}/issues`, form);
    setIssues(prev => [res.data, ...prev]);
    setForm({ issue_type: '', description: '', reported_date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });

  return (
    <Layout>
      <Link to={`/tenancies/${id}`} style={s.back}>← Back to Tenancy</Link>
      <div style={s.header}>
        <h1 style={s.h1}>⚠️ Issue Tracker</h1>
        <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>+ Log Issue</button>
      </div>

      {showForm && (
        <form style={s.form} onSubmit={addIssue}>
          <div style={s.formTitle}>Log New Issue</div>
          <div style={s.row}>
            <div>
              <label style={s.label}>Issue Type *</label>
              <select style={s.select} {...f('issue_type')} required>
                <option value="">Select type...</option>
                {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Date Reported</label>
              <input style={s.input} type="date" {...f('reported_date')} />
            </div>
          </div>
          <label style={s.label}>Description</label>
          <textarea style={{ ...s.textarea, marginBottom: 16 }} placeholder="Describe the issue in detail..." {...f('description')} />
          <button type="submit" style={s.saveBtn}>Save Issue</button>
          <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      {loading ? <p>Loading...</p> : issues.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>⚠️</p>
          <p>No issues logged yet. Document problems as they occur.</p>
        </div>
      ) : (
        <div style={s.list}>
          {issues.map(issue => (
            <div key={issue.id} style={{ ...s.item, borderLeftColor: STATUS_COLORS[issue.status] || '#718096' }}>
              <div style={s.itemHeader}>
                <div style={s.itemTitle}>{issue.issue_type}</div>
                <span style={{ ...s.badge, background: STATUS_COLORS[issue.status] || '#718096' }}>{issue.status}</span>
              </div>
              {issue.description && <div style={s.itemDesc}>{issue.description}</div>}
              <div style={s.itemDate}>Reported: {new Date(issue.reported_date).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
