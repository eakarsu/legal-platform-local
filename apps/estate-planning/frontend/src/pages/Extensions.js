// Apply pass 5 — Extensions UI for Estate backlog (vault, LTC, multistate, etc.)
import React, { useEffect, useState } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
function authH() {
  const t = localStorage.getItem('token');
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}
async function api(path, opts = {}) {
  const r = await fetch(`${API}${path}`, { ...opts, headers: authH() });
  let body; try { body = await r.json(); } catch { body = {}; }
  return { ok: r.ok, status: r.status, body };
}

const Pre = ({ data }) => data == null ? null : (
  <pre style={{ background: '#0b1020', color: '#cbd5e1', padding: 10, borderRadius: 4, overflow: 'auto', maxHeight: 280 }}>
    {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
  </pre>
);

export default function Extensions() {
  const [tab, setTab] = useState('vault');
  const tabs = [
    { id: 'vault', label: 'Document Vault' },
    { id: 'legal', label: 'Multi-State Legal' },
    { id: 'ltc', label: 'Long-Term Care' },
    { id: 'consol', label: 'Consolidation' },
    { id: 'family', label: 'Family Meeting' },
    { id: 'portal', label: 'Beneficiary Portal' },
    { id: 'intl', label: 'International' }
  ];
  return (
    <div style={{ padding: 24 }}>
      <h2>Extensions <small style={{ color: '#94a3b8', fontWeight: 400 }}>(pass 5 backlog)</small></h2>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #cbd5e1',
                     background: tab === t.id ? '#1e40af' : '#f8fafc',
                     color: tab === t.id ? 'white' : 'inherit', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'vault' && <Vault />}
      {tab === 'legal' && <Legal />}
      {tab === 'ltc' && <LTC />}
      {tab === 'consol' && <Consol />}
      {tab === 'family' && <Family />}
      {tab === 'portal' && <Portal />}
      {tab === 'intl' && <Intl />}
    </div>
  );
}

function Vault() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('Will draft');
  const [content, setContent] = useState('Plain-text contents to encrypt at rest...');
  const [last, setLast] = useState(null);
  async function load() { setList((await api('/ext/vault/list')).body || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h3>Document Vault (envelope-encrypted)</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="title" style={{ width: '100%', marginBottom: 8 }} />
      <textarea value={content} onChange={e => setContent(e.target.value)} rows={4} style={{ width: '100%' }} />
      <button onClick={async () => { await api('/ext/vault/upload', { method: 'POST', body: JSON.stringify({ title, content, category: 'general' }) }); load(); }}>Encrypt + store</button>
      <Pre data={list} />
      <h4>Decrypt</h4>
      {list.map(d => <button key={d.id} onClick={async () => setLast((await api(`/ext/vault/${d.id}`)).body)} style={{ marginRight: 6, marginBottom: 6 }}>{d.title}</button>)}
      <Pre data={last} />
    </div>
  );
}
function Legal() {
  const [j, setJ] = useState('US-CA');
  const [info, setInfo] = useState(null);
  const [s, setS] = useState(null);
  return (
    <div>
      <h3>Multi-State Legal Compliance</h3>
      <input value={j} onChange={e => setJ(e.target.value)} placeholder="jurisdiction (US-CA, US-NY, ...)" style={{ width: '100%', marginBottom: 8 }} />
      <button onClick={async () => setInfo((await api('/ext/legal/jurisdiction-info?jurisdiction=' + encodeURIComponent(j))).body)}>Provider status / info</button>{' '}
      <button onClick={async () => setS((await api('/ext/ai/multistate-summary', { method: 'POST', body: JSON.stringify({ jurisdiction: j, scenario: 'standard estate' }) })).body)}>AI summary</button>
      <Pre data={info} />
      <Pre data={s} />
    </div>
  );
}
function LTC() {
  const [proj, setProj] = useState(null);
  const [adv, setAdv] = useState(null);
  return (
    <div>
      <h3>Long-Term Care Cost Modeling</h3>
      <button onClick={async () => setProj((await api('/ext/ltc/project', { method: 'POST', body: JSON.stringify({ scenario_name: 'Skilled nursing 5y', monthly_cost: 9000, years: 5, inflation: 0.04, age_now: 60, expected_age_of_need: 80 }) })).body)}>Project costs</button>{' '}
      <button onClick={async () => setAdv((await api('/ext/ai/ltc-advisory', { method: 'POST', body: JSON.stringify({ projected_total: proj?.projected_total || 0, years: 5, age_of_need: 80 }) })).body)}>AI advisory</button>
      <Pre data={proj} />
      <Pre data={adv} />
    </div>
  );
}
function Consol() {
  const [r, setR] = useState(null);
  return (
    <div>
      <h3>Account Consolidation</h3>
      <button onClick={async () => setR((await api('/ext/ai/account-consolidate', { method: 'POST', body: '{}' })).body)}>Recommend</button>
      <Pre data={r} />
    </div>
  );
}
function Family() {
  const [list, setList] = useState([]);
  const [title, setTitle] = useState('Q2 family review');
  const [agenda, setAgenda] = useState('Estate review and Q&A');
  const [att, setAtt] = useState('[{"name":"Alice","email":"a@e.com","relationship":"daughter"}]');
  const [ai, setAI] = useState(null);
  async function load() { setList((await api('/ext/family-meetings')).body || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h3>Family Meeting Coordinator</h3>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="title" style={{ width: '100%', marginBottom: 6 }} />
      <input value={agenda} onChange={e => setAgenda(e.target.value)} placeholder="agenda" style={{ width: '100%', marginBottom: 6 }} />
      <textarea value={att} onChange={e => setAtt(e.target.value)} rows={3} style={{ width: '100%' }} />
      <button onClick={async () => { let parsed = []; try { parsed = JSON.parse(att); } catch {}; await api('/ext/family-meetings', { method: 'POST', body: JSON.stringify({ title, agenda, attendees: parsed }) }); load(); }}>Schedule</button>{' '}
      <button onClick={async () => setAI((await api('/ext/ai/family-meeting-agenda', { method: 'POST', body: JSON.stringify({ topic: title, attendee_count: 3 }) })).body)}>AI agenda</button>
      <Pre data={list} />
      <Pre data={ai} />
    </div>
  );
}
function Portal() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  async function load() { setList((await api('/ext/beneficiary-portal/list')).body || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h3>Beneficiary Portal Invites</h3>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="beneficiary name" style={{ width: '60%', marginRight: 8 }} />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" style={{ width: '35%' }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={async () => { await api('/ext/beneficiary-portal/invite', { method: 'POST', body: JSON.stringify({ beneficiary_name: name, beneficiary_email: email }) }); load(); }}>Create invite</button>
      </div>
      <Pre data={list} />
      <p style={{ color: '#64748b' }}>Activate via POST /api/ext/beneficiary-portal/&lt;id&gt;/activate. Public view at /api/ext-public/beneficiary-portal/view/&lt;token&gt;.</p>
    </div>
  );
}
function Intl() {
  const [list, setList] = useState([]);
  const [c, setC] = useState('UK');
  const [r, setR] = useState('citizen');
  const [s, setS] = useState(null);
  async function load() { setList((await api('/ext/intl/jurisdictions')).body || []); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <h3>International Planning</h3>
      <input value={c} onChange={e => setC(e.target.value)} placeholder="country" style={{ width: '60%', marginRight: 8 }} />
      <input value={r} onChange={e => setR(e.target.value)} placeholder="residency status" style={{ width: '35%' }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={async () => { await api('/ext/intl/jurisdictions', { method: 'POST', body: JSON.stringify({ country: c, residency_status: r }) }); load(); }}>Add jurisdiction</button>{' '}
        <button onClick={async () => setS((await api('/ext/ai/intl-treaty-summary', { method: 'POST', body: '{}' })).body)}>AI treaty summary</button>
      </div>
      <Pre data={list} />
      <Pre data={s} />
    </div>
  );
}
