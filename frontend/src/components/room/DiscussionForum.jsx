import { useState, useEffect } from "react";
import { MessageSquare, Loader } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import CreateAnnouncement from "./CreateAnnouncement";
import AnnouncementCard from "./AnnouncementCard";

const DiscussionForum = ({ roomId }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animatingAnnouncements, setAnimatingAnnouncements] = useState(new Set());

  const fetchAnnouncements = async () => {
    try {
      console.log("Fetching announcements for room:", roomId);
      const response = await api.get(`/announcements/room/${roomId}`);
      console.log("Fetched announcements:", response.data);
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("DiscussionForum useEffect triggered with roomId:", roomId);
    if (roomId) {
      fetchAnnouncements();
    }
  }, [roomId]);

  const handleAnnouncementCreated = (newAnnouncement) => {
    setAnnouncements(prev => {
      // Sort announcements properly: pinned first, then by creation date
      const updatedAnnouncements = [...prev, newAnnouncement];
      return updatedAnnouncements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });
  };

  const handleAnnouncementUpdated = (updatedAnnouncement) => {
    // Add animation tracking for the updated announcement
    setAnimatingAnnouncements(prev => new Set([...prev, updatedAnnouncement._id]));
    
    setAnnouncements(prev => {
      // Update the announcement and re-sort
      const updatedAnnouncements = prev.map(announcement => 
        announcement._id === updatedAnnouncement._id ? updatedAnnouncement : announcement
      );
      
      // Sort announcements properly: pinned first, then by creation date
      return updatedAnnouncements.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });
    
    // Remove animation tracking after animation completes
    setTimeout(() => {
      setAnimatingAnnouncements(prev => {
        const newSet = new Set(prev);
        newSet.delete(updatedAnnouncement._id);
        return newSet;
      });
    }, 700);
  };

  const handleAnnouncementDeleted = (deletedId) => {
    setAnnouncements(prev => prev.filter(announcement => announcement._id !== deletedId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Discussion Forum</h2>
        </div>
        <CreateAnnouncement 
          roomId={roomId} 
          onAnnouncementCreated={handleAnnouncementCreated}
        />
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content/70 mb-2">
            No announcements yet
          </h3>
          <p className="text-base-content/50">
            Be the first to create an announcement for this room!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <div
              key={announcement._id}
              className={`transition-all duration-700 ease-in-out ${
                animatingAnnouncements.has(announcement._id) 
                  ? 'animate-pulse shadow-xl scale-105' 
                  : ''
              }`}
              style={{
                transform: `translateY(0px)`,
                transitionDelay: `${index * 30}ms`,
                order: index,
                zIndex: animatingAnnouncements.has(announcement._id) ? 10 : 1
              }}
            >
              <AnnouncementCard
                announcement={announcement}
                onUpdate={handleAnnouncementUpdated}
                onDelete={handleAnnouncementDeleted}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiscussionForum;
