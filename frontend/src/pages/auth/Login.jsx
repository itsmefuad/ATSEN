// src/pages/auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar.jsx";

export default function Login() {
  const [role, setRole] = useState("institution");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If ProtectedRoute redirected us here, it will stash the original path in `location.state.from`
  const fromPath = location.state?.from;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Build the base path for API calls
    const base =
      role === "instructor"
        ? "/instructors"
        : role === "student"
        ? "/students"
        : "/institutions";

    try {
      const endpoint = `${base}/login`;
      const { data } = await api.post(endpoint, form);

      // Create user object with role and data
      const userData = {
        role,
        ...(role === "institution"
          ? data.institution
          : role === "instructor"
          ? data.instructor
          : data.student),
      };

      // Use AuthContext login
      login(data.token, userData);

      // Determine default path after login
      let defaultPath;
      if (role === "institution") {
        defaultPath = `/${data.institution.slug}/dashboard`;
      } else if (role === "instructor") {
        defaultPath = "/teacher/dashboard";
      } else {
        defaultPath = "/student/dashboard";
      }

      // If someone was trying to hit a protected URL, use that; otherwise use our default
      const redirectTo = fromPath || defaultPath;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div
        className="flex items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="max-w-md w-full bg-base-100 shadow-lg rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-base-content mb-2">
              {role.charAt(0).toUpperCase() + role.slice(1)} Login
            </h2>
            <p className="text-base-content/70">Sign in to your account</p>
          </div>

          <div className="mb-4 text-center">
            <label className="text-sm mr-2 text-base-content">Role:</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setForm({});
                setError("");
              }}
              className="select select-bordered bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="institution">Institution</option>
              <option value="instructor">Instructor</option>
              <option value="student">Student</option>
            </select>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              label="Email"
              type="email"
              onChange={handleChange}
            />
            <Input
              name="password"
              label="Password"
              type="password"
              onChange={handleChange}
            />

            <button
              type="submit"
              className="btn btn-primary w-full py-3 font-medium shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-base-content/70">
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="text-primary hover:text-primary/80 font-medium hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Extracted Input component
function Input({ name, label, type = "text", onChange }) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text text-base-content">{label}</span>
      </label>
      <input
        name={name}
        type={type}
        onChange={onChange}
        required
        className="input input-bordered bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
