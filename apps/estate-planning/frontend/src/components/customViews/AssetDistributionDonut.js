import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6', '#6366f1'];

export default function AssetDistributionDonut() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/custom-views/asset-distribution')
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message || 'load failed'));
  }, []);

  if (err) return <div className="card" style={{ padding: 16 }}>Error: {err}</div>;
  if (!data) return <div className="card" style={{ padding: 16 }}>Loading distribution…</div>;

  const slices = data.slices || [];
  const total = data.total || 0;
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const r = 90;
  const innerR = 55;

  let angle = -Math.PI / 2;
  const paths = slices.map((s, i) => {
    const pct = total > 0 ? s.value / total : 0;
    const sweep = pct * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep);
    const y2 = cy + r * Math.sin(angle + sweep);
    const xi1 = cx + innerR * Math.cos(angle + sweep);
    const yi1 = cy + innerR * Math.sin(angle + sweep);
    const xi2 = cx + innerR * Math.cos(angle);
    const yi2 = cy + innerR * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${innerR} ${innerR} 0 ${large} 0 ${xi2} ${yi2} Z`;
    angle += sweep;
    return <path key={i} d={d} fill={COLORS[i % COLORS.length]} stroke="#0f172a" strokeWidth="1" />;
  });

  return (
    <div className="card" data-testid="asset-distribution-donut" style={{ padding: 20 }}>
      <h3 style={{ marginTop: 0 }}>Asset Distribution</h3>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <svg width={size} height={size}>
          {slices.length > 0 ? paths : <text x={cx} y={cy} textAnchor="middle" fill="#94a3b8">No data</text>}
          <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize="14">Total</text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight="600">
            ${total.toLocaleString()}
          </text>
        </svg>
        <div style={{ flex: 1, minWidth: 200 }}>
          {slices.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
              <span style={{ width: 12, height: 12, background: COLORS[i % COLORS.length], marginRight: 8, borderRadius: 2 }} />
              <span style={{ flex: 1 }}>{s.label} <span style={{ color: '#64748b' }}>({s.bucket})</span></span>
              <span style={{ marginLeft: 8, color: '#94a3b8' }}>{s.pct}%</span>
              <span style={{ marginLeft: 12, fontWeight: 500 }}>${Number(s.value).toLocaleString()}</span>
            </div>
          ))}
          {slices.length === 0 && <div style={{ color: '#94a3b8' }}>No assets to display.</div>}
        </div>
      </div>
    </div>
  );
}
