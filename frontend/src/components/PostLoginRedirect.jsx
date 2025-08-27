// components/PostLoginRedirect.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PostLoginRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're on the login page and user is authenticated
    if (!loading && user && location.pathname === "/auth/login") {
      let defaultPath;
      switch (user.role) {
        case "institution":
          defaultPath = `/${user.slug}/dashboard`;
          break;
        case "instructor":
          defaultPath = "/teacher/dashboard";
          break;
        case "student":
          defaultPath = "/student/dashboard";
          break;
        default:
          defaultPath = "/";
      }

      navigate(defaultPath, { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return children;
};

export default PostLoginRedirect;
