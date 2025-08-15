import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    course_name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student"
    }],
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    maxStudents: {
      type: Number,
      default: 50
    },
    roomCode: {
      type: String,
      unique: true,
      required: true
    }
  },
  { timestamps: true } //createdAt, updatedAt
);

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;
