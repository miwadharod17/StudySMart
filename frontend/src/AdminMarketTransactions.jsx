import React, { useEffect, useState } from 'react';
import AdminDashboard from "./AdminDashboard";
import { useNavigate } from 'react-router-dom';

function AdminMarketTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchTransactions = async (pageNum = 1) => {
    try {
      const res = await fetch(`/api/admin/transactions?page=${pageNum}`);
      const data = await res.json();
      setTransactions(data.items);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    fetchTransactions(page);
  }, [page]);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
    }
  };

  return (
    <AdminDashboardLayout activePage="market_transactions">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold text-danger">Transaction History</h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </button>
      </div>

      {transactions.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-danger">
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Status</th>
                <th>Date</th>
                <th>Voucher</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((order) => (
                <tr key={order.orderID}>
                  <td>{order.orderID}</td>
                  <td>{order.buyer.name} ({order.buyer.email})</td>
                  <td>
                    <span className={`badge bg-${order.status === 'Placed' ? 'success' : 'secondary'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.orderDate).toLocaleString()}</td>
                  <td>{order.voucherID || '—'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/admin/transactions/${order.orderID}`)}
                    >
                      View
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
                <button className="page-link" onClick={() => goToPage(page - 1)}>Previous</button>
              </li>
              {[...Array(totalPages)].map((_, idx) => (
                <li key={idx} className={`page-item ${page === idx + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => goToPage(idx + 1)}>{idx + 1}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => goToPage(page + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      ) : (
        <div className="alert alert-info text-center">No transactions available.</div>
      )}
    </AdminDashboardLayout>
  );
}

export default AdminMarketTransactions;
