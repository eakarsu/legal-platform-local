import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { section: 'Overview' },
  { path: '/', icon: 'fa-solid fa-chart-pie', label: 'Dashboard' },
  { path: '/reports', icon: 'fa-solid fa-chart-bar', label: 'Reports & Analytics' },
  { section: 'Case Management' },
  { path: '/cases', icon: 'fa-solid fa-briefcase', label: 'Cases' },
  { path: '/clients', icon: 'fa-solid fa-users', label: 'Clients' },
  { path: '/documents', icon: 'fa-solid fa-file-alt', label: 'Documents' },
  { path: '/forms', icon: 'fa-solid fa-file-lines', label: 'Forms' },
  { section: 'Immigration' },
  { path: '/visas', icon: 'fa-solid fa-passport', label: 'Visa Applications' },
  { path: '/status-tracking', icon: 'fa-solid fa-route', label: 'Status Tracking' },
  { path: '/uscis-receipt-notice-tracker', icon: 'fa-solid fa-envelope-open-text', label: 'Receipt Notices' },
  { path: '/compliance', icon: 'fa-solid fa-shield-halved', label: 'Compliance' },
  { section: 'Operations' },
  { path: '/deadlines', icon: 'fa-solid fa-clock', label: 'Deadlines' },
  { path: '/billing', icon: 'fa-solid fa-file-invoice-dollar', label: 'Billing' },
  { path: '/notes', icon: 'fa-solid fa-sticky-note', label: 'Notes' },
  { section: 'AI Tools' },
  { path: '/ai', icon: 'fa-solid fa-robot', label: 'AI Assistant' },
  { path: '/advanced-ai', icon: 'fa-solid fa-wand-magic-sparkles', label: 'Advanced AI' },
  { section: 'Security' },
  { path: '/audit-log', icon: 'fa-solid fa-shield-halved', label: 'Audit Log' },
  { section: 'Custom' },
  { path: '/custom-views', icon: 'fa-solid fa-layer-group', label: 'Case Views' },
];

function Layout({ children, user, onLogout }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2><i className="fa-solid fa-scale-balanced"></i> ImmigrationAI</h2>
          <p>Case Management System</p>
        </div>
        <ul className="sidebar-nav">
          {navItems.map((item, index) => {
            if (item.section) {
              return <li key={index} className="sidebar-section">{item.section}</li>;
            }
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <i className={item.icon}></i>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li style={{ marginTop: 8 }}>
            <button onClick={onLogout}>
              <i className="fa-solid fa-right-from-bracket"></i>
              Logout
            </button>
          </li>
        </ul>
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
            <div className="user-details">
              <h4>{user?.name || 'User'}</h4>
              <p>{user?.role || 'Attorney'}</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
