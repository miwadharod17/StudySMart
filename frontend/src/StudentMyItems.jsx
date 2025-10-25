import React, { useState } from "react";

function StudentMyItems() {
  const [items, setItems] = useState([
    { itemID: 1, title: "Calculus Textbook", price: 500, availability: 3, description: "", image: null },
    { itemID: 2, title: "Physics Notes", price: 150, availability: 10, description: "", image: null },
    { itemID: 3, title: "Laptop Charger", price: 1200, availability: 2, description: "", image: null },
    { itemID: 4, title: "USB Drive 32GB", price: 300, availability: 5, description: "", image: null },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    price: "",
    availability: "",
    image: null,
  });

  const handleQuantityChange = (itemID, newQuantity) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.itemID === itemID ? { ...item, availability: newQuantity } : item
      )
    );
  };

  const handlePriceChange = (itemID, newPrice) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.itemID === itemID ? { ...item, price: newPrice } : item))
    );
  };

  const handleDelete = (itemID) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setItems((prevItems) => prevItems.filter((item) => item.itemID !== itemID));
    }
  };

  const handleNewItemChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setNewItem({ ...newItem, image: files[0] });
    } else {
      setNewItem({ ...newItem, [name]: value });
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const nextID = items.length > 0 ? Math.max(...items.map((i) => i.itemID)) + 1 : 1;
    setItems([...items, { ...newItem, itemID: nextID }]);
    setNewItem({ title: "", description: "", price: "", availability: "", image: null });
    setShowModal(false);
  };

  return (
    <div className="container py-2">
      {/* Header with Add Item button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-purple">My Items</h2>
        <button
          className="btn btn-purple fw-bold rounded-pill px-5 py-3"
          style={{ fontSize: "1.2rem", borderRadius: "25px" }}
          onClick={() => setShowModal(true)}
        >
          + Add Item
        </button>
      </div>

      {/* Table */}
      {items.length > 0 ? (
        <div className="table-responsive" style={{ marginTop: "20px" }}>
          <table
            className="table align-middle"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "2px solid #6f42c1",
              fontSize: "1.1rem",
            }}
          >
            <thead style={{ backgroundColor: "#6f42c1", color: "white", fontSize: "1.15rem" }}>
              <tr>
                <th style={tableCellStyle}>Item Name</th>
                <th style={tableCellStyle}>ID</th>
                <th style={tableCellStyle}>Quantity</th>
                <th style={tableCellStyle}>Price (₹)</th>
                <th style={tableCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.itemID}>
                  <td style={tableCellStyle}>{item.title}</td>
                  <td style={tableCellStyle}>{item.itemID}</td>
                  <td style={tableCellStyle}>
                    <input
                      type="number"
                      value={item.availability}
                      min={0}
                      className="form-control"
                      style={{ width: "80px" }}
                      onChange={(e) =>
                        handleQuantityChange(item.itemID, parseInt(e.target.value, 10))
                      }
                    />
                  </td>
                  <td style={{ ...tableCellStyle, color: "#6f42c1", fontWeight: "700" }}>
                    <input
                      type="number"
                      value={item.price}
                      min={0}
                      className="form-control"
                      style={{ width: "100px" }}
                      onChange={(e) =>
                        handlePriceChange(item.itemID, parseInt(e.target.value, 10))
                      }
                    />
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: "center" }}>
                    <button
                      className="btn btn-sm btn-danger fw-bold"
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
      ) : (
        <div
          className="alert alert-info text-center fw-semibold"
          style={{ marginTop: "2rem" }}
        >
          No items listed yet — add some items to sell.
        </div>
      )}

      {/* Modal for adding new item */}
      {showModal && (
  <div
    className="modal-backdrop"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "20px",
      overflowY: "auto",
    }}
  >
    <div
      className="modal-content p-4 p-md-5 rounded"
      style={{
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: "650px",
        borderRadius: "15px",
      }}
    >
      <h4 className="fw-bold text-purple mb-4" style={{ fontSize: "2rem" }}>
        + New Item
      </h4>
      <form onSubmit={handleAddItem}>
        {/* Item Name */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Item Name</label>
          <input
            type="text"
            name="title"
            className="form-control py-2"
            value={newItem.title}
            onChange={handleNewItemChange}
            required
            style={{ fontSize: "1rem" }}
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Description</label>
          <textarea
            name="description"
            className="form-control py-2"
            rows={3}
            value={newItem.description}
            onChange={handleNewItemChange}
            style={{ fontSize: "1rem", resize: "vertical" }}
          />
        </div>

        {/* Price & Quantity */}
        <div className="d-flex flex-column flex-md-row mb-3 gap-3">
          <div className="flex-fill" style={{ minWidth: "120px" }}>
            <label className="form-label fw-semibold">Price (₹)</label>
            <input
              type="number"
              name="price"
              className="form-control py-2"
              value={newItem.price}
              onChange={handleNewItemChange}
              required
              min={0}
              style={{ fontSize: "1rem" }}
            />
          </div>
          <div className="flex-fill" style={{ minWidth: "120px" }}>
            <label className="form-label fw-semibold">Quantity</label>
            <input
              type="number"
              name="availability"
              className="form-control py-2"
              value={newItem.availability}
              onChange={handleNewItemChange}
              required
              min={0}
              style={{ fontSize: "1rem" }}
            />
          </div>
        </div>

        {/* Upload Image */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Upload Image</label>
          <input
            type="file"
            name="image"
            className="form-control"
            accept="image/*"
            onChange={handleNewItemChange}
            style={{ fontSize: "1rem", padding: "6px" }}
          />
        </div>

        {/* Buttons */}
        <div className="d-flex flex-column flex-md-row justify-content-end mt-4 gap-3">
          <button
            type="button"
            className="btn btn-secondary px-4 py-2"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-purple fw-bold px-4 py-2">
            Add Item
          </button>
        </div>
      </form>
    </div>
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

export default StudentMyItems;
