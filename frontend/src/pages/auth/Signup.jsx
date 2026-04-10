// src/pages/auth/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function Signup() {
  const [showRoleModal, setShowRoleModal] = useState(true);
  const navigate = useNavigate();
  usePageTitle("Sign Up - Join Educational Platform");

  const handleRoleSelect = (role) => {
    setShowRoleModal(false);
    navigate(`/auth/signup/${role}`);
  };

  const handleClose = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Blur */}
      <div className="absolute inset-0">
        <img 
          src="/BlueHomeAbstract.jpg" 
          alt="Background" 
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        
        {/* Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100/95 backdrop-blur-sm rounded-lg shadow-xl max-w-md w-full p-6">
            {/* Close button */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-base-content">
                Sign Up for Educational Platform
              </h1>
              <button
                onClick={handleClose}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>
            
            <p className="text-base-content/70 mb-6">
              Select how you want to register on Atsen
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect("student")}
                className="w-full bg-base-200 hover:bg-base-300 border-2 border-primary/20 hover:border-primary/40 rounded-lg p-4 text-left transition-all duration-200 group"
              >
                <div>
                  <h3 className="text-lg font-semibold text-base-content group-hover:text-primary">
                    Sign up as a Student
                  </h3>
                  <p className="text-base-content/70 text-sm">
                    Access courses, submit assignments, and track your progress
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("instructor")}
                className="w-full bg-base-200 hover:bg-base-300 border-2 border-secondary/20 hover:border-secondary/40 rounded-lg p-4 text-left transition-all duration-200 group"
              >
                <div>
                  <h3 className="text-lg font-semibold text-base-content group-hover:text-secondary">
                    Sign up as an Instructor
                  </h3>
                  <p className="text-base-content/70 text-sm">
                    Create courses, manage students, and evaluate submissions
                  </p>
                </div>
              </button>
            </div>

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
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
