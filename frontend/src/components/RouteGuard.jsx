import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useRole } from './RoleContext.jsx';

const RouteGuard = ({ children, requirePrivileged = false, fallbackPath = '/' }) => {
  const navigate = useNavigate();

  const { role, institution } = useRole();

  useEffect(() => {
    if (requirePrivileged) {
      const isPrivileged = role === 'admin' || role === 'instructor';
      if (!isPrivileged) {
        const inst = institution || 'Brac University';
  // ...existing code...
        navigate(safePath, { replace: true });
      }
    }
  }, [requirePrivileged, navigate, role, institution]);

  return children;
};

export default RouteGuard;
