import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";

export default function Auth() {
  const [role, setRole] = useState("institution");
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setForm({});
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const path =
      role === "instructor"
        ? "/instructors"
        : role === "student"
        ? "/students"
        : "/institutions";

    try {
      const endpoint = `${path}/${isLogin ? "login" : "register"}`;
      const { data } = await api.post(endpoint, form);

      if (!isLogin) {
        // after register, go back to login
        setIsLogin(true);
        setForm({});
        setError("Registration successful — please log in");
        return;
      }

      // login flow
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      if (role === "institution") navigate("/institution/dashboard");
      if (role === "instructor") navigate("/teacher/dashboard");
      if (role === "student") navigate("/student/dashboard");
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
          {/* Institution Registration */}
          {!isLogin && role === "institution" && (
            <>
              <div>
                <label className="block text-sm">Name</label>
                <input
                  name="name"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">EIIN</label>
                <input
                  name="eiin"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Password</label>
                <input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
            </>
          )}

          {/* Instructor Registration */}
          {!isLogin && role === "instructor" && (
            <>
              <div>
                <label className="block text-sm">Instructor ID</label>
                <input
                  name="instructorId"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Name</label>
                <input
                  name="name"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
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
              <div>
                <label className="block text-sm">Password</label>
                <input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
            </>
          )}

          {/* Student Registration */}
          {!isLogin && role === "student" && (
            <>
              <div>
                <label className="block text-sm">Student ID</label>
                <input
                  name="studentId"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Name</label>
                <input
                  name="name"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Institution ID</label>
                <input
                  name="institution"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Password</label>
                <input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
            </>
          )}

          {/* Login Form */}
          {isLogin && (
            <>
              <div>
                <label className="block text-sm">Email</label>
                <input
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm">Password</label>
                <input
                  name="password"
                  type="password"
                  onChange={handleChange}
                  required
                  className="mt-1 w-full px-3 py-2 border rounded"
                />
              </div>
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