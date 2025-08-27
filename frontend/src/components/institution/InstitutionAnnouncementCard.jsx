import { useState } from "react";
import { Pin, Tag, Edit, Trash2, Calendar } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const InstitutionAnnouncementCard = ({
  announcement,
  onUpdate,
  onDelete,
  canEdit = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: announcement.title,
    content: announcement.content,
    tags: announcement.tags.join(", "),
    isPinned: announcement.isPinned,
  });
  const [loading, setLoading] = useState(false);

  const handleEdit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tags = editFormData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await api.put(
        `/institution-announcements/${announcement.institution}/${announcement._id}`,
        {
          title: editFormData.title,
          content: editFormData.content,
          tags,
          isPinned: editFormData.isPinned,
        }
      );

      toast.success("Announcement updated successfully!");
      setIsEditing(false);
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error("Error updating announcement:", error);
      toast.error(
        `Failed to update announcement: ${
          error.response?.data?.details || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    setLoading(true);
    try {
      await api.delete(
        `/institution-announcements/${announcement.institution}/${announcement._id}`
      );
      toast.success("Announcement deleted successfully!");
      if (onDelete) {
        onDelete(announcement._id);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error(
        `Failed to delete announcement: ${
          error.response?.data?.details || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async () => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/institution-announcements/${announcement.institution}/${announcement._id}/toggle-pin`
      );
      toast.success(
        `Announcement ${
          response.data.isPinned ? "pinned" : "unpinned"
        } successfully!`
      );
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error(
        `Failed to toggle pin: ${
          error.response?.data?.details || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isEditing) {
    return (
      <div className="card bg-base-100 border border-base-300 shadow-md">
        <div className="card-body">
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={editFormData.title}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Content</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                value={editFormData.content}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, content: e.target.value })
                }
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Tags</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={editFormData.tags}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, tags: e.target.value })
                }
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
                  checked={editFormData.isPinned}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      isPinned: e.target.checked,
                    })
                  }
                />
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
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
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`card bg-base-100 border shadow-md transition-all duration-300 ease-in-out ${
        announcement.isPinned
          ? "border-yellow-300 bg-yellow-50/30 border-l-4 border-l-yellow-500 scale-[1.02]"
          : "border-base-300"
      }`}
    >
      <div className="card-body">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-base-content">
              {announcement.title}
            </h3>
            {announcement.isPinned && (
              <Pin className="h-4 w-4 text-yellow-600" />
            )}
          </div>

          {canEdit && (
            <div className="flex gap-1">
              <button
                onClick={handleTogglePin}
                className={`btn btn-ghost btn-sm transition-all duration-200 ${
                  announcement.isPinned
                    ? "text-yellow-600 hover:bg-yellow-100"
                    : "hover:bg-base-200"
                }`}
                title={announcement.isPinned ? "Unpin" : "Pin"}
                disabled={loading}
              >
                <Pin
                  className={`h-4 w-4 transition-transform duration-200 ${
                    announcement.isPinned ? "rotate-12" : ""
                  }`}
                />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-ghost btn-sm"
                title="Edit"
                disabled={loading}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-ghost btn-sm text-error"
                title="Delete"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-base-content/80 mb-3 whitespace-pre-wrap">
          {announcement.content}
        </p>

        {announcement.tags && announcement.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Tag className="h-4 w-4 text-base-content/60" />
            {announcement.tags.map((tag, index) => (
              <span key={index} className="badge badge-outline badge-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-base-content/60">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(announcement.createdAt)}</span>
            </div>
            {announcement.author?.name && (
              <span>By {announcement.author.name}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionAnnouncementCard;
