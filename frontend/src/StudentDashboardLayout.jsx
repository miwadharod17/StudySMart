import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";

function StudentDashboardLayout({ currentUser = { name: "Student" } }) {
  const location = useLocation();

  const navLinks = [
    { name: "Marketplace", path: "marketplace", key: "marketplace" },
    { name: "My Items", path: "myitems", key: "myitems" },
    { name: "My Cart", path: "cart", key: "cart" },
    { name: "My Orders", path: "orders", key: "orders" },
    { name: "Forum", path: "forum", key: "forum" },
  ];

  // ✅ FIXED active link detection
  const isActive = (path) => location.pathname.startsWith(`/student/${path}`);

  // Hide welcome message for all feature pages
  const featurePaths = navLinks.map((link) => `/student/${link.path}`);
  const showWelcome = !featurePaths.some((path) => location.pathname.startsWith(path));

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          height: "100vh",
          width: "240px",
          backgroundColor: "#fff",
          borderRight: "4px solid #6f42c1",
          display: "flex",
          flexDirection: "column",
          paddingTop: "1rem",
        }}
      >
        <div
          style={{
            margin: "0 12px 1rem 12px",
            padding: "8px",
            border: "2px solid #6f42c1",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h5 style={{ color: "#6f42c1", fontWeight: "700", margin: 0 }}>
            Student Panel
          </h5>
        </div>

        {navLinks.map((link) => (
          <Link
            key={link.key}
            to={link.path}
            style={{
              color: "#6f42c1",
              margin: "6px 12px",
              borderRadius: "8px",
              padding: "10px 12px",
              fontWeight: "700",
              fontSize: "1.05rem",
              backgroundColor: isActive(link.path) ? "#d3b3ff" : "transparent",
              textDecoration: "none",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#e6ccff")}
            onMouseOut={(e) =>
              (e.target.style.backgroundColor = isActive(link.path)
                ? "#d3b3ff"
                : "transparent")
            }
          >
            {link.name}
          </Link>
        ))}

        <Link
          to="/StudentLogin"
          style={{
            color: "red",
            marginTop: "auto",
            marginLeft: "12px",
            padding: "8px 12px",
            borderRadius: "8px",
            textDecoration: "none",
          }}
        >
          Logout
        </Link>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "2rem" }}>
        {/* Show welcome only if NOT on a feature page */}
        {showWelcome && (
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{ color: "#6f42c1", fontWeight: "700", fontSize: "2rem" }}>
              Welcome, {currentUser.name} 👋
            </h2>
            <p
              style={{
                color: "#9d4edd",
                fontWeight: "700",
                fontSize: "1.1rem",
                margin: 0,
              }}
            >
              Use the sidebar to navigate between marketplace and forum features.
            </p>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}

export default StudentDashboardLayout;
