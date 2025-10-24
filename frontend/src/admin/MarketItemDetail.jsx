import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminDashboard from "../AdminDashboard";

function MarketItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState({
    title: '',
    category: '',
    price: '',
    availability: '',
    vendorID: ''
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/admin/market/items/${itemId}`);
        const data = await res.json();
        setItem({
          title: data.title,
          category: data.category || '',
          price: data.price,
          availability: data.availability,
          vendorID: data.vendorID || ''
        });
      } catch (err) {
        console.error('Error fetching item:', err);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (action) => {
    if (action === 'delete' && !window.confirm('Delete this item?')) return;

    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT';
      const res = await fetch(`/api/admin/market/items/${itemId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        alert(`Item ${action === 'delete' ? 'deleted' : 'updated'} successfully`);
        navigate('/admin/market/items');
      }
    } catch (err) {
      console.error('Error submitting item:', err);
    }
  };

  return (
    <AdminDashboardLayout activePage="market_items">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold text-primary">Item Details</h3>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/admin/market/items')}
        >
          Back
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit('update');
        }}
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              name="title"
              value={item.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-control"
              name="category"
              value={item.category}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              name="price"
              value={item.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Stock</label>
            <input
              type="number"
              className="form-control"
              name="availability"
              value={item.availability}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label">Vendor ID</label>
            <input
              type="number"
              className="form-control"
              name="vendorID"
              value={item.vendorID}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn btn-primary">Update Item</button>
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={() => handleSubmit('delete')}
          >
            Delete Item
          </button>
        </div>
      </form>
    </AdminDashboardLayout>
  );
}

export default MarketItemDetail;
