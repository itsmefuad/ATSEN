import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { roomAPI, handleAPIError } from "../../lib/api";

// Tab Components (to be created)
import ForumTab from "../../components/room/ForumTab";
import MaterialsTab from "../../components/room/MaterialsTab";
import ClassworkTab from "../../components/room/ClassworkTab";
import GradesTab from "../../components/room/GradesTab";

const T_Room = () => {
  const { roomId } = useParams();
  const [activeTab, setActiveTab] = useState("forum");
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch room details
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getRoom(roomId);
      setRoom(response.data);
    } catch (error) {
      console.error("Error fetching room details:", error);
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "forum", label: "Forum" },
    { id: "materials", label: "Materials" },
    { id: "classwork", label: "Classwork" },
    { id: "grades", label: "Grades" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Room not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-500 to-purple-600">
      {/* Header */}
      <div className="bg-transparent p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button className="p-2 text-white hover:bg-white/10 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{room.course_name}</h1>
              <p className="text-white/80">{room.section}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-white hover:bg-white/10 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format" 
                alt="Profile" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-8 border-b border-white/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-lg font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-white border-white"
                  : "text-white/70 border-transparent hover:text-white hover:border-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          {activeTab === "forum" && <ForumTab roomId={roomId} />}
          {activeTab === "materials" && <MaterialsTab roomId={roomId} />}
          {activeTab === "classwork" && <ClassworkTab roomId={roomId} />}
          {activeTab === "grades" && <GradesTab roomId={roomId} />}
        </div>
      </div>
    </div>
  );
};

export default T_Room;
