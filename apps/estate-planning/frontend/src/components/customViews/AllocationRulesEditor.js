import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';

const empty = { asset_label: '', heir_name: '', allocation_pct: 0, notes: '' };

export default function AllocationRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/custom-views/allocation-rules');
      setRules(r.data.rules || []);
      setErr(null);
    } catch (e) {
      setErr(e.message || 'load failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function update(field, v) {
    setForm((f) => ({ ...f, [field]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.asset_label || !form.heir_name) {
      setErr('asset_label and heir_name are required');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/custom-views/allocation-rules/${editingId}`, form);
      } else {
        await api.post('/custom-views/allocation-rules', form);
      }
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    }
  }

  function startEdit(r) {
    setEditingId(r.id);
    setForm({
      asset_label: r.asset_label,
      heir_name: r.heir_name,
      allocation_pct: r.allocation_pct,
      notes: r.notes || '',
    });
  }

  async function remove(id) {
    if (!window.confirm('Delete this allocation rule?')) return;
    try {
      await api.delete(`/custom-views/allocation-rules/${id}`);
      await load();
    } catch (e) {
      setErr(e.message);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  return (
    <div className="card" data-testid="allocation-rules-editor" style={{ padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>Distribution Rules Editor</h3>
      <p style={{ color: '#94a3b8', fontSize: 13 }}>
        Define percent allocations for individual assets to named heirs. Rules feed the heir-allocation heatmap.
      </p>

      {err && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', padding: 8, borderRadius: 6, marginBottom: 12 }}>
          {err}
        </div>
      )}

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 2fr auto auto', gap: 8, alignItems: 'end', marginBottom: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>Asset</label>
          <input className="input" value={form.asset_label} onChange={(e) => update('asset_label', e.target.value)} placeholder="e.g. BTC Wallet" />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>Heir</label>
          <input className="input" value={form.heir_name} onChange={(e) => update('heir_name', e.target.value)} placeholder="e.g. Alice Smith" />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>% Allocation</label>
          <input className="input" type="number" min="0" max="100" step="0.01" value={form.allocation_pct} onChange={(e) => update('allocation_pct', e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>Notes</label>
          <input className="input" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="optional" />
        </div>
        <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'}</button>
        {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : rules.length === 0 ? (
        <div style={{ color: '#94a3b8' }}>No rules defined yet. Add your first asset→heir allocation above.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'left', color: '#94a3b8' }}>
              <th style={{ padding: 6 }}>Asset</th>
              <th style={{ padding: 6 }}>Heir</th>
              <th style={{ padding: 6 }}>%</th>
              <th style={{ padding: 6 }}>Notes</th>
              <th style={{ padding: 6 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: 6 }}>{r.asset_label}</td>
                <td style={{ padding: 6 }}>{r.heir_name}</td>
                <td style={{ padding: 6 }}>{Number(r.allocation_pct).toFixed(2)}%</td>
                <td style={{ padding: 6, color: '#94a3b8' }}>{r.notes || '—'}</td>
                <td style={{ padding: 6 }}>
                  <button className="btn btn-sm btn-secondary" style={{ marginRight: 6 }} onClick={() => startEdit(r)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
