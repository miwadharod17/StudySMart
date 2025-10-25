import React, { useState } from 'react';
import StudentDashboardLayout from './StudentDashboardLayout';

function StudentForumPostDetail({ post }) {
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      content: newComment,
      user: { name: 'You' }, // replace with logged-in user
      timestamp: new Date().toISOString()
    };

    // TODO: Send comment to backend API
    // Example:
    // fetch(`/api/student/forum/${post.postID}/comment`, { method: 'POST', body: JSON.stringify({ content: newComment }) })
    //   .then(res => res.json())
    //   .then(savedComment => setComments([...comments, savedComment]));

    setComments([...comments, commentData]);
    setNewComment('');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <StudentDashboardLayout activePage="forum">
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h4 className="card-title">{post.title}</h4>
          <p className="card-text text-muted">
            by {post.user?.name || 'Anonymous'} • {formatTimestamp(post.timestamp)}
          </p>
        </div>
      </div>

      <h5 className="fw-semibold mb-3">Comments</h5>
      {comments.length > 0 ? (
        comments.map((comment, index) => (
          <div key={index} className="card mb-2">
            <div className="card-body">
              <p>{comment.content}</p>
              <p className="text-muted small mb-0">
                — {comment.user?.name || 'Anonymous'}, {formatTimestamp(comment.timestamp)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="alert alert-light border">No comments yet. Be the first to reply!</div>
      )}

      {/* Add Comment */}
      <form onSubmit={handleAddComment} className="mt-4">
        <div className="mb-3">
          <label className="form-label">Add a Comment</label>
          <textarea
            className="form-control"
            rows="2"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-success">Submit Comment</button>
      </form>
    </StudentDashboardLayout>
  );
}

export default StudentForumPostDetail;
