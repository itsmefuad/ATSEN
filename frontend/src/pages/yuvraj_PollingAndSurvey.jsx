import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { listPollingAndSurveys } from "../services/pollingandsurvey_api.js";
import { yuvrajGetRole, yuvrajIsPrivileged, yuvrajGetInstitution, yuvrajSetInstitution } from "../services/yuvraj_announcements.js";
import { useParams } from "react-router";
import YuvrajEnhancedPollingCard from "../components/yuvraj_EnhancedPollingCard.jsx";
import YuvrajModernNavPill from "../components/yuvraj_ModernNavPill.jsx";
import YuvrajModernActionButton from "../components/yuvraj_ModernActionButton.jsx";
import YuvrajLiquidGlassCard from "../components/yuvraj_LiquidGlassCard.jsx";
import YuvrajModernHeader from "../components/yuvraj_ModernHeader.jsx";
import { getFormsSeedData } from "../services/yuvraj_seed.js";

const Yuvraj_PollingAndSurvey = () => {
  const [list, setList] = useState([]);
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tab, setTab] = useState("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("forms"); // "forms" or "announcements"
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
    // persist current institution or default it so API client will send header
    const effectiveInstitution = institution || yuvrajGetInstitution();
    try { yuvrajSetInstitution(effectiveInstitution); } catch (e) {}
    setRole(roleParam || yuvrajGetRole());
    setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor' || yuvrajIsPrivileged());

    setIsLoading(true);
    listPollingAndSurveys(20)
      .then((data) => {
        setList(data);
        setIsLoading(false);
      })
      .catch(() => {
        setList([]);
        setIsLoading(false);
      });
  }, [institution, roleParam]);

  // build prefix safely so we don't create a leading '//' when institution is empty
  const effectiveInstitution = institution || yuvrajGetInstitution();
  const prefix = effectiveInstitution ? `/${effectiveInstitution}/${role || 'student'}` : `/${role || 'student'}`;

  // Mock data for demonstration - you can remove this in production
  const mockData = getFormsSeedData();

  const displayData = list.length > 0 ? list : mockData;
  const recentData = displayData.slice(0, 4);
  const allData = displayData.slice(0, 12);

  const handleViewSwitch = (view) => {
    setActiveView(view);
    if (view === "announcements") {
      navigate(`${prefix}/announcements`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background orbs for iOS 26 aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl p-6">
        {/* Enhanced Header */}
        <YuvrajModernHeader
          title="Polls & Surveys"
          subtitle="Engage with interactive forms and gather feedback"
          variant="announcements"
          showNavigation={true}
          currentView="forms"
        />

        {/* Action Cards for Privileged Users */}
        {isPrivileged && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <YuvrajLiquidGlassCard 
              variant="elevated" 
              className="cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
              onClick={() => navigate(`${prefix}/PollingAndSurvey/new?type=poll`)}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">📊</div>
                <h3 className="text-2xl font-semibold text-white/95">Create a Poll</h3>
                <p className="text-white/70">Design interactive polls to gather quick feedback from students</p>
                <div className="pt-4">
                  <YuvrajModernActionButton variant="primary" size="small">
                    Get Started
                  </YuvrajModernActionButton>
                </div>
              </div>
            </YuvrajLiquidGlassCard>

            <YuvrajLiquidGlassCard 
              variant="elevated" 
              className="cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
              onClick={() => navigate(`${prefix}/PollingAndSurvey/new?type=qna`)}
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">❓</div>
                <h3 className="text-2xl font-semibold text-white/95">Create Q&A Form</h3>
                <p className="text-white/70">Build question and answer forms for interactive sessions</p>
                <div className="pt-4">
                  <YuvrajModernActionButton variant="primary" size="small">
                    Get Started
                  </YuvrajModernActionButton>
                </div>
              </div>
            </YuvrajLiquidGlassCard>
          </div>
        )}

        {/* Tab Navigation for Non-Privileged Users */}
        {!isPrivileged && (
          <div className="mb-8 flex gap-3">
            <YuvrajModernNavPill 
              variant={tab === 'recent' ? 'primary' : 'secondary'}
              active={tab === 'recent'}
              onClick={() => setTab('recent')}
            >
              Recent Forms
            </YuvrajModernNavPill>
            <YuvrajModernNavPill 
              variant={tab === 'all' ? 'primary' : 'secondary'}
              active={tab === 'all'}
              onClick={() => setTab('all')}
            >
              All Forms
            </YuvrajModernNavPill>
          </div>
        )}

        {/* Main Content Area */}
        <div className="glass-morphism rounded-3xl p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {!isPrivileged && (
                <h2 className="text-2xl font-semibold text-white/90 mb-6">
                  {tab === 'recent' ? 'Recent Forms' : 'All Forms'}
                </h2>
              )}

              {tab === 'recent' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {recentData.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-medium text-white/80 mb-2">No forms available</h3>
                        <p className="text-white/60">Forms will appear here when they're created by instructors.</p>
                      </div>
                    ) : (
                      recentData.map((item) => (
                        <div key={item.id} className="transform transition-all duration-300 hover:scale-[1.02]">
                          <YuvrajEnhancedPollingCard
                            title={item.title}
                            type={item.type}
                            createdAt={item.createdAt}
                            responseCount={isPrivileged ? item.responseCount : undefined}
                            isActive={item.isActive}
                            isPrivileged={isPrivileged}
                            isMandatory={item.isMandatory}
                            onClick={() => navigate(`${prefix}/PollingAndSurvey/${item._id}`)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allData.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-medium text-white/80 mb-2">No forms available</h3>
                        <p className="text-white/60">Forms will appear here when they're created by instructors.</p>
                      </div>
                    ) : (
                      allData.map((item) => (
                        <div key={item.id} className="transform transition-all duration-300 hover:scale-[1.02]">
                          <YuvrajEnhancedPollingCard
                            title={item.title}
                            type={item.type}
                            createdAt={item.createdAt}
                            responseCount={isPrivileged ? item.responseCount : undefined}
                            isActive={item.isActive}
                            isPrivileged={isPrivileged}
                            isMandatory={item.isMandatory}
                            isCompact={true}
                            onClick={() => navigate(`${prefix}/PollingAndSurvey/${item._id}`)}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Quick Stats for Privileged Users */}
              {isPrivileged && displayData.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white/95">{displayData.length}</div>
                      <div className="text-white/70 text-sm">Total Forms</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white/95">
                        {displayData.reduce((sum, item) => sum + (item.responseCount || 0), 0)}
                      </div>
                      <div className="text-white/70 text-sm">Total Responses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white/95">
                        {displayData.filter(item => item.isActive).length}
                      </div>
                      <div className="text-white/70 text-sm">Active Forms</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_PollingAndSurvey;
