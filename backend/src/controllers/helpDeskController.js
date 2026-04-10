import { HelpDeskRequest, ConsultationSlot } from "../models/HelpDesk.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";
import Institution from "../models/institution.js";

// Get consultation slots
export const getConsultationSlots = async (req, res) => {
  try {
    const slots = await ConsultationSlot.find().sort({ weekday: 1, startMinutes: 1 });
    res.json(slots);
  } catch (error) {
    console.error("Error fetching consultation slots:", error);
    res.status(500).json({ message: "Failed to fetch consultation slots" });
  }
};

// Create consultation slot (admin only)
export const createConsultationSlot = async (req, res) => {
  try {
    const created = await ConsultationSlot.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating consultation slot:", error);
    res.status(500).json({ message: "Failed to create consultation slot" });
  }
};

// List help desk requests with filtering
export const listHelpDeskRequests = async (req, res) => {
  try {
    const { institutionSlug, studentId, assigneeId, assigneeType } = req.query;
    const user = req.user; // Get the authenticated user
    
    let query = {};
    
    // Role-based filtering
    if (user.role === "student") {
      // Students see their own requests
      query.createdBy = user.id || user._id;
    } else if (user.role === "institution") {
      // Institutions see all requests for their institution
      query.institutionSlug = user.slug;
    } else if (user.role === "instructor") {
      // Instructors see requests assigned to them
      query.assigneeId = user.id || user._id;
      query.assigneeType = "instructor";
    }
    
    // Additional filters from query params (for backward compatibility)
    if (institutionSlug && !query.institutionSlug) {
      query.institutionSlug = institutionSlug;
    }
    
    if (studentId && !query.createdBy) {
      query.createdBy = studentId;
    }
    
    if (assigneeId && !query.assigneeId) {
      query.assigneeId = assigneeId;
    }
    
    if (assigneeType && !query.assigneeType) {
      query.assigneeType = assigneeType;
    }
    
    const requests = await HelpDeskRequest.find(query)
      .populate('createdBy', 'name email')
      .populate('assigneeId', 'name email')
      .populate('institutionId', 'name slug')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error("Error listing help desk requests:", error);
    res.status(500).json({ message: "Failed to list help desk requests" });
  }
};

// Create help desk request
export const createHelpDeskRequest = async (req, res) => {
  try {
    const {
      createdBy,
      assigneeType,
      assigneeId,
      institutionId,
      institutionSlug,
      category,
      title,
      description
    } = req.body;

    // Validate required fields
    if (!createdBy || !category || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify student exists
    const student = await Student.findById(createdBy);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Verify institution exists if provided
    if (institutionId) {
      const institution = await Institution.findById(institutionId);
      if (!institution) {
        return res.status(404).json({ message: "Institution not found" });
      }
    }



    const request = await HelpDeskRequest.create({
      createdBy,
      assigneeType,
      assigneeId,
      institutionId,
      institutionSlug,
      category,
      title,
      description,
      timeline: [{
        status: 'pending',
        note: 'Request created',
        by: student.name || 'Student'
      }]
    });

    const populatedRequest = await HelpDeskRequest.findById(request._id)
      .populate('createdBy', 'name email')
      .populate('assigneeId', 'name email')
      .populate('institutionId', 'name slug');

    res.status(201).json(populatedRequest);
  } catch (error) {
    console.error("Error creating help desk request:", error);
    res.status(500).json({ message: "Failed to create help desk request" });
  }
};

// Update help desk request status
export const updateHelpDeskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, timelineEntry } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updateData = { status };
    
    if (timelineEntry) {
      updateData.$push = { timeline: timelineEntry };
    }

    const updated = await HelpDeskRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('createdBy', 'name email')
     .populate('assigneeId', 'name email')
     .populate('institutionId', 'name slug');

    if (!updated) {
      return res.status(404).json({ message: "Help desk request not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating help desk status:", error);
    res.status(500).json({ message: "Failed to update help desk status" });
  }
};

// Get help desk request by ID
export const getHelpDeskRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await HelpDeskRequest.findById(id)
      .populate('createdBy', 'name email')
      .populate('assigneeId', 'name email')
      .populate('institutionId', 'name slug');

    if (!request) {
      return res.status(404).json({ message: "Help desk request not found" });
    }

    res.json(request);
  } catch (error) {
    console.error("Error fetching help desk request:", error);
    res.status(500).json({ message: "Failed to fetch help desk request" });
  }
};

// Delete help desk request (admin only)
export const deleteHelpDeskRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await HelpDeskRequest.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Help desk request not found" });
    }

    res.json({ message: "Help desk request deleted successfully" });
  } catch (error) {
    console.error("Error deleting help desk request:", error);
    res.status(500).json({ message: "Failed to delete help desk request" });
  }
};
