import { useNavigate, useLocation } from "react-router";

const YuvrajNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isDemoStudent = location?.pathname?.includes("/student/");

  const toggleDemoStudent = () => {
    let p = location.pathname || "/";

    if (p.includes("/admin/")) {
      p = p.replace("/admin/", "/student/");
    } else if (p.includes("/student/")) {
      p = p.replace("/student/", "/admin/");
    } else {
      const parts = p.split("/");
      if (parts.length >= 2 && parts[1]) {
        parts.splice(2, 0, "student");
        p = parts.join("/");
      } else {
        p = "/student" + p;
      }
    }

    navigate(p);
  };

  return (
    <nav className="flex items-center gap-3">
      <button
        className="px-4 py-2 rounded-xl font-medium transition-all duration-200 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white/90"
        onClick={toggleDemoStudent}
        title={isDemoStudent ? "Exit student demo" : "View as student (demo)"}
      >
        {isDemoStudent ? "Exit Demo" : "Demo Student"}
      </button>
    </nav>
  );
};

export default YuvrajNavbar;
