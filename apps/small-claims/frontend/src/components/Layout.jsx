import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const GAP_LINKS = [
  { to: '/gap-no-evidenceorganizer', label: 'Evidence Organizer' },
  { to: '/gap-no-witnessstatementguide', label: 'Witness Statement Guide' },
  { to: '/gap-no-settlementcalculator-casevalue-estimator', label: 'Settlement Calculator' },
  { to: '/gap-no-courtprocedurechecklist-perjurisdiction', label: 'Court Procedure Checklist' },
  { to: '/gap-no-appealassessment', label: 'Appeal Assessment' },
  { to: '/gap-no-case-tracking-beyond-crud-no-hearing-remi', label: 'Hearing Reminders' },
  { to: '/gap-no-fee-schedule-lookup-filing-fees-by-court', label: 'Fee Schedule Lookup' },
  { to: '/gap-no-statute-of-limitations-checker', label: 'Statute of Limitations' },
  { to: '/gap-no-legal-citation-library', label: 'Legal Citations' },
  { to: '/gap-no-efiling-integration-tyler-efiletexas', label: 'E-Filing Integration' },
  { to: '/gap-no-notificationscalendar-reminders', label: 'Calendar Reminders' },
  { to: '/gap-no-payment-processing-for-court-fees', label: 'Court Fee Payment' },
  { to: '/gap-no-audit-log-rbac', label: 'Audit Log / RBAC' },
];

const styles = {
  nav: { background: '#1a365d', color: 'white', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'relative' },
  brand: { fontWeight: 700, fontSize: 18, color: 'white', textDecoration: 'none' },
  navLinks: { display: 'flex', gap: 20, alignItems: 'center' },
  navLink: { color: '#a0aec0', textDecoration: 'none', fontSize: 14 },
  btn: { background: '#e53e3e', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 20px' },
  dropBtn: { background: 'none', border: 'none', color: '#a0aec0', fontSize: 14, cursor: 'pointer', padding: 0 },
  dropdown: { position: 'absolute', top: 60, right: 120, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 220, padding: '8px 0' },
  dropLink: { display: 'block', padding: '7px 18px', color: '#1a365d', textDecoration: 'none', fontSize: 13, borderBottom: '1px solid #f0f0f0' },
};

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [gapOpen, setGapOpen] = useState(false);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.brand}>⚖️ AI Small Claims Guide</Link>
        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>My Cases</Link>
          <Link to="/cases/new" style={styles.navLink}>New Case</Link>
          <Link to="/custom-views" style={styles.navLink}>Court Views</Link>
          <button style={styles.dropBtn} onClick={() => setGapOpen(o => !o)}>
            AI Tools {gapOpen ? '▲' : '▼'}
          </button>
          {gapOpen && (
            <div style={styles.dropdown}>
              {GAP_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} style={styles.dropLink} onClick={() => setGapOpen(false)}>
                  {label}
                </Link>
              ))}
            </div>
          )}
          <span style={{ color: '#a0aec0', fontSize: 13 }}>{user.name}</span>
          <button onClick={logout} style={styles.btn}>Logout</button>
        </div>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  );
}
