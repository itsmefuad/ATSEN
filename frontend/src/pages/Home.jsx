// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleSignup = () => {
    navigate("/auth/signup");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        {/* Left Section */}
        <div className="flex-1 pr-8">
          <h1 className="text-4xl font-medium text-gray-800 mb-4">
            Welcome to <span className="text-sky-500">Atsen</span>
          </h1>
          <p className="text-lg text-gray-600">
            Your comprehensive learning management system for institutions, instructors, and students.
          </p>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex justify-center">
          <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100 min-w-80">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Get Started</h2>
              <p className="text-gray-600">Join thousands of learners worldwide</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Login
              </button>
              
              <button
                onClick={handleSignup}
                className="w-full bg-white hover:bg-gray-50 text-sky-500 py-3 px-4 rounded-lg font-medium border-2 border-sky-500 transition-colors duration-200"
              >
                Sign Up
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
