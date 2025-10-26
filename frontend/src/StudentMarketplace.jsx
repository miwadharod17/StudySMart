import React, { useState, useEffect } from "react";

function StudentMarketplace() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantities, setQuantities] = useState({}); // track quantity per item
  const [loading, setLoading] = useState(true);

  // Fetch all items from backend on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/items");
        const data = await res.json();
        setItems(data);
        // Initialize quantities with 1
        const initialQuantities = {};
        data.forEach((item) => (initialQuantities[item.itemID] = 1));
        setQuantities(initialQuantities);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching items:", err);
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    // Filter items by title or category
    const filtered = items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setItems(filtered);
  };

  const handleAddToCart = (itemID) => {
    const quantity = quantities[itemID] || 1;
    console.log(`Add to cart: itemID=${itemID}, quantity=${quantity}`);
    // TODO: Integrate with cart API or state
  };

  if (loading) {
    return <div className="text-center py-5">Loading items...</div>;
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-purple">Student Marketplace</h2>

        <form onSubmit={handleSearch} className="d-flex search-form">
          <input
            type="text"
            className="form-control me-3 rounded-pill px-4 py-3 border-purple"
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
            <thead style={{ backgroundColor: "#6f42c1", color: "#fff" }}>
              <tr className="text-center">
                <th>Photo</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price (₹)</th>
                <th>Availability</th>
                <th>Ratings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.itemID} className="text-center">
                  <td>
                    <img
                      src={item.image || "https://via.placeholder.com/80x80?text=No+Image"}
                      alt={item.title}
                      className="rounded"
                      style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    />
                  </td>
                  <td className="fw-semibold">{item.title}</td>
                  <td>{item.category || "-"}</td>
                  <td className="fw-bold text-purple">₹{item.price}</td>
                  <td>
                    {item.availability > 0 ? (
                      <span className="badge bg-success">{item.availability} left</span>
                    ) : (
                      <span className="badge bg-secondary">Out of Stock</span>
                    )}
                  </td>
                  <td>
                    <span className="text-warning fw-bold">{'★'.repeat(item.rating || 0)}</span>
                    <span className="text-muted small"> ({item.reviews || 0})</span>
                  </td>
                  <td>
                    {item.availability > 0 ? (
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <input
                          type="number"
                          value={quantities[item.itemID]}
                          min={1}
                          max={item.availability}
                          className="form-control"
                          style={{ width: "70px" }}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [item.itemID]: parseInt(e.target.value, 10),
                            })
                          }
                        />
                        <button
                          className="btn btn-sm btn-purple fw-semibold"
                          onClick={() => handleAddToCart(item.itemID)}
                        >
                          Add
                        </button>
                      </div>
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
        <div className="alert alert-info text-center mt-5 fw-semibold">
          <b>Sorry! No items available right now. Check back later.</b>
        </div>
      )}
    </div>
  );
}

export default StudentMarketplace;
