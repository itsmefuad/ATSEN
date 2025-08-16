import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import { yuvrajGetRole } from "../services/yuvraj_announcements.js";
import { yuvrajListAnnouncements } from "../services/yuvraj_announcements_api.js";
import { yuvrajSeedData } from "../services/yuvraj_seed.js";

const NavPill = ({ children, active = false }) => (
  <div
    className={`rounded-full px-4 py-2 text-white shadow backdrop-blur transition-all ${
      active ? "bg-white/40" : "bg-white/20 hover:bg-white/30"
    }`}
  >
    {children}
  </div>
);

const Yuvraj_Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

  useEffect(() => {
    setRole(yuvrajGetRole());
    yuvrajListAnnouncements(7)
      .then(setAnnouncements)
      .catch(async () => {
        const seed = await yuvrajSeedData();
        setAnnouncements(seed);
      });
  }, []);

  const visible = useMemo(() => announcements.slice(0, 7), [announcements]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/yuvraj_bracu_logo.svg" alt="BRAC University" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">BRAC University</span>
          </div>
          <nav className="flex items-center gap-4">
            <NavPill active>Home</NavPill>
            <NavPill>Dashboard</NavPill>
            <NavPill>Notifications</NavPill>
            <NavPill>Profile</NavPill>
          </nav>
        </div>

        <div className="rounded-3xl bg-white/20 p-5 shadow-2xl backdrop-blur">
          <div
            className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
            style={{ scrollSnapType: "y proximity" }}
          >
            {visible.length === 0 && (
              <YuvrajAnnouncementCard title="No announcements yet">
                <p className="opacity-80">Announcements will appear here.</p>
              </YuvrajAnnouncementCard>
            )}

            {visible.slice(0, 7).map((a) => (
              <div
                key={a.id}
                className="scroll-snap-start transform transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl"
              >
                <Link to={`/yuvraj/announcements/${a.id}`}>
                  <YuvrajAnnouncementCard title={a.title}>
                    <p className="line-clamp-3 opacity-80">{a.content}</p>
                    <div className="mt-3 text-sm opacity-70">
                      {new Date(a.createdAt).toLocaleString()} • {a.author}
                    </div>
                  </YuvrajAnnouncementCard>
                </Link>
              </div>
            ))}
          </div>

          {role === "admin" && (
            <div className="mt-6 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={() => navigate("/yuvraj/admin/announcements/new")}
              >
                Create Announcement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_Announcements;


