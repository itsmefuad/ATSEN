import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    feedback: {
      type: String
    },
    submissionDate: {
      type: Date
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true
    },
    isGraded: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Ensure one grade per student per assessment
gradeSchema.index({ student: 1, assessment: 1 }, { unique: true });

const Grade = mongoose.models.Grade || mongoose.model("Grade", gradeSchema);

export default Grade;