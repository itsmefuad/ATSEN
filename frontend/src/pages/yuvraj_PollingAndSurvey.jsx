import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listPollingAndSurveys } from "../services/pollingandsurvey_api.js";
import { yuvrajGetRole, yuvrajIsPrivileged, yuvrajGetInstitution, yuvrajSetInstitution } from "../services/yuvraj_announcements.js";
import { useParams } from "react-router";
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

const OptionBox = ({ title, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-xl bg-white/20 p-6 shadow-md hover:scale-[1.01] transition-transform"
  >
    <div className="text-lg font-semibold text-white">{title}</div>
  </div>
);

const Yuvraj_PollingAndSurvey = () => {
  const [list, setList] = useState([]);
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tab, setTab] = useState("recent");
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
    // persist current institution or default it so API client will send header
    const effectiveInstitution = institution || yuvrajGetInstitution();
    try { yuvrajSetInstitution(effectiveInstitution); } catch (e) {}
    setRole(roleParam || yuvrajGetRole());
    setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor' || yuvrajIsPrivileged());

    listPollingAndSurveys(20)
      .then(setList)
      .catch(() => setList([]));
  }, [institution, roleParam]);

  // build prefix safely so we don't create a leading '//' when institution is empty
  const effectiveInstitution = institution || yuvrajGetInstitution();
  const prefix = effectiveInstitution ? `/${effectiveInstitution}/${role || 'student'}` : `/${role || 'student'}`;

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

        <div className="grid grid-cols-2 gap-4 mb-4">
          {isPrivileged ? (
            <>
              <OptionBox title="Create a Poll Form" onClick={() => navigate(`${prefix}/PollingAndSurvey/new?type=poll`)} />
              <OptionBox title="Create a QnA Form" onClick={() => navigate(`${prefix}/PollingAndSurvey/new?type=qna`)} />
            </>
          ) : (
            <div className="col-span-2 flex gap-2">
              <button onClick={() => setTab('recent')} className={`glass-pill ${tab==='recent' ? 'bg-white/40' : 'bg-white/20'}`}>Recent</button>
              <button onClick={() => setTab('all')} className={`glass-pill ${tab==='all' ? 'bg-white/40' : 'bg-white/20'}`}>All</button>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/20 p-5 shadow-2xl backdrop-blur">
          {tab === 'recent' ? (
            <div className="recent-scroll">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(list.slice(0,4).length === 0) && (<div className="text-white/80">No forms yet.</div>)}
                {list.slice(0,4).map((it) => (
                  <div key={it.id} className="relative announcement-card p-4 card-hover">
                    <div className="card-sheen" />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-semibold text-lg">{it.title}</div>
                      <div className="text-sm opacity-80">{it.type} • {new Date(it.createdAt).toLocaleString()}</div>
                    </div>
                    <div>
                      {isPrivileged ? (
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`${prefix}/PollingAndSurvey/${it.id}`)} className="btn btn-ghost btn-sm">Edit</button>
                          <button onClick={() => navigate(`${prefix}/PollingAndSurvey/${it.id}#reports`)} className="btn btn-outline btn-sm">Results</button>
                        </div>
                      ) : (
                        <button onClick={() => navigate(`${prefix}/PollingAndSurvey/${it.id}`)} className="btn btn-primary btn-sm">Respond</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(list.slice(0,12).length === 0) && (<div className="text-white/80">No forms yet.</div>)}
              {list.slice(0,12).map((it) => (
                <div key={it.id} className="relative p-3 announcement-card card-hover">
                  <div className="card-sheen" />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{it.title}</div>
                      <div className="text-xs opacity-80">{it.type} • {new Date(it.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div>
                      {isPrivileged ? (
                        <button onClick={() => navigate(`${prefix}/PollingAndSurvey/${it.id}`)} className="btn btn-ghost btn-sm">Edit</button>
                      ) : (
                        <button onClick={() => navigate(`${prefix}/PollingAndSurvey/${it.id}`)} className="btn btn-primary btn-sm">Respond</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_PollingAndSurvey;
