import express from "express";
import YuvrajResourceItem from "../models/yuvraj_Resource.js";
import Room from "../models/Room.js";
import Institution from "../models/institution.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all resources for a specific room
router.get("/room/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const resources = await YuvrajResourceItem.find({ room: roomId })
      .populate('uploadedBy', 'name email')
      .populate('institutionId', 'name slug')
      .sort({ order: 1, createdAt: -1 });
      
    res.json(resources);
  } catch (error) {
    console.error("Error fetching room resources:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

// Create a new resource item for a room
router.post("/room/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, type, url, content, uploadedBy, institutionId } = req.body;

    // Verify the room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check permissions - only instructors can create resources
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: "Only instructors can create resources" });
    }

    // Verify instructor is assigned to this room
    const isInstructorOfRoom = room.instructors?.some(instructor => 
      instructor.toString() === req.user.id
    );
    
    if (!isInstructorOfRoom) {
      return res.status(403).json({ message: "Not authorized to add resources to this room" });
    }

    

    const resourceData = {
      room: roomId,
      title,
      type,
      url,
      content,
      order: 0 // Default order, can be updated later
    };

    // Add optional fields only if provided
    if (uploadedBy) {
      resourceData.uploadedBy = uploadedBy;
    }
    
    if (institutionId) {
      resourceData.institutionId = institutionId;
    }

    const created = await YuvrajResourceItem.create(resourceData);
    const populated = await YuvrajResourceItem.findById(created._id)
      .populate('uploadedBy', 'name email')
      .populate('institutionId', 'name slug');
      
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating resource:", error);
    res.status(500).json({ message: "Failed to create resource", details: error.message });
  }
});

// Update a resource item
router.put("/:resourceId", authMiddleware, async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { title, type, url, content, order } = req.body;

    // Check if user is instructor of this room
    const resource = await YuvrajResourceItem.findById(resourceId).populate('room');
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Verify user has permission to edit this resource
    if (req.user?.role === 'instructor') {
      // Check if instructor is assigned to this room
      const room = await Room.findById(resource.room).populate('instructors');
      const isInstructorOfRoom = room?.instructors?.some(instructor => 
        instructor._id.toString() === req.user.id
      );
      
      if (!isInstructorOfRoom) {
        return res.status(403).json({ message: "Not authorized to edit this resource" });
      }
    }

    const updated = await YuvrajResourceItem.findByIdAndUpdate(
      resourceId,
      { title, type, url, content, order },
      { new: true, runValidators: true }
    )
      .populate('uploadedBy', 'name email')
      .populate('institutionId', 'name slug');
      
    if (!updated) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error updating resource:", error);
    res.status(500).json({ message: "Failed to update resource" });
  }
});

// Delete a resource item
router.delete("/:resourceId", authMiddleware, async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    // Check permissions - only instructors can delete resources
    if (req.user.role !== 'instructor') {
      return res.status(403).json({ message: "Only instructors can delete resources" });
    }

    // Verify instructor owns this resource or is assigned to the room
    const resource = await YuvrajResourceItem.findById(resourceId).populate('room');
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    const room = await Room.findById(resource.room).populate('instructors');
    const isInstructorOfRoom = room?.instructors?.some(instructor => 
      instructor._id.toString() === req.user.id
    );
    
    if (!isInstructorOfRoom) {
      return res.status(403).json({ message: "Not authorized to delete this resource" });
    }
    
    const deleted = await YuvrajResourceItem.findByIdAndDelete(resourceId);
    if (!deleted) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource:", error);
    res.status(500).json({ message: "Failed to delete resource" });
  }
});

// Get resources grouped by type for a room
router.get("/room/:roomId/grouped", async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const resources = await YuvrajResourceItem.find({ room: roomId })
      .populate('uploadedBy', 'name email')
      .populate('institutionId', 'name slug')
      .sort({ order: 1, createdAt: -1 });

    const grouped = {
      videos: resources.filter(r => r.type === 'youtube'),
      documents: resources.filter(r => r.type === 'slides')
    };
      
    res.json(grouped);
  } catch (error) {
    console.error("Error fetching grouped resources:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

export default router;
