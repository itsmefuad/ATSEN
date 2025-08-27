// utils/authUtils.js
export const getDefaultDashboardPath = (user) => {
  if (!user) return "/";

  switch (user.role) {
    case "institution":
      return `/${user.slug}/dashboard`;
    case "instructor":
      return "/teacher/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/";
  }
};

export const ensureUserRedirection = (user, navigate, currentPath) => {
  if (!user) return;

  const dashboardPath = getDefaultDashboardPath(user);

  // If we're on login/signup pages and user is authenticated, redirect
  if (currentPath === "/auth/login" || currentPath === "/auth/signup") {
    console.log(
      "ensureUserRedirection: Redirecting from auth page to dashboard"
    );
    navigate(dashboardPath, { replace: true });
    return;
  }

  // If we're on home page and user is authenticated, they can choose to go to dashboard
  // No automatic redirect from home page
};

// Role management utilities
export const getLastUserRole = () => {
  const lastRole = localStorage.getItem("lastUserRole");
  return lastRole && ["institution", "instructor", "student"].includes(lastRole)
    ? lastRole
    : "institution";
};

export const setLastUserRole = (role) => {
  if (["institution", "instructor", "student"].includes(role)) {
    localStorage.setItem("lastUserRole", role);
  }
};

export const clearLastUserRole = () => {
  localStorage.removeItem("lastUserRole");
};

export const isRoleAutoSelected = () => {
  const lastRole = localStorage.getItem("lastUserRole");
  return (
    lastRole && ["institution", "instructor", "student"].includes(lastRole)
  );
};
