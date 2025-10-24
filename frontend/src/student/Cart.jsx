import React, { useState } from 'react';
import StudentDashboardLayout from '../StudentDashboardLayout'; // adjust path

function Cart({ initialCartItems = [] }) {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const handleQuantityChange = (cartId, quantity) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartID === cartId ? { ...item, quantity: Number(quantity) } : item
      )
    );
    // TODO: Call backend API to update quantity
    // Example: fetch(`/api/student/cart/${cartId}`, { method: 'POST', body: JSON.stringify({ quantity }) })
  };

  const handleRemove = (cartId) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    setCartItems((prev) => prev.filter((item) => item.cartID !== cartId));
    // TODO: Call backend API to remove item
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout', cartItems);
    // TODO: Call backend API for checkout
  };

  const totalPrice = (item) => item.quantity * item.item.price;

  return (
    <StudentDashboardLayout activePage="cart">
      <h4 className="fw-semibold mb-3">My Shopping Cart</h4>

      {cartItems.length > 0 ? (
        <>
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Total (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.cartID}>
                  <td>{item.item.title}</td>
                  <td>₹{item.item.price}</td>
                  <td>
                    <div className="d-flex">
                      <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        className="form-control form-control-sm me-2"
                        style={{ width: '70px' }}
                        onChange={(e) => handleQuantityChange(item.cartID, e.target.value)}
                      />
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => e.preventDefault()}
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td>₹{totalPrice(item)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemove(item.cartID)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn btn-success" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </>
      ) : (
        <div className="alert alert-info">
          Your cart is empty. Browse <a href="/student/marketplace">marketplace</a> to add items!
        </div>
      )}
    </StudentDashboardLayout>
  );
}

export default Cart;
