// === Batch 03 Gaps & Frontend Mounts ===
// Auto-generated frontend page (lean v0). Wires Custom Feature Suggestions
// and Gap endpoints (AI counterparts + non-AI features) to backend routes.
import React, { useState } from 'react';

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) || 'http://localhost:4000/api';

const FEATURES = [
  { kind: 'cfs', slug: 'cf-agentic-estate-planner', label: 'Agentic estate planner', desc: '"I have $2M in assets, married with 3 kids" → generates comprehensive estate plan with tax-minimized structure', endpoint: '/cf-agentic-estate-planner' },
  { kind: 'cfs', slug: 'cf-digital-legacy-management', label: 'Digital legacy management', desc: 'Store important messages, photos, credentials (passwords) in vault', endpoint: '/cf-digital-legacy-management' },
  { kind: 'cfs', slug: 'cf-ai-drafted-documents', label: 'AI-drafted documents', desc: 'Generate state-specific wills, trusts, POAs (may require lawyer review)', endpoint: '/cf-ai-drafted-documents' },
  { kind: 'cfs', slug: 'cf-family-meeting-coordinator', label: 'Family meeting coordinator', desc: 'Schedule and prepare materials for family meetings', endpoint: '/cf-family-meeting-coordinator' },
  { kind: 'cfs', slug: 'cf-life-expectancy-planning', label: 'Life expectancy planning', desc: 'Long-term care cost estimation, insurance recommendations', endpoint: '/cf-life-expectancy-planning' },
  { kind: 'cfs', slug: 'cf-beneficiary-experience', label: 'Beneficiary experience', desc: 'Portal for beneficiaries post-death, guidance on claiming assets', endpoint: '/cf-beneficiary-experience' },
  { kind: 'cfs', slug: 'cf-international-planning', label: 'International planning', desc: 'Tax-optimized planning for multi-national families', endpoint: '/cf-international-planning' },
  { kind: 'gap-ai', slug: 'gap-ai-no-tax-minimisation-planner-state-aware', label: 'No tax-minimisation planner (state-aware)', desc: 'No tax-minimisation planner (state-aware)', endpoint: '/gap-no-tax-minimisation-planner-state-aware' },
  { kind: 'gap-ai', slug: 'gap-ai-no-beneficiary-suitability-assessor', label: 'No beneficiary-suitability assessor', desc: 'No beneficiary-suitability assessor', endpoint: '/gap-no-beneficiary-suitability-assessor' },
  { kind: 'gap-ai', slug: 'gap-ai-no-account-consolidation-recommender', label: 'No account-consolidation recommender', desc: 'No account-consolidation recommender', endpoint: '/gap-no-account-consolidation-recommender' },
  { kind: 'gap-non', slug: 'gap-non-no-webhooks-no-advisor-system-push', label: 'No webhooks (no advisor system push)', desc: 'No webhooks (no advisor system push)', endpoint: '/gap-no-webhooks-no-advisor-system-push' },
  { kind: 'gap-non', slug: 'gap-non-limited-integration-no-brokerage-bank-account-aggregation', label: 'Limited integration (no brokerage/bank-account aggregation)', desc: 'Limited integration (no brokerage/bank-account aggregation)', endpoint: '/gap-limited-integration-no-brokerage-bank-account-aggregation' },
  { kind: 'gap-non', slug: 'gap-non-no-payment-processing-for-filing-fees', label: 'No payment processing for filing fees', desc: 'No payment processing for filing fees', endpoint: '/gap-no-payment-processing-for-filing-fees' },
  { kind: 'gap-non', slug: 'gap-non-no-multi-state-compliance-lookups', label: 'No multi-state compliance lookups', desc: 'No multi-state compliance lookups', endpoint: '/gap-no-multi-state-compliance-lookups' },
  { kind: 'gap-non', slug: 'gap-non-no-video-message-scheduling-for-legacy-letters', label: 'No video-message scheduling for legacy letters', desc: 'No video-message scheduling for legacy letters', endpoint: '/gap-no-video-message-scheduling-for-legacy-letters' },
];

function authHeaders() {
  const t = (typeof window !== 'undefined') ? localStorage.getItem('token') : null;
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

export default function Batch03Features() {
  const [active, setActive] = useState(FEATURES[0]?.slug);
  const [input, setInput] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleRequests = [
      {
          "label": "Scenario",
          "value": "Run Batch03 Features for a realistic customer case.\nContext: a team needs a practical recommendation based on incomplete operating data.\nGoal: identify the best action, key risks, missing information, and expected business impact.\nReturn: summary, prioritized action plan, assumptions, and follow-up questions."
      },
      {
          "label": "Data sample",
          "value": "Analyze this Batch03 Features data sample.\nInput records:\n- Record 1: urgent, customer impact high, owner unassigned\n- Record 2: medium priority, blocked by missing data\n- Record 3: recurring issue, automation opportunity\nReturn structured findings, anomalies, recommendations, and confidence."
      },
      {
          "label": "Executive review",
          "value": "Prepare an executive review for Batch03 Features.\nAudience: business owner, operations lead, and implementation team.\nInclude impact, risk, estimated effort, decision points, and a concise next-step plan."
      }
  ];

  const applySampleRequest = (value) => {
    setInput(value);
    setError(null);
  };
  const current = FEATURES.find(f => f.slug === active) || FEATURES[0];

  async function run() {
    if (!current) return;
    setLoading(true); setError(null);
    try {
      let parsed;
      try { parsed = input ? JSON.parse(input) : {}; } catch { parsed = { input }; }
      const r = await fetch(`${API_BASE}${current.endpoint}`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(parsed)
      });
      let body; try { body = await r.json(); } catch { body = { raw: await r.text() }; }
      if (!r.ok) setError(body.error || `HTTP ${r.status}`);
      setResults(prev => ({ ...prev, [current.slug]: body }));
    } catch (e) {
      setError(String(e.message || e));
    } finally { setLoading(false); }
  }

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Batch 03 Features <small style={{ color: '#64748b', fontWeight: 400 }}>(AIEstatePlanningDigitalLegacy)</small></h2>
      <p style={{ color: '#475569', maxWidth: 720 }}>
        Audit-driven AI counterparts, non-AI feature gaps, and custom feature suggestions.
        Backend endpoints prefixed <code>/api/cf-*</code> (custom features) and <code>/api/gap-*</code> (gap fills).
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
        {FEATURES.map(f => (
          <button key={f.slug} onClick={() => setActive(f.slug)}
            style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #cbd5e1',
                     background: active === f.slug ? '#1e40af' : '#f8fafc',
                     color: active === f.slug ? 'white' : '#0f172a', cursor: 'pointer', fontSize: 12 }}>
            <span style={{ opacity: 0.7, marginRight: 4 }}>[{f.kind}]</span>{f.label}
          </button>
        ))}
      </div>
      {current && (
        <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 6, border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: 8 }}>
            <strong>{current.label}</strong>
            <div style={{ color: '#475569', fontSize: 13 }}>{current.desc}</div>
            <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>POST <code>{current.endpoint}</code></div>
          </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {sampleRequests.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => applySampleRequest(sample.value)}
              style={{ padding: '6px 10px', background: '#eef2ff', color: '#1e3a8a', border: '1px solid #c7d2fe', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              {sample.label}
            </button>
          ))}
        </div>

          <textarea value={input} onChange={e => setInput(e.target.value)}
            placeholder='Optional JSON input (e.g. {"query":"..."})'
            style={{ width: '100%', minHeight: 80, padding: 8, fontFamily: 'monospace', fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4 }} />
          <div style={{ marginTop: 8 }}>
            <button onClick={run} disabled={loading}
              style={{ padding: '8px 16px', background: '#1e40af', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Running…' : 'Run'}
            </button>
          </div>
          {error && (<div style={{ marginTop: 12, padding: 10, background: '#fee2e2', color: '#991b1b', borderRadius: 4, fontSize: 13 }}>{error}</div>)}
          {results[current.slug] && (
            <pre style={{ marginTop: 12, padding: 10, background: '#0b1020', color: '#cbd5e1', borderRadius: 4, overflow: 'auto', maxHeight: 360, fontSize: 12 }}>
              {typeof results[current.slug] === 'string' ? results[current.slug] : JSON.stringify(results[current.slug], null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
