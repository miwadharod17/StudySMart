import React, { useState } from 'react';
import StudentDashboardLayout from '../StudentDashboardLayout';

function Orders({ orders }) {
  const [openOrderID, setOpenOrderID] = useState(null);

  const toggleDetails = (orderID) => {
    setOpenOrderID(openOrderID === orderID ? null : orderID);
  };

  return (
    <StudentDashboardLayout activePage="orders">
      <h4 className="fw-semibold mb-3">My Orders</h4>

      {orders && orders.length > 0 ? (
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total Amount (₹)</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const grandTotal = order.bill.amount; // Already calculated
              return (
                <React.Fragment key={order.orderID}>
                  <tr>
                    <td>{order.orderID}</td>
                    <td>{new Date(order.orderDate).toLocaleString()}</td>
                    <td>
                      <span className={`badge bg-${order.status === 'Paid' ? 'success' : 'secondary'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>₹{grandTotal.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => toggleDetails(order.orderID)}
                      >
                        View
                      </button>
                    </td>
                  </tr>

                  {openOrderID === order.orderID && (
                    <tr>
                      <td colSpan="5">
                        <div className="card mb-3">
                          <div className="card-header d-flex justify-content-between align-items-center">
                            <strong>Order {order.orderID}</strong>
                            <small>{new Date(order.orderDate).toLocaleString()}</small>
                          </div>
                          <ul className="list-group list-group-flush">
                            {order.order_details.map((od) => {
                              const subtotal = od.price * od.quantity;
                              return (
                                <li
                                  className="list-group-item d-flex justify-content-between align-items-center"
                                  key={od.item.itemID}
                                >
                                  <div>
                                    <strong>{od.item.title}</strong> × {od.quantity}
                                    <br />
                                    <small className="text-muted">
                                      Category: {od.item.category || '-'} | Seller: {od.item.seller.userID} - {od.item.seller.name}
                                    </small>
                                  </div>
                                  <div>₹{subtotal.toFixed(2)}</div>
                                </li>
                              );
                            })}

                            {order.voucher && (
                              <li className="list-group-item d-flex justify-content-between">
                                <strong>Voucher Applied:</strong> {order.voucher.discountPercent}% off
                                <span>-₹{order.voucher.applyVoucher(order).toFixed(2)}</span>
                              </li>
                            )}

                            <li className="list-group-item d-flex justify-content-between">
                              <strong>Grand Total:</strong>
                              <span>₹{grandTotal.toFixed(2)}</span>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-info">
          You haven't placed any orders yet. Browse the <a href="/student/marketplace">marketplace</a> to shop!
        </div>
      )}
    </StudentDashboardLayout>
  );
}

export default Orders;
