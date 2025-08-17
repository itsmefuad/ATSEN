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
// In-memory pseudo data
const announcements = [
    {
        _id: "1",
        title: "Mid-Term Exam schedule for Summer 2025",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
        date: new Date(),
        createdAt: new Date()
    },
    {
        _id: "2",
        title: "UG Wishlist Event Schedule, Fall 2025",
        content: "The Fall 2025 advising preparatory phase will begin with the upcoming Wishlist event, which will help us plan course offerings for the term. All undergraduate programs will participate, except PMR.",
        date: new Date(),
        createdAt: new Date()
    },
    {
        _id: "3",
        title: "Exam schedules of Architecture programs",
        content: "Exam schedules of Architecture programs will be provided by the respective department. For any kind of assistance, contact the Department Coordination Officer (DCO) of your respective Department",
        date: new Date(),
        createdAt: new Date()
    }
];

// Get all announcements
export const getAnnouncements = async (req, res) => {
    try {
        res.status(200).json(announcements);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get single announcement
export const getAnnouncement = async (req, res) => {
    try {
        const announcement = announcements.find(a => a._id === req.params.id);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new announcement (for testing purposes)
export const createAnnouncement = async (req, res) => {
    try {
        const newAnnouncement = {
            _id: (announcements.length + 1).toString(),
            ...req.body,
            date: new Date(),
            createdAt: new Date()
        };
        announcements.push(newAnnouncement);
        res.status(201).json(newAnnouncement);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};