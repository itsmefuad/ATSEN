import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Loader, MessageSquare, User, Calendar, Pin } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";

const S_Room = () => {
  const [room, setRoom] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const [roomRes, announcementsRes] = await Promise.all([
          api.get(`/rooms/${id}`),
          api.get(`/forum-content/room/${id}`)
        ]);
        
        setRoom(roomRes.data);
        setAnnouncements(announcementsRes.data);
      } catch (error) {
        console.error("Error fetching room data:", error);
        toast.error("Failed to fetch room data");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/student/dashboard" className="btn btn-ghost">
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </Link>
          </div>

          {/* Room Info Header */}
          <div className="card bg-base-100 shadow-lg mb-6">
            <div className="card-body">
              <h1 className="text-2xl font-bold">{room.room_name}</h1>
              <p className="text-base-content/70">{room.description}</p>
            </div>
          </div>

          {/* Discussion Forum */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Discussion Forum</h2>
            </div>

            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-base-content/70 mb-2">
                  No announcements yet
                </h3>
                <p className="text-base-content/50">
                  Check back later for announcements from your instructor!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement._id} 
                    className={`card bg-base-100 shadow-lg ${announcement.isPinned ? 'border-l-4 border-l-warning' : ''}`}
                  >
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{announcement.title}</h3>
                          {announcement.isPinned && (
                            <Pin className="h-4 w-4 text-warning" />
                          )}
                        </div>
                      </div>

                      <div className="prose max-w-none mb-4">
                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                      </div>

                      {announcement.tags && announcement.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {announcement.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="badge badge-outline badge-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-base-content/70">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                                                          <User className="h-3 w-3" />
                                                         <span>{announcement.author?.name || 'Teacher'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                                                          <Calendar className="h-3 w-3" />
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default S_Room;
