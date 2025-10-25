import React, { useState } from 'react';

function StudentMarketplace({ initialItems }) {
  const [items, setItems] = useState(initialItems || []);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search for:', searchQuery);
  };

  const handleAddToCart = (itemID, quantity) => {
    console.log(`Add to cart: itemID=${itemID}, quantity=${quantity}`);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-purple">Student Marketplace</h2>

        <form onSubmit={handleSearch} className="d-flex search-form">
          <input
            type="text"
            className="form-control me-3 rounded-pill px-4 py-3 border-purple search-input"
            placeholder="Search for books, notes, gadgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-purple rounded-pill px-5 fw-semibold fs-5" type="submit">
            Search
          </button>
        </form>
      </div>

      {/* Items Table */}
      {items.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover align-middle shadow-sm border">
            <thead className="table-purple text-white">
              <tr>
                <th className="fw-bold">Photo</th>
                <th className="fw-bold">Title</th>
                <th className="fw-bold">Category</th>
                <th className="fw-bold">Price (₹)</th>
                <th className="fw-bold">Availability</th>
                <th className="fw-bold">Ratings</th>
                <th className="fw-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.itemID}>
                  <td>
                    <img
                      src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                      alt={item.title}
                      className="rounded"
                      style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    />
                  </td>
                  <td className="fw-semibold">{item.title}</td>
                  <td>{item.category || '-'}</td>
                  <td className="fw-bold text-purple">₹{item.price}</td>
                  <td>
                    {item.availability > 0 ? (
                      <span className="badge bg-success">{item.availability} left</span>
                    ) : (
                      <span className="badge bg-secondary">Out of Stock</span>
                    )}
                  </td>
                  <td>
                    <span className="text-warning fw-bold">
                      {'★'.repeat(item.rating || 0)}
                    </span>
                    <span className="text-muted small"> ({item.reviews || 0})</span>
                  </td>
                  <td className="text-center">
                    {item.availability > 0 ? (
                      <>
                        <input
                          type="number"
                          defaultValue={1}
                          min={1}
                          max={item.availability}
                          className="form-control d-inline-block me-2"
                          style={{ width: '70px' }}
                          id={`quantity-${item.itemID}`}
                        />
                        <button
                          className="btn btn-sm btn-purple fw-semibold"
                          onClick={() => {
                            const quantity = parseInt(
                              document.getElementById(`quantity-${item.itemID}`).value,
                              10
                            );
                            handleAddToCart(item.itemID, quantity);
                          }}
                        >
                          Add
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-secondary" disabled>
                        N/A
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info text-center mt-5 fw-semibold" style={{ marginTop: '3rem' }}>
          
  <b>Sorry No items found ! Please try adjusting your search or check back later for new products.</b>
</div>

      )}
    </div>
  );
}

export default StudentMarketplace;
