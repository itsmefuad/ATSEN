import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import api from "../../lib/axios";
import { ArrowLeft, Loader, Trash2, Settings, MessageSquare } from "lucide-react";
import Navbar from "../../components/Navbar";
import DiscussionForum from "../../components/room/DiscussionForum";

const T_Room = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("forum"); // Default to forum

  const navigate = useNavigate();
  const location = useLocation();

  const { id } = useParams();

  // Determine active tab based on URL
  useEffect(() => {
    if (location.pathname.includes('/edit')) {
      setActiveTab("settings");
    } else {
      setActiveTab("forum");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${id}`);
        setRoom(res.data);
      } catch (error) {
        console.log("Error in fetching room details", error);
        toast.error("Failed to fetch room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success("Room deleted successfully");
      navigate("/teacher/dashboard");
    } catch (error) {
      console.log("Error in deleting room", error);
      toast.error("Failed to delete room");
    }
  };
  const handleSave = async () => {
    if (!room.room_name.trim() || !room.description.trim()) {
      toast.error("All fields are required");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/rooms/${id}`, room);
      toast.success("Room updated successfully!");
      navigate(`/teacher/dashboard`);
    } catch (error) {
      console.log("Error updating the room", error);
      toast.error("Failed to update room");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <Loader className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/teacher/dashboard" className="btn btn-ghost">
              <ArrowLeft className="h-5 w-5" />
              Back to rooms
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-error btn-outline"
            >
              <Trash2 className="h-5 w-5" />
              Delete Room
            </button>
          </div>

          {/* Room Info Header */}
          <div className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body">
              <h1 className="text-2xl font-bold">{room.room_name}</h1>
              <p className="text-base-content/70">{room.description}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs tabs-boxed mb-6">
            <Link
              to={`/teacher/edit/room/${id}/edit`}
              className={`tab ${activeTab === "settings" ? "tab-active" : ""}`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Room Settings
            </Link>
            <Link
              to={`/teacher/room/${id}/forum`}
              className={`tab ${activeTab === "forum" ? "tab-active" : ""}`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussion Forum
            </Link>
          </div>

          {/* Tab Content */}
          {activeTab === "settings" && (
            <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Room name</span>
                </label>
                <input
                  type="text"
                  placeholder="room name"
                  className="input input-bordered"
                  value={room.room_name}
                  onChange={(e) =>
                    setRoom({ ...room, room_name: e.target.value })
                  }
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Write your description here..."
                  className="textarea textarea-bordered h-32"
                  value={room.description}
                  onChange={(e) =>
                    setRoom({ ...room, description: e.target.value })
                  }
                />
              </div>

              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
          )}

          {activeTab === "forum" && (
            <DiscussionForum roomId={id} />
          )}
        </div>
      </div>
    </div>
  );
};
export default T_Room;
