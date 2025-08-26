import mongoose from "mongoose";
const { Schema } = mongoose;

const quizGradeSchema = new Schema(
  {
    assessment: { 
      type: Schema.Types.ObjectId, 
      ref: "Assessment", 
      required: true 
    },
    student: { 
      type: Schema.Types.ObjectId, 
      ref: "Student", 
      required: true 
    },
    // Grading fields
    marks: { 
      type: Number, 
      min: 0,
      default: null 
    },
    maxMarks: { 
      type: Number, 
      min: 0,
      default: 15 // Default for quiz
    },
    teacherFeedback: { 
      type: String, 
      default: "" 
    },
    isGraded: { 
      type: Boolean, 
      default: false 
    },
    gradedAt: { 
      type: Date, 
      default: null 
    },
    gradedBy: { 
      type: Schema.Types.ObjectId, 
      ref: "Instructor", 
      default: null 
    }
  },
  { timestamps: true }
);

// Ensure one grade per student per quiz
quizGradeSchema.index({ assessment: 1, student: 1 }, { unique: true });

const QuizGrade = mongoose.models.QuizGrade || mongoose.model("QuizGrade", quizGradeSchema);
export default QuizGrade;
