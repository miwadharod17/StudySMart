import React, { useState } from "react";

function StudentOrders() {
  const [orders, setOrders] = useState([
    {
      orderID: 101,
      orderDate: new Date("2025-10-20T14:35"),
      status: "Paid",
      orderDetails: [
        { itemID: 1, title: "Calculus Textbook", price: 500, quantity: 2, category: "Books", seller: "John D." },
        { itemID: 2, title: "Physics Notes", price: 150, quantity: 3, category: "Notes", seller: "Sarah M." },
      ],
      voucher: { discountPercent: 10 },
    },
    {
      orderID: 102,
      orderDate: new Date("2025-10-22T10:15"),
      status: "Pending",
      orderDetails: [
        { itemID: 3, title: "USB Drive 32GB", price: 300, quantity: 1, category: "Accessories", seller: "Mike B." },
      ],
      voucher: null,
    },
  ]);

  const [openDetails, setOpenDetails] = useState(null);

  const toggleDetails = (orderID) => {
    setOpenDetails(openDetails === orderID ? null : orderID);
  };

  const calculateOrderTotal = (order) => {
    const total = order.orderDetails.reduce((sum, od) => sum + od.price * od.quantity, 0);
    const discount = order.voucher ? (order.voucher.discountPercent / 100) * total : 0;
    return total - discount;
  };

  const formatDate = (date) => {
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-purple mb-4"> My Orders</h2>

      {orders.length > 0 ? (
        <div className="table-responsive">
          <table
            className="table align-middle"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "2px solid #6f42c1",
              fontSize: "1.1rem",
            }}
          >
            <thead style={{ backgroundColor: "#6f42c1", color: "white" }}>
              <tr>
                <th style={tableCellStyle}>Order ID</th>
                <th style={tableCellStyle}>Date</th>
                <th style={tableCellStyle}>Status</th>
                <th style={tableCellStyle}>Total Amount (₹)</th>
                <th style={tableCellStyle}>Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const totalAmount = calculateOrderTotal(order);

                return (
                  <React.Fragment key={order.orderID}>
                    <tr>
                      <td style={tableCellStyle}>{order.orderID}</td>
                      <td style={tableCellStyle}>{formatDate(order.orderDate)}</td>
                      <td style={tableCellStyle}>
                        <span className={`badge ${order.status === "Paid" ? "bg-success" : "bg-secondary"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ ...tableCellStyle, color: "#6f42c1", fontWeight: 700 }}>₹{totalAmount.toFixed(2)}</td>
                      <td style={{ ...tableCellStyle, textAlign: "center" }}>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => toggleDetails(order.orderID)}
                        >
                          View
                        </button>
                      </td>
                    </tr>

                    {openDetails === order.orderID && (
                      <tr>
                        <td colSpan={5}>
                          <div className="card mb-3 border-purple" style={{ borderRadius: "10px" }}>
                            <div className="card-header bg-purple text-white" style={{ fontWeight: "600" }}>
                              Order {order.orderID} ({formatDate(order.orderDate)})
                            </div>
                            <ul className="list-group list-group-flush">
                              {order.orderDetails.map((od) => (
                                <li
                                  key={od.itemID}
                                  className="list-group-item d-flex justify-content-between align-items-start"
                                  style={{ padding: "12px 16px" }}
                                >
                                  <div style={{ lineHeight: "1.5rem" }}>
                                    <strong>{od.title}</strong> × {od.quantity} <br />
                                    <small className="text-muted">
                                      Category: {od.category || "-"} | Seller: {od.seller}
                                    </small>
                                  </div>
                                  <div style={{ color: "#6f42c1", fontWeight: 700, fontSize: "1.1rem" }}>
                                    ₹{(od.price * od.quantity).toFixed(2)}
                                  </div>
                                </li>
                              ))}

                              {order.voucher && (
                                <li className="list-group-item d-flex justify-content-between" style={{ padding: "12px 16px" }}>
                                  <strong>Voucher Applied:</strong>
                                  <span style={{ color: "red", fontWeight: 700 }}>
                                    -₹{(
                                      (order.voucher.discountPercent / 100) *
                                      order.orderDetails.reduce((sum, od) => sum + od.price * od.quantity, 0)
                                    ).toFixed(2)}
                                  </span>
                                </li>
                              )}

                              <li
                                className="list-group-item d-flex justify-content-between fw-bold"
                                style={{ padding: "12px 16px", fontSize: "1.1rem" }}
                              >
                                <strong>Grand Total:</strong>
                                <span style={{ color: "#6f42c1" }}>₹{totalAmount.toFixed(2)}</span>
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
        </div>
      ) : (
        <div className="alert alert-info text-center fw-semibold" style={{ marginTop: "2rem" }}>
          You haven't placed any orders yet. Browse the marketplace to shop!
        </div>
      )}
    </div>
  );
}

const tableCellStyle = {
  border: "1px solid #6f42c1",
  padding: "12px 8px",
  textAlign: "center",
};

export default StudentOrders;
