import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function WillTrustSummaryPDF() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.get('/custom-views/will-trust-summary')
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message || 'load failed'));
  }, []);

  function downloadPdf() {
    if (!data) return;
    // Open a print-friendly HTML window, user can "Save as PDF" from print dialog.
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    const html = `<!doctype html><html><head><title>Will & Trust Summary</title>
      <style>
        body { font-family: -apple-system, Segoe UI, sans-serif; margin: 32px; color: #0f172a; }
        h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
        h2 { margin-top: 28px; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; font-size: 12px; }
        th { background: #f1f5f9; }
        .narrative { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px; margin: 12px 0; }
        .meta { color: #64748b; font-size: 12px; }
      </style></head><body>
      <h1>${data.title}</h1>
      <div class="meta">Generated ${new Date(data.generated_at).toLocaleString()}</div>
      <div class="narrative">${data.narrative}</div>
      <h2>Wills (${data.counts.wills})</h2>
      <table><thead><tr><th>Title</th><th>Testator</th><th>Executor</th><th>Status</th></tr></thead><tbody>
      ${(data.wills || []).map((w) => `<tr><td>${w.title || ''}</td><td>${w.testator_name || ''}</td><td>${w.executor_name || ''}</td><td>${w.status || ''}</td></tr>`).join('')}
      </tbody></table>
      <h2>Trusts (${data.counts.trusts})</h2>
      <table><thead><tr><th>Trust Name</th><th>Type</th><th>Grantor</th><th>Trustee</th><th>Status</th></tr></thead><tbody>
      ${(data.trusts || []).map((t) => `<tr><td>${t.trust_name || ''}</td><td>${t.trust_type || ''}</td><td>${t.grantor_name || ''}</td><td>${t.trustee_name || ''}</td><td>${t.status || ''}</td></tr>`).join('')}
      </tbody></table>
      <h2>Beneficiaries (${data.counts.beneficiaries})</h2>
      <table><thead><tr><th>Name</th><th>Relationship</th><th>Share %</th></tr></thead><tbody>
      ${(data.beneficiaries || []).map((b) => `<tr><td>${b.full_name || ''}</td><td>${b.relationship || ''}</td><td>${b.share_percentage || 0}%</td></tr>`).join('')}
      </tbody></table>
      <div class="meta">Total share: ${data.share_total_pct}% — ${data.share_balanced ? 'Balanced' : 'Unbalanced'}</div>
      </body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 350);
  }

  if (err) return <div className="card" style={{ padding: 16 }}>Error: {err}</div>;
  if (!data) return <div className="card" style={{ padding: 16 }}>Loading summary…</div>;

  return (
    <div className="card" data-testid="will-trust-summary" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Will & Trust Summary</h3>
        <button className="btn btn-primary" onClick={downloadPdf}>Export PDF</button>
      </div>
      <p style={{ color: '#94a3b8', marginTop: 8 }}>{data.narrative}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
        <div style={{ background: 'var(--accent-light)', padding: 12, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Wills</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{data.counts.wills}</div>
        </div>
        <div style={{ background: 'var(--purple-light)', padding: 12, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Trusts</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{data.counts.trusts}</div>
        </div>
        <div style={{ background: 'var(--success-light, rgba(16,185,129,0.1))', padding: 12, borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Beneficiaries</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{data.counts.beneficiaries}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: data.share_balanced ? '#10b981' : '#f59e0b' }}>
        Combined share: <strong>{data.share_total_pct}%</strong> — {data.share_balanced ? 'balanced' : 'needs rebalancing'}
      </div>
    </div>
  );
}
