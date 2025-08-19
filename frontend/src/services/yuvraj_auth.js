// Yuvraj Authentication Service - Simplified for MongoDB Atlas usage
// No local storage, just basic role and institution management

const ROLE_KEY = "yuvraj_role";

export function yuvrajGetRole() {
  try {
    const role = localStorage.getItem(ROLE_KEY);
    return role || 'admin'; // Default to admin if no role set
  } catch (error) {
    return 'admin';
  }
}

export function yuvrajSetRole(role) {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch (error) {
    console.error('Failed to set role:', error);
  }
}

export function yuvrajIsPrivileged() {
  const role = yuvrajGetRole();
  return role === 'admin' || role === 'instructor';
}

export function yuvrajIsAdmin() {
  const role = yuvrajGetRole();
  return role === 'admin';
}

export function yuvrajIsInstructor() {
  const role = yuvrajGetRole();
  return role === 'instructor';
}

export function yuvrajIsStudent() {
  const role = yuvrajGetRole();
  return role === 'student';
}

// Default institution used when no institution route param is present
export const DEFAULT_INSTITUTION = 'general';

export function yuvrajGetInstitution() {
  try {
    return localStorage.getItem('yuvraj_institution') || DEFAULT_INSTITUTION;
  } catch (error) {
    return DEFAULT_INSTITUTION;
  }
}

export function yuvrajSetInstitution(inst) {
  try {
    if (inst) {
      localStorage.setItem('yuvraj_institution', inst);
    }
  } catch (error) {
    console.error('Failed to set institution:', error);
  }
}

export function yuvrajGetUserDisplayName() {
  const role = yuvrajGetRole();
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'instructor':
      return 'Instructor';
    case 'student':
      return 'Student';
    default:
      return 'Admin';
  }
}

// Console commands for role switching
export const yuvrajConsoleCommands = {
  setStudent: () => {
    localStorage.setItem('yuvraj_role', 'student');
    location.reload();
  },
  setInstructor: () => {
    localStorage.setItem('yuvraj_role', 'instructor');
    location.reload();
  },
  setAdmin: () => {
    localStorage.setItem('yuvraj_role', 'admin');
    location.reload();
  },
  resetToDefault: () => {
    localStorage.removeItem('yuvraj_role');
    location.reload();
  }
};
