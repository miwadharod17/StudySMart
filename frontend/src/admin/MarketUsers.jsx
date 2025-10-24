import React, { useState, useEffect } from 'react';
import AdminDashboard from "../AdminDashboard";

function MarketUsers() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  const fetchUsers = async () => {
    // TODO: Replace with your API endpoint
    let url = `/api/admin/users?page=${page}`;
    if (roleFilter) url += `&role=${roleFilter}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;

    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      fetchUsers(); // Refresh after delete
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  return (
    <AdminDashboardLayout activePage="market_users">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold text-success">Manage Users</h3>
        <div>
          <a href="/admin/users/create" className="btn btn-outline-primary btn-sm">+ Add User</a>
          <a href="/admin/dashboard" className="btn btn-outline-secondary btn-sm ms-2">Back</a>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-3">
        {['', 'student', 'vendor', 'admin'].map((role) => (
          <button
            key={role}
            className={`btn btn-sm ${roleFilter === role ? 'btn-success' : 'btn-outline-success'} me-1`}
            onClick={() => { setRoleFilter(role); setPage(1); }}
          >
            {role ? role.charAt(0).toUpperCase() + role.slice(1) + 's' : 'All'}
          </button>
        ))}
      </div>

      {users.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-striped align-middle">
            <thead className="table-success">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userID}>
                  <td>{user.userID}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                  <td>
                    <a href={`/admin/users/edit/${user.userID}`} className="btn btn-sm btn-outline-info me-1">Edit</a>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(user.userID)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      ) : (
        <div className="alert alert-info text-center">No users found.</div>
      )}
    </AdminDashboardLayout>
  );
}

export default MarketUsers;
