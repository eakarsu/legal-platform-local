import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  card: { background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', width: 400 },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1a365d' },
  sub: { color: '#718096', marginBottom: 28, fontSize: 14 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#4a5568' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, marginBottom: 18, outline: 'none' },
  btn: { width: '100%', padding: '12px', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  err: { background: '#fff5f5', color: '#e53e3e', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
  link: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#718096' },
  a: { color: '#2b6cb0', textDecoration: 'none' },
};

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h1 style={s.h1}>⚖️ Small Claims Guide</h1>
        <p style={s.sub}>Sign in to manage your cases</p>
        {error && <div style={s.err}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <div style={s.link}>Don't have an account? <Link to="/register" style={s.a}>Register</Link></div>
      </div>
    </div>
  );
}
