import React, { useEffect, useState } from 'react';
import api from '../../api.js';

const colors = { open: '#c53030', pending: '#d69e2e', resolved: '#276749' };

export default function CaseStatusChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/custom-views/case-status-chart')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#718096' }}>Loading chart...</div>;
  if (error) return <div style={{ padding: 16, color: '#c53030' }}>Error: {error}</div>;
  if (!data) return null;

  const max = Math.max(1, ...data.series.map(s => s.count));
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h3 style={{ color: '#276749', marginTop: 0, marginBottom: 4 }}>Case Status Distribution</h3>
      <div style={{ color: '#718096', fontSize: 13, marginBottom: 16 }}>Total cases: {data.total}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, height: 220, borderBottom: '2px solid #e2e8f0', paddingBottom: 6 }}>
        {data.series.map(s => {
          const h = Math.round((s.count / max) * 180) + 10;
          return (
            <div key={s.status} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                margin: '0 auto',
                width: '70%',
                height: h,
                background: colors[s.status] || '#3182ce',
                borderRadius: '6px 6px 0 0',
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: -22, left: 0, right: 0, fontWeight: 700, color: '#1a202c' }}>{s.count}</div>
              </div>
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: '#4a5568', textTransform: 'capitalize' }}>{s.status}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
