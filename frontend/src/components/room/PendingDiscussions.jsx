import { useState, useEffect } from "react";
import {
  Clock,
  Check,
  X,
  User,
  Calendar,
  Tag,
  AlertCircle,
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const PendingDiscussions = ({ roomId, onDiscussionApproved }) => {
  const [pendingDiscussions, setPendingDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchPendingDiscussions = async () => {
    try {
      const response = await api.get(`/forum-content/room/${roomId}/pending`);
      setPendingDiscussions(response.data);
    } catch (error) {
      console.error("Error fetching pending discussions:", error);
      toast.error("Failed to fetch pending discussions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchPendingDiscussions();
    }
  }, [roomId]);

  const handleApprove = async (discussionId) => {
    setActionLoading((prev) => ({ ...prev, [discussionId]: "approving" }));
    try {
      // Mock instructor ID - in a real app, this would come from authentication
      const mockInstructorId = "507f1f77bcf86cd799439012";

      const response = await api.patch(
        `/forum-content/${discussionId}/approve`,
        {
          instructorId: mockInstructorId,
        }
      );

      toast.success("Discussion approved successfully!");

      // Remove from pending list
      setPendingDiscussions((prev) =>
        prev.filter((discussion) => discussion._id !== discussionId)
      );

      // Notify parent component
      if (onDiscussionApproved) {
        onDiscussionApproved(response.data);
      }
    } catch (error) {
      console.error("Error approving discussion:", error);
      toast.error(
        error.response?.data?.message || "Failed to approve discussion"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [discussionId]: null }));
    }
  };

  const handleReject = async (discussionId) => {
    const reason = prompt("Please provide a reason for rejection (optional):");
    if (reason === null) return; // User cancelled

    setActionLoading((prev) => ({ ...prev, [discussionId]: "rejecting" }));
    try {
      await api.patch(`/forum-content/${discussionId}/reject`, {
        reason: reason || "No reason provided",
      });

      toast.success("Discussion rejected and removed");

      // Remove from pending list
      setPendingDiscussions((prev) =>
        prev.filter((discussion) => discussion._id !== discussionId)
      );
    } catch (error) {
      console.error("Error rejecting discussion:", error);
      toast.error(
        error.response?.data?.message || "Failed to reject discussion"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [discussionId]: null }));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="loading loading-spinner loading-md"></div>
      </div>
    );
  }

  if (pendingDiscussions.length === 0) {
    return (
      <div className="text-center py-6">
        <Check className="h-10 w-10 text-success mx-auto mb-3" />
        <h4 className="text-md font-medium text-base-content/70 mb-1">
          No pending discussions
        </h4>
        <p className="text-sm text-base-content/50">
          All student discussions have been reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-warning" />
        <h3 className="text-lg font-semibold">
          Pending Discussions ({pendingDiscussions.length})
        </h3>
      </div>

      {pendingDiscussions.map((discussion) => (
        <div
          key={discussion._id}
          className="card bg-base-100 border border-warning/30 shadow-sm"
        >
          <div className="card-body">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1">
                <h4 className="text-lg font-semibold">{discussion.title}</h4>
                <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 text-warning rounded-full text-xs">
                  <Clock className="h-3 w-3" />
                  <span>Pending Review</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(discussion._id)}
                  disabled={actionLoading[discussion._id]}
                  className="btn btn-success btn-sm text-white"
                  title="Approve Discussion"
                >
                  {actionLoading[discussion._id] === "approving" ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Approve
                </button>

                <button
                  onClick={() => handleReject(discussion._id)}
                  disabled={actionLoading[discussion._id]}
                  className="btn btn-error btn-sm text-white"
                  title="Reject Discussion"
                >
                  {actionLoading[discussion._id] === "rejecting" ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Reject
                </button>
              </div>
            </div>

            <div className="prose max-w-none mb-4">
              <p className="whitespace-pre-wrap text-sm">
                {discussion.content}
              </p>
            </div>

            {discussion.tags && discussion.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {discussion.tags.map((tag, index) => (
                  <span key={index} className="badge badge-outline badge-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-base-content/70">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Student</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(discussion.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingDiscussions;
