import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from './RoleContext.jsx';

export default function ProtectedRoute({ roles = [], children }) {
  const { role } = useRole();
  if (!roles || roles.length === 0) return children;
  if (roles.includes(role)) return children;
  // redirect to root or role-appropriate landing
  return <Navigate to="/" replace />;
}
