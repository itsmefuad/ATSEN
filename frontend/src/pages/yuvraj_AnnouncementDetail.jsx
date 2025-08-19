import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import YuvrajAnnouncementCard from "../components/yuvraj_AnnouncementCard.jsx";
import { yuvrajGetRole, yuvrajIsPrivileged } from "../services/yuvraj_announcements.js";
import { yuvrajGetAnnouncementById } from "../services/yuvraj_announcements_api.js";
import { yuvrajSeedData } from "../services/yuvraj_seed.js";

const NavPill = ({ children }) => (
  <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">{children}</div>
);

const Yuvraj_AnnouncementDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
    yuvrajGetAnnouncementById(id)
      .then(setData)
      .catch(async () => {
        const seed = await yuvrajSeedData();
        setData(seed.find((x) => x.id === id) || seed[0]);
      });
  setRole(roleParam || yuvrajGetRole());
  setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor' || yuvrajIsPrivileged());
  if (institution) { try { localStorage.setItem('yuvraj_institution', institution); } catch(e){} }
  }, [id]);

  const title = data?.title || (isPrivileged ? "Edit title here" : "Announcement");
  const content = data?.content || (isPrivileged ? "Edit content here" : "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/yuvraj_bracu_logo.svg" alt="BRAC University" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">BRAC University</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to={`/${institution || 'yuvraj'}/${role || 'student'}/announcements`} className="rounded-full bg-white/40 px-4 py-2 text-white shadow backdrop-blur">Home</Link>
            <NavPill>Dashboard</NavPill>
            <NavPill>Notifications</NavPill>
            <NavPill>Profile</NavPill>
          </nav>
        </div>

        <div className="rounded-3xl bg-white/20 p-5 shadow-2xl backdrop-blur">
          <YuvrajAnnouncementCard title={title}>
            <p className="whitespace-pre-wrap leading-relaxed opacity-90">{content}</p>
            {data && (
              <div className="mt-4 text-sm opacity-70">
                {new Date(data.createdAt).toLocaleString()} • {data.author}
              </div>
            )}
          </YuvrajAnnouncementCard>

          {isPrivileged && data && (
            <div className="mt-6 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/${institution || 'yuvraj'}/${role || 'admin'}/announcements/${data.id}/edit`)}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_AnnouncementDetail;


