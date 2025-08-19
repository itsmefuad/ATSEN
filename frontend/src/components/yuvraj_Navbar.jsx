import { useNavigate, useLocation } from "react-router";
import GlassCard from './GlassCard';

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
    <GlassCard className="inline-block">
      <button
        className="btn btn-xs btn-outline"
        onClick={toggleDemoStudent}
        title={isDemoStudent ? "Exit student demo" : "View as student (demo)"}
      >
        {isDemoStudent ? "Exit Demo" : "Demo Student"}
      </button>
    </GlassCard>
  );
};

export default YuvrajNavbar;
