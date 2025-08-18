import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const RouteGuard = ({ children, requirePrivileged = false, fallbackPath = '/' }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (requirePrivileged) {
      // Check if user is privileged based on role in localStorage
      const role = localStorage.getItem('yuvraj_role') || 'student';
      const isPrivileged = role === 'admin' || role === 'instructor';
      
      if (!isPrivileged) {
        // Redirect non-privileged users
        const institution = localStorage.getItem('yuvraj_institution') || 'Brac University';
        const safePath = `/${institution}/${role}/PollingAndSurvey`;
        navigate(safePath, { replace: true });
      }
    }
  }, [requirePrivileged, navigate, fallbackPath]);

  return children;
};

export default RouteGuard;
