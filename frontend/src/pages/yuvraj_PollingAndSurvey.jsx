import { useEffect, useState } from "react";
import { useRole } from "../components/RoleContext.jsx";
import RoleSwitcher from "../components/RoleSwitcher.jsx";
import { useNavigate } from "react-router-dom";
import { listPollingAndSurveys } from "../services/pollingandsurvey_api.js";
import FormCard from "../components/FormCard.jsx";

const Yuvraj_PollingAndSurvey = () => {
  const [forms, setForms] = useState([]);
  const { role, setRole } = useRole();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('recent');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await listPollingAndSurveys(50);
        setForms(data || []);
        setError(null);
      } catch (e) {
        console.error('list error', e);
        setError(e?.message || 'Failed to load');
        setForms([]);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const isPrivileged = role === 'admin' || role === 'instructor';

  const goCreate = (type) => { if (!isPrivileged) return; navigate(`/PollingAndSurvey/new?type=${type}`); };
  const goEdit = (form) => { if (!isPrivileged) return; navigate(`/PollingAndSurvey/${form.id}/edit`); };
  const goRespond = (form) => { if (isPrivileged) return; navigate(`/PollingAndSurvey/${form.id}`); };
  const goResults = (form) => { if (!isPrivileged) return; navigate(`/PollingAndSurvey/${form.id}/results`); };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400/80 via-blue-600/80 to-indigo-700/80 p-6">
      <div className="mx-auto max-w-6xl text-center py-12 text-white/90">📊 Loading forms...</div>
    </div>
  );

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
            <RoleSwitcher position="inline" />
          </nav>
        </div>

        {isPrivileged && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Form</h2>
            <div className="flex gap-4">
              <button onClick={() => goCreate('poll')} className="px-4 py-2 rounded-full bg-emerald-600 text-white">Create Poll</button>
              <button onClick={() => goCreate('qna')} className="px-4 py-2 rounded-full bg-blue-600 text-white">Create QnA</button>
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-white/15 p-5 shadow-2xl backdrop-blur border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="text-white/90 text-lg font-bold">{tab === 'recent' ? 'Recent Forms' : 'All Forms'}</div>
            <div className="text-sm text-white/70">{forms.length} form{forms.length !== 1 ? 's' : ''} available</div>
          </div>

          {error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : (
            <div className={tab === 'recent' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
              {forms.length === 0 && (
                <div className="text-center py-12 text-white/80">No forms available yet</div>
              )}
              {forms.map((form) => (
                <FormCard
                  key={form._id || form.id}
                  form={{ ...form, id: form._id || form.id }}
                  isPrivileged={isPrivileged}
                  onEdit={() => goEdit(form)}
                  onViewResults={() => goResults(form)}
                  onRespond={() => goRespond(form)}
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
