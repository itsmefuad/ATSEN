import express from "express";
import YuvrajPoll, { YuvrajPollResponse } from "../models/yuvraj_Poll.js";
import Room from "../models/Room.js";
import Institution from "../models/institution.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";

const router = express.Router();

// Get all polls for a specific institution or room
router.get("/", async (req, res) => {
  try {
    const { institutionId, institutionSlug, roomId } = req.query;
    
    let query = { isActive: true };
    
    if (institutionId) {
      query.institutionId = institutionId;
    } else if (institutionSlug) {
      const institution = await Institution.findOne({ slug: institutionSlug });
      if (institution) {
        query.institutionId = institution._id;
      }
    }
    
    if (roomId) {
      query.$or = [
        { createdFor: "institution", institutionId: query.institutionId },
        { createdFor: "room", targetRoomId: roomId }
      ];
    }
    
    const polls = await YuvrajPoll.find(query)
      .populate('targetInstructorId', 'name email')
      .populate('institutionId', 'name slug')
      .populate('targetRoomId', 'room_name')
      .sort({ createdAt: -1 });
      
    res.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ message: "Failed to fetch polls" });
  }
});

// Create a new poll (institutions and instructors only)
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      kind,
      options,
      targetInstructorId,
      targetInstructorName,
      createdFor,
      targetRoomId,
      institutionId,
      institutionSlug,
      createdBy
    } = req.body;

    let finalInstitutionId = institutionId;
    
    if (!finalInstitutionId && institutionSlug) {
      const institution = await Institution.findOne({ slug: institutionSlug });
      if (institution) {
        finalInstitutionId = institution._id;
      }
    }

    if (!finalInstitutionId) {
      return res.status(400).json({ message: "Institution ID or slug is required" });
    }

    const pollData = {
      title,
      description,
      kind,
      options: options || [],
      institutionId: finalInstitutionId,
      institutionSlug,
      createdFor: createdFor || "institution",
      createdBy,
      targetInstructorId: targetInstructorId || undefined,
      targetInstructorName: targetInstructorName || "",
      targetRoomId: targetRoomId || undefined
    };

    const created = await YuvrajPoll.create(pollData);
    const populated = await YuvrajPoll.findById(created._id)
      .populate('targetInstructorId', 'name email')
      .populate('institutionId', 'name slug')
      .populate('targetRoomId', 'room_name');
      
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ message: "Failed to create poll" });
  }
});

// Get specific poll with responses
router.get("/:id", async (req, res) => {
  try {
    const poll = await YuvrajPoll.findById(req.params.id)
      .populate('targetInstructorId', 'name email')
      .populate('institutionId', 'name slug')
      .populate('targetRoomId', 'room_name');
      
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    
    const responses = await YuvrajPollResponse.find({ pollId: poll._id })
      .populate('studentId', 'name email')
      .populate('targetInstructorId', 'name email')
      .sort({ createdAt: -1 });
      
    res.json({ poll, responses });
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ message: "Failed to fetch poll" });
  }
});

// Submit a response to a poll
router.post("/:id/vote", async (req, res) => {
  try {
    const {
      studentId,
      studentName,
      optionId,
      textAnswer,
      targetInstructorId,
      satisfactionLevel,
      contentDeliveryRating,
      recommendations
    } = req.body;
    
    const pollId = req.params.id;
    const poll = await YuvrajPoll.findById(pollId);
    
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (!poll.isActive) return res.status(400).json({ message: "Poll is no longer active" });

    // Check if poll is room-specific and verify student membership
    if (poll.createdFor === 'room' && poll.targetRoomId) {
      try {
        const room = await Room.findById(poll.targetRoomId).select('students');
        if (!room) return res.status(404).json({ message: "Room not found" });
        
        const isMember = (room.students || []).some((sid) => String(sid) === String(studentId));
        if (!isMember) {
          return res.status(403).json({ message: "Not permitted to respond to this poll" });
        }
      } catch (e) {
        console.error("Room membership check failed:", e);
        return res.status(500).json({ message: "Room membership check failed" });
      }
    }

    // Check for existing response
    const existing = await YuvrajPollResponse.findOne({
      pollId: poll._id,
      studentId: studentId
    });
    
    if (existing) {
      return res.status(400).json({ message: "You have already submitted a response to this poll" });
    }

    // Create response
    const responseData = {
      pollId: poll._id,
      studentId,
      studentName,
      optionId,
      textAnswer,
      targetInstructorId: targetInstructorId || undefined,
      satisfactionLevel,
      contentDeliveryRating,
      recommendations
    };

    const created = await YuvrajPollResponse.create(responseData);
    const populated = await YuvrajPollResponse.findById(created._id)
      .populate('studentId', 'name email')
      .populate('targetInstructorId', 'name email');
      
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ message: "Failed to submit response" });
  }
});

// Delete a poll (institutions only)
router.delete("/:id", async (req, res) => {
  try {
    const poll = await YuvrajPoll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    
    // Delete all responses first
    await YuvrajPollResponse.deleteMany({ pollId: poll._id });
    
    // Delete the poll
    await YuvrajPoll.findByIdAndDelete(req.params.id);
    
    res.json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Error deleting poll:", error);
    res.status(500).json({ message: "Failed to delete poll" });
  }
});

export default router;
