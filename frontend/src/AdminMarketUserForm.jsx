import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminDashboard from "./AdminDashboard";

function AdminMarketUserForm() {
  const { userId } = useParams(); // undefined for Add, defined for Edit
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  // Fetch user data if editing
  useEffect(() => {
    if (userId) {
      fetch(`/api/admin/users/${userId}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name);
          setEmail(data.email);
          setRole(data.role);
        })
        .catch(err => console.error('Error fetching user:', err));
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { name, email, role };
    if (!userId) payload.password = password; // include password only for Add

    const method = userId ? 'PUT' : 'POST';
    const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save user');

      navigate('/admin/users'); // go back to users list
    } catch (err) {
      console.error(err);
      alert('Error saving user. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      navigate('/admin/users');
    } catch (err) {
      console.error(err);
      alert('Error deleting user.');
    }
  };

  return (
    <AdminDashboardLayout activePage="market_users">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold text-success">{userId ? 'Edit User' : 'Add New User'}</h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/admin/users')}>Back</button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!userId && (
            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div className="col-md-6">
            <label className="form-label">Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button type="submit" className="btn btn-success" disabled={loading}>
            {userId ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>

      {userId && (
        <div className="mt-3">
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            Delete User
          </button>
        </div>
      )}
    </AdminDashboardLayout>
  );
}

export default AdminMarketUserForm;
