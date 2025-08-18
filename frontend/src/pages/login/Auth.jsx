// src/pages/login/Auth.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../lib/axios";

export default function Auth() {
  const [role, setRole] = useState("institution");
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // If ProtectedRoute redirected us here, it will stash the original path in `location.state.from`
  const fromPath = location.state?.from;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setForm({});
    setError("");
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
      const endpoint = `${base}/${isLogin ? "login" : "register"}`;
      const { data } = await api.post(endpoint, form);

      // If registering, flip back to login with a success message
      if (!isLogin) {
        setIsLogin(true);
        setForm({});
        setError("🎉 Registration successful—please log in.");
        return;
      }

      // Persist auth token & role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      // Determine default path after login
      let defaultPath;
      if (role === "institution") {
        // your backend must return the slug or ID here
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
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {role.charAt(0).toUpperCase() + role.slice(1)}{" "}
          {isLogin ? "Login" : "Register"}
        </h2>

        <div className="mb-4 text-center">
          <label className="text-sm mr-2">Role:</label>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setForm({});
              setError("");
            }}
            className="border p-1 rounded"
          >
            <option value="institution">Institution</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Registration fields */}
          {!isLogin && role === "institution" && (
            <>
              <Input name="name" label="Name" onChange={handleChange} />
              <Input name="eiin" label="EIIN" onChange={handleChange} />
              <Input name="email" label="Email" type="email" onChange={handleChange} />
              <Input name="password" label="Password" type="password" onChange={handleChange} />
            </>
          )}
          {!isLogin && role === "instructor" && (
            <>
              <Input name="instructorId" label="Instructor ID" onChange={handleChange} />
              <Input name="name" label="Name" onChange={handleChange} />
              <Input name="email" label="Email" type="email" onChange={handleChange} />
              <div>
                <label className="block text-sm">
                  Institutions (IDs comma-separated)
                </label>
                <input
                  name="institutions"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      institutions: e.target.value.split(","),
                    })
                  }
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <Input name="password" label="Password" type="password" onChange={handleChange} />
            </>
          )}
          {!isLogin && role === "student" && (
            <>
              <Input name="studentId" label="Student ID" onChange={handleChange} />
              <Input name="name" label="Name" onChange={handleChange} />
              <Input name="email" label="Email" type="email" onChange={handleChange} />
              <Input
                name="institution"
                label="Institution ID"
                onChange={handleChange}
              />
              <Input name="password" label="Password" type="password" onChange={handleChange} />
            </>
          )}

          {/* Login fields */}
          {isLogin && (
            <>
              <Input name="email" label="Email" type="email" onChange={handleChange} />
              <Input name="password" label="Password" type="password" onChange={handleChange} />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "No account?" : "Have an account?"}{" "}
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}

// Extracted Input component to DRY up JSX
function Input({ name, label, type = "text", onChange }) {
  return (
    <div>
      <label className="block text-sm">{label}</label>
      <input
        name={name}
        type={type}
        onChange={onChange}
        required
        className="mt-1 w-full px-3 py-2 border rounded"
      />
    </div>
  );
}