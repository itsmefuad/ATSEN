import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, User, Trophy, Moon, Sun } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
    setIsDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/";

    switch (user.role) {
      case "institution":
        return `/${user.slug}/dashboard`;
      case "instructor":
        return "/teacher/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  const getUserDisplayText = () => {
    if (!user) return "";

    switch (user.role) {
      case "institution":
        return user.name || "Institution";
      case "instructor":
        return "Instructor";
      case "student":
        return "Student";
      default:
        return "";
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-base-100 border-b border-base-300 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Logo and User Info */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link to="/">
            <img
              src="/Atsenlogo.png"
              alt="ATSEN"
              className="h-8 w-auto cursor-pointer"
            />
          </Link>

          {/* Divider and User Info - only show when logged in */}
          {user && (
            <>
              <div className="text-base-content/40 text-xl font-light">|</div>
              <Link
                to={getDashboardLink()}
                className="text-base-content hover:text-primary font-medium transition-colors duration-200"
              >
                {getUserDisplayText()}
              </Link>
            </>
          )}
        </div>

        {/* Right side - Theme Toggle and User Dropdown or Login/Signup buttons */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 text-base-content hover:text-primary transition-colors duration-200 rounded-md hover:bg-base-200"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {user ? (
            // Logged in user dropdown
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-base-content hover:text-primary transition-colors duration-200 p-2 rounded-md hover:bg-base-200"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-content font-medium text-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                  {user.email || 'User Account'}
                </div>
                
                {/* Profile option for students */}
                {user.role === "student" && (
                  <>
                    <Link
                      to="/student/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    
                    <Link
                      to="/my-progress"
                      onClick={() => setIsDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Trophy className="h-4 w-4" />
                      <span>My Progress</span>
                    </Link>
                  </>
                )}
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          // Not logged in - show login/signup buttons
          <div className="flex items-center space-x-3">
            <Link
              to="/auth/login"
              className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              Login
            </Link>
            <Link
              to="/auth/signup"
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
