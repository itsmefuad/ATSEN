import { useState } from "react";
import { Plus, X, Tag, Pin } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const CreateAnnouncement = ({ roomId, onAnnouncementCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    isPinned: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await api.post(`/announcements/room/${roomId}`, {
        title: formData.title,
        content: formData.content,
        tags,
        isPinned: formData.isPinned
      });

      toast.success("Announcement created successfully!");
      setFormData({ title: "", content: "", tags: "", isPinned: false });
      setIsOpen(false);
      onAnnouncementCreated(response.data);
    } catch (error) {
      console.error("Error creating announcement:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(`Failed to create announcement: ${error.response?.data?.details || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "", tags: "", isPinned: false });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary btn-sm gap-2"
      >
        <Plus className="h-4 w-4" />
        New Announcement
      </button>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg border border-primary/20">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Create New Announcement</h3>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title</span>
            </label>
            <input
              type="text"
              placeholder="Enter announcement title..."
              className="input input-bordered"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Content</span>
            </label>
            <textarea
              placeholder="Write your announcement content..."
              className="textarea textarea-bordered h-32"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (comma-separated)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., important, homework, exam"
              className="input input-bordered"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-medium flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pin this announcement
              </span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              />
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncement;
