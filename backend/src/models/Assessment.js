import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    type: {
      type: String,
      enum: ["assignment", "quiz", "midterm_exam", "final_exam", "project"],
      required: true
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 0
    },
    dueDate: {
      type: Date
    },
    instructions: {
      type: String
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileSize: Number
    }],
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Assessment = mongoose.models.Assessment || mongoose.model("Assessment", assessmentSchema);

export default Assessment;