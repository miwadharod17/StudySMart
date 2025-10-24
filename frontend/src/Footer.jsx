import React from 'react';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ backgroundColor: '#6f42c1', color: 'white', textAlign: 'center', padding: '12px', fontSize: '14px' }}>
      &copy; {year} StudySMart | All Rights Reserved
    </footer>
  );
}

export default Footer;
