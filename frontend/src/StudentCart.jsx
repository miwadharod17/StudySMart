import React, { useState } from "react";

function StudentCart() {
  const [cartItems, setCartItems] = useState([
    { itemID: 1, title: "Calculus Textbook", price: 500, quantity: 3 },
    { itemID: 2, title: "Physics Notes", price: 150, quantity: 10 },
    { itemID: 3, title: "Laptop Charger", price: 1200, quantity: 2 },
    { itemID: 4, title: "USB Drive 32GB", price: 300, quantity: 5 },
  ]);

  const handleQuantityChange = (itemID, newQuantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.itemID === itemID ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemove = (itemID) => {
    setCartItems((prev) => prev.filter((item) => item.itemID !== itemID));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="container py-4">
      <h2 className="fw-bold text-purple mb-4">My Cart</h2>

      {cartItems.length > 0 ? (
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
                <th style={tableCellStyle}>Item Name</th>
                <th style={tableCellStyle}>ID</th>
                <th style={tableCellStyle}>Quantity</th>
                <th style={tableCellStyle}>Price (₹)</th>
                <th style={tableCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.itemID}>
                  <td style={tableCellStyle}>{item.title}</td>
                  <td style={tableCellStyle}>{item.itemID}</td>
                  <td style={tableCellStyle}>
                    <input
                      type="number"
                      value={item.quantity}
                      min={0}
                      className="form-control"
                      style={{ width: "80px" }}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.itemID,
                          parseInt(e.target.value, 10)
                        )
                      }
                    />
                  </td>
                  <td
                    style={{
                      ...tableCellStyle,
                      color: "#6f42c1",
                      fontWeight: "700",
                    }}
                  >
                    ₹{item.price}
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: "center" }}>
                    <button
                      className="btn btn-sm btn-danger fw-bold"
                      onClick={() => handleRemove(item.itemID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {/* Total Row in Price Column */}
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <td style={tableCellStyle} colSpan={3} className="text-end fw-bold">
                  Total
                </td>
                <td
                  style={{
                    ...tableCellStyle,
                    color: "#6f42c1",
                    fontWeight: "700",
                  }}
                >
                  ₹{total}
                </td>
                <td style={tableCellStyle}></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="alert alert-info text-center fw-semibold"
          style={{ marginTop: "2rem" }}
        >
          Your cart is empty.
        </div>
      )}

      {/* Proceed to Checkout Button Below Table */}
      {cartItems.length > 0 && (
        <div
          className="d-flex justify-content-center"
          style={{ marginTop: "30px" }}
        >
          <button
            className="btn btn-purple fw-bold"
            style={{
              fontSize: "1.3rem",
              padding: "14px 32px",
              borderRadius: "25px",
            }}
          >
            Proceed to Checkout
          </button>
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

export default StudentCart;
