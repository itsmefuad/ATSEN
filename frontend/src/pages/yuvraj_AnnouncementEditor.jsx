import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  yuvrajCreateAnnouncement,
  yuvrajGetAnnouncementById,
  yuvrajGetRole,
  yuvrajUpdateAnnouncement,
} from "../services/yuvraj_announcements.js";

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

  useEffect(() => {
    setRole(yuvrajGetRole());
    if (!isCreate) {
      yuvrajGetAnnouncementById(id).then((d) => {
        if (!d) return;
        setTitle(d.title || "");
        setContent(d.content || "");
        setPinned(Boolean(d.pinned));
      });
    }
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
    if (isCreate) {
      const newItem = await yuvrajCreateAnnouncement({ title, content, pinned, author: "Admin" });
      navigate(`/yuvraj/announcements/${newItem.id}`);
    } else {
      await yuvrajUpdateAnnouncement(id, { title, content, pinned });
      navigate(`/yuvraj/announcements/${id}`);
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
    </div>
  );
};

export default Yuvraj_AnnouncementEditor;


