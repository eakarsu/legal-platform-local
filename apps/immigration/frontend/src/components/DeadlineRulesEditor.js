import React, { useEffect, useState } from 'react';
import api from '../services/api';

const VISA_TYPES = ['H-1B', 'L-1A', 'L-1B', 'F-1', 'O-1', 'EB-2', 'EB-3', 'B-1/B-2', 'U Visa', 'TPS', 'DACA'];
const SEVERITIES = ['low', 'medium', 'high', 'urgent'];

function DeadlineRulesEditor() {
  const [rules, setRules] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ visa_type: 'H-1B', stage: '', days_before: 30, severity: 'medium' });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = () => {
    const url = filter ? `/custom-views/deadline-rules?visa_type=${encodeURIComponent(filter)}` : '/custom-views/deadline-rules';
    api.get(url).then(r => setRules(r.data.rules || [])).catch(e => setMsg(e.message));
  };

  useEffect(load, [filter]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/custom-views/deadline-rules/${editingId}`, form);
        setMsg('Rule updated.');
      } else {
        await api.post('/custom-views/deadline-rules', form);
        setMsg('Rule created.');
      }
      setForm({ visa_type: 'H-1B', stage: '', days_before: 30, severity: 'medium' });
      setEditingId(null);
      load();
    } catch (err) {
      setMsg(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  const edit = (rule) => {
    setEditingId(rule.id);
    setForm({ visa_type: rule.visa_type, stage: rule.stage, days_before: rule.days_before, severity: rule.severity });
  };

  const del = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await api.delete(`/custom-views/deadline-rules/${id}`);
      setMsg('Rule deleted.');
      load();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>Deadline Rules Editor</h3>
      <p style={{ color: '#666', fontSize: 13 }}>Manage per-visa-type deadline rules.</p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, marginRight: 6 }}>Filter by visa type:</label>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 4 }}>
          <option value="">All</option>
          {VISA_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <form onSubmit={submit} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'end' }} data-testid="rules-form">
        <div>
          <div style={{ fontSize: 11, color: '#475569' }}>Visa Type</div>
          <select value={form.visa_type} onChange={e => setForm({ ...form, visa_type: e.target.value })} style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 4 }}>
            {VISA_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#475569' }}>Stage</div>
          <input value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} placeholder="e.g. LCA Filing" required style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 4 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#475569' }}>Days before</div>
          <input type="number" value={form.days_before} onChange={e => setForm({ ...form, days_before: e.target.value })} min={1} style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 4, width: 90 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#475569' }}>Severity</div>
          <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} style={{ padding: 6, border: '1px solid #d1d5db', borderRadius: 4 }}>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" style={{ background: '#10b981', color: '#fff', border: 0, padding: '8px 14px', borderRadius: 4, cursor: 'pointer' }}>
          {editingId ? 'Update' : 'Create'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm({ visa_type: 'H-1B', stage: '', days_before: 30, severity: 'medium' }); }} style={{ background: '#6b7280', color: '#fff', border: 0, padding: '8px 14px', borderRadius: 4, cursor: 'pointer' }}>
            Cancel
          </button>
        )}
      </form>

      {msg && <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>{msg}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Visa Type</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'left' }}>Stage</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Days Before</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Severity</th>
            <th style={{ padding: 8, border: '1px solid #e5e7eb' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 12, textAlign: 'center', color: '#94a3b8' }}>No rules.</td></tr>
          )}
          {rules.map(r => (
            <tr key={r.id}>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.visa_type}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb' }}>{r.stage}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{r.days_before}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>{r.severity}</td>
              <td style={{ padding: 8, border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <button onClick={() => edit(r)} style={{ marginRight: 6, background: '#3b82f6', color: '#fff', border: 0, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(r.id)} style={{ background: '#ef4444', color: '#fff', border: 0, padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DeadlineRulesEditor;
