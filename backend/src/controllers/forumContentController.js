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
    const { title, content, tags, isPinned } = req.body;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Create forum content
    const forumContent = new ForumContent({
      title,
      content,
      room: roomId,
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
    const { title, content, tags, isPinned } = req.body;

    const forumContent = await ForumContent.findById(id);
    if (!forumContent) {
      return res.status(404).json({ message: "Forum content not found" });
    }

    // Update fields
    if (title) forumContent.title = title;
    if (content) forumContent.content = content;
    if (tags) forumContent.tags = tags;
    if (typeof isPinned === 'boolean') forumContent.isPinned = isPinned;

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

    const forumContent = await ForumContent.findById(id);
    if (!forumContent) {
      return res.status(404).json({ message: "Forum content not found" });
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

    const forumContent = await ForumContent.findById(id);
    if (!forumContent) {
      return res.status(404).json({ message: "Forum content not found" });
    }

    forumContent.isPinned = !forumContent.isPinned;
    const updatedForumContent = await forumContent.save();

    res.status(200).json(updatedForumContent);
  } catch (error) {
    console.error("Error toggling pin status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
