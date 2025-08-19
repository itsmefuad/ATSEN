import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listPollingAndSurveys } from "../services/pollingandsurvey_api.js";
import { yuvrajGetRole, yuvrajIsPrivileged, yuvrajGetInstitution, yuvrajSetInstitution } from "../services/yuvraj_announcements.js";
import { useParams } from "react-router";

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
              <button onClick={() => setTab('recent')} className={`px-4 py-2 rounded-full ${tab==='recent' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/80'}`}>Recent</button>
              <button onClick={() => setTab('existing')} className={`px-4 py-2 rounded-full ${tab==='existing' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/80'}`}>Existing</button>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/20 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/90">Recent forms</div>
          </div>

          <div className="space-y-3">
            {list.length === 0 && (
              <div className="text-white/80">No forms yet.</div>
            )}
            {list.map((it) => (
              <div key={it.id} className="p-3 rounded-lg bg-white/10 text-white flex justify-between items-center">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-white text-xs font-semibold`} style={{background: it.type === 'poll' ? '#059669' : '#2563EB'}}>{(it.type || 'poll').toUpperCase()}</span>
                    <div>
                      <div className="font-semibold">{it.title}</div>
                      <div className="text-sm opacity-80">{it.type} • {new Date(it.createdAt).toLocaleString()}</div>
                    </div>
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
      </div>
    </div>
  );
};

export default Yuvraj_PollingAndSurvey;
