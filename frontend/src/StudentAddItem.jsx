import React, { useState, useEffect } from 'react';
import StudentDashboardLayout from './StudentDashboardLayout'; // adjust path as needed

function StudentAddItem() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [image, setImage] = useState(null);

  const studentID = localStorage.getItem("studentID"); // get logged-in student ID

  // ✅ Reusable fetch function
  const fetchItems = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/items/student/${studentID}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  // Fetch student items when component mounts or studentID changes
  useEffect(() => {
    if (studentID) fetchItems();
  }, [studentID]);

  // ✅ Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();

    if (!studentID) {
      alert("Student ID not found. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("availability", availability);
    if (image) formData.append("image", image);

    try {
      const res = await fetch(`http://127.0.0.1:5000/items/student/${studentID}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        // ✅ Refresh list from backend to show latest data
        await fetchItems();

        // Reset form fields
        setTitle('');
        setPrice('');
        setCategory('');
        setAvailability('');
        setImage(null);

        alert("Item added successfully!");
      } else {
        alert(data.error || "Failed to add item.");
      }
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item.");
    }
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
              min="0"
              className="form-control"
              required
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
            />
          </div>

          <div className="col-md-12">
            <label className="form-label">Upload Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
        </div>

        <div className="mt-3">
          <button type="submit" className="btn btn-success">Add Item</button>
        </div>
      </form>

      {/* ✅ Display student's current items */}
      {items.length > 0 && (
        <div className="mt-5">
          <h5 className="fw-semibold">Your Listed Items</h5>
          <ul className="list-group">
            {items.map((item) => (
              <li
                key={item.itemID}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{item.title}</strong> — ₹{item.price} ({item.availability} in stock)
                  <br />
                  <small className="text-muted">Category: {item.category || 'N/A'}</small>
                </div>

                {item.image && (
                  <img
                    src={`http://127.0.0.1:5000${item.image}`}
                    alt={item.title}
                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </StudentDashboardLayout>
  );
}

export default StudentAddItem;
