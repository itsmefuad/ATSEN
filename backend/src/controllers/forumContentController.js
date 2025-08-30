import ForumContent from "../models/ForumContent.js";
import Room from "../models/Room.js";

// Get all forum content for a room
export const getForumContentByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userRole, userId } = req.query;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    let query = { room: roomId };

    // Filter based on user role and approval status
    if (userRole === "student") {
      // Students can only see:
      // 1. Approved content
      // 2. Their own discussions (regardless of approval status)
      query = {
        room: roomId,
        $or: [
          { isApproved: true },
          { author: userId, contentType: "discussion" },
        ],
      };
    } else if (userRole === "instructor") {
      // Instructors can see all content
      // No additional filtering needed
    } else {
      // For backwards compatibility, show only approved content
      query.isApproved = true;
    }

    const forumContent = await ForumContent.find(query)
      .populate("approvedBy", "name email")
      .sort({ isPinned: -1, createdAt: -1 });

    console.log(
      `Found ${forumContent.length} forum content items for room ${roomId}`
    );
    console.log("Forum content:", forumContent);

    res.status(200).json(forumContent);
  } catch (error) {
    console.error("Error fetching forum content:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId: req.params.roomId,
    });
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Create a new forum content item
export const createForumContent = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, content, tags, isPinned, contentType, userRole, authorId } =
      req.body;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Use provided authorId or fallback to mock user ID
    const author = authorId || "507f1f77bcf86cd799439011";

    // Determine approval status based on content type and user role
    let isApproved = true; // Default to approved
    let approvedBy = null;
    let approvedAt = null;

    if (contentType === "discussion" && userRole === "student") {
      // Student discussions need approval
      isApproved = false;
    } else if (contentType === "announcement" || userRole === "instructor") {
      // Announcements and instructor posts are auto-approved
      isApproved = true;
      if (userRole === "instructor") {
        approvedBy = author;
        approvedAt = new Date();
      }
    }

    // Create forum content
    const forumContent = new ForumContent({
      title,
      content,
      room: roomId,
      contentType: contentType || "announcement",
      author,
      tags: tags || [],
      isPinned: isPinned || false,
      isApproved,
      approvedBy,
      approvedAt,
    });

    const savedForumContent = await forumContent.save();

    // Populate the approvedBy field for response
    await savedForumContent.populate("approvedBy", "name email");

    console.log("Created forum content:", savedForumContent);
    console.log("Room ID saved:", savedForumContent.room);

    res.status(201).json(savedForumContent);
  } catch (error) {
    console.error("Error creating forum content:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId,
      body: req.body,
    });
    res
      .status(500)
      .json({ message: "Internal server error", details: error.message });
  }
};

// Update a forum content item
export const updateForumContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, isPinned, userRole } = req.body;

    const forumContent = await ForumContent.findById(id);
    if (!forumContent) {
      return res.status(404).json({ message: "Forum content not found" });
    }

    // Authorization logic
    const mockUserId = "507f1f77bcf86cd799439011"; // Mock user ID
    const isAuthor = forumContent.author.toString() === mockUserId;
    const isTeacher = userRole === "teacher";

    // Students can only edit their own discussions
    if (!isTeacher && forumContent.contentType === "announcement") {
      return res
        .status(403)
        .json({ message: "Students cannot edit teacher announcements" });
    }

    if (!isTeacher && !isAuthor) {
      return res
        .status(403)
        .json({ message: "You can only edit your own content" });
    }

    // Students cannot pin content - only check if they're trying to change pin status
    if (
      !isTeacher &&
      typeof isPinned === "boolean" &&
      isPinned !== forumContent.isPinned
    ) {
      return res.status(403).json({ message: "Students cannot pin content" });
    }

    // Update fields
    if (title) forumContent.title = title;
    if (content) forumContent.content = content;
    if (tags) forumContent.tags = tags;
    if (typeof isPinned === "boolean" && isTeacher)
      forumContent.isPinned = isPinned;

    const updatedForumContent = await forumContent.save();

    res.status(200).json(updatedForumContent);
  } catch (error) {
    console.error("Error updating forum content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a forum content item
export const deleteForumContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userRole } = req.body;

    const forumContent = await ForumContent.findById(id);
    if (!forumContent) {
      return res.status(404).json({ message: "Forum content not found" });
    }

    // Authorization logic
    const mockUserId = "507f1f77bcf86cd799439011"; // Mock user ID
    const isAuthor = forumContent.author.toString() === mockUserId;
    const isTeacher = userRole === "teacher";

    // Students can only delete their own discussions
    if (!isTeacher && forumContent.contentType === "announcement") {
      return res
        .status(403)
        .json({ message: "Students cannot delete teacher announcements" });
    }

    if (!isTeacher && !isAuthor) {
      return res
        .status(403)
        .json({ message: "You can only delete your own content" });
    }

    await ForumContent.findByIdAndDelete(id);
    res.status(200).json({ message: "Forum content deleted successfully" });
  } catch (error) {
    console.error("Error deleting forum content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Toggle pin status of a forum content item
export const togglePinForumContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userRole } = req.body;

    const forumContent = await ForumContent.findById(id);
    if (!forumContent) {
      return res.status(404).json({ message: "Forum content not found" });
    }

    // Only teachers can pin/unpin content
    if (userRole !== "teacher") {
      return res.status(403).json({ message: "Only teachers can pin content" });
    }

    forumContent.isPinned = !forumContent.isPinned;
    const updatedForumContent = await forumContent.save();

    res.status(200).json(updatedForumContent);
  } catch (error) {
    console.error("Error toggling pin status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve a discussion (instructor only)
export const approveDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { instructorId } = req.body;

    const forumContent = await ForumContent.findById(id);
    if (!forumContent) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    if (forumContent.contentType !== "discussion") {
      return res
        .status(400)
        .json({ message: "Only discussions can be approved" });
    }

    if (forumContent.isApproved) {
      return res
        .status(400)
        .json({ message: "Discussion is already approved" });
    }

    forumContent.isApproved = true;
    forumContent.approvedBy = instructorId;
    forumContent.approvedAt = new Date();

    const updatedContent = await forumContent.save();
    await updatedContent.populate("approvedBy", "name email");

    res.status(200).json(updatedContent);
  } catch (error) {
    console.error("Error approving discussion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject a discussion (instructor only)
export const rejectDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const forumContent = await ForumContent.findById(id);
    if (!forumContent) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    if (forumContent.contentType !== "discussion") {
      return res
        .status(400)
        .json({ message: "Only discussions can be rejected" });
    }

    // For now, we'll delete rejected discussions
    // In a more sophisticated system, you might keep them with a "rejected" status
    await ForumContent.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "Discussion rejected and removed", reason });
  } catch (error) {
    console.error("Error rejecting discussion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get pending discussions for approval (instructor only)
export const getPendingDiscussions = async (req, res) => {
  try {
    const { roomId } = req.params;

    console.log("Fetching pending discussions for room:", roomId);

    const pendingDiscussions = await ForumContent.find({
      room: roomId,
      contentType: "discussion",
      isApproved: false,
    }).sort({ createdAt: -1 });

    console.log("Found pending discussions:", pendingDiscussions.length);
    res.status(200).json(pendingDiscussions);
  } catch (error) {
    console.error("Error fetching pending discussions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
