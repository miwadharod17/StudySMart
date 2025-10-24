import React, { useState } from 'react';
import Layout from './components/Layout'; // adjust path if needed

function VendorRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    console.log({ name, email, password });
    // TODO: Call backend API for vendor registration
    // Example:
    // fetch('/api/register/vendor', { method: 'POST', body: JSON.stringify({ name, email, password }) })
  };

  return (
    <Layout>
      <div className="card shadow p-4 mx-auto mt-5" style={{ maxWidth: '400px' }}>
        <h4 className="mb-4 text-center">Vendor Registration</h4>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <button type="submit" className="btn btn-primary w-100">Register as Vendor</button>
        </form>

        <p className="mt-3 text-center">
          Already registered? <a href="/login/vendor">Login here</a>
        </p>
      </div>
    </Layout>
  );
}

export default VendorRegister;
