// frontend/src/pages/institution/InstitutionLayout.jsx
import React, { useEffect, useState } from "react";
import { useParams, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Navbar from "../../components/Navbar.jsx";
import api from "../../lib/axios.js";

export default function InstitutionLayout() {
  const { idOrName } = useParams();
  const { user } = useAuth();
  const [instName, setInstName] = useState("");

  useEffect(() => {
    if (!idOrName) return;
    api.get(`/institutions/${encodeURIComponent(idOrName)}/dashboard`)
      .then((response) => setInstName(response.data.name))
      .catch((err) => console.error("Failed to load institution name:", err));
  }, [idOrName]);

  return (
    <div className="min-h-screen bg-base-200">
      {/* Use unified navbar */}
      <Navbar />

      {/* Main content */}
      <main className="px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
