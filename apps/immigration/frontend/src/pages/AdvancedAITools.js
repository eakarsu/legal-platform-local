import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';

const TOOLS = [
  {
    id: 'visa-category-recommendation',
    title: 'Visa Category Recommendation',
    icon: 'fa-solid fa-passport',
    endpoint: '/ai/visa-category-recommendation',
    desc: 'Ranked visa categories with feasibility, evidence to gather, timeline, and cost ranges (not legal advice).',
    fields: [
      { name: 'client_id', label: 'Client (optional)', type: 'client' },
      { name: 'profile', label: 'Inline Profile (used if no client selected)', type: 'textarea', placeholder: 'e.g., 32yo software engineer, current H-1B, US masters, 8 years experience...' },
      { name: 'goals', label: 'Goals / Constraints', type: 'textarea', placeholder: 'Permanent residency in 3 years, willing to relocate, family of 4...' },
    ],
  },
  {
    id: 'interview-preparation',
    title: 'Interview Preparation',
    icon: 'fa-solid fa-comments',
    endpoint: '/ai/interview-preparation',
    desc: 'Expected topics, practice Q&A, document checklist, behavioral coaching, and mock interview plan.',
    fields: [
      { name: 'case_id', label: 'Case', type: 'case', required: true },
      {
        name: 'interview_type',
        label: 'Interview Type',
        type: 'select',
        required: true,
        options: ['Adjustment of Status (Green Card)', 'Naturalization (N-400)', 'Asylum', 'Consular (DS-160)', 'Marriage-based', 'EB-1 / EB-2 / EB-3', 'Other'],
      },
      { name: 'focus_areas', label: 'Focus Areas (comma-separated)', type: 'text', placeholder: 'Marriage history, financial documentation, employment timeline' },
    ],
  },
  {
    id: 'agentic-case-manager',
    title: 'Agentic Case Manager',
    icon: 'fa-solid fa-list-check',
    endpoint: '/ai/agentic-case-manager',
    desc: 'Workflow steps, reminders, document drafting plan, and decision points for the next horizon.',
    fields: [
      { name: 'case_id', label: 'Case', type: 'case' },
      { name: 'horizon_days', label: 'Horizon (days)', type: 'number', placeholder: '60' },
    ],
  },
  {
    id: 'pathway-optimizer',
    title: 'Pathway Optimizer',
    icon: 'fa-solid fa-route',
    endpoint: '/ai/pathway-optimizer',
    desc: 'Multi-step optimal immigration pathway with branching, fallbacks, and 30/60/90-day actions.',
    fields: [
      { name: 'client_id', label: 'Client (optional)', type: 'client' },
      { name: 'profile', label: 'Inline Profile (used if no client selected)', type: 'textarea', placeholder: 'e.g., 32yo software engineer, current H-1B, US masters, 8 years experience...' },
      { name: 'target_outcome', label: 'Target Outcome', type: 'text', placeholder: 'permanent residency / citizenship / family reunification' },
      { name: 'time_horizon_years', label: 'Time Horizon (years)', type: 'number', placeholder: '5' },
      {
        name: 'risk_tolerance',
        label: 'Risk Tolerance',
        type: 'select',
        options: ['conservative', 'moderate', 'aggressive'],
      },
    ],
  },
  {
    id: 'auto-detect-language',
    title: 'Auto-Detect Language',
    icon: 'fa-solid fa-language',
    endpoint: '/ai/auto-detect-language',
    desc: 'Detect dominant language(s) of pasted text and produce a translation recommendation for the case file.',
    fields: [
      { name: 'text', label: 'Text', type: 'textarea', required: true, placeholder: 'Paste foreign-language document text here...' },
      { name: 'target_language', label: 'Target Language (optional)', type: 'text', placeholder: 'English' },
    ],
  },
];

export default function AdvancedAITools() {
  const [tab, setTab] = useState(TOOLS[0].id);
  const [forms, setForms] = useState({});
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const tool = TOOLS.find((t) => t.id === tab);

  useEffect(() => {
    api.get('/clients').then((r) => setClients(r.data?.data || r.data || [])).catch(() => setClients([]));
    api.get('/cases').then((r) => setCases(r.data?.data || r.data || [])).catch(() => setCases([]));
  }, []);

  const setField = (name, value) => {
    setForms((p) => ({ ...p, [tab]: { ...(p[tab] || {}), [name]: value } }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = forms[tab] || {};
    for (const f of tool.fields) {
      if (f.required && !data[f.name]) {
        setError(`${f.label} is required`);
        return;
      }
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const body = {};
      tool.fields.forEach((f) => {
        const v = data[f.name];
        if (v === undefined || v === '' || v === null) return;
        if (f.type === 'client' || f.type === 'case') body[f.name] = Number(v);
        else if (f.type === 'number') body[f.name] = Number(v);
        else if (f.name === 'focus_areas' && typeof v === 'string') {
          body.focus_areas = v.split(',').map((s) => s.trim()).filter(Boolean);
        } else {
          body[f.name] = v;
        }
      });
      const res = await api.post(tool.endpoint, body);
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 429
        ? 'AI rate limit reached.'
        : status === 503
          ? (err.response?.data?.error || 'AI provider not configured. Set OPENROUTER_API_KEY in the backend environment.')
          : err.response?.data?.error || err.message || 'Request failed';
      setError(msg);
      setToast({ type: 'error', message: msg });
    }
    setLoading(false);
  };

  const switchTab = (id) => {
    setTab(id);
    setError(null);
    setResult(null);
  };

  const formData = forms[tab] || {};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1><i className="fa-solid fa-robot"></i> Advanced AI Tools</h1>
          <p>Visa category recommendations and interview preparation</p>
        </div>
      </div>

      <div style={{ background: 'var(--primary-bg, #f3f4f6)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, padding: '8px 14px', marginBottom: 12, fontSize: 13 }}>
        <i className="fa-solid fa-circle-info" style={{ marginRight: 8 }}></i>
        These outputs are AI-generated and do <strong>not constitute legal advice</strong>.
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            style={{
              padding: '10px 16px', borderRadius: 8,
              border: '1px solid var(--border, #e5e7eb)',
              background: tab === t.id ? 'var(--primary, #4f46e5)' : 'white',
              color: tab === t.id ? 'white' : 'var(--text, #111827)',
              fontWeight: 600, cursor: 'pointer',
            }}
          >
            <i className={t.icon} style={{ marginRight: 6 }}></i>{t.title}
          </button>
        ))}
      </div>

      <div className="card" style={{ background: 'white', border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ marginTop: 0 }}><i className={tool.icon}></i> {tool.title}</h3>
        <p style={{ color: 'var(--text-secondary, #6b7280)' }}>{tool.desc}</p>

        <form onSubmit={submit}>
          {tool.fields.map((f) => (
            <div key={f.name} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
              </label>
              {f.type === 'client' ? (
                <select
                  value={formData[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border, #e5e7eb)', borderRadius: 8 }}
                >
                  <option value="">-- Optional --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name || c.firstName || ''} {c.last_name || c.lastName || ''} (#{c.id})</option>
                  ))}
                </select>
              ) : f.type === 'case' ? (
                <select
                  value={formData[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border, #e5e7eb)', borderRadius: 8 }}
                >
                  <option value="">-- Select Case --</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>#{c.id} {c.case_number || c.title || ''}</option>
                  ))}
                </select>
              ) : f.type === 'select' ? (
                <select
                  value={formData[f.name] || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border, #e5e7eb)', borderRadius: 8 }}
                >
                  <option value="">-- Select --</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  rows={4}
                  value={formData[f.name] || ''}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, fontFamily: 'inherit' }}
                />
              ) : (
                <input
                  type={f.type || 'text'}
                  value={formData[f.name] || ''}
                  placeholder={f.placeholder || ''}
                  onChange={(e) => setField(f.name, e.target.value)}
                  style={{ width: '100%', padding: 10, border: '1px solid var(--border, #e5e7eb)', borderRadius: 8 }}
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: loading ? '#94a3b8' : 'var(--primary, #4f46e5)',
              color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? <><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 6 }}></i>Generating...</> : 'Run Analysis'}
          </button>
        </form>

        {error && (
          <div style={{ marginTop: 16, padding: 12, background: '#fee2e2', color: '#991b1b', borderRadius: 8, border: '1px solid #fecaca' }}>
            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 6 }}></i>{error}
          </div>
        )}

        {result && (
          <div style={{ marginTop: 20, padding: 18, background: 'var(--bg-secondary, #f8fafc)', borderRadius: 12, border: '1px solid var(--border, #e2e8f0)' }}>
            <h4 style={{ marginTop: 0 }}>Result</h4>
            <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 14, borderRadius: 8, overflow: 'auto', fontSize: 12, maxHeight: 520 }}>
              {JSON.stringify(result.structured || result, null, 2)}
            </pre>
            {result.raw && (
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary, #6b7280)' }}>Raw response</summary>
                <pre style={{ background: '#1e293b', color: '#cbd5e1', padding: 14, borderRadius: 8, overflow: 'auto', fontSize: 12, maxHeight: 320 }}>
                  {result.raw}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}
