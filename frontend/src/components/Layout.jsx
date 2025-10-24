import React from 'react';
import Navbar from "../Navbar";
import Footer from "../Footer";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main className="container" style={{ padding: '60px 20px', minHeight: '80vh' }}>
        {children} {/* Page content goes here */}
      </main>
      <Footer />
    </>
  );
}

export default Layout;
