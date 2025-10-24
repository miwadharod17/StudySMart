import React from 'react';
import StudentDashboardLayout from '../StudentDashboardLayout';

function MyItems({ items }) {
  const handleDelete = (itemID, title) => {
    if (window.confirm(`Delete ${title}?`)) {
      // TODO: Call backend API to delete item
      console.log(`Delete itemID=${itemID}`);
    }
  };

  return (
    <StudentDashboardLayout activePage="my_items">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-semibold">My Items</h4>
        <a href="/student/add_item" className="btn btn-sm btn-success">+ Add Item</a>
      </div>

      {items && items.length > 0 ? (
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.itemID}>
                <td>{item.title}</td>
                <td>{item.category || '-'}</td>
                <td>₹{item.price}</td>
                <td>{item.availability}</td>
                <td>
                  <a href={`/student/edit_item/${item.itemID}`} className="btn btn-sm btn-outline-primary me-2">Edit</a>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(item.itemID, item.title)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="alert alert-info">
          You have not added any items yet. Add items from the <a href="/student/add_item">Add Item</a> page.
        </div>
      )}
    </StudentDashboardLayout>
  );
}

export default MyItems;
