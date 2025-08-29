import mongoose from "mongoose";
const { Schema } = mongoose;

// Define schema for class timing
const classTimingSchema = new Schema(
  {
    day: {
      type: String,
      required: true,
      enum: [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
    },
    startTime: {
      type: String,
      required: true,
      enum: [
        "8:00 AM",
        "9:30 AM",
        "11:00 AM",
        "12:30 PM",
        "2:00 PM",
        "3:30 PM",
      ],
    },
    endTime: {
      type: String,
      required: true,
      enum: [
        "9:20 AM",
        "10:50 AM",
        "12:20 PM",
        "1:50 PM",
        "3:20 PM",
        "4:50 PM",
      ],
    },
  },
  { _id: false }
);

// Define schema for section
const sectionSchema = new Schema(
  {
    sectionNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    classTimings: {
      type: [classTimingSchema],
      required: true,
      validate: {
        validator: function (timings) {
          return timings.length === 2; // Each section must have exactly 2 class timings
        },
        message: "Each section must have exactly 2 class timings",
      },
    },
    // Students assigned to this specific section
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    // Instructors assigned to this specific section
    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Instructor",
      },
    ],
  },
  { _id: false }
);

const roomSchema = new Schema(
  {
    room_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: false,
    },
    maxCapacity: {
      type: Number,
      default: 30,
      min: 1,
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Instructor",
      },
    ],
    sections: {
      type: [sectionSchema],
      required: true,
      validate: {
        validator: function (sections) {
          return sections.length === 5; // Must have exactly 5 sections
        },
        message: "Room must have exactly 5 sections",
      },
      default: function () {
        // Default 5 sections with empty class timings (to be set during room creation)
        return [
          { sectionNumber: 1, classTimings: [] },
          { sectionNumber: 2, classTimings: [] },
          { sectionNumber: 3, classTimings: [] },
          { sectionNumber: 4, classTimings: [] },
          { sectionNumber: 5, classTimings: [] },
        ];
      },
    },
    createTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
export default Room;
