import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

// Wires the three AI endpoints in backend/routes/aiNew.js that previously
// had no FE entrypoint:
//   POST /api/ai/beneficiary-access-report
//   POST /api/ai/legacy-message-schedule
//   POST /api/ai/estate-timeline-advisor
// Each pulls user-scoped data on the server; no body required.
// Auth is handled by services/api.js (Bearer token from localStorage).

const REPORTS = [
  {
    key: 'beneficiary',
    label: 'Beneficiary Access Report',
    description: 'Per-beneficiary inheritance summary — who receives what, gap analysis, recommendations.',
    endpoint: '/ai/beneficiary-access-report',
    contentField: 'report',
  },
  {
    key: 'legacy',
    label: 'Legacy Message Schedule',
    description: 'Delivery timeline and personalization guide for your scheduled legacy messages.',
    endpoint: '/ai/legacy-message-schedule',
    contentField: 'schedule',
  },
  {
    key: 'timeline',
    label: 'Estate Timeline Advisor',
    description: 'Strategic advice on overdue and at-risk milestones in your estate plan.',
    endpoint: '/ai/estate-timeline-advisor',
    contentField: 'advice',
  },
  {
    key: 'tax',
    label: 'Tax Minimization Plan',
    description: 'Jurisdiction-aware estate tax minimization plan based on your assets, properties, insurance, and trusts.',
    endpoint: '/ai/tax-minimize',
    contentField: 'plan',
  },
  {
    key: 'beneficiary-analyze',
    label: 'Beneficiary Suitability Analysis',
    description: 'Per-beneficiary suitability assessment, share allocation review, and risk flags.',
    endpoint: '/ai/beneficiary-analyze',
    contentField: 'analysis',
  },
  {
    key: 'agentic-plan',
    label: 'Agentic Estate Plan',
    description: 'Multi-phase plan synthesizing wills, beneficiaries, properties, insurance, and trusts. Jurisdiction-aware.',
    endpoint: '/ai/agentic-plan',
    contentField: 'plan',
  },
  {
    key: 'digital-vault-audit',
    label: 'Digital Vault Audit',
    description: 'Reviews documents and digital accounts for orphan accounts and access risks.',
    endpoint: '/ai/digital-vault-audit',
    contentField: 'audit',
  },
];

export default function AIReports() {
  const [activeKey, setActiveKey] = useState('beneficiary');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});

  const active = REPORTS.find(r => r.key === activeKey);
  const currentResult = results[activeKey];
  const currentError = errors[activeKey];

  const run = async () => {
    setLoading(true);
    setErrors({ ...errors, [activeKey]: null });
    try {
      const res = await api.post(active.endpoint, {});
      setResults({ ...results, [activeKey]: res.data });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Request failed';
      const friendly = status === 503
        ? `${msg} (set OPENROUTER_API_KEY on the backend and restart)`
        : status === 404
          ? `${msg} (add data in the relevant module first)`
          : msg;
      setErrors({ ...errors, [activeKey]: friendly });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📑 AI Estate Reports</h2>
          <p>Generate comprehensive AI-driven reports across your estate plan.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {REPORTS.map(r => (
          <button
            key={r.key}
            type="button"
            className={`btn ${activeKey === r.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveKey(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{active.label}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{active.description}</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          Endpoint: <code>POST {active.endpoint}</code>
        </p>
        <button type="button" className="btn btn-primary" onClick={run} disabled={loading}>
          {loading ? (<><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div> Generating…</>) : 'Generate Report'}
        </button>
      </div>

      {currentError && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            borderLeft: '4px solid var(--danger, #dc2626)',
            background: 'rgba(220, 38, 38, 0.06)',
          }}
        >
          <strong>Error:</strong> {currentError}
        </div>
      )}

      {currentResult && (
        <div className="ai-output">
          <div className="ai-output-header">
            <span className="ai-badge">{active.label}</span>
            {currentResult.model && <span className="ai-model">Model: {currentResult.model}</span>}
            {currentResult.beneficiary_count !== undefined && (
              <span className="ai-model">Beneficiaries: {currentResult.beneficiary_count}</span>
            )}
            {currentResult.message_count !== undefined && (
              <span className="ai-model">Messages: {currentResult.message_count}</span>
            )}
            {currentResult.summary && currentResult.summary.total !== undefined && (
              <span className="ai-model">
                Total: {currentResult.summary.total} · Overdue: {currentResult.summary.overdue} · At-risk: {currentResult.summary.at_risk}
              </span>
            )}
            {currentResult.summary && currentResult.summary.gross_estate_estimate !== undefined && (
              <span className="ai-model">
                Gross Estate: ${Number(currentResult.summary.gross_estate_estimate).toLocaleString()}
              </span>
            )}
            {currentResult.summary && currentResult.summary.beneficiary_count !== undefined && (
              <span className="ai-model">
                Beneficiaries: {currentResult.summary.beneficiary_count} · Total Share: {Number(currentResult.summary.total_share_pct || 0).toFixed(1)}%
              </span>
            )}
            {currentResult.jurisdiction && (
              <span className="ai-model">Jurisdiction: {currentResult.jurisdiction}</span>
            )}
          </div>
          <div className="ai-output-content">
            <ReactMarkdown>
              {currentResult[active.contentField] || JSON.stringify(currentResult, null, 2)}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
