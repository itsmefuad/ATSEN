// frontend/src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ProtectedRoute({ children, requiredRole, institutionSlug }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role if specified
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // For institution routes, check if user belongs to this institution
  if (institutionSlug && user.role === 'institution' && user.slug !== institutionSlug) {
    return <Navigate to={`/${user.slug}/dashboard`} replace />;
  }

  return children;
}