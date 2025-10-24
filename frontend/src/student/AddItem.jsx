import React, { useState } from 'react';
import StudentDashboardLayout from '../StudentDashboardLayout'; // adjust path

function AddItem() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    console.log({ title, price, category, availability });
    // TODO: Call backend API to add item
    // Example:
    // fetch('/api/student/add_item', { method: 'POST', body: JSON.stringify({ title, price, category, availability }) })
  };

  return (
    <StudentDashboardLayout activePage="add_item">
      <h4 className="fw-semibold mb-3">Add an Item to Sell</h4>

      <form onSubmit={handleAddItem}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Item Title</label>
            <input
              type="text"
              name="title"
              className="form-control"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              className="form-control"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Category</label>
            <input
              type="text"
              name="category"
              className="form-control"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Availability (Stock)</label>
            <input
              type="number"
              name="availability"
              min="0"
              className="form-control"
              required
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="btn btn-success">Add Item</button>
        </div>
      </form>
    </StudentDashboardLayout>
  );
}

export default AddItem;
