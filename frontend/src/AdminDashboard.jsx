import React from 'react';
import Layout from './components/Layout'; // adjust path if needed

function AdminDashboard({ totalItems, totalUsers, totalOrders }) {
  return (
    <Layout>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-semibold text-dark">Admin Dashboard</h2>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => window.location.href = '/login/admin'}
        >
          Logout
        </button>
      </div>

      {/* Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="text-muted mb-1">Total Items</h5>
              <h3 className="fw-bold text-primary">{totalItems}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="text-muted mb-1">Total Users</h5>
              <h3 className="fw-bold text-success">{totalUsers}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="text-muted mb-1">Total Orders</h5>
              <h3 className="fw-bold text-danger">{totalOrders}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card mt-4">
        <div className="card-header">
          <strong>Quick Links</strong>
        </div>
        <div className="card-body d-flex flex-wrap gap-2">
          <button className="btn btn-outline-primary" onClick={() => window.location.href='/admin/items'}>Manage Items</button>
          <button className="btn btn-outline-success" onClick={() => window.location.href='/admin/users'}>Manage Users</button>
          <button className="btn btn-outline-danger" onClick={() => window.location.href='/admin/orders'}>View Orders</button>
          <button className="btn btn-outline-info" onClick={() => window.location.href='/admin/forum/posts'}>View Forum Posts</button>
          <button className="btn btn-outline-warning" onClick={() => window.location.href='/admin/forum/comments'}>View Forum Comments</button>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
