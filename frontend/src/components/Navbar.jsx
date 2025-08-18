import { Link, useLocation } from "react-router";
import { CircleUserRoundIcon, MenuIcon, BookOpen, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  
  // Determine if user is on student or teacher routes
  const isStudent = location.pathname.startsWith('/student');
  const isTeacher = location.pathname.startsWith('/teacher');
  
  const getTitle = () => {
    if (isStudent) return "Student Dashboard";
    if (isTeacher) return "Teacher's Dashboard";
    return "ATSEN";
  };
  
  const getProfileLink = () => {
    if (isStudent) return "/student/profile";
    if (isTeacher) return "/teacher/dashboard";
    return "/";
  };
  
  const getDashboardLink = () => {
    if (isStudent) return "/student/dashboard";
    if (isTeacher) return "/teacher/dashboard";
    return "/";
  };

  return (
    <div className="navbar bg-base-300">
      <div className="flex-none m-4">
        <div className="drawer">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            {/* Page content here */}
            <label
              htmlFor="my-drawer"
              className="btn btn-primary drawer-button"
            >
              <MenuIcon className="size-5" />
            </label>
          </div>
          <div className="drawer-side fixed inset-0 z-50">
            <label
              htmlFor="my-drawer"
              aria-label="close sidebar"
              className="drawer-overlay"
            ></label>
            <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
              {/* Sidebar content here */}
              <li>
                <Link to={getDashboardLink()}>
                  <BookOpen className="size-5" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to={getProfileLink()}>
                  <User className="size-5" />
                  Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">
          {getTitle()}
        </h1>
      </div>

      <div className="flex-none m-4">
        <Link to={getProfileLink()} className="btn btn-Neutral">
          <CircleUserRoundIcon className="size-5" />
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
