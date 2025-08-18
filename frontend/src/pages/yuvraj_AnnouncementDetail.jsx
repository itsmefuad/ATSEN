import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import { yuvrajGetAnnouncementById } from "../services/yuvraj_announcements_api.js";

const NavPill = ({ children }) => (
  <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">{children}</div>
);

const Yuvraj_AnnouncementDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
    // Set role and privileges
    setRole(roleParam || 'student');
    setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor');
    
    // Persist institution for API header
    if (institution) { 
      try { 
        localStorage.setItem('yuvraj_institution', institution); 
      } catch(e){} 
    }
    
    // Load announcement from API only
    const loadAnnouncement = async () => {
      try {
        setLoading(true);
        setError(null);
        const announcementData = await yuvrajGetAnnouncementById(id);
        setData(announcementData);
      } catch (err) {
        console.error('Failed to load announcement:', err);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadAnnouncement();
  }, [id, institution, roleParam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">📢</div>
            <div className="text-white/80 text-lg">Loading announcement...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <div className="text-red-400 text-lg mb-2">Failed to load announcement</div>
            <div className="text-red-300 text-sm">{error || 'Announcement not found'}</div>
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-primary mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const title = data?.title || (isPrivileged ? "Edit title here" : "Announcement");
  const content = data?.content || (isPrivileged ? "Edit content here" : "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">ATSEN</span>
          </div>
          <nav className="flex items-center gap-4">
            <NavPill>Home</NavPill>
            <NavPill>Dashboard</NavPill>
            <NavPill>Notifications</NavPill>
            <NavPill>Profile</NavPill>
          </nav>
        </div>

        <div className="rounded-3xl bg-white/20 p-5 shadow-2xl backdrop-blur">
          <YuvrajAnnouncementCard title={title}>
            <p className="opacity-80">{content}</p>
            <div className="mt-3 text-sm opacity-70">
              {new Date(data.createdAt).toLocaleString()} • {data.author}
            </div>
          </YuvrajAnnouncementCard>

          {isPrivileged && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  const editPath = institution 
                    ? `/${institution}/${role}/announcements/${id}/edit`
                    : `/yuvraj/admin/announcements/${id}/edit`;
                  navigate(editPath);
                }}
                className="btn btn-primary"
              >
                Edit Announcement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_AnnouncementDetail;


