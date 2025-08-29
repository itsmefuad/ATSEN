import mongoose from "mongoose";

const instructorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },

    // Array of institution references
    institutions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Institution",
        required: true,
      },
    ],

    // Array of room references
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      },
    ],
    // Track section assignments for each room (instructor can be in 1-2 sections per room)
    roomSections: [
      {
        roomId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Room",
          required: true,
        },
        sectionNumbers: {
          type: [Number],
          required: true,
          validate: {
            validator: function (sections) {
              return (
                sections.length >= 1 &&
                sections.length <= 2 &&
                sections.every((section) => section >= 1 && section <= 5)
              );
            },
            message: "Instructor can be assigned to 1-2 sections only (1-5)",
          },
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Instructor", instructorSchema);
