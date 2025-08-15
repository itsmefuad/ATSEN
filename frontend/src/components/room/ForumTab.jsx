import { useState, useEffect } from "react";
import { announcementAPI, handleAPIError } from "../../lib/api";

const ForumTab = ({ roomId }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [roomId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementAPI.getAnnouncementsByRoom(roomId);
      setAnnouncements(response.data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      handleAPIError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await announcementAPI.createAnnouncement(roomId, {
        title: newAnnouncement.title,
        content: newAnnouncement.content
      });
      
      setAnnouncements([response.data, ...announcements]);
      setNewAnnouncement({ title: "", content: "" });
      setShowAddAnnouncement(false);
    } catch (error) {
      console.error("Error adding announcement:", error);
      handleAPIError(error);
    }
  };

  const handleAddComment = async (announcementId, comment) => {
    try {
      const response = await announcementAPI.addComment(announcementId, {
        content: comment
      });
      
      setAnnouncements(announcements.map(announcement => 
        announcement._id === announcementId ? response.data : announcement
      ));
    } catch (error) {
      console.error("Error adding comment:", error);
      handleAPIError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Announcement Button */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <button
          onClick={() => setShowAddAnnouncement(true)}
          className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          Add an announcement
        </button>
      </div>

      {/* Add Announcement Form */}
      {showAddAnnouncement && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <form onSubmit={handleAddAnnouncement} className="space-y-4">
            <input
              type="text"
              placeholder="Announcement title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <textarea
              placeholder="Write your announcement content..."
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
              className="w-full p-3 border rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post
              </button>
              <button
                type="button"
                onClick={() => setShowAddAnnouncement(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement._id}
          announcement={announcement}
          onAddComment={handleAddComment}
        />
      ))}

      {announcements.length === 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-lg text-center">
          <p className="text-gray-600">No announcements yet. Create the first one!</p>
        </div>
      )}
    </div>
  );
};

const AnnouncementCard = ({ announcement, onAddComment }) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(announcement._id, newComment);
      setNewComment("");
      setShowCommentForm(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
          <p className="text-sm text-gray-600">{formatDate(announcement.createdAt)}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 mb-4">{announcement.content}</p>
      </div>

      {/* Comments Section */}
      {announcement.comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {announcement.comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm text-gray-800">{comment.student.name}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-gray-700 text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Section */}
      {showCommentForm ? (
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Comment
            </button>
            <button
              type="button"
              onClick={() => setShowCommentForm(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowCommentForm(true)}
          className="w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 text-left transition-colors"
        >
          Add a comment
        </button>
      )}
    </div>
  );
};

export default ForumTab;