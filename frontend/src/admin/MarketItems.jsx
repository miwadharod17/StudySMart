import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from "../AdminDashboard";

function MarketItems() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const navigate = useNavigate();

  const fetchItems = async (page = 1) => {
    try {
      const res = await fetch(`/api/admin/market/items?page=${page}`);
      const data = await res.json();
      setItems(data.items);
      setPagination({ page: data.page, totalPages: data.total_pages });
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/admin/market/items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Item deleted successfully');
        fetchItems(pagination.page); // refresh current page
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handlePageChange = (page) => {
    fetchItems(page);
  };

  return (
    <AdminDashboardLayout activePage="market_items">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold text-primary">Manage Items</h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {items.length > 0 ? (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-primary">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price (₹)</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.itemID}>
                    <td>{item.itemID}</td>
                    <td>{item.title}</td>
                    <td>{item.category || '—'}</td>
                    <td>{item.price.toFixed(2)}</td>
                    <td>{item.availability}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info me-2"
                        onClick={() => navigate(`/admin/market/items/${item.itemID}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(item.itemID)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(pagination.page - 1)}>
                  Previous
                </button>
              </li>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <li key={p} className={`page-item ${p === pagination.page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(p)}>
                    {p}
                  </button>
                </li>
              ))}

              <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(pagination.page + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </>
      ) : (
        <div className="alert alert-info text-center">No items found.</div>
      )}
    </AdminDashboardLayout>
  );
}

export default MarketItems;
