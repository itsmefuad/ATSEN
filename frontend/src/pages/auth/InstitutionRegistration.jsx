// src/pages/auth/InstitutionRegistration.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar.jsx";

export default function InstitutionRegistration() {
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

    // Check if passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Remove confirmPassword from form data before sending to API
    const { confirmPassword, ...formData } = form;

    try {
      await api.post("/institutions/register", formData);
      setSuccess(
        "Institution registration successful! Please log in with your credentials."
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
        className="flex items-center justify-center px-4 py-8"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="max-w-md w-full bg-base-100 shadow-lg rounded-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-base-content mb-2">
              Institution Registration
            </h2>
            <p className="text-base-content/70">Register your educational institution</p>
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
            <Input
              name="name"
              label="Institution Name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="e.g., ABC University"
            />
            <Input
              name="eiin"
              label="EIIN (Educational Institution Identification Number)"
              value={form.eiin || ""}
              onChange={handleChange}
              placeholder="e.g., 123456"
            />
            <Input
              name="email"
              label="Official Email"
              type="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="e.g., admin@abcuniversity.edu"
            />
            <Input
              name="phone"
              label="Phone Number"
              type="tel"
              value={form.phone || ""}
              onChange={handleChange}
              placeholder="e.g., +880-1234-567890"
            />
            <Input
              name="address"
              label="Address"
              value={form.address || ""}
              onChange={handleChange}
              placeholder="Full institutional address"
            />
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base-content">Description (Optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Brief description about your institution"
                className="textarea textarea-bordered bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
                rows="3"
              />
            </div>
            <Input
              name="password"
              label="Password"
              type="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Create a strong password"
            />
            <Input
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={form.confirmPassword || ""}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />

            <button
              type="submit"
              className="btn btn-primary w-full py-3 font-medium shadow-md hover:shadow-lg"
            >
              Register Institution
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
function Input({ name, label, type = "text", onChange, value = "", placeholder = "" }) {
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
        placeholder={placeholder}
        required
        className="input input-bordered bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  );
}
