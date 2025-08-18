import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import CompactAnnouncementCard from "../components/CompactAnnouncementCard.jsx";
import { yuvrajGetRole, yuvrajIsPrivileged } from "../services/yuvraj_announcements.js";
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
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tab, setTab] = useState("recent");
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
  setRole(roleParam || yuvrajGetRole());
  setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor' || yuvrajIsPrivileged());
  // persist institution for API header
  if (institution) { try { localStorage.setItem('yuvraj_institution', institution); } catch(e){} }
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
            <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">ATSEN</span>
          </div>
          <nav className="flex items-center gap-4">
            <NavPill active>Home</NavPill>
            <NavPill>Dashboard</NavPill>
            <NavPill>Notifications</NavPill>
            <NavPill>Profile</NavPill>
          </nav>
        </div>

        {/* Tab buttons */}
        <div className="mb-6 flex gap-4 justify-center">
          <button 
            onClick={() => setTab('recent')} 
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
              tab==='recent' 
                ? 'bg-white/30 text-white shadow-lg' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            📋 Recent Announcements
          </button>
          <button 
            onClick={() => setTab('all')} 
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
              tab==='all' 
                ? 'bg-white/30 text-white shadow-lg' 
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            📚 All Announcements
          </button>
        </div>

        <div className="rounded-3xl bg-white/20 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div className="text-white/90 text-lg font-semibold">
              {tab === 'recent' ? 'Recent Announcements' : 'All Announcements'}
            </div>
            <div className="text-sm text-white/70">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''} available</div>
          </div>

          {tab === 'recent' ? (
            // Recent announcements view (original layout)
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
                  <Link to={`/${institution || 'yuvraj'}/${role || 'student'}/announcements/${a.id}`}>
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
          ) : (
            // All announcements view (compact grid)
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">📢</div>
                  <div className="text-white/80 text-lg">No announcements available yet</div>
                  <div className="text-white/60 text-sm mt-2">Announcements will appear here when created by admins</div>
                </div>
              )}
              {announcements.map((a) => (
                <CompactAnnouncementCard
                  key={a.id}
                  announcement={a}
                  onClick={() => navigate(`/${institution || 'yuvraj'}/${role || 'student'}/announcements/${a.id}`)}
                />
              ))}
            </div>
          )}

      {isPrivileged && (
            <div className="mt-6 flex justify-end">
              <button
                className="btn btn-primary"
        onClick={() => navigate(`/${institution || 'yuvraj'}/${role || 'admin'}/announcements/new`)}
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


