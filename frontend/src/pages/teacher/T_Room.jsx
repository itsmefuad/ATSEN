// src/pages/teacher/T_Room.jsx

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams, useLocation } from "react-router";
import api from "../../lib/axios";
import {
  ArrowLeft,
  Loader,
  Trash2,
  Settings,
  MessageSquare,
  BookOpen,
  Calendar,
  TrendingUp,
  Video, // ← added Video icon
} from "lucide-react";
import Navbar from "../../components/Navbar";
import DiscussionForum from "../../components/room/DiscussionForum";
import Materials from "../../components/room/Materials";
import Assessment from "../../components/room/Assessment";
import TeacherGrades from "../../components/room/TeacherGrades";
import CourseTimeline from "../../components/room/CourseTimeline";

const T_Room = () => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false); // ← added meetingLoading
  const [activeTab, setActiveTab] = useState("forum"); // Default to forum

  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Determine active tab based on URL
  useEffect(() => {
    if (location.pathname.includes("/edit")) {
      setActiveTab("settings");
    } else if (location.pathname.includes("/materials")) {
      setActiveTab("materials");
    } else if (location.pathname.includes("/assessment")) {
      setActiveTab("assessment");
    } else if (location.pathname.includes("/grades")) {
      setActiveTab("grades");
    } else {
      setActiveTab("forum");
    }
  }, [location.pathname]);

  // Fetch room details
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

  // Delete room handler
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

  // Save room settings handler
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

  // Meeting creation handler
  const handleMeeting = async () => {
    setMeetingLoading(true);
    try {
      const res = await api.post(`/rooms/${id}/meeting`);
      window.open(res.data.join_url, "_blank");
      toast.success("Meeting started!");
    } catch (error) {
      console.error("Error creating meeting:", error);
      toast.error("Could not start meeting");
    } finally {
      setMeetingLoading(false);
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
        {/* Back to Dashboard Button */}
        <div className="mb-6 flex justify-start">
          <Link to="/teacher/dashboard" className="btn btn-ghost">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              {/* Room Info Header with Meeting & Settings */}
              <div className="card bg-base-100 border border-base-300 mb-6">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-base-content">
                        {room.room_name}
                      </h1>
                      <p className="text-base-content/70">{room.description}</p>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      {/* Meeting button first */}
                      <button
                        onClick={handleMeeting}
                        disabled={meetingLoading}
                        className="btn btn-primary btn-sm"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        {meetingLoading ? "Starting…" : "Meeting"}
                      </button>
                      {/* Settings button second */}
                      <Link
                        to={`/teacher/room/${id}/edit`}
                        className={`btn btn-sm ${
                          activeTab === "settings" ? "btn-primary" : "btn-ghost"
                        }`}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs tabs-boxed mb-6">
                <Link
                  to={`/teacher/room/${id}/forum`}
                  className={`tab ${activeTab === "forum" ? "tab-active" : ""}`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discussion Forum
                </Link>
                <Link
                  to={`/teacher/room/${id}/materials`}
                  className={`tab ${
                    activeTab === "materials" ? "tab-active" : ""
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Materials
                </Link>
                <Link
                  to={`/teacher/room/${id}/assessment`}
                  className={`tab ${
                    activeTab === "assessment" ? "tab-active" : ""
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Assessment
                </Link>
                <Link
                  to={`/teacher/room/${id}/grades`}
                  className={`tab ${
                    activeTab === "grades" ? "tab-active" : ""
                  }`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Grades
                </Link>
              </div>

              {/* Tab Content */}
              {activeTab === "settings" && (
                <div className="card bg-base-100 border border-base-300">
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="label">
                        <span className="label-text">Room name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="room name"
                        className="input input-bordered w-full"
                        value={room.room_name}
                        onChange={(e) =>
                          setRoom({ ...room, room_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-4">
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea
                        placeholder="Write your description here..."
                        className="textarea textarea-bordered w-full h-32"
                        value={room.description}
                        onChange={(e) =>
                          setRoom({ ...room, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="btn btn-error"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Room
                      </button>
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

              {activeTab === "forum" && <DiscussionForum roomId={id} />}
              {activeTab === "materials" && <Materials roomId={id} />}
              {activeTab === "assessment" && (
                <Assessment roomId={id} room={room} />
              )}
              {activeTab === "grades" && <TeacherGrades roomId={id} />}
            </div>

            {/* Timeline Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <CourseTimeline roomId={id} room={room} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default T_Room;
