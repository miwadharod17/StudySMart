import React, { useState } from 'react';
import StudentDashboardLayout from '../StudentDashboardLayout';
import { Link } from 'react-router-dom'; // for navigation if using React Router

function Forum({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [newPostTitle, setNewPostTitle] = useState('');

  const handleAddPost = (e) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    const postData = {
      postID: Date.now(), // temporary ID; backend should return real ID
      title: newPostTitle,
      user: { name: 'You' }, // replace with logged-in user
      timestamp: new Date().toISOString(),
      comments: []
    };

    // TODO: Send new post to backend API
    // Example:
    // fetch('/api/student/forum', { method: 'POST', body: JSON.stringify({ title: newPostTitle }) })
    //   .then(res => res.json())
    //   .then(savedPost => setPosts([savedPost, ...posts]));

    setPosts([postData, ...posts]);
    setNewPostTitle('');
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
      <h4 className="fw-semibold mb-3">Forum</h4>

      {/* Add New Post */}
      <form onSubmit={handleAddPost} className="mb-4">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Start a new discussion..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-success">Post</button>
        </div>
      </form>

      {/* Posts List */}
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.postID} className="card mb-3 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">
                {/* Replace Link with <a> if not using React Router */}
                <Link to={`/student/forum/${post.postID}`}>{post.title}</Link>
              </h5>
              <p className="card-text text-muted small">
                by {post.user?.name || 'Anonymous'} • {formatTimestamp(post.timestamp)}
              </p>
              <Link
                to={`/student/forum/${post.postID}`}
                className="btn btn-outline-primary btn-sm"
              >
                View Comments ({post.comments?.length || 0})
              </Link>
            </div>
          </div>
        ))
      ) : (
        <div className="alert alert-info">No posts yet. Start the conversation!</div>
      )}
    </StudentDashboardLayout>
  );
}

export default Forum;
