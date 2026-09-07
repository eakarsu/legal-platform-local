import React, { useEffect, useState } from 'react';
import api from '../api.js';

const empty = { jurisdiction: '', rule_title: '', filing_fee: 0, service_fee: 0, max_claim_amount: 10000, notes: '' };

export default function ProceduralRulesEditor() {
  const [rules, setRules] = useState([]);
  const [draft, setDraft] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const r = await api.get('/custom-views/rules');
      setRules(r.data.rules || []);
    } catch (e) {
      setMsg(`Load error: ${e.response?.data?.error || e.message}`);
    }
  }
  useEffect(() => { load(); }, []);

  async function save() {
    try {
      if (editingId) await api.put(`/custom-views/rules/${editingId}`, draft);
      else await api.post('/custom-views/rules', draft);
      setDraft(empty); setEditingId(null); setMsg('Saved.');
      load();
    } catch (e) {
      setMsg(`Save error: ${e.response?.data?.error || e.message}`);
    }
  }
  async function remove(id) {
    if (!confirm('Delete this rule?')) return;
    try {
      await api.delete(`/custom-views/rules/${id}`);
      setMsg('Deleted.'); load();
    } catch (e) {
      setMsg(`Delete error: ${e.response?.data?.error || e.message}`);
    }
  }
  function edit(r) {
    setDraft({
      jurisdiction: r.jurisdiction, rule_title: r.rule_title, filing_fee: r.filing_fee,
      service_fee: r.service_fee, max_claim_amount: r.max_claim_amount, notes: r.notes || '',
    });
    setEditingId(r.id);
  }

  const ip = { padding: '6px 8px', border: '1px solid #cbd5e0', borderRadius: 4, fontSize: 12, marginRight: 6, marginBottom: 6 };
  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 12px', color: '#1a365d' }}>Procedural Rules Editor</h3>
      <div style={{ background: '#f7fafc', padding: 12, borderRadius: 6, marginBottom: 12 }}>
        <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8 }}>{editingId ? 'Edit rule' : 'New rule'}</div>
        <input style={{ ...ip, width: 140 }} placeholder="Jurisdiction" value={draft.jurisdiction} onChange={e => setDraft({ ...draft, jurisdiction: e.target.value })} />
        <input style={{ ...ip, width: 220 }} placeholder="Rule title" value={draft.rule_title} onChange={e => setDraft({ ...draft, rule_title: e.target.value })} />
        <input style={{ ...ip, width: 90 }} type="number" placeholder="Filing fee" value={draft.filing_fee} onChange={e => setDraft({ ...draft, filing_fee: parseFloat(e.target.value) || 0 })} />
        <input style={{ ...ip, width: 90 }} type="number" placeholder="Service fee" value={draft.service_fee} onChange={e => setDraft({ ...draft, service_fee: parseFloat(e.target.value) || 0 })} />
        <input style={{ ...ip, width: 110 }} type="number" placeholder="Max claim" value={draft.max_claim_amount} onChange={e => setDraft({ ...draft, max_claim_amount: parseFloat(e.target.value) || 0 })} />
        <input style={{ ...ip, width: '100%' }} placeholder="Notes" value={draft.notes} onChange={e => setDraft({ ...draft, notes: e.target.value })} />
        <div>
          <button onClick={save} style={{ background: '#38a169', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
            {editingId ? 'Update' : 'Create'}
          </button>
          {editingId && <button onClick={() => { setDraft(empty); setEditingId(null); }} style={{ marginLeft: 8, padding: '6px 14px', borderRadius: 6, border: '1px solid #cbd5e0', cursor: 'pointer' }}>Cancel</button>}
        </div>
      </div>
      {msg && <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 8 }}>{msg}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#edf2f7' }}>
            <th style={{ textAlign: 'left', padding: 6 }}>Jurisdiction</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Rule</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Filing $</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Service $</th>
            <th style={{ textAlign: 'right', padding: 6 }}>Max $</th>
            <th style={{ padding: 6 }}></th>
          </tr>
        </thead>
        <tbody>
          {rules.map(r => (
            <tr key={r.id} style={{ borderBottom: '1px solid #edf2f7' }}>
              <td style={{ padding: 6 }}>{r.jurisdiction}</td>
              <td style={{ padding: 6 }}>{r.rule_title}</td>
              <td style={{ padding: 6, textAlign: 'right' }}>{Number(r.filing_fee).toFixed(2)}</td>
              <td style={{ padding: 6, textAlign: 'right' }}>{Number(r.service_fee).toFixed(2)}</td>
              <td style={{ padding: 6, textAlign: 'right' }}>{Number(r.max_claim_amount).toFixed(2)}</td>
              <td style={{ padding: 6, textAlign: 'right' }}>
                <button onClick={() => edit(r)} style={{ marginRight: 6, padding: '4px 10px', cursor: 'pointer', border: '1px solid #cbd5e0', borderRadius: 4, background: '#fff' }}>Edit</button>
                <button onClick={() => remove(r.id)} style={{ padding: '4px 10px', cursor: 'pointer', border: '1px solid #fc8181', color: '#c53030', borderRadius: 4, background: '#fff' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
