import React, { useEffect, useState } from 'react';
import api from '../api.js';

function shade(count, max) {
  if (!count) return '#f1f5f9';
  const intensity = Math.min(1, count / max);
  const r = Math.round(255 - 175 * intensity);
  const g = Math.round(255 - 130 * intensity);
  const b = Math.round(255 - 40 * intensity);
  return `rgb(${r},${g},${b})`;
}

export default function CourtScheduleHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    api.get('/custom-views/court-heatmap')
      .then(r => setData(r.data))
      .catch(e => setErr(e.response?.data?.error || e.message));
  }, []);
  if (err) return <div style={{ color: '#c53030' }}>Heatmap error: {err}</div>;
  if (!data) return <div>Loading heatmap...</div>;
  const max = Math.max(1, ...data.cells.map(c => c.count));
  return (
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', overflowX: 'auto' }}>
      <h3 style={{ margin: '0 0 6px', color: '#1a365d' }}>Court Schedule Heatmap (14 days)</h3>
      <div style={{ fontSize: 12, color: '#718096', marginBottom: 12 }}>Hearings & deadlines, court x date</div>
      <table style={{ borderCollapse: 'collapse', fontSize: 11 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 8px', position: 'sticky', left: 0, background: '#fff' }}>Court</th>
            {data.dates.map(d => (
              <th key={d} style={{ padding: '4px 6px', color: '#4a5568', minWidth: 32 }}>{d.slice(5)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.courts.map(court => (
            <tr key={court}>
              <td style={{ padding: '4px 8px', fontWeight: 500, position: 'sticky', left: 0, background: '#fff' }}>{court}</td>
              {data.dates.map(d => {
                const cell = data.cells.find(c => c.court === court && c.date === d) || { count: 0 };
                return (
                  <td key={d} style={{ padding: 0 }}>
                    <div
                      title={`${court} • ${d}: ${cell.count}`}
                      style={{
                        width: 28, height: 22, margin: 1, borderRadius: 3,
                        background: shade(cell.count, max),
                        textAlign: 'center', lineHeight: '22px', color: cell.count > max * 0.6 ? '#fff' : '#1a365d',
                        fontSize: 10, fontWeight: 600,
                      }}
                    >{cell.count || ''}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
