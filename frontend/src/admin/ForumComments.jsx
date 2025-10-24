import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from "../AdminDashboard";

function ForumComments() {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const fetchComments = async (p = 1) => {
    try {
      const res = await fetch(`/api/admin/forum/comments?page=${p}`);
      const data = await res.json();
      setComments(data.items);
      setPage(data.page);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  useEffect(() => {
    fetchComments(page);
  }, [page]);

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await fetch(`/api/admin/forum/comments/${commentId}`, { method: 'DELETE' });
      fetchComments(page);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let p = 1; p <= totalPages; p++) {
      pages.push(
        <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
          <button className="page-link" onClick={() => setPage(p)}>
            {p}
          </button>
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
    <AdminDashboardLayout activePage="forum_comments">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-semibold text-warning">Forum Comments</h3>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/admin')}
        >
          Back to Dashboard
        </button>
      </div>

      {comments.length > 0 ? (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-bordered align-middle">
              <thead className="table-warning">
                <tr>
                  <th>Comment ID</th>
                  <th>Content</th>
                  <th>Post</th>
                  <th>Author</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.map((comment) => (
                  <tr key={comment.commentID}>
                    <td>{comment.commentID}</td>
                    <td className="text-truncate" style={{ maxWidth: '360px' }}>
                      {comment.content}
                    </td>
                    <td>
                      {comment.forum_post ? (
                        <button
                          className="btn btn-link p-0"
                          onClick={() =>
                            navigate(`/admin/forum/post/${comment.forum_post.postID}`)
                          }
                        >
                          {comment.forum_post.title.length > 50
                            ? comment.forum_post.title.slice(0, 50) + '...'
                            : comment.forum_post.title}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{comment.user ? comment.user.name : '—'}</td>
                    <td>{new Date(comment.timestamp).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(comment.commentID)}
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
        <div className="alert alert-info text-center">No comments found.</div>
      )}
    </AdminDashboardLayout>
  );
}

export default ForumComments;
