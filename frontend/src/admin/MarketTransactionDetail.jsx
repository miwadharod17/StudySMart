import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminDashboard from "../AdminDashboard";

function MarketTransactionDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/transactions/${orderId}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <AdminDashboardLayout activePage="market_transactions">
        <div className="alert alert-info text-center">Loading order details...</div>
      </AdminDashboardLayout>
    );
  }

  const grandTotal = order.order_details.reduce(
    (acc, od) => acc + od.price * od.quantity,
    0
  );

  return (
    <AdminDashboardLayout activePage="market_transactions">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold text-danger">Transaction Details</h3>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/admin/transactions')}
        >
          Back
        </button>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Order {order.orderID}</h5>
          <p><strong>User:</strong> {order.buyer.name} ({order.buyer.email})</p>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`badge bg-${order.status === 'Placed' ? 'success' : 'secondary'}`}>
              {order.status}
            </span>
          </p>
          <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
          <p><strong>Voucher ID:</strong> {order.voucherID || '—'}</p>
        </div>
      </div>

      <h5 className="fw-semibold mb-3">Ordered Items</h5>
      {order.order_details.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead className="table-danger">
              <tr>
                <th>Item ID</th>
                <th>Title</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
                <th>Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              {order.order_details.map((od) => (
                <tr key={od.item.itemID}>
                  <td>{od.item.itemID}</td>
                  <td>{od.item.title}</td>
                  <td>{od.quantity}</td>
                  <td>{od.price.toFixed(2)}</td>
                  <td>{(od.price * od.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="4" className="text-end">
                  Grand Total:
                </th>
                <th>₹{grandTotal.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="alert alert-info text-center">No items in this order.</div>
      )}
    </AdminDashboardLayout>
  );
}

export default MarketTransactionDetail;
