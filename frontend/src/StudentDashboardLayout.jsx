import React from 'react';
import { Link } from 'react-router-dom';

function StudentDashboardLayout({ activePage, currentUser = { name: 'Student' }, children }) {
  const navLinks = [
    { name: 'Marketplace', path: '/student/Marketplace', key: 'marketplace' },
    { name: 'My Items', path: '/student/MyItems', key: 'sell' },
    { name: 'My Cart', path: '/student/Cart', key: 'cart' },
    { name: 'My Orders', path: '/student/Orders', key: 'orders' },
    { name: 'Forum', path: '/student/Forum', key: 'forum' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          height: '100vh',
          width: '240px',
          backgroundColor: '#fff',
          borderRight: '4px solid #6f42c1',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '1rem',
        }}
      >
        {/* Small box for Student Panel */}
        <div
          style={{
            margin: '0 12px 1rem 12px',
            padding: '8px',
            border: '2px solid #6f42c1',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h5 style={{ color: '#6f42c1', fontWeight: '700', margin: 0 }}>
            Student Panel
          </h5>
        </div>

        {/* Nav Links */}
        {navLinks.map((link) => (
          <Link
            key={link.key}
            to={link.path}
            className={`nav-link ${activePage === link.key ? 'active' : ''}`}
            style={{
              color: '#6f42c1',
              margin: '6px 12px',
              borderRadius: '8px',
              padding: '10px 12px',
              fontWeight: '700',
              fontSize: '1.05rem',
              backgroundColor: activePage === link.key ? '#d3b3ff' : 'transparent',
              textDecoration: 'none',
              transition: '0.3s',
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#e6ccff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor =
                activePage === link.key ? '#d3b3ff' : 'transparent';
            }}
          >
            {link.name}
          </Link>
        ))}

        {/* Logout */}
        <Link
          to="/login/student"
          className="nav-link"
          style={{
            color: 'red',
            marginTop: 'auto',
            marginLeft: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
          }}
        >
          Logout
        </Link>
      </div>

      {/* Content Area */}
      <div
        className="content"
        style={{
          flex: 1,
          padding: '2rem',
        }}
      >
        {/* Top welcome section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <h2
            style={{
              color: '#6f42c1',
              fontWeight: '700',
              fontSize: '2rem',
              marginBottom: '0.5rem',
            }}
          >
            Welcome, {currentUser.name} 👋
          </h2>
          <p
            style={{
              color: '#9d4edd',
              fontWeight: '700',
              fontSize: '1.1rem',
              margin: 0,
            }}
          >
            Use the sidebar to navigate between marketplace and forum features.
          </p>
        </div>

        {/* Page-specific content */}
        {children}
      </div>
    </div>
  );
}

export default StudentDashboardLayout;
