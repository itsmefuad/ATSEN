import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useRole } from "../components/RoleContext.jsx";
import RoleSwitcher from "../components/RoleSwitcher.jsx";
import { getInstitutionHeader } from "../components/RoleContext";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import CompactAnnouncementCard from "../components/CompactAnnouncementCard.jsx";
import { yuvrajListAnnouncements } from "../services/yuvraj_announcements_api.js";

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
  const { role, setRole, institution: ctxInstitution, setInstitution } = useRole();
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tab, setTab] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
    const currentRole = roleParam || role || 'student';
    setIsPrivileged(currentRole === 'admin' || currentRole === 'instructor');

    if (institution && !ctxInstitution) {
      try { setInstitution(institution); } catch (e) {}
    }

    const loadAnnouncements = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await yuvrajListAnnouncements(7);
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to load announcements:', err);
        setError(err.message);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, [institution, roleParam, role, ctxInstitution, setInstitution]);

  const handleEdit = (id) => {
    const editPath = institution ? `/${institution}/${role}/announcements/${id}/edit` : `/yuvraj/admin/announcements/${id}/edit`;
    navigate(editPath);
  };

  const changeRole = (r) => {
    setRole(r);
    setIsPrivileged(r === 'admin' || r === 'instructor');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const r = await fetch(`${API}/api/yuvraj/announcements/${id}`, { method: 'DELETE', headers: { 'x-admin-key': import.meta.env.VITE_ADMIN_KEY || '', ...getInstitutionHeader() } });
      if (!r.ok) throw new Error('Delete failed');
      setAnnouncements((prev) => prev.filter(a => (a.id || a._id) !== id));
    } catch (err) {
      console.error('Failed to delete announcement', err);
      alert('Failed to delete announcement');
    }
  };

  const visible = useMemo(() => announcements.slice(0, 7), [announcements]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400/80 via-blue-600/80 to-indigo-700/80 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">📢</div>
            <div className="text-white/80 text-lg">Loading announcements...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400/80 via-blue-600/80 to-indigo-700/80 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <nav className="flex items-center gap-4">
            <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">ATSEN</span>
          </nav>
          <nav className="flex items-center gap-4">
            <NavPill active>Home</NavPill>
            <NavPill>Dashboard</NavPill>
            <NavPill>Notifications</NavPill>
            <NavPill>Profile</NavPill>

            <RoleSwitcher position="inline" />
          </nav>
        </div>

        {/* Tab buttons with enhanced animations */}
        <div className="mb-6 flex gap-4 justify-center">
          <button 
            onClick={() => setTab('recent')} 
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] ${
              tab==='recent' 
                ? 'bg-white/30 text-white shadow-lg' 
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:shadow-md'
            }`}
          >
            📋 Recent Announcements
          </button>
          <button 
            onClick={() => setTab('all')} 
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-[1.02] ${
              tab==='all' 
                ? 'bg-white/30 text-white shadow-lg' 
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:shadow-md'
            }`}
          >
            📚 All Announcements
          </button>
        </div>

        <div className="rounded-3xl bg-white/15 p-5 shadow-2xl backdrop-blur border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="text-black text-lg font-semibold">
              {tab === 'recent' ? 'Recent Announcements' : 'All Announcements'}
            </div>
            <div className="text-sm text-black/70">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''} available</div>
          </div>

          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg mb-2">Failed to load announcements</div>
              <div className="text-red-300 text-sm">{error}</div>
            </div>
          )}

          {!error && tab === 'recent' ? (
            // Recent announcements view with liquid glass effect and enhanced animations
            <div
              className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 pb-2"
              style={{ scrollSnapType: "y proximity" }}
            >
              {visible.length === 0 && (
                <div className="text-center py-12 transform transition-all duration-500 hover:scale-[1.02]">
                  <div className="text-6xl mb-4 animate-pulse">📢</div>
                  <div className="text-black/80 text-lg">No announcements yet</div>
                  <div className="text-black/60 text-sm mt-2">Announcements will appear here.</div>
                </div>
              )}

              {visible.slice(0, 7).map((a, index) => (
                <div
                  key={a.id || a._id}
                  className="scroll-snap-start transform transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:scale-[1.005]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {isPrivileged && (
                      // left-side stacked buttons aligned to card left margin
                      <div className="flex flex-col gap-3 mt-2 w-[92px]">
                        <button
                          onClick={() => handleEdit(a.id || a._id)}
                          className="h-8 px-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(a.id || a._id)}
                          className="h-8 px-3 bg-red-300 text-red-800 hover:bg-red-400 rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <div className="flex-1 ml-2">
                      <Link to={`/announcements/${a.id || a._id}`}>
                        <div className="transform transition-all duration-300 hover:scale-[1.002]">
                          <YuvrajAnnouncementCard title={a.title}>
                            <p className="line-clamp-3 text-black/80">{a.content}</p>
                            <div className="mt-3 text-sm text-black/70">
                              {new Date(a.createdAt).toLocaleString()}  {a.author}
                            </div>
                          </YuvrajAnnouncementCard>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // All announcements view (compact grid) with enhanced animations
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.length === 0 && (
                <div className="col-span-full text-center py-12 transform transition-all duration-500 hover:scale-[1.02]">
                  <div className="text-6xl mb-4 animate-pulse">📢</div>
                  <div className="text-black/80 text-lg">No announcements available yet</div>
                  <div className="text-black/60 text-sm mt-2">Announcements will appear here when created by admins</div>
                </div>
              )}
              {announcements.map((a, index) => (
                <div
                  key={a.id}
                  className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CompactAnnouncementCard
                    announcement={a}
                    onClick={() => navigate(`/${institution || 'yuvraj'}/${role || 'student'}/announcements/${a.id}`)}
                  />
                </div>
              ))}
            </div>
          )}

          {isPrivileged && (
            <div className="mt-6 flex justify-end">
              <button
                className="btn btn-primary transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
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


