import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const styles = {
  nav: { background: '#276749', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 },
  brand: { fontWeight: 700, fontSize: 18, color: 'white', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: 20, alignItems: 'center' },
  navLink: { color: '#9ae6b4', textDecoration: 'none', fontSize: 14 },
  btn: { background: '#c53030', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
};

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.brand}>🏠 AI Tenant Rights Advisor</Link>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>My Tenancies</Link>
          <Link to="/tenancies/new" style={styles.navLink}>Add Tenancy</Link>
          <Link to="/case-outcome" style={styles.navLink}>Case Outcome</Link>
          <Link to="/local-law-lookup" style={styles.navLink}>Local Law</Link>
          <Link to="/custom-views" style={styles.navLink} data-testid="nav-tenant-views">Tenant Views</Link>
          <span style={{ color: '#9ae6b4', fontSize: 13 }}>{user.name}</span>
          <button onClick={logout} style={styles.btn}>Logout</button>
        </div>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  );
}
