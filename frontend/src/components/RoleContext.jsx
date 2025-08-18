import React, { createContext, useContext, useEffect, useState } from 'react';

const RoleContext = createContext(null);

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem('yuvraj_role') || 'student'; } catch (e) { return 'student'; }
  });
  const [institution, setInstitution] = useState(() => {
    try { return localStorage.getItem('yuvraj_institution') || 'Brac University'; } catch (e) { return 'Brac University'; }
  });

  useEffect(() => {
    try { localStorage.setItem('yuvraj_role', role); } catch (e) {}
  }, [role]);

  useEffect(() => {
  try { localStorage.setItem('yuvraj_institution', institution); } catch (e) {}
  }, [institution]);

  return (
    <RoleContext.Provider value={{ role, setRole, institution, setInstitution }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

export default RoleContext;

// non-hook helper for plain modules to read institution header
export function getInstitutionHeader() {
  try { const inst = localStorage.getItem('yuvraj_institution'); if (inst) return { 'x-institution-id': inst }; } catch (e) {}
  return {};
}
