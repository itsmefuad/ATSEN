import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { yuvrajGetRole, yuvrajGetInstitution, yuvrajSetInstitution } from "../services/yuvraj_announcements.js";
import {
  yuvrajCreateAnnouncement,
  yuvrajGetAnnouncementById,
  yuvrajUpdateAnnouncement,
} from "../services/yuvraj_announcements_api.js";

const Field = ({ label, children }) => (
  <label className="form-control w-full">
    <div className="label">
      <span className="label-text text-white/90">{label}</span>
    </div>
    {children}
  </label>
);

const Yuvraj_AnnouncementEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = id === "new";
  const [role, setRole] = useState("student");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
  setRole(roleParam || yuvrajGetRole());
    if (!isCreate) {
      yuvrajGetAnnouncementById(id).then((d) => {
        if (!d) return;
        setTitle(d.title || "");
        setContent(d.content || "");
        setPinned(Boolean(d.pinned));
      });
    }
  // ensure institution is set in localStorage (default to configured value)
  const effectiveInstitution = institution || yuvrajGetInstitution();
  try { yuvrajSetInstitution(effectiveInstitution); } catch (e) {}
  }, [id, isCreate]);

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6 text-white">
        <div className="mx-auto max-w-3xl">
          <p>You must be an admin to edit announcements.</p>
          <Link className="link" to="/yuvraj/announcements">Back</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        if (isCreate) {
          await yuvrajCreateAnnouncement({ title, content, pinned, author: "Admin" });
        } else {
          await yuvrajUpdateAnnouncement(id, { title, content, pinned });
        }
        const effectiveInstitution = institution || yuvrajGetInstitution();
        // show confirmation animation similar to polling editor
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          navigate(`/${effectiveInstitution || 'yuvraj'}/${role || 'student'}/announcements`, { replace: true });
        }, 900);
    } catch (e) {
  console.error(e);
  alert("Failed to submit: " + (e?.message || String(e)) + " — Check backend and ADMIN key if required.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white/20 p-6 shadow-2xl backdrop-blur">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Header">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Edit here for header"
              className="input input-bordered w-full"
            />
          </Field>

          <Field label="Content">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Edit here for content"
              rows={10}
              className="textarea textarea-bordered w-full"
            />
          </Field>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-white/90">Pin to top</span>
              <input type="checkbox" className="toggle" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <Link to="/yuvraj/announcements" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative p-8 bg-white rounded-xl shadow-2xl flex flex-col items-center gap-4">
            <svg width="72" height="72" viewBox="0 0 72 72" className="overflow-visible">
              <circle cx="36" cy="36" r="34" fill="none" stroke="#10B981" strokeWidth="4" className="opacity-20" />
              <path d="M22 37 L31 46 L50 27" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'dash 0.9s ease forwards 0.2s' }} />
            </svg>
            <div className="text-lg font-semibold">Your announcement has been posted.</div>
          </div>
          <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
        </div>
      )}
    </div>
  );
};

export default Yuvraj_AnnouncementEditor;


