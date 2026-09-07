import React, { useEffect, useState } from 'react';
import api from '../services/api';

function CasePipelineFunnel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/custom-views/pipeline-funnel')
      .then(r => setData(r.data))
      .catch(e => setError(e.message));
  }, []);

  if (error) return <div style={{ color: 'red' }}>Funnel error: {error}</div>;
  if (!data) return <div>Loading funnel...</div>;

  const max = data.funnel.reduce((m, f) => Math.max(m, f.count), 1);

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>Case Pipeline Funnel</h3>
      <p style={{ color: '#666', fontSize: 13 }}>Total cases: {data.total}</p>
      <div data-testid="funnel">
        {data.funnel.map((f, i) => {
          const widthPct = max ? (f.count / max) * 100 : 0;
          const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981', '#ef4444', '#6b7280'];
          return (
            <div key={f.stage} style={{ display: 'flex', alignItems: 'center', margin: '6px 0' }}>
              <div style={{ width: 140, fontSize: 13, textTransform: 'capitalize' }}>
                {f.stage.replace(/_/g, ' ')}
              </div>
              <div style={{ flex: 1, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${widthPct}%`,
                    background: colors[i % colors.length],
                    color: '#fff',
                    padding: '6px 10px',
                    fontSize: 12,
                    minWidth: 40,
                  }}
                >
                  {f.count} ({f.pct}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CasePipelineFunnel;
