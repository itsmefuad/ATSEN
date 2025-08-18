import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { yuvrajGetRole, yuvrajIsPrivileged } from '../services/yuvraj_announcements.js';

const RouteGuard = ({ children, requirePrivileged = false, fallbackPath = '/' }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (requirePrivileged && !yuvrajIsPrivileged()) {
      // Redirect non-privileged users
      const role = yuvrajGetRole();
      const institution = localStorage.getItem('yuvraj_institution') || 'Brac University';
      const safePath = `/${institution}/${role}/PollingAndSurvey`;
      navigate(safePath, { replace: true });
    }
  }, [requirePrivileged, navigate, fallbackPath]);

  return children;
};

export default RouteGuard;
