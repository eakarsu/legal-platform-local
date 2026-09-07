import React, { useEffect, useState } from 'react';
import api from '../../services/api';

function cellColor(pct) {
  // 0 -> dark, 100 -> bright accent
  const t = Math.min(1, Math.max(0, pct / 100));
  const r = Math.round(15 + (59 - 15) * t);
  const g = Math.round(23 + (130 - 23) * t);
  const b = Math.round(42 + (246 - 42) * t);
  return `rgb(${r},${g},${b})`;
}

export default function HeirAllocationHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/custom-views/heir-allocation')
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message || 'load failed'));
  }, []);

  if (err) return <div className="card" style={{ padding: 16 }}>Error: {err}</div>;
  if (!data) return <div className="card" style={{ padding: 16 }}>Loading heatmap…</div>;

  const { assets = [], heirs = [], matrix = [] } = data;

  return (
    <div className="card" data-testid="heir-allocation-heatmap" style={{ padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>Heir Allocation Heatmap</h3>
      {assets.length === 0 || heirs.length === 0 ? (
        <div style={{ color: '#94a3b8' }}>Add assets and beneficiaries to populate the matrix.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: 6, textAlign: 'left', color: '#94a3b8' }}>Asset \ Heir</th>
                {heirs.map((h) => (
                  <th key={h} style={{ padding: 6, color: '#cbd5e1', minWidth: 80, textAlign: 'center' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((a, ai) => (
                <tr key={a}>
                  <td style={{ padding: 6, color: '#e2e8f0', whiteSpace: 'nowrap', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a}
                  </td>
                  {heirs.map((h, hi) => {
                    const v = (matrix[ai] && matrix[ai][hi]) || 0;
                    return (
                      <td
                        key={h}
                        title={`${a} → ${h}: ${v}%`}
                        style={{
                          padding: 0,
                          width: 64,
                          height: 36,
                          textAlign: 'center',
                          background: cellColor(v),
                          color: v > 50 ? '#fff' : '#cbd5e1',
                          border: '1px solid #0f172a',
                          fontWeight: v > 0 ? 600 : 400,
                        }}
                      >
                        {v > 0 ? `${Number(v).toFixed(0)}%` : '·'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
