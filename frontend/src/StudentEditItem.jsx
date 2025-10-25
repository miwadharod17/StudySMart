import React, { useState, useEffect } from 'react';
import StudentDashboardLayout from './StudentDashboardLayout';
import { useNavigate } from 'react-router-dom';

function StudentEditItem({ itemData }) {
  const [title, setTitle] = useState(itemData?.title || '');
  const [category, setCategory] = useState(itemData?.category || '');
  const [price, setPrice] = useState(itemData?.price || '');
  const [availability, setAvailability] = useState(itemData?.availability || '');

  const navigate = useNavigate();

  const handleUpdate = (e) => {
    e.preventDefault();
    const updatedItem = { title, category, price, availability };
    console.log('Updated Item:', updatedItem);
    // TODO: Call backend API to update the item
    // Example:
    // fetch(`/api/student/items/${itemData.id}`, { method: 'PUT', body: JSON.stringify(updatedItem) })
    //   .then(res => res.json())
    //   .then(() => navigate('/student/my_items'));

    navigate('/student/my_items'); // redirect after update (for now)
  };

  return (
    <StudentDashboardLayout activePage="sell">
      <h4 className="fw-semibold mb-3">Edit Item</h4>

      <form onSubmit={handleUpdate}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <input
            type="text"
            id="category"
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price (₹)</label>
          <input
            type="number"
            step="0.01"
            id="price"
            className="form-control"
            value={price}
            required
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="availability" className="form-label">Availability</label>
          <input
            type="number"
            id="availability"
            className="form-control"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary me-2">Update Item</button>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/student/my_items')}>
          Cancel
        </button>
      </form>
    </StudentDashboardLayout>
  );
}

export default StudentEditItem;
