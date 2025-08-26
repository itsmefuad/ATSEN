import QuizGrade from "../models/QuizGrade.js";
import Assessment from "../models/Assessment.js";
import Student from "../models/student.js";
import Room from "../models/Room.js";
import Instructor from "../models/instructor.js";
import jwt from "jsonwebtoken";
import { calculateAchievements } from "./achievementController.js";

// Get all quiz grades for an assessment (teacher view)
export const getQuizGrades = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Verify it's a quiz
    if (assessment.assessmentType !== 'quiz') {
      return res.status(400).json({ message: "This endpoint is only for quizzes" });
    }

    // Get all students enrolled in the room
    const room = await Room.findById(assessment.room).populate('students', 'name email');
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get existing grades for this quiz
    const existingGrades = await QuizGrade.find({ assessment: assessmentId })
      .populate('student', 'name email')
      .populate('gradedBy', 'name email')
      .sort({ createdAt: -1 });

    // Create a map of existing grades by student ID
    const gradeMap = {};
    existingGrades.forEach(grade => {
      if (grade.student) {
        gradeMap[grade.student._id.toString()] = grade;
      }
    });

    // Create complete list with all enrolled students
    const allStudentGrades = room.students.map(student => {
      const existingGrade = gradeMap[student._id.toString()];
      if (existingGrade) {
        return existingGrade;
      } else {
        // Return placeholder for ungraded student
        return {
          _id: null,
          assessment: assessmentId,
          student: student,
          marks: null,
          maxMarks: 15,
          teacherFeedback: "",
          isGraded: false,
          gradedAt: null,
          gradedBy: null,
          createdAt: null,
          updatedAt: null
        };
      }
    });

    res.json(allStudentGrades);
  } catch (error) {
    console.error("Error fetching quiz grades:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get my quiz grade for an assessment (student view)
export const getMyQuizGrade = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Verify assessment is a quiz
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    if (assessment.assessmentType !== 'quiz') {
      return res.status(400).json({ message: "This endpoint is only for quizzes" });
    }
    
    const quizGrade = await QuizGrade.findOne({ 
      assessment: assessmentId, 
      student: decoded.id 
    }).populate('gradedBy', 'name email');

    if (!quizGrade) {
      return res.status(404).json({ message: "No grade found" });
    }

    res.json(quizGrade);
  } catch (error) {
    console.error("Error fetching quiz grade:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Grade a quiz (teacher functionality)
export const gradeQuiz = async (req, res) => {
  try {
    const { assessmentId, studentId } = req.params;
    const { marks, teacherFeedback } = req.body;
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find the assessment and verify it's a quiz
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    if (assessment.assessmentType !== 'quiz') {
      return res.status(400).json({ message: "This endpoint is only for quizzes" });
    }

    // Verify student exists and is enrolled in the room
    const room = await Room.findById(assessment.room);
    if (!room || !room.students.includes(studentId)) {
      return res.status(400).json({ message: "Student not enrolled in this room" });
    }

    // Determine max marks (default 15 for quiz)
    const maxMarks = 15;

    // Validate marks
    if (marks < 0 || marks > maxMarks) {
      return res.status(400).json({ 
        message: `Marks must be between 0 and ${maxMarks} for quiz` 
      });
    }

    // Create or update quiz grade
    const quizGradeData = {
      assessment: assessmentId,
      student: studentId,
      marks,
      maxMarks,
      teacherFeedback: teacherFeedback || "",
      isGraded: true,
      gradedAt: new Date(),
      gradedBy: decoded.id
    };

    const quizGrade = await QuizGrade.findOneAndUpdate(
      { assessment: assessmentId, student: studentId },
      quizGradeData,
      { new: true, upsert: true }
    ).populate('student', 'name email')
     .populate('gradedBy', 'name email');

    // Get the assessment to find room and trigger achievement calculation
    const assessmentForAchievements = await Assessment.findById(assessmentId);
    if (assessmentForAchievements) {
      await calculateAchievements(studentId, assessmentForAchievements.room);
    }

    res.json({
      message: "Quiz graded successfully",
      quizGrade: quizGrade
    });
  } catch (error) {
    console.error("Error grading quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update grade for a quiz (teacher functionality)
export const updateQuizGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { marks, teacherFeedback } = req.body;
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Find the quiz grade
    const quizGrade = await QuizGrade.findById(gradeId).populate('assessment');
    if (!quizGrade) {
      return res.status(404).json({ message: "Quiz grade not found" });
    }

    // Determine max marks
    const maxMarks = 15;

    // Validate marks
    if (marks < 0 || marks > maxMarks) {
      return res.status(400).json({ 
        message: `Marks must be between 0 and ${maxMarks} for quiz` 
      });
    }

    // Update quiz grade
    const updatedQuizGrade = await QuizGrade.findByIdAndUpdate(
      gradeId,
      {
        marks,
        maxMarks,
        teacherFeedback: teacherFeedback || "",
        gradedAt: new Date(),
        gradedBy: decoded.id
      },
      { new: true }
    ).populate('student', 'name email')
     .populate('gradedBy', 'name email');

    res.json({
      message: "Grade updated successfully",
      quizGrade: updatedQuizGrade
    });
  } catch (error) {
    console.error("Error updating quiz grade:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
