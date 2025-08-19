import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import YuvrajEnhancedAnnouncementCard from "../components/yuvraj_EnhancedAnnouncementCard.jsx";
import YuvrajModernNavPill from "../components/yuvraj_ModernNavPill.jsx";
import YuvrajModernActionButton from "../components/yuvraj_ModernActionButton.jsx";
import YuvrajModernHeader from "../components/yuvraj_ModernHeader.jsx";
import { yuvrajGetRole, yuvrajIsPrivileged } from "../services/yuvraj_announcements.js";
import { yuvrajListAnnouncements } from "../services/yuvraj_announcements_api.js";
import { yuvrajSeedData } from "../services/yuvraj_seed.js";

const Yuvraj_Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [tab, setTab] = useState('recent');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
    setRole(roleParam || yuvrajGetRole());
    setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor' || yuvrajIsPrivileged());
    
    // persist institution for API header
    if (institution) { 
      try { 
        localStorage.setItem('yuvraj_institution', institution); 
      } catch(e){} 
    }
    
    setIsLoading(true);
    yuvrajListAnnouncements(12)
      .then((data) => {
        setAnnouncements(data);
        setIsLoading(false);
      })
      .catch(async () => {
        const seed = await yuvrajSeedData();
        setAnnouncements(seed);
        setIsLoading(false);
      });
  }, [institution, roleParam]);

  const recent = useMemo(() => announcements.slice(0, 4), [announcements]);
  const all = useMemo(() => announcements.slice(0, 12), [announcements]);

  // Mock data for demonstration - you can remove this in production
  const mockAnnouncements = [
    {
      id: '1',
      title: 'Welcome to ATSEN Platform',
      content: 'We are excited to announce the launch of our new learning management system. This platform will provide enhanced features for students and instructors.',
      author: 'Admin Team',
      createdAt: new Date().toISOString(),
      priority: 'high',
      category: 'Platform Update'
    },
    {
      id: '2',
      title: 'New Course Materials Available',
      content: 'Updated course materials for Advanced Mathematics have been uploaded. Please review the new content before next week\'s session.',
      author: 'Dr. Smith',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      priority: 'normal',
      category: 'Course Update'
    },
    {
      id: '3',
      title: 'Holiday Schedule Update',
      content: 'The institution will be closed for the upcoming holiday. All classes will resume on the following Monday.',
      author: 'Administration',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      priority: 'low',
      category: 'General'
    }
  ];

  const displayAnnouncements = announcements.length > 0 ? announcements : mockAnnouncements;
  const displayRecent = displayAnnouncements.slice(0, 4);
  const displayAll = displayAnnouncements.slice(0, 12);

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
          
          <div className="text-white/80 text-sm">
            {displayAnnouncements.length} announcements available
          </div>
        </div>

        {/* Main Content Area */}
        <div className="glass-morphism rounded-3xl p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : tab === 'recent' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white/90 mb-6">Recent Announcements</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayRecent.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">📢</div>
                    <h3 className="text-xl font-medium text-white/80 mb-2">No announcements yet</h3>
                    <p className="text-white/60">Announcements will appear here when they're created.</p>
                  </div>
                ) : (
                  displayRecent.map((announcement) => (
                    <Link 
                      key={announcement.id} 
                      to={`/${institution || 'yuvraj'}/${role || 'student'}/announcements/${announcement.id}`}
                      className="block transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <YuvrajEnhancedAnnouncementCard
                        title={announcement.title}
                        content={announcement.content}
                        author={announcement.author}
                        createdAt={announcement.createdAt}
                        priority={announcement.priority || 'normal'}
                        category={announcement.category}
                      />
                    </Link>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white/90 mb-6">All Announcements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2">
                {displayAll.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">📢</div>
                    <h3 className="text-xl font-medium text-white/80 mb-2">No announcements yet</h3>
                    <p className="text-white/60">Announcements will appear here when they're created.</p>
                  </div>
                ) : (
                  displayAll.map((announcement) => (
                    <Link 
                      key={announcement.id} 
                      to={`/${institution || 'yuvraj'}/${role || 'student'}/announcements/${announcement.id}`}
                      className="block transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <YuvrajEnhancedAnnouncementCard
                        title={announcement.title}
                        content={announcement.content}
                        author={announcement.author}
                        createdAt={announcement.createdAt}
                        priority={announcement.priority || 'normal'}
                        category={announcement.category}
                        isCompact={true}
                      />
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Create Announcement Button */}
          {isPrivileged && (
            <div className="mt-8 flex justify-end">
              <YuvrajModernActionButton
                variant="primary"
                size="large"
                icon="✨"
                onClick={() => navigate(`/${institution || 'yuvraj'}/${role || 'admin'}/announcements/new`)}
              >
                Create Announcement
              </YuvrajModernActionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_Announcements;


