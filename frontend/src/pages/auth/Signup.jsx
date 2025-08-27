// src/pages/auth/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar.jsx";

export default function Signup() {
  // Get the last user role from localStorage, fallback to "institution"
  const getInitialRole = () => {
    const lastRole = localStorage.getItem("lastUserRole");
    return lastRole &&
      ["institution", "instructor", "student"].includes(lastRole)
      ? lastRole
      : "institution";
  };

  const [role, setRole] = useState(getInitialRole);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Build the base path for API calls
    const base =
      role === "instructor"
        ? "/instructors"
        : role === "student"
        ? "/students"
        : "/institutions";

    try {
      const endpoint = `${base}/register`;
      await api.post(endpoint, form);

      // Clear the stored role since signup was successful
      localStorage.removeItem("lastUserRole");

      setSuccess(
        "🎉 Registration successful! Please log in with your credentials."
      );
      setForm({});

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
              {role.charAt(0).toUpperCase() + role.slice(1)} Registration
            </h2>
            <p className="text-base-content/70">Create your new account</p>
          </div>

          <div className="mb-4 text-center">
            <label className="text-sm mr-2 text-base-content">Role:</label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setForm({});
                setError("");
                setSuccess("");
                // Clear stored role when user manually changes it
                localStorage.removeItem("lastUserRole");
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

          {success && (
            <div className="alert alert-success mb-4">
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Registration fields based on role */}
            {role === "institution" && (
              <>
                <Input
                  name="name"
                  label="Institution Name"
                  value={form.name || ""}
                  onChange={handleChange}
                />
                <Input
                  name="eiin"
                  label="EIIN"
                  value={form.eiin || ""}
                  onChange={handleChange}
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email || ""}
                  onChange={handleChange}
                />
                <Input
                  name="password"
                  label="Password"
                  type="password"
                  value={form.password || ""}
                  onChange={handleChange}
                />
              </>
            )}

            {role === "instructor" && (
              <>
                <Input
                  name="name"
                  label="Full Name"
                  value={form.name || ""}
                  onChange={handleChange}
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email || ""}
                  onChange={handleChange}
                />
                <Input
                  name="password"
                  label="Password"
                  type="password"
                  value={form.password || ""}
                  onChange={handleChange}
                />
              </>
            )}

            {role === "student" && (
              <>
                <Input
                  name="name"
                  label="Full Name"
                  value={form.name || ""}
                  onChange={handleChange}
                />
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email || ""}
                  onChange={handleChange}
                />
                <Input
                  name="password"
                  label="Password"
                  type="password"
                  value={form.password || ""}
                  onChange={handleChange}
                />
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full py-3 font-medium shadow-md hover:shadow-lg"
            >
              Register
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-base-content/70">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-primary hover:text-primary/80 font-medium hover:underline"
              >
                Login here
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
function Input({ name, label, type = "text", onChange, value = "" }) {
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text text-base-content">{label}</span>
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        className="input input-bordered bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
