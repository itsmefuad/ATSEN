import Grade from "../models/Grade.js";
import Assessment from "../models/Assessment.js";
import Room from "../models/Room.js";
import Student from "../models/student.js";

// Get all grades for a room with student and assessment details
export async function getGradesByRoom(req, res) {
  try {
    const { roomId } = req.params;

    // Get room with students
    const room = await Room.findById(roomId).populate("students", "name email studentId");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Get all assessments for the room
    const assessments = await Assessment.find({ room: roomId, isPublished: true })
      .select("title type totalMarks");

    // Get all grades for the room
    const grades = await Grade.find({ room: roomId })
      .populate("student", "name email studentId")
      .populate("assessment", "title type totalMarks")
      .populate("gradedBy", "name email");

    // Structure data for frontend
    const studentsWithGrades = room.students.map(student => {
      const studentGrades = grades.filter(grade => 
        grade.student._id.toString() === student._id.toString()
      );

      const gradesByAssessment = {};
      studentGrades.forEach(grade => {
        gradesByAssessment[grade.assessment._id] = {
          _id: grade._id,
          marksObtained: grade.marksObtained,
          feedback: grade.feedback,
          isGraded: grade.isGraded,
          submissionDate: grade.submissionDate,
          gradedBy: grade.gradedBy
        };
      });

      return {
        student,
        grades: gradesByAssessment
      };
    });

    res.status(200).json({
      students: studentsWithGrades,
      assessments
    });
  } catch (error) {
    console.error("Error in getGradesByRoom controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Create or update grade for a student
export async function upsertGrade(req, res) {
  try {
    const { studentId, assessmentId } = req.params;
    const { marksObtained, feedback, submissionDate } = req.body;
    const instructorId = req.user?.id; // Assuming auth middleware sets this

    // Verify assessment exists
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if marks are within valid range
    if (marksObtained < 0 || marksObtained > assessment.totalMarks) {
      return res.status(400).json({ 
        message: `Marks must be between 0 and ${assessment.totalMarks}` 
      });
    }

    // Find existing grade or create new one
    let grade = await Grade.findOne({ 
      student: studentId, 
      assessment: assessmentId 
    });

    if (grade) {
      // Update existing grade
      grade.marksObtained = marksObtained;
      grade.feedback = feedback;
      grade.submissionDate = submissionDate ? new Date(submissionDate) : grade.submissionDate;
      grade.gradedBy = instructorId;
      grade.isGraded = true;
    } else {
      // Create new grade
      grade = new Grade({
        student: studentId,
        assessment: assessmentId,
        room: assessment.room,
        marksObtained,
        feedback,
        submissionDate: submissionDate ? new Date(submissionDate) : null,
        gradedBy: instructorId,
        isGraded: true
      });
    }

    const savedGrade = await grade.save();
    const populatedGrade = await Grade.findById(savedGrade._id)
      .populate("student", "name email studentId")
      .populate("assessment", "title type totalMarks")
      .populate("gradedBy", "name email");

    res.status(200).json(populatedGrade);
  } catch (error) {
    console.error("Error in upsertGrade controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get grades for a specific student
export async function getStudentGrades(req, res) {
  try {
    const { studentId, roomId } = req.params;

    const grades = await Grade.find({ 
      student: studentId, 
      room: roomId 
    })
      .populate("assessment", "title type totalMarks dueDate")
      .populate("gradedBy", "name email")
      .sort({ "assessment.dueDate": -1 });

    res.status(200).json(grades);
  } catch (error) {
    console.error("Error in getStudentGrades controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete grade
export async function deleteGrade(req, res) {
  try {
    const { id } = req.params;

    const deletedGrade = await Grade.findByIdAndDelete(id);

    if (!deletedGrade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGrade controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get grade statistics for a room
export async function getGradeStatistics(req, res) {
  try {
    const { roomId } = req.params;

    const grades = await Grade.find({ room: roomId, isGraded: true })
      .populate("assessment", "title type totalMarks");

    const statistics = {
      totalGrades: grades.length,
      averageScore: 0,
      assessmentStats: {}
    };

    if (grades.length > 0) {
      // Calculate overall average
      const totalPercentages = grades.map(grade => 
        (grade.marksObtained / grade.assessment.totalMarks) * 100
      );
      statistics.averageScore = totalPercentages.reduce((a, b) => a + b, 0) / totalPercentages.length;

      // Calculate per-assessment statistics
      grades.forEach(grade => {
        const assessmentId = grade.assessment._id.toString();
        if (!statistics.assessmentStats[assessmentId]) {
          statistics.assessmentStats[assessmentId] = {
            title: grade.assessment.title,
            type: grade.assessment.type,
            totalMarks: grade.assessment.totalMarks,
            grades: [],
            average: 0,
            highest: 0,
            lowest: grade.assessment.totalMarks
          };
        }
        
        const percentage = (grade.marksObtained / grade.assessment.totalMarks) * 100;
        statistics.assessmentStats[assessmentId].grades.push(percentage);
        
        if (percentage > statistics.assessmentStats[assessmentId].highest) {
          statistics.assessmentStats[assessmentId].highest = percentage;
        }
        if (percentage < statistics.assessmentStats[assessmentId].lowest) {
          statistics.assessmentStats[assessmentId].lowest = percentage;
        }
      });

      // Calculate averages for each assessment
      Object.keys(statistics.assessmentStats).forEach(assessmentId => {
        const grades = statistics.assessmentStats[assessmentId].grades;
        statistics.assessmentStats[assessmentId].average = 
          grades.reduce((a, b) => a + b, 0) / grades.length;
      });
    }

    res.status(200).json(statistics);
  } catch (error) {
    console.error("Error in getGradeStatistics controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}