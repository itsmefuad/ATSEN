// frontend/src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme synchronously to avoid flash
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
  const [clickCount, setClickCount] = useState(0);
  const [clickTimer, setClickTimer] = useState(null);

  useEffect(() => {
    // Apply theme to document on mount and changes
    const theme = isDarkMode ? "dim" : "nord";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (clickTimer) {
        clearTimeout(clickTimer);
      }
    };
  }, [clickTimer]);

  // Keyboard easter egg: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        
        // Show easter egg message
        const easterEggMessage = document.createElement('div');
        easterEggMessage.innerHTML = '🔑 Admin Access Activated! 🔑';
        easterEggMessage.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 20px 40px;
          border-radius: 20px;
          font-size: 18px;
          font-weight: bold;
          z-index: 9999;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          animation: slideIn 0.5s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
          @keyframes slideIn {
            0% { opacity: 0; transform: translate(-50%, -50%) translateY(-50px); }
            100% { opacity: 1; transform: translate(-50%, -50%) translateY(0); }
          }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(easterEggMessage);
        
        // Navigate to admin login
        setTimeout(() => {
          window.location.href = '/admin/login';
        }, 500);
        
        // Cleanup
        setTimeout(() => {
          if (easterEggMessage.parentNode) {
            easterEggMessage.parentNode.removeChild(easterEggMessage);
          }
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        }, 1000);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
    
    // Easter egg logic
    const newCount = clickCount + 1;
    
    // Clear existing timer
    if (clickTimer) {
      clearTimeout(clickTimer);
    }
    
    // Set new timer to reset count after 3 seconds
    const timer = setTimeout(() => {
      setClickCount(0);
    }, 3000);
    
    setClickTimer(timer);
    setClickCount(newCount);
    
    // Easter egg trigger - 5 clicks
    if (newCount >= 10) {
      setClickCount(0);
      clearTimeout(timer);
      
      // Navigate to admin login page silently
      window.location.href = '/admin/login';
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? "dim" : "nord",
    clickCount, // Expose click count for easter egg visual feedback
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
