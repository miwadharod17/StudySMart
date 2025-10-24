import React, { useState } from 'react';
import StudentDashboardLayout from '../StudentDashboardLayout';

function Marketplace({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Call backend API with searchQuery
    // Example: fetch(`/api/student/marketplace?q=${searchQuery}`)
    console.log('Search for:', searchQuery);
  };

  const handleAddToCart = (itemID, quantity) => {
    // TODO: Call backend API to add item to cart
    console.log(`Add to cart: itemID=${itemID}, quantity=${quantity}`);
  };

  return (
    <StudentDashboardLayout activePage="marketplace">
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-semibold">Marketplace</h4>

          <form onSubmit={handleSearch} className="d-flex" style={{ width: '300px' }}>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
        </div>

        {items.length > 0 ? (
          <div className="row g-4">
            {items.map((item) => (
              <div key={item.itemID} className="col-md-6">
                <div className="card h-100">
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title">{item.title}</h6>
                    <p className="card-text mb-1">Category: {item.category || 'N/A'}</p>
                    <p className="card-text mb-2 fw-bold">₹{item.price}</p>
                    <p className="card-text mb-2">Available: {item.availability}</p>

                    {item.availability > 0 ? (
                      <div className="mt-auto">
                        <input
                          type="number"
                          defaultValue={1}
                          min={1}
                          max={item.availability}
                          className="form-control mb-2"
                          id={`quantity-${item.itemID}`}
                        />
                        <button
                          className="btn btn-success w-100"
                          onClick={() => {
                            const quantity = parseInt(
                              document.getElementById(`quantity-${item.itemID}`).value,
                              10
                            );
                            handleAddToCart(item.itemID, quantity);
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-secondary w-100 mt-auto" disabled>
                        Out of Stock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-info">No items found.</div>
        )}
      </div>
    </StudentDashboardLayout>
  );
}

export default Marketplace;
