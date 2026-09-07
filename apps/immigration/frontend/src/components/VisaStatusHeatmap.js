import React, { useEffect, useState } from 'react';
import api from '../services/api';

function VisaStatusHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/custom-views/visa-status-heatmap')
      .then(r => setData(r.data))
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div style={{ color: 'red' }}>Heatmap error: {error}</div>;
  if (!data) return <div>Loading heatmap...</div>;

  const cellColor = (count) => {
    if (!count) return '#f8fafc';
    const intensity = data.max ? count / data.max : 0;
    const r = Math.round(255 - intensity * 180);
    const g = Math.round(255 - intensity * 80);
    const b = 255;
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>Visa Type x Status Heatmap</h3>
      <div style={{ overflowX: 'auto' }} data-testid="heatmap">
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ padding: 6, border: '1px solid #e5e7eb', background: '#f9fafb', textAlign: 'left' }}>Visa Type</th>
              {data.statuses.map(s => (
                <th key={s} style={{ padding: 6, border: '1px solid #e5e7eb', background: '#f9fafb', textTransform: 'capitalize' }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.visa_types.map(vt => (
              <tr key={vt}>
                <td style={{ padding: 6, border: '1px solid #e5e7eb', fontWeight: 600 }}>{vt}</td>
                {data.statuses.map(s => {
                  const cell = data.cells.find(c => c.visa_type === vt && c.status === s);
                  const count = cell ? cell.count : 0;
                  return (
                    <td
                      key={s}
                      style={{
                        padding: 10,
                        border: '1px solid #e5e7eb',
                        background: cellColor(count),
                        textAlign: 'center',
                        minWidth: 60,
                      }}
                    >
                      {count}
                    </td>
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

export default VisaStatusHeatmap;
