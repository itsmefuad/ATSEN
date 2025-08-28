// src/pages/auth/Signup.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  // Redirect to role selection page
  React.useEffect(() => {
    navigate("/auth/signup/role-selection", { replace: true });
  }, [navigate]);

  
  return null; // This component just redirects, no UI needed
}
