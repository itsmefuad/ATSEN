import { Link, useLocation, useNavigate } from "react-router";
import { CircleUserRoundIcon, MenuIcon, BookOpen, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Determine if user is on student or teacher routes
  const isStudent = location.pathname.startsWith('/student');
  const isTeacher = location.pathname.startsWith('/teacher');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const getTitle = () => {
    if (isStudent) return `Student: ${user?.name || 'Dashboard'}`;
    if (isTeacher) return `Teacher: ${user?.name || 'Dashboard'}`;
    return user?.name || "ATSEN";
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
        <button onClick={handleLogout} className="btn btn-error">
          <LogOut className="size-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
