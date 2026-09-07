import React, { useEffect, useState } from 'react';
import api from '../../api.js';

const inp = { padding: '6px 8px', border: '1px solid #cbd5e0', borderRadius: 4, fontSize: 12, width: '100%' };
const btn = { background: '#276749', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontWeight: 600 };
const btnDanger = { ...btn, background: '#c53030' };
const btnSec = { ...btn, background: '#3182ce' };

export default function RegulationRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newRule, setNewRule] = useState({ state: '', category: '', rule: '', citation: '' });

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/custom-views/regulation-rules');
      setRules(r.data.rules || []);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create() {
    if (!newRule.state || !newRule.category || !newRule.rule) {
      setError('state, category, and rule are required');
      return;
    }
    try {
      await api.post('/custom-views/regulation-rules', newRule);
      setNewRule({ state: '', category: '', rule: '', citation: '' });
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Create failed');
    }
  }

  function startEdit(r) {
    setEditingId(r.id);
    setEditForm({ state: r.state, category: r.category, rule: r.rule, citation: r.citation });
  }

  async function saveEdit() {
    try {
      await api.put(`/custom-views/regulation-rules/${editingId}`, editForm);
      setEditingId(null);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Update failed');
    }
  }

  async function del(id) {
    try {
      await api.delete(`/custom-views/regulation-rules/${id}`);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Delete failed');
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h3 style={{ color: '#276749', marginTop: 0, marginBottom: 12 }}>State Regulation Rules Editor</h3>
      {error && <div style={{ background: '#fff5f5', color: '#c53030', padding: 8, borderRadius: 6, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <div style={{ background: '#f7fafc', padding: 12, borderRadius: 8, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#4a5568' }}>Add Rule</div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 2fr 1fr auto', gap: 8 }}>
          <input style={inp} placeholder="State" value={newRule.state} onChange={e => setNewRule({ ...newRule, state: e.target.value })} />
          <input style={inp} placeholder="Category" value={newRule.category} onChange={e => setNewRule({ ...newRule, category: e.target.value })} />
          <input style={inp} placeholder="Rule" value={newRule.rule} onChange={e => setNewRule({ ...newRule, rule: e.target.value })} />
          <input style={inp} placeholder="Citation" value={newRule.citation} onChange={e => setNewRule({ ...newRule, citation: e.target.value })} />
          <button style={btn} onClick={create}>Add</button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: '#718096', fontSize: 13 }}>Loading rules...</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#edf2f7' }}>
              <th style={{ textAlign: 'left', padding: '8px 10px' }}>State</th>
              <th style={{ textAlign: 'left', padding: '8px 10px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '8px 10px' }}>Rule</th>
              <th style={{ textAlign: 'left', padding: '8px 10px' }}>Citation</th>
              <th style={{ textAlign: 'left', padding: '8px 10px' }}>Updated</th>
              <th style={{ textAlign: 'right', padding: '8px 10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                {editingId === r.id ? (
                  <>
                    <td style={{ padding: 6 }}><input style={inp} value={editForm.state} onChange={e => setEditForm({ ...editForm, state: e.target.value })} /></td>
                    <td style={{ padding: 6 }}><input style={inp} value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} /></td>
                    <td style={{ padding: 6 }}><input style={inp} value={editForm.rule} onChange={e => setEditForm({ ...editForm, rule: e.target.value })} /></td>
                    <td style={{ padding: 6 }}><input style={inp} value={editForm.citation} onChange={e => setEditForm({ ...editForm, citation: e.target.value })} /></td>
                    <td style={{ padding: 6, color: '#718096' }}>{r.updated}</td>
                    <td style={{ padding: 6, textAlign: 'right' }}>
                      <button style={btn} onClick={saveEdit}>Save</button>{' '}
                      <button style={btnSec} onClick={() => setEditingId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{r.state}</td>
                    <td style={{ padding: '8px 10px' }}>{r.category}</td>
                    <td style={{ padding: '8px 10px' }}>{r.rule}</td>
                    <td style={{ padding: '8px 10px', color: '#3182ce' }}>{r.citation}</td>
                    <td style={{ padding: '8px 10px', color: '#718096' }}>{r.updated}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <button style={btnSec} onClick={() => startEdit(r)}>Edit</button>{' '}
                      <button style={btnDanger} onClick={() => del(r.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
