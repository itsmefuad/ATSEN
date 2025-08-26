import mongoose from "mongoose";
const { Schema } = mongoose;

const gradeSchema = new Schema(
  {
    student: { 
      type: Schema.Types.ObjectId, 
      ref: "Student", 
      required: true 
    },
    room: { 
      type: Schema.Types.ObjectId, 
      ref: "Room", 
      required: true 
    },
    // Manual entries by teacher
    midTermMarks: { 
      type: Number, 
      min: 0,
      max: 25,
      default: null 
    },
    finalMarks: { 
      type: Number, 
      min: 0,
      max: 35,
      default: null 
    },
    // Calculated fields
    averageAssessmentMarks: {
      type: Number,
      default: 0
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    // Tracking
    lastUpdated: { 
      type: Date, 
      default: Date.now 
    },
    updatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: "Instructor", 
      default: null 
    }
  },
  { timestamps: true }
);

// Ensure one grade record per student per room
gradeSchema.index({ student: 1, room: 1 }, { unique: true });

const Grade = mongoose.models.Grade || mongoose.model("Grade", gradeSchema);
export default Grade;
