// frontend/src/pages/institution/InstitutionLayout.jsx
import React, { useEffect, useState } from "react";
import { useParams, Outlet } from "react-router";

export default function InstitutionLayout() {
  const { idOrName } = useParams();
  const [instName, setInstName] = useState("");

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
          flexDirection: "column",     // stack items vertically
          alignItems: "flex-start",    // align to left
          padding: "1rem 2rem",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e5e5e5",
          gap: "0.25rem",               // small gap between lines
        }}
      >
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>{instName}</h1>
        <span style={{ fontSize: "0.9rem", color: "#666" }}>
          Admin Control
        </span>
      </header>

      {/* Main content */}
      <main style={{ padding: "2rem" }}>
        <Outlet />
      </main>
    </div>
  );
}