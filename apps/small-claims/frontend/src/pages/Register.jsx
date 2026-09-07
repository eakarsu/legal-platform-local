import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  card: { background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: 420 },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1a365d' },
  sub: { color: '#718096', marginBottom: 28, fontSize: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4a5568' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 18, outline: 'none' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 18, background: 'white' },
  btn: { width: '100%', padding: '12px', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  link: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#718096' },
  a: { color: '#2b6cb0', textDecoration: 'none' },
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', state: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h1 style={s.h1}>⚖️ Create Account</h1>
        <p style={s.sub}>Start managing your small claims case</p>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} type="text" {...f('name')} required />
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" {...f('email')} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" {...f('password')} required />
          <label style={s.label}>State</label>
          <select style={s.select} {...f('state')}>
            <option value="">Select state...</option>
            {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
        </form>
        <div style={s.link}>Already have an account? <Link to="/login" style={s.a}>Sign in</Link></div>
      </div>
    </div>
  );
}
