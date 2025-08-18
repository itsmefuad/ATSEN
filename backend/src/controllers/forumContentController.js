import ForumContent from "../models/ForumContent.js";
import Room from "../models/Room.js";

// Get all forum content for a room
export const getForumContentByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const forumContent = await ForumContent.find({ room: roomId })
      .sort({ isPinned: -1, createdAt: -1 });

    console.log(`Found ${forumContent.length} forum content items for room ${roomId}`);
    console.log("Forum content:", forumContent);

    res.status(200).json(forumContent);
  } catch (error) {
    console.error("Error fetching forum content:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId: req.params.roomId
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Create a new forum content item
export const createForumContent = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, content, tags, isPinned, contentType } = req.body;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // For now, we'll use a mock user ID. In a real app, this would come from authentication
    const mockUserId = "507f1f77bcf86cd799439011"; // Mock user ID

    // Create forum content
    const forumContent = new ForumContent({
      title,
      content,
      room: roomId,
      contentType: contentType || 'announcement',
      author: mockUserId,
      tags: tags || [],
      isPinned: isPinned || false
    });

    const savedForumContent = await forumContent.save();

    console.log("Created forum content:", savedForumContent);
    console.log("Room ID saved:", savedForumContent.room);

    res.status(201).json(savedForumContent);
  } catch (error) {
    console.error("Error creating forum content:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId,
      body: req.body
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
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
    const isTeacher = userRole === 'teacher';

    // Students can only edit their own discussions
    if (!isTeacher && forumContent.contentType === 'announcement') {
      return res.status(403).json({ message: "Students cannot edit teacher announcements" });
    }

    if (!isTeacher && !isAuthor) {
      return res.status(403).json({ message: "You can only edit your own content" });
    }

    // Students cannot pin content
    if (!isTeacher && typeof isPinned === 'boolean') {
      return res.status(403).json({ message: "Students cannot pin content" });
    }

    // Update fields
    if (title) forumContent.title = title;
    if (content) forumContent.content = content;
    if (tags) forumContent.tags = tags;
    if (typeof isPinned === 'boolean' && isTeacher) forumContent.isPinned = isPinned;

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
    const isTeacher = userRole === 'teacher';

    // Students can only delete their own discussions
    if (!isTeacher && forumContent.contentType === 'announcement') {
      return res.status(403).json({ message: "Students cannot delete teacher announcements" });
    }

    if (!isTeacher && !isAuthor) {
      return res.status(403).json({ message: "You can only delete your own content" });
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
    if (userRole !== 'teacher') {
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
