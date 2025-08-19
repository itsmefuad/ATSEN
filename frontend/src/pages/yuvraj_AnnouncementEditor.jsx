import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { yuvrajGetRole, yuvrajGetInstitution, yuvrajSetInstitution } from "../services/yuvraj_announcements.js";
import {
  yuvrajCreateAnnouncement,
  yuvrajGetAnnouncementById,
  yuvrajUpdateAnnouncement,
  yuvrajDeleteAnnouncement,
} from "../services/yuvraj_announcements_api.js";
import YuvrajModernHeader from "../components/yuvraj_ModernHeader.jsx";
import YuvrajModernActionButton from "../components/yuvraj_ModernActionButton.jsx";
import YuvrajLiquidGlassCard from "../components/yuvraj_LiquidGlassCard.jsx";

const EnhancedField = ({ label, children, required = false }) => (
  <div className="space-y-2">
    <label className="block">
      <span className="text-sm font-medium text-white/90">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </span>
    </label>
    {children}
  </div>
);

const Yuvraj_AnnouncementEditor = () => {
  const { id, institution, role: roleParam } = useParams();
  const navigate = useNavigate();
  const isCreate = id === "new";
  
  console.log("AnnouncementEditor render - id:", id, "institution:", institution, "roleParam:", roleParam, "isCreate:", isCreate);
  const [role, setRole] = useState("student");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [category, setCategory] = useState("");
  const [pinned, setPinned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    console.log("AnnouncementEditor useEffect - id:", id, "isCreate:", isCreate);
    setRole(roleParam || yuvrajGetRole());
    if (!isCreate) {
      yuvrajGetAnnouncementById(id).then((d) => {
        if (!d) return;
        setTitle(d.title || "");
        setContent(d.content || "");
        setPriority(d.priority || "normal");
        setCategory(d.category || "");
        setPinned(Boolean(d.pinned));
      });
    }
    // ensure institution is set in localStorage
    const effectiveInstitution = institution || yuvrajGetInstitution();
    try { yuvrajSetInstitution(effectiveInstitution); } catch (e) {}
  }, [id, isCreate, institution, roleParam]);

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 mx-auto max-w-4xl p-6">
          <YuvrajModernHeader
            title="Access Denied"
            subtitle="You must be an admin to edit announcements"
            variant="announcements"
          />
          
          <div className="glass-morphism rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-semibold text-white/90 mb-4">Admin Access Required</h2>
            <p className="text-white/70 mb-6">Only administrators can create and edit announcements.</p>
            <Link to={`/${institution || 'yuvraj'}/student/announcements`}>
              <YuvrajModernActionButton variant="secondary" size="medium">
                Back to Announcements
              </YuvrajModernActionButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate that we have an ID for updates
    if (!isCreate && !id) {
      alert("Invalid announcement ID. Please go back and try again.");
      return;
    }

    console.log("handleSubmit - isCreate:", isCreate, "id:", id, "announcementData:", announcementData);

    setIsSubmitting(true);
    try {
      const announcementData = { 
        title: title.trim(), 
        content: content.trim(), 
        priority,
        category: category.trim(),
        pinned, 
        author: "Admin" 
      };

      if (isCreate) {
        await yuvrajCreateAnnouncement(announcementData);
      } else {
        await yuvrajUpdateAnnouncement(id, announcementData);
      }

      const effectiveInstitution = institution || yuvrajGetInstitution();
      setShowConfirmation(true);
      
      setTimeout(() => {
        setShowConfirmation(false);
        navigate(`/${effectiveInstitution || 'yuvraj'}/${role || 'admin'}/announcements`, { replace: true });
      }, 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to submit: " + (e?.message || String(e)) + " — Check backend and ADMIN key if required.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || isCreate) return;
    
    setIsDeleting(true);
    try {
      await yuvrajDeleteAnnouncement(id);
      const effectiveInstitution = institution || yuvrajGetInstitution();
      navigate(`/${effectiveInstitution || 'yuvraj'}/${role || 'admin'}/announcements`, { replace: true });
    } catch (e) {
      console.error(e);
      alert("Failed to delete announcement: " + (e?.message || String(e)));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const priorityOptions = [
    { value: "low", label: "Low Priority", color: "text-emerald-400" },
    { value: "normal", label: "Normal", color: "text-blue-400" },
    { value: "high", label: "High Priority", color: "text-amber-400" },
    { value: "urgent", label: "Urgent", color: "text-red-400" }
  ];

  const categoryOptions = [
    "General", "Course Update", "Platform Update", "Event", "Holiday", "Maintenance", "Important"
  ];

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
          title={isCreate ? "Create Announcement" : "Edit Announcement"}
          subtitle={isCreate ? "Share important information with the community" : "Update announcement details"}
          variant="announcements"
          showNavigation={true}
          currentView="announcements"
        />

        <div className="glass-morphism rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <EnhancedField label="Title" required>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                maxLength={100}
              />
            </EnhancedField>

            {/* Priority and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EnhancedField label="Priority">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value} className={option.color}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </EnhancedField>

              <EnhancedField label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </EnhancedField>
            </div>

            {/* Content Field */}
            <EnhancedField label="Content" required>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter announcement content..."
                rows={8}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 resize-none"
                maxLength={1000}
              />
              <div className="text-right text-xs text-white/50 mt-1">
                {content.length}/1000 characters
              </div>
            </EnhancedField>

            {/* Pinned Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="pinned"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="pinned" className="text-sm text-white/90 cursor-pointer">
                Pin to top of announcements
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex gap-3">
                <Link to={`/${institution || 'yuvraj'}/${role || 'admin'}/announcements`}>
                  <YuvrajModernActionButton variant="ghost" size="medium">
                    Cancel
                  </YuvrajModernActionButton>
                </Link>
                
                {!isCreate && (
                  <YuvrajModernActionButton
                    variant="danger"
                    size="medium"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </YuvrajModernActionButton>
                )}
              </div>

              <YuvrajModernActionButton
                type="submit"
                variant="primary"
                size="large"
                icon="✨"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                loading={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : (isCreate ? "Create Announcement" : "Update Announcement")}
              </YuvrajModernActionButton>
            </div>
          </form>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative p-12 bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 rounded-3xl shadow-2xl flex flex-col items-center gap-6 text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Success!</h3>
              <p className="text-white/90">
                {isCreate ? "Announcement created successfully!" : "Announcement updated successfully!"}
              </p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-white transition-all duration-2000 ease-linear" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

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

export default Yuvraj_AnnouncementEditor;


