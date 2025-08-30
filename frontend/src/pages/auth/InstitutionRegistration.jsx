// src/pages/auth/InstitutionRegistration.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/axios";
import Navbar from "../../components/Navbar.jsx";
import { CheckCircle } from "lucide-react";

export default function InstitutionRegistration() {
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Check if passwords match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Remove confirmPassword from form data before sending to API
    const { confirmPassword, ...formData } = form;

    try {
      await api.post("/institutions/register", formData);
      setSuccess(
        "Registration requested successfully. Your institution details will be reviewed for approval."
      );
      setForm({});
      setShowSuccessPopup(true);

      // Redirect to homepage after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // Success Popup Component
  const SuccessPopup = () => {
    if (!showSuccessPopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-base-100 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce-in border">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-success mb-4" />
            <h3 className="text-xl font-semibold text-base-content mb-2">
              Registration Requested Successfully!
            </h3>
            <p className="text-base-content/80 mb-4">
              Your institution details will be reviewed for approval. You will receive an email notification once approved.
            </p>
            <p className="text-sm text-base-content/60">
              Redirecting to homepage in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
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
            <p className="text-base-content/70">Request registration for your educational institution</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <p className="text-sm">{error}</p>
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
              className={`btn btn-primary w-full py-3 font-medium shadow-md hover:shadow-lg ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? "Submitting Request..." : "Request for Registration"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-base-content/70">
              Already have an approved account?{" "}
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
      <SuccessPopup />
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
