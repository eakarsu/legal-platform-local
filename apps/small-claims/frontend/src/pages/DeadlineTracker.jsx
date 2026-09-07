import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const DEADLINE_TYPES = ['Statute of Limitations', 'File Complaint', 'Serve Defendant', 'Response Window', 'Hearing Date', 'Appeal Deadline', 'Discovery Deadline', 'Other'];

const s = {
  back: { color: '#2b6cb0', textDecoration: 'none', fontSize: 14, marginBottom: 20, display: 'block' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  h1: { fontSize: 24, fontWeight: 700, color: '#1a365d' },
  addBtn: { background: '#2b6cb0', color: 'white', padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  form: { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 },
  formTitle: { fontWeight: 700, marginBottom: 16, color: '#1a365d' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 4 },
  input: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 },
  select: { width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, background: 'white' },
  saveBtn: { background: '#38a169', color: 'white', padding: '8px 20px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  cancelBtn: { background: '#e2e8f0', color: '#4a5568', padding: '8px 16px', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, marginLeft: 8 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: { background: 'white', borderRadius: 10, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 },
  dateBadge: { width: 56, textAlign: 'center', flexShrink: 0 },
  dateDay: { fontSize: 22, fontWeight: 700, color: '#1a365d' },
  dateMonth: { fontSize: 11, color: '#718096', textTransform: 'uppercase' },
  itemTitle: { fontWeight: 600, color: '#1a365d', fontSize: 15 },
  itemDesc: { color: '#718096', fontSize: 13, marginTop: 2 },
  overdue: { color: '#e53e3e' },
  soon: { color: '#d69e2e' },
  ok: { color: '#38a169' },
  empty: { textAlign: 'center', padding: 40, color: '#718096' },
};

export default function DeadlineTracker() {
  const { id } = useParams();
  const [deadlines, setDeadlines] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ deadline_type: '', due_date: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cases/${id}/deadlines`)
      .then(r => setDeadlines(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function addDeadline(e) {
    e.preventDefault();
    const res = await api.post(`/cases/${id}/deadlines`, form);
    setDeadlines(prev => [...prev, res.data].sort((a, b) => new Date(a.due_date) - new Date(b.due_date)));
    setForm({ deadline_type: '', due_date: '', description: '' });
    setShowForm(false);
  }

  function getDaysUntil(dateStr) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dateStr);
    return Math.round((due - now) / (1000 * 60 * 60 * 24));
  }

  function getStyle(days) {
    if (days < 0) return s.overdue;
    if (days <= 7) return s.soon;
    return s.ok;
  }

  return (
    <Layout>
      <Link to={`/cases/${id}`} style={s.back}>← Back to Case</Link>
      <div style={s.header}>
        <h1 style={s.h1}>📅 Deadline Tracker</h1>
        <button style={s.addBtn} onClick={() => setShowForm(!showForm)}>+ Add Deadline</button>
      </div>

      {showForm && (
        <form style={s.form} onSubmit={addDeadline}>
          <div style={s.formTitle}>Add New Deadline</div>
          <div style={s.row}>
            <div>
              <label style={s.label}>Type</label>
              <select style={s.select} value={form.deadline_type} onChange={e => setForm({...form, deadline_type: e.target.value})} required>
                <option value="">Select type...</option>
                {DEADLINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Due Date</label>
              <input style={s.input} type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} required />
            </div>
            <div>
              <label style={s.label}>Description</label>
              <input style={s.input} type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
          </div>
          <button type="submit" style={s.saveBtn}>Save Deadline</button>
          <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}

      {loading ? <p>Loading...</p> : deadlines.length === 0 ? (
        <div style={s.empty}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>📅</p>
          <p>No deadlines tracked yet. Add important dates to stay on schedule.</p>
        </div>
      ) : (
        <div style={s.list}>
          {deadlines.map(d => {
            const days = getDaysUntil(d.due_date);
            const date = new Date(d.due_date);
            return (
              <div key={d.id} style={{ ...s.item, borderLeft: `4px solid ${days < 0 ? '#e53e3e' : days <= 7 ? '#d69e2e' : '#38a169'}` }}>
                <div style={s.dateBadge}>
                  <div style={s.dateDay}>{date.getDate()}</div>
                  <div style={s.dateMonth}>{date.toLocaleString('default', { month: 'short' })} {date.getFullYear()}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.itemTitle}>{d.deadline_type}</div>
                  {d.description && <div style={s.itemDesc}>{d.description}</div>}
                </div>
                <div style={getStyle(days)}>
                  {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today!' : `${days}d left`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
