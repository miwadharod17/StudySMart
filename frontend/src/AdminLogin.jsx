import React, { useState } from 'react';
import Layout from './components/Layout'; // adjust path if needed

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log({ email, password });
    // TODO: Call backend API here
    // Example:
    // fetch('/api/login/admin', { method: 'POST', body: JSON.stringify({ email, password }) })
  };

  return (
    <Layout>
      <div className="card shadow p-4 mx-auto mt-5" style={{ maxWidth: '400px' }}>
        <h4 className="mb-4 text-center">Admin Login</h4>
        <form onSubmit={handleLogin}>
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
          <button className="btn btn-primary w-100" type="submit">Login</button>
        </form>
        <p className="mt-3 text-center">
          Not registered? <a href="/register/admin">Create an account</a>
        </p>
      </div>
    </Layout>
  );
}

export default AdminLogin;
