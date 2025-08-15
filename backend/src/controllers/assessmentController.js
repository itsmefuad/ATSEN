import Assessment from "../models/Assessment.js";
import Room from "../models/Room.js";

// Get all assessments for a room grouped by type
export async function getAssessmentsByRoom(req, res) {
  try {
    const { roomId } = req.params;

    const assessments = await Assessment.find({ room: roomId })
      .populate("instructor", "name email")
      .sort({ type: 1, createdAt: -1 });

    // Group assessments by type
    const groupedAssessments = {
      assignments: assessments.filter(a => a.type === "assignment"),
      quizzes: assessments.filter(a => a.type === "quiz"),
      exams: assessments.filter(a => a.type === "midterm_exam" || a.type === "final_exam"),
      projects: assessments.filter(a => a.type === "project")
    };

    res.status(200).json(groupedAssessments);
  } catch (error) {
    console.error("Error in getAssessmentsByRoom controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Create new assessment
export async function createAssessment(req, res) {
  try {
    const { roomId } = req.params;
    const { title, description, type, totalMarks, dueDate, instructions, attachments, isPublished } = req.body;
    const instructorId = req.user?.id; // Assuming auth middleware sets this

    // Verify room exists and instructor has access
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const assessment = new Assessment({
      room: roomId,
      title,
      description,
      type,
      totalMarks,
      dueDate: dueDate ? new Date(dueDate) : null,
      instructions,
      attachments: attachments || [],
      instructor: instructorId,
      isPublished: isPublished || false
    });

    const savedAssessment = await assessment.save();
    const populatedAssessment = await Assessment.findById(savedAssessment._id)
      .populate("instructor", "name email");

    res.status(201).json(populatedAssessment);
  } catch (error) {
    console.error("Error in createAssessment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update assessment
export async function updateAssessment(req, res) {
  try {
    const { id } = req.params;
    const { title, description, type, totalMarks, dueDate, instructions, attachments, isPublished } = req.body;

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      id,
      { 
        title, 
        description, 
        type, 
        totalMarks, 
        dueDate: dueDate ? new Date(dueDate) : null, 
        instructions, 
        attachments, 
        isPublished 
      },
      { new: true }
    ).populate("instructor", "name email");

    if (!updatedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json(updatedAssessment);
  } catch (error) {
    console.error("Error in updateAssessment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete assessment
export async function deleteAssessment(req, res) {
  try {
    const { id } = req.params;

    const deletedAssessment = await Assessment.findByIdAndDelete(id);

    if (!deletedAssessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ message: "Assessment deleted successfully" });
  } catch (error) {
    console.error("Error in deleteAssessment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get single assessment by ID
export async function getAssessmentById(req, res) {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id)
      .populate("instructor", "name email")
      .populate("room", "course_name section");

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.error("Error in getAssessmentById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Publish/unpublish assessment
export async function toggleAssessmentPublish(req, res) {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    assessment.isPublished = !assessment.isPublished;
    await assessment.save();

    const updatedAssessment = await Assessment.findById(id)
      .populate("instructor", "name email");

    res.status(200).json(updatedAssessment);
  } catch (error) {
    console.error("Error in toggleAssessmentPublish controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}