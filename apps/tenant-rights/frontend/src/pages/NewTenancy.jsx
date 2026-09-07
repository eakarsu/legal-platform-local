import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import api from '../api.js';

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const s = {
  card: { background: 'white', borderRadius: 12, padding: 36, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 680 },
  h1: { fontSize: 26, fontWeight: 700, color: '#276749', marginBottom: 8 },
  sub: { color: '#718096', marginBottom: 32, fontSize: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4a5568' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 20, outline: 'none' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 20, background: 'white' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  btn: { background: '#276749', color: 'white', padding: '12px 28px', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
};

export default function NewTenancy() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    property_address: '', state: '', landlord_name: '',
    monthly_rent: '', lease_start: '', lease_end: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/tenancies', form);
      navigate(`/tenancies/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add tenancy');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div style={s.card}>
        <h1 style={s.h1}>Add New Tenancy</h1>
        <p style={s.sub}>Enter your rental details to get started with AI-powered tenant rights guidance.</p>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Property Address *</label>
          <input style={s.input} type="text" placeholder="123 Main St, City, State 12345" {...f('property_address')} required />
          <div style={s.row}>
            <div>
              <label style={s.label}>State *</label>
              <select style={s.select} {...f('state')} required>
                <option value="">Select state...</option>
                {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Monthly Rent ($)</label>
              <input style={s.input} type="number" min="0" step="0.01" placeholder="e.g. 1500" {...f('monthly_rent')} />
            </div>
          </div>
          <label style={s.label}>Landlord / Property Manager Name</label>
          <input style={s.input} type="text" placeholder="John Smith or ABC Property Management" {...f('landlord_name')} />
          <div style={s.row}>
            <div>
              <label style={s.label}>Lease Start Date</label>
              <input style={s.input} type="date" {...f('lease_start')} />
            </div>
            <div>
              <label style={s.label}>Lease End Date</label>
              <input style={s.input} type="date" {...f('lease_end')} />
            </div>
          </div>
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Tenancy'}</button>
        </form>
      </div>
    </Layout>
  );
}
