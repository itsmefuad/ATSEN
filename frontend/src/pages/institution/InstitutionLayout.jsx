// frontend/src/pages/institution/InstitutionLayout.jsx
import React, { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate, Link } from "react-router";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function InstitutionLayout() {
  const { idOrName } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [instName, setInstName] = useState("");

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!idOrName) return;
    fetch(
      `http://localhost:5001/api/institutions/${encodeURIComponent(
        idOrName
      )}/dashboard`
    )
      .then((res) => res.json())
      .then((json) => setInstName(json.name))
      .catch((err) => console.error("Failed to load institution name:", err));
  }, [idOrName]);

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Top Bar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e5e5e5",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", margin: 0 }}>{user?.name || instName}</h1>
            <span style={{ fontSize: "0.9rem", color: "#666" }}>
              Institution Control Panel
            </span>
          </div>
          <Link
            to={`/${idOrName}/dashboard`}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#2563eb",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "0.9rem",
              fontWeight: "500"
            }}
          >
            🏠 Home
          </Link>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {/* Main content */}
      <main style={{ padding: "2rem" }}>
        <Outlet />
      </main>
    </div>
  );
}