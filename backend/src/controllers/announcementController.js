import Announcement from "../models/Announcement.js";
import Room from "../models/Room.js";

// Get all announcements for a room
export async function getAnnouncementsByRoom(req, res) {
  try {
    const { roomId } = req.params;
    const announcements = await Announcement.find({ room: roomId })
      .populate("instructor", "name email")
      .populate("comments.student", "name email")
      .sort({ isPinned: -1, createdAt: -1 });

    res.status(200).json(announcements);
  } catch (error) {
    console.error("Error in getAnnouncementsByRoom controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Create new announcement
export async function createAnnouncement(req, res) {
  try {
    const { roomId } = req.params;
    const { title, content, isPinned } = req.body;
    const instructorId = req.user?.id; // Assuming auth middleware sets this

    // Verify room exists and instructor has access
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const announcement = new Announcement({
      room: roomId,
      title,
      content,
      instructor: instructorId,
      isPinned: isPinned || false
    });

    const savedAnnouncement = await announcement.save();
    const populatedAnnouncement = await Announcement.findById(savedAnnouncement._id)
      .populate("instructor", "name email");

    res.status(201).json(populatedAnnouncement);
  } catch (error) {
    console.error("Error in createAnnouncement controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update announcement
export async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const { title, content, isPinned } = req.body;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { title, content, isPinned },
      { new: true }
    ).populate("instructor", "name email");

    if (!updatedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error in updateAnnouncement controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete announcement
export async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params;

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.status(200).json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAnnouncement controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Add comment to announcement
export async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const studentId = req.user?.id; // Assuming auth middleware sets this

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.comments.push({
      student: studentId,
      content
    });

    await announcement.save();

    const updatedAnnouncement = await Announcement.findById(id)
      .populate("instructor", "name email")
      .populate("comments.student", "name email");

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error in addComment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete comment
export async function deleteComment(req, res) {
  try {
    const { id, commentId } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.comments.id(commentId).remove();
    await announcement.save();

    const updatedAnnouncement = await Announcement.findById(id)
      .populate("instructor", "name email")
      .populate("comments.student", "name email");

    res.status(200).json(updatedAnnouncement);
  } catch (error) {
    console.error("Error in deleteComment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}