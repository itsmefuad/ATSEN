import Grade from "../models/Grade.js";
import Room from "../models/Room.js";
import Student from "../models/student.js";
import Submission from "../models/Submission.js";
import QuizGrade from "../models/QuizGrade.js";
import Assessment from "../models/Assessment.js";
import jwt from "jsonwebtoken";
import { calculateAchievements } from "./achievementController.js";

// Get comprehensive grade sheet for all students in a room (teacher view)
export const getRoomGrades = async (req, res) => {
  try {
    console.log("getRoomGrades called with roomId:", req.params.roomId);
    const { roomId } = req.params;
    
    const room = await Room.findById(roomId).populate('students', 'name email');
    console.log("Room found:", room ? `Room: ${room.name}, Students: ${room.students?.length}` : "No room found");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get all assessments for this room
    const assessments = await Assessment.find({ room: roomId }).sort({ date: 1 });

    // Get all submissions for this room
    const submissions = await Submission.find({
      assessment: { $in: assessments.map(a => a._id) }
    }).populate('assessment', 'title assessmentType');

    // Get all quiz grades for this room
    const quizGrades = await QuizGrade.find({
      assessment: { $in: assessments.filter(a => a.assessmentType === 'quiz').map(a => a._id) }
    }).populate('assessment', 'title assessmentType');

    // Get existing grade records
    const existingGrades = await Grade.find({ room: roomId });
    const gradeMap = {};
    existingGrades.forEach(grade => {
      gradeMap[grade.student.toString()] = grade;
    });

    // Build comprehensive grade data for each student
    const studentGrades = room.students.map(student => {
      const studentId = student._id.toString();
      
      // Get student's submissions
      const studentSubmissions = submissions.filter(sub => 
        sub.student && sub.student.toString() === studentId && sub.isGraded
      );

      // Get student's quiz grades
      const studentQuizGrades = quizGrades.filter(quiz => 
        quiz.student && quiz.student.toString() === studentId && quiz.isGraded
      );

      // Calculate assessment marks by type
      const assessmentMarks = {
        assignments: [],
        projects: [],
        quizzes: []
      };

      // Process submissions (assignments and projects)
      studentSubmissions.forEach(submission => {
        const assessmentType = submission.assessment.assessmentType;
        const percentage = (submission.marks / submission.maxMarks) * 100;
        
        if (assessmentType === 'assignment') {
          assessmentMarks.assignments.push({
            title: submission.assessment.title,
            marks: submission.marks,
            maxMarks: submission.maxMarks,
            percentage: percentage
          });
        } else if (assessmentType === 'project') {
          assessmentMarks.projects.push({
            title: submission.assessment.title,
            marks: submission.marks,
            maxMarks: submission.maxMarks,
            percentage: percentage
          });
        }
      });

      // Process quiz grades
      studentQuizGrades.forEach(quizGrade => {
        const percentage = (quizGrade.marks / quizGrade.maxMarks) * 100;
        assessmentMarks.quizzes.push({
          title: quizGrade.assessment.title,
          marks: quizGrade.marks,
          maxMarks: quizGrade.maxMarks,
          percentage: percentage
        });
      });

      // Calculate averages
      const calculateAverage = (items) => {
        if (items.length === 0) return 0;
        const sum = items.reduce((acc, item) => acc + item.percentage, 0);
        return sum / items.length;
      };

      const averages = {
        assignments: calculateAverage(assessmentMarks.assignments),
        projects: calculateAverage(assessmentMarks.projects),
        quizzes: calculateAverage(assessmentMarks.quizzes)
      };

      // Calculate overall assessment average
      const allAssessments = [
        ...assessmentMarks.assignments,
        ...assessmentMarks.projects,
        ...assessmentMarks.quizzes
      ];
      const overallAverage = calculateAverage(allAssessments);

      // Get or create grade record
      const gradeRecord = gradeMap[studentId] || {
        student: studentId,
        room: roomId,
        midTermMarks: null,
        finalMarks: null,
        averageAssessmentMarks: overallAverage,
        totalMarks: 0
      };

      // Calculate total marks out of 100
      // Assessment average: 40% of total score (40 marks)
      // Mid-term: 25 marks (25% of total score) 
      // Final: 35 marks (35% of total score)
      const midMarks = gradeRecord.midTermMarks || 0;
      const finalMarks = gradeRecord.finalMarks || 0;
      
      // Convert assessment percentage to marks out of 40
      const assessmentWeight = (overallAverage * 40) / 100; // overallAverage is 0-100%, convert to 0-40 marks
      const totalMarks = assessmentWeight + midMarks + finalMarks;

      return {
        student: student,
        assessmentMarks,
        averages,
        overallAverage: parseFloat(overallAverage.toFixed(2)),
        midTermMarks: gradeRecord.midTermMarks,
        finalMarks: gradeRecord.finalMarks,
        totalMarks: parseFloat(totalMarks.toFixed(2)),
        gradeId: gradeRecord._id || null
      };
    });

    console.log("Returning studentGrades:", studentGrades.length, "students");
    res.json(studentGrades);
  } catch (error) {
    console.error("Error fetching room grades:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get grade sheet for a specific student (student view)
export const getStudentGrades = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const studentId = decoded.id;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Check if student is enrolled in the room
    if (!room.students.includes(studentId)) {
      return res.status(403).json({ message: "Not enrolled in this room" });
    }

    // Get all assessments for this room
    const assessments = await Assessment.find({ room: roomId }).sort({ date: 1 });

    // Get student's submissions
    const submissions = await Submission.find({
      student: studentId,
      assessment: { $in: assessments.map(a => a._id) }
    }).populate('assessment', 'title assessmentType');

    // Get student's quiz grades
    const quizGrades = await QuizGrade.find({
      student: studentId,
      assessment: { $in: assessments.filter(a => a.assessmentType === 'quiz').map(a => a._id) }
    }).populate('assessment', 'title assessmentType');

    // Build assessment marks
    const assessmentMarks = {
      assignments: [],
      projects: [],
      quizzes: []
    };

    // Process submissions
    submissions.filter(sub => sub.isGraded).forEach(submission => {
      const assessmentType = submission.assessment.assessmentType;
      const percentage = (submission.marks / submission.maxMarks) * 100;
      
      if (assessmentType === 'assignment') {
        assessmentMarks.assignments.push({
          title: submission.assessment.title,
          marks: submission.marks,
          maxMarks: submission.maxMarks,
          percentage: percentage
        });
      } else if (assessmentType === 'project') {
        assessmentMarks.projects.push({
          title: submission.assessment.title,
          marks: submission.marks,
          maxMarks: submission.maxMarks,
          percentage: percentage
        });
      }
    });

    // Process quiz grades
    quizGrades.filter(quiz => quiz.isGraded).forEach(quizGrade => {
      const percentage = (quizGrade.marks / quizGrade.maxMarks) * 100;
      assessmentMarks.quizzes.push({
        title: quizGrade.assessment.title,
        marks: quizGrade.marks,
        maxMarks: quizGrade.maxMarks,
        percentage: percentage
      });
    });

    // Calculate averages
    const calculateAverage = (items) => {
      if (items.length === 0) return 0;
      const sum = items.reduce((acc, item) => acc + item.percentage, 0);
      return sum / items.length;
    };

    const averages = {
      assignments: calculateAverage(assessmentMarks.assignments),
      projects: calculateAverage(assessmentMarks.projects),
      quizzes: calculateAverage(assessmentMarks.quizzes)
    };

    // Calculate overall assessment average
    const allAssessments = [
      ...assessmentMarks.assignments,
      ...assessmentMarks.projects,
      ...assessmentMarks.quizzes
    ];
    const overallAverage = calculateAverage(allAssessments);

    // Get grade record
    const gradeRecord = await Grade.findOne({ student: studentId, room: roomId });

    // Calculate total marks out of 100
    // Assessment average: 40% of total score (40 marks)
    // Mid-term: 25 marks (25% of total score) 
    // Final: 35 marks (35% of total score)
    const midMarks = gradeRecord?.midTermMarks || 0;
    const finalMarks = gradeRecord?.finalMarks || 0;
    
    // Convert assessment percentage to marks out of 40
    const assessmentWeight = (overallAverage * 40) / 100; // overallAverage is 0-100%, convert to 0-40 marks
    const totalMarks = assessmentWeight + midMarks + finalMarks;

    const result = {
      assessmentMarks,
      averages,
      overallAverage: parseFloat(overallAverage.toFixed(2)),
      midTermMarks: gradeRecord?.midTermMarks || null,
      finalMarks: gradeRecord?.finalMarks || null,
      totalMarks: parseFloat(totalMarks.toFixed(2))
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching student grades:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update mid-term and final marks (teacher only)
export const updateExamMarks = async (req, res) => {
  try {
    console.log("updateExamMarks called with:", { roomId: req.params.roomId, studentId: req.params.studentId, body: req.body });
    const { roomId, studentId } = req.params;
    const { midTermMarks, finalMarks } = req.body;
    
    // User is already authenticated via authMiddleware (or temp without auth)
    const userId = req.user?.id || "temp-user-id";
    console.log("User ID from token:", userId);

    // Validate marks
    console.log("Validating marks:", { midTermMarks, finalMarks });
    if (midTermMarks !== null && (midTermMarks < 0 || midTermMarks > 25)) {
      return res.status(400).json({ message: "Mid-term marks must be between 0 and 25" });
    }
    
    if (finalMarks !== null && (finalMarks < 0 || finalMarks > 35)) {
      return res.status(400).json({ message: "Final marks must be between 0 and 35" });
    }

    // Check if room exists and student is enrolled
    console.log("Checking room and student enrollment...");
    const room = await Room.findById(roomId);
    if (!room || !room.students.includes(studentId)) {
      return res.status(400).json({ message: "Student not enrolled in this room" });
    }

    console.log("Fetching assessments and grades...");

    // Calculate average assessment marks for this student
    const assessments = await Assessment.find({ room: roomId });
    const submissions = await Submission.find({
      student: studentId,
      assessment: { $in: assessments.map(a => a._id) },
      isGraded: true
    });
    const quizGrades = await QuizGrade.find({
      student: studentId,
      assessment: { $in: assessments.filter(a => a.assessmentType === 'quiz').map(a => a._id) },
      isGraded: true
    });

    // Calculate overall assessment average
    const allGrades = [
      ...submissions.map(s => (s.marks / s.maxMarks) * 100),
      ...quizGrades.map(q => (q.marks / q.maxMarks) * 100)
    ];
    
    console.log("Calculating averages...");
    const averageAssessmentMarks = allGrades.length > 0 
      ? allGrades.reduce((sum, grade) => sum + grade, 0) / allGrades.length 
      : 0;

    console.log("Assessment average:", averageAssessmentMarks);

    // Calculate total marks out of 100
    // Assessment average: 40% of total score (40 marks)
    // Mid-term: 25 marks (25% of total score) 
    // Final: 35 marks (35% of total score)
    const assessmentWeight = (averageAssessmentMarks * 40) / 100; // Convert percentage to marks out of 40
    const totalMarks = assessmentWeight + (midTermMarks || 0) + (finalMarks || 0);

    console.log("Total marks calculated:", totalMarks);

    // Update or create grade record
    const gradeData = {
      student: studentId,
      room: roomId,
      midTermMarks: midTermMarks,
      finalMarks: finalMarks,
      averageAssessmentMarks: parseFloat(averageAssessmentMarks.toFixed(2)),
      totalMarks: parseFloat(totalMarks.toFixed(2)),
      lastUpdated: new Date()
      // Temporarily removing updatedBy to test without auth
    };

    console.log("About to save gradeData:", gradeData);

    // One-time fix: Drop the problematic index if it exists
    try {
      const indexes = await Grade.collection.getIndexes();
      console.log("Current indexes:", Object.keys(indexes));
      
      if (indexes['student_1_assessment_1']) {
        console.log("Dropping problematic student_1_assessment_1 index...");
        await Grade.collection.dropIndex('student_1_assessment_1');
        console.log("Index dropped successfully");
      }
    } catch (indexError) {
      console.log("Index handling:", indexError.message);
    }

    const grade = await Grade.findOneAndUpdate(
      { student: studentId, room: roomId },
      gradeData,
      { new: true, upsert: true }
    ).populate('student', 'name email');

    // Calculate achievements after grade update
    await calculateAchievements(studentId, roomId);

    res.json({
      message: "Exam marks updated successfully",
      grade: grade
    });
  } catch (error) {
    console.error("Error updating exam marks:", error);
    console.error("Error stack:", error.stack);
    console.error("Error message:", error.message);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
