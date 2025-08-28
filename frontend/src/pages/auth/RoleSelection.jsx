// src/pages/auth/RoleSelection.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/auth/signup/${role}`);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div
        className="flex items-center justify-center px-4"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        <div className="max-w-md w-full bg-base-100 shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-base-content mb-2">
              Choose Your Role
            </h2>
            <p className="text-base-content/70">
              Select how you want to register on Atsen
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect("student")}
              className="w-full bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 rounded-lg p-6 text-left transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
                  📚
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700">
                    Sign up as a Student
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Access courses, submit assignments, and track your progress
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect("instructor")}
              className="w-full bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 rounded-lg p-6 text-left transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700">
                    Sign up as an Instructor
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Create courses, manage students, and evaluate submissions
                  </p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center">
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
