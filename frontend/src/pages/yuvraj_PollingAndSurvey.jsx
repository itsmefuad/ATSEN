import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listPollingAndSurveys } from "../services/pollingandsurvey_api.js";
import FormCard from "../components/FormCard.jsx";

const OptionBox = ({ title, description, icon, onClick, isActive = false }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-2xl border border-white/20 bg-white/10 p-6 shadow-lg backdrop-blur transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-white/15 ${
      isActive ? "border-white/40 bg-white/20" : ""
    }`}
  >
    <div className="text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </div>
  </div>
);

const Yuvraj_PollingAndSurvey = () => {
  const [forms, setForms] = useState([]);
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tab, setTab] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
    // Set role and privileges from URL params or localStorage
    const currentRole = roleParam || localStorage.getItem('yuvraj_role') || 'student';
    setRole(currentRole);
    setIsPrivileged(currentRole === 'admin' || currentRole === 'instructor');
    
    // Persist institution for API header
    if (institution) { 
      try { 
        localStorage.setItem('yuvraj_institution', institution); 
      } catch(e){} 
    }
    
    // Load forms from API
    const loadForms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listPollingAndSurveys(20);
        setForms(data);
      } catch (err) {
        console.error('Failed to load forms:', err);
        setError(err.message);
        setForms([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadForms();
  }, [institution, roleParam]);

  const handleCreateForm = (type) => {
    if (!isPrivileged) return;
    navigate(`/${institution || 'Brac University'}/${role}/PollingAndSurvey/new?type=${type}`);
  };

  const handleEditForm = (form) => {
    if (!isPrivileged) return;
    navigate(`/${institution || 'Brac University'}/${role}/PollingAndSurvey/${form.id}/edit`);
  };

  const handleViewResults = (form) => {
    if (!isPrivileged) return;
    navigate(`/${institution || 'Brac University'}/${role}/PollingAndSurvey/${form.id}/results`);
  };

  const handleRespondToForm = (form) => {
    if (isPrivileged) return;
    navigate(`/${institution || 'Brac University'}/${role}/PollingAndSurvey/${form.id}/respond`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-400/80 via-blue-600/80 to-indigo-700/80 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-pulse">📊</div>
            <div className="text-white/80 text-lg">Loading forms...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400/80 via-blue-600/80 to-indigo-700/80 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">ATSEN</span>
          </div>
          <nav className="flex items-center gap-4">
            <div className="rounded-full bg-white/40 px-4 py-2 text-white shadow backdrop-blur">Home</div>
            <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">Dashboard</div>
            <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">Notifications</div>
            <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">Profile</div>
          </nav>
        </div>

        {isPrivileged && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Create New Form</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OptionBox
                title="Create Poll"
                description="Create a new poll with multiple choice questions"
                icon="📊"
                onClick={() => handleCreateForm("poll")}
              />
              <OptionBox
                title="Create QnA"
                description="Create a new Q&A form for open-ended responses"
                icon="❓"
                onClick={() => handleCreateForm("qna")}
              />
            </div>
          </div>
        )}

        {!isPrivileged && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Available Forms</h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setTab("recent")}
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                  tab === "recent"
                    ? "bg-white/30 text-white shadow-lg"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setTab("existing")}
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                  tab === "existing"
                    ? "bg-white/30 text-white shadow-lg"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                All Forms
              </button>
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-white/15 p-5 shadow-2xl backdrop-blur border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="text-white/90 text-lg font-semibold">
              {tab === "recent" ? "Recent Forms" : "All Forms"}
            </div>
            <div className="text-sm text-white/70">{forms.length} form{forms.length !== 1 ? "s" : ""} available</div>
          </div>

          {error && (
            <div className="text-center py-8">
              <div className="text-red-400 text-lg mb-2">Failed to load forms</div>
              <div className="text-red-300 text-sm">{error}</div>
            </div>
          )}

          {!error && (
            <div className={tab === "recent" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
              {forms.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <div className="text-white/80 text-lg">No forms available yet</div>
                  <div className="text-white/60 text-sm mt-2">Forms will appear here when created by instructors</div>
                </div>
              )}
              {forms.map((form) => (
                <FormCard
                  key={form.id}
                  form={form}
                  isPrivileged={isPrivileged}
                  onEdit={() => handleEditForm(form)}
                  onViewResults={() => handleViewResults(form)}
                  onRespond={() => handleRespondToForm(form)}
                  compact={tab === "existing"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_PollingAndSurvey;
