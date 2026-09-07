import React, { useEffect, useState } from 'react';
import api from '../../api.js';

function colorFor(value, max) {
  if (!value) return '#f7fafc';
  const pct = value / Math.max(max, 1);
  // green gradient (low) -> red (high)
  const r = Math.round(39 + (197 - 39) * pct);
  const g = Math.round(103 + (48 - 103) * pct);
  const b = Math.round(73 + (48 - 73) * pct);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function ViolationHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/custom-views/violation-heatmap')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.error || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 16, color: '#718096' }}>Loading heatmap...</div>;
  if (error) return <div style={{ padding: 16, color: '#c53030' }}>Error: {error}</div>;
  if (!data) return null;

  const maxVal = Math.max(1, ...data.matrix.flatMap(row => data.states.map(s => row[s] || 0)));

  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h3 style={{ color: '#276749', marginTop: 0, marginBottom: 4 }}>Violation Type Heatmap</h3>
      <div style={{ color: '#718096', fontSize: 13, marginBottom: 16 }}>Violation x State (count)</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 10px', borderBottom: '2px solid #e2e8f0', fontSize: 13 }}>Violation</th>
              {data.states.map(s => (
                <th key={s} style={{ padding: '8px 10px', borderBottom: '2px solid #e2e8f0', fontSize: 13 }}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.matrix.map(row => (
              <tr key={row.violation}>
                <td style={{ padding: '6px 10px', fontWeight: 600, color: '#4a5568', fontSize: 13 }}>{row.violation}</td>
                {data.states.map(s => {
                  const v = row[s] || 0;
                  const bg = colorFor(v, maxVal);
                  const fg = v / maxVal > 0.5 ? 'white' : '#1a202c';
                  return (
                    <td key={s} style={{
                      padding: '10px',
                      textAlign: 'center',
                      background: bg,
                      color: fg,
                      fontWeight: 600,
                      border: '1px solid #fff',
                      minWidth: 50,
                    }}>{v}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
