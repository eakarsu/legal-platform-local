import React, { useState } from 'react';
import api from '../services/api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  const autoFill = () => {
    setEmail('admin@immigrationlaw.com');
    setPassword('password123');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <i className="fa-solid fa-scale-balanced"></i>
          <h1>ImmigrationAI</h1>
          <p>AI-Powered Case Management System</p>
        </div>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
            <i className="fa-solid fa-exclamation-circle" style={{ marginRight: 8 }}></i>{error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-login" disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Signing in...</> : <><i className="fa-solid fa-right-to-bracket"></i> Sign In</>}
          </button>
        </form>
        <button className="btn btn-autofill" onClick={autoFill}>
          <i className="fa-solid fa-wand-magic-sparkles"></i> Auto-fill Demo Credentials
        </button>
      </div>
    </div>
  );
}

export default Login;
