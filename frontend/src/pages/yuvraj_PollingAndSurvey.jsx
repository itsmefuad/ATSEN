import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listPollingAndSurveys } from "../services/pollingandsurvey_api.js";
import { yuvrajGetRole, yuvrajIsPrivileged, yuvrajGetInstitution, yuvrajSetInstitution } from "../services/yuvraj_announcements.js";
import { useParams } from "react-router";
import FormCard from "../components/FormCard.jsx";

const NavPill = ({ children, active = false }) => (
  <div
    className={`rounded-full px-4 py-2 text-white shadow backdrop-blur transition-all ${
      active ? "bg-white/40" : "bg-white/20 hover:bg-white/30"
    }`}
  >
    {children}
  </div>
);

const OptionBox = ({ title, onClick, icon }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-2xl bg-white/20 p-8 shadow-xl backdrop-blur hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/20"
  >
    <div className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-xl font-bold text-white">{title}</div>
      <div className="text-sm text-white/70 mt-2">Click to create</div>
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-sky-400/80 via-blue-600/80 to-indigo-700/80 p-6">
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

        <div className="grid grid-cols-2 gap-6 mb-8">
          {isPrivileged ? (
            <>
              <OptionBox 
                title="Create a Poll Form" 
                icon="📊"
                onClick={() => navigate(`${prefix}/PollingAndSurvey/new?type=poll`)} 
              />
              <OptionBox 
                title="Create a QnA Form" 
                icon="❓"
                onClick={() => navigate(`${prefix}/PollingAndSurvey/new?type=qna`)} 
              />
            </>
          ) : (
            <div className="col-span-2 flex gap-4 justify-center">
              <button 
                onClick={() => setTab('recent')} 
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                  tab==='recent' 
                    ? 'bg-white/30 text-white shadow-lg' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                📋 Recent Forms
              </button>
              <button 
                onClick={() => setTab('existing')} 
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                  tab==='existing' 
                    ? 'bg-white/30 text-white shadow-lg' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                📚 All Forms
              </button>
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-white/15 p-5 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div className="text-white/90 text-lg font-semibold">
              {tab === 'recent' ? 'Recent Forms' : 'All Forms'}
            </div>
            <div className="text-sm text-white/70">{list.length} form{list.length !== 1 ? 's' : ''} available</div>
          </div>

          <div className={tab === 'recent' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
            {list.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <div className="text-white/80 text-lg">No forms available yet</div>
                <div className="text-white/60 text-sm mt-2">Forms will appear here when created by instructors</div>
              </div>
            )}
            {list.map((it) => (
              <FormCard
                key={it.id}
                form={it}
                isPrivileged={isPrivileged}
                compact={tab === 'existing'}
                onEdit={() => navigate(`${prefix}/PollingAndSurvey/${it.id}`)}
                onViewResults={() => navigate(`${prefix}/PollingAndSurvey/${it.id}#reports`)}
                onRespond={() => navigate(`${prefix}/PollingAndSurvey/${it.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_PollingAndSurvey;
