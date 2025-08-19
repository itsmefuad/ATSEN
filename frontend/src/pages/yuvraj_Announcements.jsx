import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { yuvrajListAnnouncements } from "../services/yuvraj_announcements_api.js";
import { yuvrajGetRole, yuvrajIsPrivileged, yuvrajGetInstitution, yuvrajSetInstitution } from "../services/yuvraj_auth.js";
import { useParams } from "react-router";
import YuvrajEnhancedAnnouncementCard from "../components/yuvraj_EnhancedAnnouncementCard.jsx";
import YuvrajModernNavPill from "../components/yuvraj_ModernNavPill.jsx";
import YuvrajModernActionButton from "../components/yuvraj_ModernActionButton.jsx";
import YuvrajLiquidGlassCard from "../components/yuvraj_LiquidGlassCard.jsx";
import YuvrajModernHeader from "../components/yuvraj_ModernHeader.jsx";

const Yuvraj_Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tab, setTab] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const effectiveInstitution = institution || yuvrajGetInstitution();
    try { yuvrajSetInstitution(effectiveInstitution); } catch (e) {}
    setRole(roleParam || yuvrajGetRole());
    setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor' || yuvrajIsPrivileged());

    setIsLoading(true);
    yuvrajListAnnouncements(50) // Increased limit to get more announcements
      .then((data) => {
        console.log("Announcements fetched from database:", data);
        setAnnouncements(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching announcements:", err);
        setError("Failed to load announcements from database");
        setAnnouncements([]);
        setIsLoading(false);
      });
  }, [institution, roleParam]);

  // Use real data from database instead of mock data
  const displayAnnouncements = announcements;
  const displayRecent = displayAnnouncements.slice(0, 5);
  const displayAll = displayAnnouncements.slice(0, 12);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    setDeletingId(id);
    
    try {
      // Import the delete function
      const { yuvrajDeleteAnnouncement } = await import('../services/yuvraj_announcements_api.js');
      await yuvrajDeleteAnnouncement(id);
      
      // Remove from local state
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    } catch (error) {
      console.error('Failed to delete announcement:', error);
      alert('Failed to delete announcement: ' + (error?.message || String(error)));
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl p-6">
          <YuvrajModernHeader
            title="Error Loading Announcements"
            subtitle="Failed to connect to database"
            variant="announcements"
          />
          
          <div className="glass-morphism rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-white/90 mb-4">Database Connection Error</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors duration-200"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          title="Announcements"
          subtitle="Stay updated with the latest news and updates"
          variant="announcements"
          showNavigation={true}
          currentView="announcements"
        />

        {/* Tab Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-3">
            <YuvrajModernNavPill 
              variant={tab === 'recent' ? 'primary' : 'secondary'}
              active={tab === 'recent'}
              onClick={() => setTab('recent')}
            >
              Recent Announcements
            </YuvrajModernNavPill>
            <YuvrajModernNavPill 
              variant={tab === 'all' ? 'primary' : 'secondary'}
              active={tab === 'all'}
              onClick={() => setTab('all')}
            >
              All Announcements
            </YuvrajModernNavPill>
          </div>
          
          {/* Create Announcement Button for Privileged Users */}
          {isPrivileged && (
            <YuvrajModernActionButton
              variant="primary"
              size="medium"
              icon="✨"
              onClick={() => navigate("/yuvraj/announcements/new")}
            >
              Create Announcement
            </YuvrajModernActionButton>
          )}
        </div>

        {/* Main Content Area */}
        <div className="glass-morphism rounded-3xl p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === 'recent' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-white/90">Recent Announcements</h2>
                    <div className="text-white/80 text-sm">
                      {displayRecent.length} recent announcements
                    </div>
                  </div>
                  
                  {/* Vertical scrollable recent announcements */}
                  <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
                    {displayRecent.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📢</div>
                        <h3 className="text-xl font-medium text-white/80 mb-2">No announcements yet</h3>
                        <p className="text-white/60">Create the first announcement to get started.</p>
                      </div>
                    ) : (
                      displayRecent.map((announcement) => (
                        <div key={announcement._id} className="transform transition-all duration-300 hover:scale-[1.02]">
                          <YuvrajEnhancedAnnouncementCard
                            title={announcement.title}
                            content={announcement.content}
                            author={announcement.author}
                            createdAt={announcement.createdAt}
                            priority={announcement.priority}
                            category={announcement.category}
                            onClick={() => navigate(`/yuvraj/announcements/${announcement._id}`)}
                            onDelete={handleDelete}
                            isPrivileged={isPrivileged}
                            id={announcement._id}
                            isDeleting={isDeleting && deletingId === announcement._id}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-white/90">All Announcements</h2>
                    <div className="text-white/80 text-sm">
                      {displayAll.length} announcements available
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayAll.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">📢</div>
                        <h3 className="text-xl font-medium text-white/80 mb-2">No announcements available</h3>
                        <p className="text-white/60">Announcements will appear here when they're created.</p>
                      </div>
                    ) : (
                      displayAll.map((announcement) => (
                        <div key={announcement._id} className="transform transition-all duration-300 hover:scale-[1.02]">
                          <YuvrajEnhancedAnnouncementCard
                            title={announcement.title}
                            content={announcement.content}
                            author={announcement.author}
                            createdAt={announcement.createdAt}
                            priority={announcement.priority}
                            category={announcement.category}
                            isCompact={true}
                            onClick={() => navigate(`/yuvraj/announcements/${announcement._id}`)}
                            onDelete={() => handleDelete(announcement._id)}
                            isPrivileged={isPrivileged}
                            id={announcement._id}
                            isDeleting={isDeleting && deletingId === announcement._id}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Quick Stats for Privileged Users */}
              {isPrivileged && displayAnnouncements.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white/95">{displayAnnouncements.length}</div>
                      <div className="text-white/70 text-sm">Total Announcements</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white/95">
                        {displayAnnouncements.filter(a => a.priority === 'urgent').length}
                      </div>
                      <div className="text-white/70 text-sm">Urgent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white/95">
                        {displayAnnouncements.filter(a => a.priority === 'high').length}
                      </div>
                      <div className="text-white/70 text-sm">High Priority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white/95">
                        {displayAnnouncements.filter(a => a.category === 'Academic').length}
                      </div>
                      <div className="text-white/70 text-sm">Academic</div>
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

export default Yuvraj_Announcements;


