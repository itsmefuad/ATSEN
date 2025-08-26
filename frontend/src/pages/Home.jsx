// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleSignup = () => {
    navigate("/auth/signup");
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-center"
        style={{ 
          backgroundImage: 'url(/BlueHomeAbstract.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%', // Adjust vertical position to show less of top/bottom
        }}
      />
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <div className="flex items-center justify-center px-4" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
            {/* Left Section */}
            <div className={user ? "flex-1" : "flex-1 pr-8"}>
              <h1 className="text-4xl font-medium text-white mb-4">
                Welcome to <span className="text-white font-bold">Atsen</span>
              </h1>
              <p className="text-lg text-gray-200">
                The comprehensive learning management system.
              </p>
              
              {/* Show additional content for logged-in users */}
              {user && (
                <div className="mt-8">
                  <p className="text-white text-xl mb-4">
                    Hello, {user.name || 'User'}! 
                  </p>
                  <button
                    onClick={() => {
                      if (user.role === 'student') navigate('/student/dashboard');
                      else if (user.role === 'institution') navigate(`/${user.slug}/dashboard`);
                      else if (user.role === 'instructor') navigate('/teacher/dashboard');
                    }}
                    className="bg-sky-500 hover:bg-sky-600 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>

            {/* Right Section - Only show for non-logged-in users */}
            {!user && (
              <div className="flex-1 flex justify-center">
                <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-100 min-w-80 backdrop-blur-sm bg-opacity-95">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Get Started</h2>
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
                    
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
