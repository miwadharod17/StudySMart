import React, { useState, useRef, useEffect } from "react";
import "./index.css";

function QueryComments({ query, isOpen, newComment, setNewComment, handleAddComment }) {
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  useEffect(() => {
    if (isOpen) {
      setMaxHeight(`${contentRef.current.scrollHeight}px`);
    } else {
      setMaxHeight("0px");
    }
  }, [isOpen, query.comments]);

  return (
    <div
      className="card-footer bg-light comment-section"
      style={{
        overflow: "hidden",
        transition: "max-height 0.3s ease, padding 0.3s ease",
        maxHeight: maxHeight,
        paddingTop: isOpen ? "15px" : "0px",
        paddingBottom: isOpen ? "15px" : "0px",
      }}
    >
      <div ref={contentRef}>
        {query.comments.map((c) => (
          <div
            key={c.id}
            className="p-2"
            style={{ borderBottom: "1px solid #6f42c1", marginBottom: "10px" }}
          >
            <strong className="text-purple">{c.author}:</strong> {c.text}
          </div>
        ))}

        <div className="d-flex gap-2 mt-2">
          <input
            type="text"
            className="form-control"
            placeholder="Add a comment..."
            value={newComment || ""}
            onChange={(e) => setNewComment(e.target.value)}
            style={{ borderRadius: "10px" }}
          />
          <button
            className="btn btn-purple"
            style={{ borderRadius: "10px" }}
            onClick={handleAddComment}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}

function StudentForum() {
  const [queries, setQueries] = useState([
    {
      id: 1,
      title: "How to solve integrals in Calculus?",
      likes: 12,
      comments: [
        { id: 1, author: "Alice", text: "Try using substitution method." },
        { id: 2, author: "Bob", text: "Integration by parts works here." },
        { id: 3, author: "Eve", text: "Don’t forget about definite integrals too!" },
      ],
    },
    {
      id: 2,
      title: "Tips for preparing Physics midterms?",
      likes: 8,
      comments: [
        { id: 1, author: "Charlie", text: "Solve previous years’ papers." },
        { id: 2, author: "Dave", text: "Focus on conceptual understanding." },
        { id: 3, author: "Fiona", text: "Make a formula sheet for quick revision." },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [openQuery, setOpenQuery] = useState(null);
  const [newComments, setNewComments] = useState({});
  const [showPostBox, setShowPostBox] = useState(false);
  const [newQueryTitle, setNewQueryTitle] = useState("");

  const filteredQueries = queries.filter((q) =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleQuery = (id) => {
    setOpenQuery(openQuery === id ? null : id);
  };

  const handleAddComment = (queryId) => {
    const commentText = newComments[queryId];
    if (!commentText || commentText.trim() === "") return;

    setQueries((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? {
              ...q,
              comments: [
                ...q.comments,
                { id: q.comments.length + 1, author: "You", text: commentText },
              ],
            }
          : q
      )
    );

    setNewComments({ ...newComments, [queryId]: "" });
  };

  const handlePostQuery = () => {
    if (newQueryTitle.trim() === "") return;
    const nextId = queries.length + 1;
    setQueries([...queries, { id: nextId, title: newQueryTitle, likes: 0, comments: [] }]);
    setNewQueryTitle("");
    setShowPostBox(false);
  };

  const handleLike = (queryId) => {
    setQueries((prev) =>
      prev.map((q) => (q.id === queryId ? { ...q, likes: q.likes + 1 } : q))
    );
  };

  return (
    <div className="container py-4 position-relative">
      <h2 className="fw-bold text-purple mb-3"> Student Forum</h2>

      {/* Search and Post Query */}
      <div className="d-flex align-items-center mb-4 flex-wrap gap-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flexGrow: 1, minWidth: "200px", padding: "10px 15px" }}
        />
        <button
          className="btn btn-purple fw-bold"
          style={{ fontSize: "1.2rem", padding: "12px 30px", borderRadius: "25px" }}
          onClick={() => setShowPostBox(true)}
        >
          Post a Query
        </button>
      </div>

      {/* Post Query Modal */}
      {showPostBox && (
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
            backdropFilter: "blur(4px)",
            padding: "10px",
            overflowY: "auto",
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#fff",
              width: "100%",
              maxWidth: "900px",
              maxHeight: "90vh",
              padding: "20px",
              borderRadius: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <h4 className="text-purple mb-2">Post a New Query</h4>
            <textarea
              className="form-control"
              placeholder="Write your query here..."
              value={newQueryTitle}
              onChange={(e) => setNewQueryTitle(e.target.value)}
              style={{
                fontSize: "1rem",
                resize: "none",
                padding: "15px",
                width: "100%",
                minHeight: "120px",
                maxHeight: "50vh",
                borderRadius: "15px",
                border: "1px solid #6f42c1",
              }}
            />
            <div className="d-flex justify-content-end gap-3 flex-wrap">
              <button
                className="btn btn-secondary px-5 py-3"
                onClick={() => setShowPostBox(false)}
                style={{ borderRadius: "15px", fontSize: "1.1rem" }}
              >
                Cancel
              </button>
              <button
                className="btn btn-purple fw-bold px-5 py-3"
                style={{ borderRadius: "25px", fontSize: "1.1rem" }}
                onClick={handlePostQuery}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Queries */}
      {filteredQueries.length === 0 && (
        <div className="alert alert-info text-center">No queries found.</div>
      )}

      {/* Query List */}
      {filteredQueries.map((q) => (
        <div
          key={q.id}
          className="card border-purple"
          style={{
            borderRadius: "10px",
            padding: "15px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div className="card-body d-flex justify-content-between align-items-center">
            <h5 className="card-title text-purple mb-0">{q.title}</h5>
            {/* Like & Comment Buttons side by side */}
            <div className="d-flex gap-2" style={{ flexWrap: "nowrap" }}>
              <button className="btn btn-heart" style={{ padding: "8px 15px" }} onClick={() => handleLike(q.id)}>
                ❤️ {q.likes}
              </button>
              <button
                className="btn btn-purple"
                style={{ borderRadius: "15px", padding: "8px 15px" }}
                onClick={() => toggleQuery(q.id)}
              >
                💬 Comment
              </button>
            </div>
          </div>

          <QueryComments
            query={q}
            isOpen={openQuery === q.id}
            newComment={newComments[q.id]}
            setNewComment={(val) => setNewComments({ ...newComments, [q.id]: val })}
            handleAddComment={() => handleAddComment(q.id)}
          />
        </div>
      ))}
    </div>
  );
}

export default StudentForum;
