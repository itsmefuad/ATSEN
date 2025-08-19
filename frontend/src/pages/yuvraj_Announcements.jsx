import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import { yuvrajGetRole, yuvrajIsPrivileged } from "../services/yuvraj_announcements.js";
import { yuvrajListAnnouncements } from "../services/yuvraj_announcements_api.js";
import { yuvrajSeedData } from "../services/yuvraj_seed.js";
import YuvrajNavbar from "../components/yuvraj_Navbar.jsx";

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
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tab, setTab] = useState('recent');
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
  setRole(roleParam || yuvrajGetRole());
  setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor' || yuvrajIsPrivileged());
  // persist institution for API header
  if (institution) { try { localStorage.setItem('yuvraj_institution', institution); } catch(e){} }
  yuvrajListAnnouncements(12)
      .then(setAnnouncements)
      .catch(async () => {
        const seed = await yuvrajSeedData();
        setAnnouncements(seed);
      });
  }, []);

  const recent = useMemo(() => announcements.slice(0, 4), [announcements]);
  const all = useMemo(() => announcements.slice(0, 12), [announcements]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">ATSEN</span>
          </div>
          <nav className="flex items-center gap-4">
            <NavPill active>Home</NavPill>
            <NavPill>Dashboard</NavPill>
            <NavPill>Notifications</NavPill>
            <NavPill>Profile</NavPill>
            <YuvrajNavbar />
          </nav>
        </div>

        <div className="rounded-3xl bg-white/20 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3">
              <button onClick={() => setTab('recent')} className={`glass-pill ${tab==='recent' ? 'bg-white/40' : 'bg-white/20'}`}>Recent Announcements</button>
              <button onClick={() => setTab('all')} className={`glass-pill ${tab==='all' ? 'bg-white/40' : 'bg-white/20'}`}>All Announcements</button>
            </div>
            <div className="text-white/80">{announcements.length} announcements available</div>
          </div>

          {tab === 'recent' ? (
            <div className="recent-scroll">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ scrollSnapType: 'y proximity' }}>
              {(recent.length === 0) && (
                <YuvrajAnnouncementCard title="No announcements yet">
                  <p className="opacity-80">Announcements will appear here.</p>
                </YuvrajAnnouncementCard>
              )}
              {recent.map((a) => (
                <div key={a.id} className="relative announcement-card card-hover">
                  <div className="card-sheen" />
                  <Link to={`/${institution || 'yuvraj'}/${role || 'student'}/announcements/${a.id}`}>
                    <YuvrajAnnouncementCard title={a.title} className="p-4">
                      <p className="line-clamp-3 opacity-80">{a.content}</p>
                      <div className="mt-3 text-sm opacity-70">{new Date(a.createdAt).toLocaleString()} • {a.author}</div>
                    </YuvrajAnnouncementCard>
                  </Link>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2">
              {(all.length === 0) && (
                <div className="announcement-card p-4">No announcements yet.</div>
              )}
              {all.map((a) => (
                <Link key={a.id} to={`/${institution || 'yuvraj'}/${role || 'student'}/announcements/${a.id}`} className="transform transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-xl">
                  <div className="announcement-card p-3 text-white/90">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-lg">{a.title}</div>
                      <div className="text-sm opacity-60">{new Date(a.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-2 text-sm opacity-80 line-clamp-2">{a.content}</div>
                    <div className="mt-3 text-xs opacity-70">By: {a.author}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {isPrivileged && (
            <div className="mt-6 flex justify-end">
              <button className="btn btn-primary" onClick={() => navigate(`/${institution || 'yuvraj'}/${role || 'admin'}/announcements/new`)}>Create Announcement</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_Announcements;


