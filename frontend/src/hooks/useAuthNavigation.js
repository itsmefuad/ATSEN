// hooks/useAuthNavigation.js
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const useAuthNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigateAfterAuth = (redirectTo, options = {}) => {
    // Double-check that user is available before navigation
    const checkAndNavigate = () => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");

      if (currentUser) {
        navigate(redirectTo, { replace: true, ...options });
        return true;
      }
      return false;
    };

    // Try immediate navigation
    if (checkAndNavigate()) return;

    // If user not available, wait for next render cycle
    requestAnimationFrame(() => {
      if (checkAndNavigate()) return;

      // Last resort: wait a bit more
      setTimeout(() => {
        checkAndNavigate();
      }, 50);
    });
  };

  return { navigateAfterAuth };
};
