import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { yuvrajGetRole, yuvrajIsPrivileged } from "../services/yuvraj_auth.js";
import { yuvrajGetAnnouncementById, yuvrajDeleteAnnouncement } from "../services/yuvraj_announcements_api.js";
import YuvrajModernHeader from "../components/yuvraj_ModernHeader.jsx";
import YuvrajModernActionButton from "../components/yuvraj_ModernActionButton.jsx";
import YuvrajLiquidGlassCard from "../components/yuvraj_LiquidGlassCard.jsx";

const PriorityBadge = ({ priority }) => {
  const config = {
    low: { color: "from-emerald-400/20 to-emerald-600/10", border: "border-emerald-400/30", text: "text-emerald-400" },
    normal: { color: "from-blue-400/20 to-blue-600/10", border: "border-blue-400/30", text: "text-blue-400" },
    high: { color: "from-amber-400/20 to-amber-600/10", border: "border-amber-400/30", text: "text-amber-400" },
    urgent: { color: "from-red-400/20 to-red-600/10", border: "border-red-400/30", text: "text-red-400" }
  };

  const priorityConfig = config[priority] || config.normal;

  return (
    <div className={`px-4 py-2 rounded-full text-sm font-medium border bg-gradient-to-r ${priorityConfig.color} ${priorityConfig.border}`}>
      <span className={priorityConfig.text}>
        {priority === 'low' && 'Low Priority'}
        {priority === 'normal' && 'Normal'}
        {priority === 'high' && 'High Priority'}
        {priority === 'urgent' && 'Urgent'}
      </span>
    </div>
  );
};

const CategoryBadge = ({ category }) => {
  if (!category) return null;
  
  return (
    <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white/80">
      {category}
    </div>
  );
};

const Yuvraj_AnnouncementDetail = () => {
  const { id, institution, role: roleParam } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setRole(roleParam || yuvrajGetRole());
    setIsPrivileged(roleParam === 'admin' || roleParam === 'instructor' || yuvrajIsPrivileged());

    if (id) {
      setIsLoading(true);
      yuvrajGetAnnouncementById(id)
        .then((data) => {
          setAnnouncement(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch announcement:', error);
          setIsLoading(false);
        });
    }
  }, [id, roleParam]);

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      await yuvrajDeleteAnnouncement(id);
      const effectiveInstitution = institution || 'yuvraj';
      navigate(`/${effectiveInstitution}/${role || 'admin'}/announcements`, { replace: true });
    } catch (e) {
      console.error(e);
      alert("Failed to delete announcement: " + (e?.message || String(e)));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const announcementDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - announcementDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return announcementDate.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl p-6">
          <YuvrajModernHeader
            title="Loading..."
            subtitle="Fetching announcement details"
            variant="announcements"
          />
          
          <div className="glass-morphism rounded-3xl p-8 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl p-6">
          <YuvrajModernHeader
            title="Announcement Not Found"
            subtitle="The requested announcement could not be found"
            variant="announcements"
          />
          
          <div className="glass-morphism rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-semibold text-white/90 mb-4">Announcement Not Found</h2>
            <p className="text-white/70 mb-6">The announcement you're looking for doesn't exist or has been removed.</p>
            <Link to={`/${institution || 'yuvraj'}/${role || 'student'}/announcements`}>
              <YuvrajModernActionButton variant="primary" size="medium">
                Back to Announcements
              </YuvrajModernActionButton>
            </Link>
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

      <div className="relative z-10 mx-auto max-w-4xl p-6">
        <YuvrajModernHeader
          title="Announcement Details"
          subtitle="View complete announcement information"
          variant="announcements"
          showNavigation={true}
          currentView="announcements"
        />

        <div className="glass-morphism rounded-3xl p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white/95 leading-tight mb-3">
                  {announcement.title}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <PriorityBadge priority={announcement.priority || 'normal'} />
                  <CategoryBadge category={announcement.category} />
                  {announcement.pinned && (
                    <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-400 text-xs font-medium">
                      📌 Pinned
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex items-center justify-between text-sm text-white/70">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/40"></div>
                  <span>By {announcement.author || 'Admin'}</span>
                </div>
                <span>•</span>
                <span>{formatDate(announcement.createdAt)}</span>
                {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                  <>
                    <span>•</span>
                    <span>Updated {formatDate(announcement.updatedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mb-8">
            <div className="prose prose-invert max-w-none">
              <div className="text-lg text-white/90 leading-relaxed whitespace-pre-wrap">
                {announcement.content}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <Link to={`/${institution || 'yuvraj'}/${role || 'student'}/announcements`}>
              <YuvrajModernActionButton variant="ghost" size="medium">
                ← Back to Announcements
              </YuvrajModernActionButton>
            </Link>

            {isPrivileged && (
              <div className="flex gap-3">
                <Link to={`/${institution || 'yuvraj'}/${role || 'admin'}/announcements/${id}/edit`}>
                  <YuvrajModernActionButton variant="secondary" size="medium" icon="✏️">
                    Edit
                  </YuvrajModernActionButton>
                </Link>
                
                <YuvrajModernActionButton
                  variant="danger"
                  size="medium"
                  icon="🗑️"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </YuvrajModernActionButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative p-8 bg-gradient-to-br from-red-500/90 to-red-600/90 rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-4">Delete Announcement?</h3>
              <p className="text-white/90 mb-6">
                This action cannot be undone. The announcement will be permanently removed.
              </p>
              <div className="flex gap-3 justify-center">
                <YuvrajModernActionButton
                  variant="secondary"
                  size="medium"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </YuvrajModernActionButton>
                <YuvrajModernActionButton
                  variant="danger"
                  size="medium"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </YuvrajModernActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Yuvraj_AnnouncementDetail;


