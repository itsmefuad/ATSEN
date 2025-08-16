import Announcement from "../models/Announcement.js";
import Room from "../models/Room.js";

// Get all announcements for a room
export const getAnnouncementsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const announcements = await Announcement.find({ room: roomId })
      .sort({ isPinned: -1, createdAt: -1 });

    console.log(`Found ${announcements.length} announcements for room ${roomId}`);
    console.log("Announcements:", announcements);

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId: req.params.roomId
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Create a new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, content, tags, isPinned } = req.body;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Create announcement - author will be handled by authentication later
    const announcement = new Announcement({
      title,
      content,
      room: roomId,
      tags: tags || [],
      isPinned: isPinned || false
    });

    const savedAnnouncement = await announcement.save();

    console.log("Created announcement:", savedAnnouncement);
    console.log("Room ID saved:", savedAnnouncement.room);

    res.status(201).json(savedAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId,
      body: req.body
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

    // Update an announcement
    export const updateAnnouncement = async (req, res) => {
      try {
        const { id } = req.params;
        const { title, content, tags, isPinned } = req.body;

        const announcement = await Announcement.findById(id);
        if (!announcement) {
          return res.status(404).json({ message: "Announcement not found" });
        }

        // Update fields
        if (title) announcement.title = title;
        if (content) announcement.content = content;
        if (tags) announcement.tags = tags;
        if (typeof isPinned === 'boolean') announcement.isPinned = isPinned;

        const updatedAnnouncement = await announcement.save();

        res.status(200).json(updatedAnnouncement);
      } catch (error) {
        console.error("Error updating announcement:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    };

// Delete an announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await Announcement.findByIdAndDelete(id);
    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

    // Toggle pin status of an announcement
    export const togglePinAnnouncement = async (req, res) => {
      try {
        const { id } = req.params;

        const announcement = await Announcement.findById(id);
        if (!announcement) {
          return res.status(404).json({ message: "Announcement not found" });
        }

        announcement.isPinned = !announcement.isPinned;
        const updatedAnnouncement = await announcement.save();

        res.status(200).json(updatedAnnouncement);
      } catch (error) {
        console.error("Error toggling pin status:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    };
