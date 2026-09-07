import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return <div className={`toast toast-${type}`}>{message}</div>;
}

function AIOutput({ result }) {
  if (!result) return null;
  return (
    <div className="ai-output">
      <div className="ai-output-header">
        <span className="ai-badge">AI Generated</span>
        <span className="ai-model">Model: {result.model || 'claude-haiku'}</span>
        {result.usage?.total_tokens && <span className="ai-model">Tokens: {result.usage.total_tokens}</span>}
      </div>
      <div className="ai-output-content">
        <ReactMarkdown>{result.content}</ReactMarkdown>
      </div>
    </div>
  );
}

function DetailModal({ item, feature, onClose, onEdit, onDelete }) {
  if (!item) return null;
  const displayFields = feature.fields.filter(f => item[f.name] !== undefined && item[f.name] !== null && item[f.name] !== '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item[feature.fields[0]?.name] || 'Details'}</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="detail-grid">
            {displayFields.map(f => (
              <div key={f.name} className="detail-item">
                <label>{f.label}</label>
                <span>
                  {f.name === 'status' ? (
                    <span className={`status-badge status-${item[f.name]}`}>{item[f.name]}</span>
                  ) : f.name === 'is_encrypted' ? (
                    item[f.name] ? 'Yes' : 'No'
                  ) : f.type === 'number' ? (
                    typeof item[f.name] === 'number' ? `$${parseFloat(item[f.name]).toLocaleString()}` : item[f.name]
                  ) : (
                    String(item[f.name])
                  )}
                </span>
              </div>
            ))}
            <div className="detail-item">
              <label>Created</label>
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
            </div>
            {item.updated_at && (
              <div className="detail-item">
                <label>Updated</label>
                <span>{new Date(item.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          {(item.content || item.message_content || item.powers_granted || item.wishes || item.description) && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Content</label>
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {item.content || item.message_content || item.powers_granted || item.wishes || item.description}
              </div>
            </div>
          )}
          {(item.ai_suggestions || item.ai_content || item.ai_recommendations || item.ai_enhanced_content) && (
            <AIOutput result={{ content: item.ai_suggestions || item.ai_content || item.ai_recommendations || item.ai_enhanced_content, model: 'Saved AI Content' }} />
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>Delete</button>
          <button className="btn btn-primary btn-sm" onClick={() => onEdit(item)}>Edit</button>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function FormModal({ item, feature, onClose, onSave, title }) {
  const [formData, setFormData] = useState(() => {
    if (item) {
      const data = {};
      feature.fields.forEach(f => {
        let val = item[f.name];
        if (f.type === 'date' && val) val = val.split('T')[0];
        data[f.name] = val || '';
      });
      return data;
    }
    const data = {};
    feature.fields.forEach(f => { data[f.name] = ''; });
    return data;
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {feature.fields.map(f => (
              <div key={f.name} className="form-group">
                <label>{f.label} {f.required && '*'}</label>
                {f.type === 'textarea' ? (
                  <textarea className="form-control" value={formData[f.name]} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} required={f.required} />
                ) : f.type === 'select' ? (
                  <select className="form-control" value={formData[f.name]} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} required={f.required}>
                    <option value="">Select...</option>
                    {f.options.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                  </select>
                ) : (
                  <input type={f.type || 'text'} className="form-control" value={formData[f.name]} onChange={e => setFormData({ ...formData, [f.name]: e.target.value })} required={f.required} step={f.type === 'number' ? '0.01' : undefined} />
                )}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CrudPage({ feature }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(feature.api);
      setItems(res.data);
    } catch (err) {
      setToast({ message: 'Failed to load data', type: 'error' });
    }
    setLoading(false);
  }, [feature.api]);

  useEffect(() => {
    loadItems();
    setAiResult(null);
    setSearchTerm('');
  }, [loadItems, feature.key]);

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleCreate = () => {
    setEditItem(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setShowDetail(false);
    setEditItem(item);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editItem) {
        await api.put(`${feature.api}/${editItem.id}`, formData);
        setToast({ message: 'Updated successfully', type: 'success' });
      } else {
        await api.post(feature.api, formData);
        setToast({ message: 'Created successfully', type: 'success' });
      }
      setShowForm(false);
      setEditItem(null);
      loadItems();
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'Save failed', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`${feature.api}/${id}`);
      setToast({ message: 'Deleted successfully', type: 'success' });
      setShowDetail(false);
      loadItems();
    } catch (err) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  };

  const handleAI = async (itemData) => {
    setAiLoading(true);
    setAiResult(null);
    try {
      let payload;
      if (feature.aiGlobal) {
        payload = {};
      } else if (itemData) {
        payload = {};
        (feature.aiFields || []).forEach(f => { payload[f] = itemData[f] || ''; });
      } else {
        setToast({ message: 'Select an item first or create one to use AI', type: 'error' });
        setAiLoading(false);
        return;
      }
      const res = await api.post(`/ai/${feature.aiAction}`, payload);
      setAiResult(res.data);
    } catch (err) {
      setToast({ message: err.response?.data?.error || 'AI request failed', type: 'error' });
    }
    setAiLoading(false);
  };

  const formatCell = (item, col) => {
    const val = item[col];
    if (val === null || val === undefined) return '-';
    if (col === 'status') return <span className={`status-badge status-${val}`}>{val.replace(/_/g, ' ')}</span>;
    if (col === 'is_encrypted') return val ? 'Yes' : 'No';
    if (col === 'value_estimate' || col === 'estimated_value' || col === 'coverage_amount' || col === 'premium_amount' || col === 'mortgage_balance') {
      return `$${parseFloat(val).toLocaleString()}`;
    }
    if (col === 'share_percentage' && val) return `${val}%`;
    if (col.includes('date') && val) return new Date(val).toLocaleDateString();
    if (col === 'priority') {
      const colors = { high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--success)' };
      return <span style={{ color: colors[val] || 'inherit', fontWeight: 500 }}>{val}</span>;
    }
    return String(val).length > 40 ? String(val).substring(0, 40) + '...' : String(val);
  };

  const filteredItems = items.filter(item => {
    if (!searchTerm) return true;
    return feature.columns.some(col => {
      const val = item[col];
      return val && String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <div>
          <h2>{feature.icon} {feature.label}</h2>
          <p>{items.length} items total</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {feature.ai && (
            <button className="btn btn-purple" onClick={() => handleAI(feature.aiGlobal ? {} : items[0])} disabled={aiLoading}>
              {aiLoading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> AI Processing...</> : <>🤖 {feature.aiLabel}</>}
            </button>
          )}
          <button className="btn btn-primary" onClick={handleCreate}>+ New {feature.label.replace(/s$/, '')}</button>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input type="text" className="form-control" placeholder={`Search ${feature.label.toLowerCase()}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ maxWidth: '400px' }} />
      </div>

      {aiResult && <AIOutput result={aiResult} />}
      {aiLoading && <div className="loading-spinner"><div className="spinner"></div>AI is generating content...</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div>Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <h3>No {feature.label.toLowerCase()} found</h3>
          <p>Create your first item to get started</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={handleCreate}>+ Add New</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                {feature.columns.map(col => (
                  <th key={col}>{col.replace(/_/g, ' ')}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr key={item.id} onClick={() => handleRowClick(item)}>
                  <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                  {feature.columns.map(col => (
                    <td key={col}>{formatCell(item, col)}</td>
                  ))}
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Del</button>
                      {feature.ai && !feature.aiGlobal && (
                        <button className="btn btn-purple btn-sm" onClick={() => handleAI(item)} disabled={aiLoading}>AI</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDetail && (
        <DetailModal item={selectedItem} feature={feature} onClose={() => setShowDetail(false)} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      {showForm && (
        <FormModal item={editItem} feature={feature} onClose={() => { setShowForm(false); setEditItem(null); }} onSave={handleSave} title={editItem ? `Edit ${feature.label.replace(/s$/, '')}` : `New ${feature.label.replace(/s$/, '')}`} />
      )}
    </div>
  );
}
