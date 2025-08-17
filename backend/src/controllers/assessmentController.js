import Assessment from "../models/Assessment.js";
import Room from "../models/Room.js";

// Get all assessments for a specific room
export const getAssessmentsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const assessments = await Assessment.find({ room: roomId }).sort({ date: 1 });
    res.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new assessment
export const createAssessment = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, description, topics, date, assessmentType } = req.body;

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    // Description is required only for final_exam and mid_term_exam
    if ((assessmentType === 'final_exam' || assessmentType === 'mid_term_exam') && (!description || !description.trim())) {
      return res.status(400).json({ message: "Description is required for exams" });
    }
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }
    if (!assessmentType) {
      return res.status(400).json({ message: "Assessment type is required" });
    }

    // Check if permanent assessment already exists
    if (assessmentType === 'final_exam' || assessmentType === 'mid_term_exam') {
      const existingPermanent = await Assessment.findOne({ 
        room: roomId, 
        assessmentType,
        isPermanent: true 
      });
      if (existingPermanent) {
        return res.status(400).json({ 
          message: `${assessmentType.replace('_', ' ')} already exists for this room` 
        });
      }
    }

    // Create assessment
    const assessment = new Assessment({
      title: title.trim(),
      description: description.trim(),
      topics: topics || [],
      date: new Date(date),
      assessmentType,
      room: roomId,
      isPermanent: assessmentType === 'final_exam' || assessmentType === 'mid_term_exam'
    });

    const savedAssessment = await assessment.save();
    res.status(201).json(savedAssessment);
  } catch (error) {
    console.error("Error creating assessment:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      roomId: req.params.roomId,
      body: req.body
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Update an assessment
export const updateAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, topics, date } = req.body;

    // First, find the assessment to check its type
    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    // Description is required only for final_exam and mid_term_exam
    if ((assessment.assessmentType === 'final_exam' || assessment.assessmentType === 'mid_term_exam') && (!description || !description.trim())) {
      return res.status(400).json({ message: "Description is required for exams" });
    }
    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Update assessment
    assessment.title = title.trim();
    assessment.description = description.trim();
    assessment.topics = topics || [];
    assessment.date = new Date(date);

    const updatedAssessment = await assessment.save();
    res.json(updatedAssessment);
  } catch (error) {
    console.error("Error updating assessment:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      assessmentId: req.params.id,
      body: req.body
    });
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

  // Delete an assessment
  export const deleteAssessment = async (req, res) => {
    try {
      const { id } = req.params;

      const assessment = await Assessment.findById(id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }

      await Assessment.findByIdAndDelete(id);
      res.json({ message: "Assessment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
