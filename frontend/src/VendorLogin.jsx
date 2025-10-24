import React, { useState } from 'react';
import Layout from './components/Layout'; // adjust path if needed

function VendorLogin() {
  const [vendorId, setVendorId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log({ vendorId, password });
    // TODO: Call backend API for vendor login
    // Example:
    // fetch('/api/login/vendor', { method: 'POST', body: JSON.stringify({ vendorId, password }) })
  };

  return (
    <Layout>
      <div className="card shadow p-4 mx-auto mt-5" style={{ maxWidth: '400px' }}>
        <h4 className="mb-4 text-center">Vendor Login</h4>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Vendor ID</label>
            <input
              type="text"
              name="vendor_id"
              className="form-control"
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-success w-100">Login</button>
        </form>

        <p className="mt-3 text-center">
          Not registered? <a href="/register/vendor">Create an account</a>
        </p>
      </div>
    </Layout>
  );
}

export default VendorLogin;
