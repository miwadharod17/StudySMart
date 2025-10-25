import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from "./AdminDashboard";

function AdminForumPosts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchPosts = async (p = 1) => {
    try {
      const res = await fetch(`/api/admin/forum/posts?page=${p}`);
      const data = await res.json();
      setPosts(data.items);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleDelete = async (postId, title) => {
    if (!window.confirm(`Delete post "${title}"? This will remove all its comments.`)) return;
    try {
      await fetch(`/api/admin/forum/posts/${postId}`, { method: 'DELETE' });
      fetchPosts(page);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      pages.push(
        <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
          <button className="page-link" onClick={() => setPage(p)}>{p}</button>
        </li>
      );
    }

    return (
      <ul className="pagination justify-content-center">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
        </li>
        {pages}
        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
        </li>
      </ul>
    );
  };

  return (
    <AdminDashboardLayout activePage="forum_posts">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold text-info">Forum Posts</h3>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
        </button>
      </div>

      {posts.length > 0 ? (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle">
              <thead className="table-info">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Comments</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.postID}>
                    <td>{post.postID}</td>
                    <td className="text-truncate" style={{ maxWidth: '320px' }}>
                      {post.title}
                    </td>
                    <td>{post.user ? post.user.name : '—'}</td>
                    <td>{post.comments.length}</td>
                    <td>{new Date(post.timestamp).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => navigate(`/admin/forum/post/${post.postID}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(post.postID, post.title)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="alert alert-info text-center">No forum posts found.</div>
      )}
    </AdminDashboardLayout>
  );
}

export default AdminForumPosts;
