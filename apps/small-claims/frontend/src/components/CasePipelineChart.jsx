import React, { useEffect, useState } from 'react';
import api from '../api.js';

const colors = ['#3182ce', '#38a169', '#dd6b20', '#805ad5', '#d53f8c', '#2c5282', '#718096'];

export default function CasePipelineChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.get('/custom-views/case-pipeline')
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.error || e.message));
  }, []);
  if (err) return <div style={{ color: '#c53030' }}>Pipeline error: {err}</div>;
  if (!data) return <div>Loading pipeline...</div>;
  const max = Math.max(1, ...data.stages.map(s => s.count));
  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 6px', color: '#1a365d' }}>Case Status Pipeline</h3>
      <div style={{ fontSize: 12, color: '#718096', marginBottom: 12 }}>Total cases: {data.total}</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180 }}>
        {data.stages.map((s, i) => (
          <div key={s.status} style={{ flex: 1, textAlign: 'center' }}>
            <div title={`${s.status}: ${s.count}`} style={{
              background: colors[i % colors.length],
              height: `${(s.count / max) * 140 + 4}px`,
              borderRadius: 4,
              transition: 'height .3s',
            }} />
            <div style={{ fontSize: 11, marginTop: 6, color: '#4a5568', textTransform: 'capitalize' }}>{s.status}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
