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
    const { institutionId, institutionSlug, roomId, studentId } = req.query;
    
    let query = { isActive: true };
    
    if (institutionId) {
      query.institutionId = institutionId;
    } else if (institutionSlug) {
      const institution = await Institution.findOne({ slug: institutionSlug });
      if (institution) {
        query.institutionId = institution._id;
      }
    } else if (studentId) {
      // If no institution specified but we have a student, infer institutions from the student
      try {
        const student = await Student.findById(studentId).select('institutions');
        if (student?.institutions?.length) {
          query.institutionId = { $in: student.institutions };
        }
      } catch (e) {
        // Best-effort; if this fails, we continue without institution filter
      }
    }
    
    if (roomId) {
      // When in room context, show both institution-wide forms AND room-specific forms for this room
      query.$or = [
        { createdFor: "institution", institutionId: query.institutionId },
        { createdFor: "room", targetRoomId: roomId }
      ];
    }
    
    let polls = await YuvrajPoll.find(query)
      .populate('targetInstructorId', 'name email')
      .populate('institutionId', 'name slug')
      .populate('targetRoomId', 'room_name')
      .sort({ createdAt: -1 });
    
    // Filter room-specific polls for students based on room membership
    if (studentId) {
      try {
        const student = await Student.findById(studentId).populate('room');
        const studentRoomIds = student?.room?.map(room => String(room._id)) || [];
        
        // If we're in a specific room context, we already filtered by roomId in the query
        // But we still need to verify the student is actually in that room
        if (roomId) {
          // Verify student is in the requested room
          if (!studentRoomIds.includes(String(roomId))) {
            // Student not in this room, only show institution-wide forms
            polls = polls.filter(poll => poll.createdFor === 'institution');
          }
          // If student is in the room, show all forms (both institution and room-specific)
        } else {
          // Not in room context, filter room-specific forms by student's room membership
          polls = polls.filter(poll => {
            if (poll.createdFor === 'institution') {
              return true; // Institution-wide polls are visible to all students
            } else if (poll.createdFor === 'room' && poll.targetRoomId) {
              return studentRoomIds.includes(String(poll.targetRoomId));
            }
            return false;
          });
        }
      } catch (e) {
        console.error("Student room membership check failed:", e);
        // If check fails, show all polls (fallback)
      }
    }
      
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
      customQuestions,
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

    // For evaluations, get instructor name if not provided
    let finalInstructorName = targetInstructorName || "";
    if (kind === 'evaluation' && targetInstructorId && !finalInstructorName) {
      try {
        const instructor = await Instructor.findById(targetInstructorId);
        if (instructor) {
          finalInstructorName = instructor.name;
        }
      } catch (error) {
        console.error("Error fetching instructor name:", error);
      }
    }

    const pollData = {
      title,
      description,
      kind,
      options: options || [],
      customQuestions: customQuestions || [],
      institutionId: finalInstitutionId,
      institutionSlug,
      createdFor: createdFor || "institution",
      createdBy,
      targetInstructorId: targetInstructorId || undefined,
      targetInstructorName: finalInstructorName,
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

// Update poll title (institutions only)
router.patch("/:id", async (req, res) => {
  try {
    const { title } = req.body;
    const pollId = req.params.id;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const poll = await YuvrajPoll.findById(pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    
    // Update the title
    poll.title = title.trim();
    await poll.save();
    
    // Return updated poll
    const updated = await YuvrajPoll.findById(pollId)
      .populate('targetInstructorId', 'name email')
      .populate('institutionId', 'name slug')
      .populate('targetRoomId', 'room_name');
      
    res.json(updated);
  } catch (error) {
    console.error("Error updating poll:", error);
    res.status(500).json({ message: "Failed to update poll" });
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
