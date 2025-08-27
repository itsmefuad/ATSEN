// frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function ProtectedRoute({
  children,
  requiredRole,
  institutionSlug,
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  // Check role if specified
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/auth/login" replace />;
  }

  // For institution routes, check if user belongs to this institution
  if (
    institutionSlug &&
    user.role === "institution" &&
    user.slug !== institutionSlug
  ) {
    return <Navigate to={`/${user.slug}/dashboard`} replace />;
  }

  return children;
}
