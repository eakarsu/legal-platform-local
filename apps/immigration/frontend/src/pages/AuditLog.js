import React, { useState, useEffect } from 'react';
import api from '../services/api';

const actionColors = {
  READ_CLIENT_PII: 'badge-warning',
  READ_CASE: 'badge-info',
  POST: 'badge-success',
  PUT: 'badge-primary',
  DELETE: 'badge-danger',
};

function AuditLog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ action: '', entity_type: '', user_id: '' });
  const [appliedFilters, setAppliedFilters] = useState({});

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 50, ...appliedFilters });
    api.get(`/audit-log?${params}`)
      .then(r => {
        setItems(r.data.data || []);
        setTotalPages(r.data.pagination?.totalPages || 1);
        setTotal(r.data.pagination?.total || 0);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, appliedFilters]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters({ action: '', entity_type: '', user_id: '' });
    setAppliedFilters({});
    setPage(1);
  };

  const getBadgeClass = (action) => actionColors[action] || 'badge-secondary';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1><i className="fa-solid fa-shield-halved" style={{ color: 'var(--primary-light)', marginRight: 8 }}></i>Audit Log</h1>
          <p>Complete audit trail of all system actions ({total} total entries)</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 20 }}>
        <div className="form-row" style={{ marginBottom: 0 }}>
          <div className="form-group">
            <label>Filter by Action</label>
            <input value={filters.action} onChange={e => setFilters({...filters, action: e.target.value})} placeholder="e.g. READ_CLIENT_PII, POST, DELETE" />
          </div>
          <div className="form-group">
            <label>Filter by Entity Type</label>
            <input value={filters.entity_type} onChange={e => setFilters({...filters, entity_type: e.target.value})} placeholder="e.g. cases, clients, documents" />
          </div>
          <div className="form-group">
            <label>Filter by User ID</label>
            <input type="number" value={filters.user_id} onChange={e => setFilters({...filters, user_id: e.target.value})} placeholder="User ID" />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button className="btn btn-primary" onClick={applyFilters}>Apply</button>
            <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
          </div>
        </div>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: 'var(--primary-light)' }}></i>
            <p>Loading audit log...</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity ID</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.user_name || '—'}</div>
                    {item.user_email && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.user_email}</div>}
                    {!item.user_name && item.user_id && <div style={{ fontSize: 12 }}>ID: {item.user_id}</div>}
                  </td>
                  <td><span className={`badge ${getBadgeClass(item.action)}`}>{item.action || '—'}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{item.entity_type || '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{item.entity_id || '—'}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{item.ip_address || '—'}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <i className="fa-solid fa-shield-halved"></i>
                      <h3>No audit entries found</h3>
                      <p>Audit entries will appear here as users interact with the system</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ padding: '6px 12px', fontSize: 14 }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}

export default AuditLog;
