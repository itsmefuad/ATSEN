import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please fill a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    // changed: institution is now an array so a student can belong to multiple institutions
    institutions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
      },
    ],
    // changed: room is now an array so a student can belong to multiple rooms
    room: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
    // Track section assignments for each room (student can only be in 1 section per room)
    roomSections: [
      {
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Room",
          required: true,
        },
        sectionNumber: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
      },
    ],
    // Document requests made by this student
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "StudentDocument",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
