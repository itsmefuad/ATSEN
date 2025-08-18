import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { yuvrajCreateAnnouncement, yuvrajUpdateAnnouncement, yuvrajGetAnnouncementById } from "../services/yuvraj_announcements_api.js";

const Field = ({ label, children }) => (
  <label className="form-control w-full">
    <div className="label">
      <span className="label-text text-white/90">{label}</span>
    </div>
    {children}
  </label>
);

const Yuvraj_AnnouncementEditor = () => {
  const params = useParams();
  const navigate = useNavigate();
  
  // Handle both route patterns:
  // 1. /yuvraj/admin/announcements/:id (old pattern)
  // 2. /:institution/:role/announcements/:id (new pattern)
  const id = params.id;
  const institution = params.institution || 'yuvraj';
  const role = params.role || 'admin';
  
  const isCreate = !id || id === "new";
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set privileges based on role
    setIsPrivileged(role === 'admin' || role === 'instructor');
    
    // Persist institution for API header
    try { 
      localStorage.setItem('yuvraj_institution', institution); 
    } catch(e){} 
    
    // Load existing announcement if editing
    if (!isCreate && id) {
      const loadAnnouncement = async () => {
        try {
          setLoading(true);
          const data = await yuvrajGetAnnouncementById(id);
          if (data) {
            setTitle(data.title || "");
            setContent(data.content || "");
            setPinned(data.pinned || false);
          }
        } catch (err) {
          console.error('Failed to load announcement:', err);
          setErrorMessage('Failed to load announcement: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      
      loadAnnouncement();
    }
  }, [id, isCreate, institution, role]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!isPrivileged) {
      setErrorMessage("Only admins and instructors can create/edit announcements.");
      return;
    }
    
    setErrorMessage("");
    if (!title || !title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }
    if (!content || !content.trim()) {
      setErrorMessage("Content is required.");
      return;
    }
    
    try {
      setLoading(true);
      const body = { title: title.trim(), content: content.trim(), pinned: Boolean(pinned) };
      
      if (isCreate) {
        await yuvrajCreateAnnouncement(body);
      } else {
        if (!id) {
          setErrorMessage("Cannot update: No announcement ID provided.");
          return;
        }
        await yuvrajUpdateAnnouncement(id, body);
      }
      
      // Navigate back to announcements list
      const safePrefix = institution ? `/${institution}/${role}` : `/${role}`;
      navigate(`${safePrefix}/announcements`, { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      setErrorMessage("Failed to save: " + msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isPrivileged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <div className="text-red-400 text-lg mb-2">Access Denied</div>
            <div className="text-red-300 text-sm">Only admins and instructors can create/edit announcements.</div>
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-primary mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">ATSEN</span>
          </div>
          <nav className="flex items-center gap-4">
            <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">Home</div>
            <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">Dashboard</div>
            <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">Notifications</div>
            <div className="rounded-full bg-white/20 px-4 py-2 text-white shadow backdrop-blur">Profile</div>
          </nav>
        </div>

        <div className="rounded-3xl bg-white/20 p-6 shadow-2xl backdrop-blur">
          <h1 className="text-2xl font-bold text-white mb-6">
            {isCreate ? "Create New Announcement" : "Edit Announcement"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 mb-2 rounded bg-red-600 text-white">{errorMessage}</div>
            )}

            <Field label="Title">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter announcement title"
                disabled={loading}
              />
            </Field>

            <Field label="Content">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="textarea textarea-bordered w-full h-32"
                placeholder="Enter announcement content"
                disabled={loading}
              />
            </Field>

            <Field label="Pin Announcement">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="checkbox"
                  disabled={loading}
                />
                <span className="text-white/90">Pin this announcement to the top</span>
              </label>
            </Field>

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-ghost text-white"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : (isCreate ? "Create Announcement" : "Update Announcement")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Yuvraj_AnnouncementEditor;


