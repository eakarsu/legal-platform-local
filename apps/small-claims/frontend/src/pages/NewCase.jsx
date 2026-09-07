import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
const DISPUTE_TYPES = ['Unpaid debt', 'Property damage', 'Security deposit', 'Breach of contract', 'Personal injury', 'Product defect', 'Landlord-tenant', 'Auto accident', 'Services not rendered', 'Fraud/misrepresentation', 'Other'];

const s = {
  card: { background: 'white', borderRadius: 12, padding: 36, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 700 },
  h1: { fontSize: 26, fontWeight: 700, color: '#1a365d', marginBottom: 8 },
  sub: { color: '#718096', marginBottom: 32 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4a5568' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 20, outline: 'none' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 20, background: 'white' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 20, minHeight: 140, resize: 'vertical', fontFamily: 'inherit' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  btn: { background: '#2b6cb0', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
};

export default function NewCase() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    dispute_type: '', jurisdiction_state: '', jurisdiction_county: '',
    claim_amount: '', opposing_party: '', facts: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/cases', form);
      navigate(`/cases/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div style={s.card}>
        <h1 style={s.h1}>New Case Intake</h1>
        <p style={s.sub}>Provide your case details to get started with AI-powered guidance.</p>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={s.row}>
            <div>
              <label style={s.label}>Dispute Type *</label>
              <select style={s.select} {...f('dispute_type')} required>
                <option value="">Select type...</option>
                {DISPUTE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Claim Amount ($) *</label>
              <input style={s.input} type="number" min="1" step="0.01" placeholder="e.g. 5000" {...f('claim_amount')} required />
            </div>
          </div>
          <div style={s.row}>
            <div>
              <label style={s.label}>State *</label>
              <select style={s.select} {...f('jurisdiction_state')} required>
                <option value="">Select state...</option>
                {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>County (optional)</label>
              <input style={s.input} type="text" placeholder="e.g. Los Angeles" {...f('jurisdiction_county')} />
            </div>
          </div>
          <label style={s.label}>Opposing Party Name</label>
          <input style={s.input} type="text" placeholder="Person or business name" {...f('opposing_party')} />
          <label style={s.label}>Case Facts *</label>
          <textarea style={s.textarea} placeholder="Describe what happened, including dates, amounts, and relevant details..." {...f('facts')} required />
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Case'}</button>
        </form>
      </div>
    </Layout>
  );
}
