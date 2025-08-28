import mongoose from "mongoose";

const YuvrajPollSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    kind: { type: String, enum: ["poll", "qna", "evaluation"], default: "poll" },
    options: [
      {
        id: { type: String },
        label: { type: String },
      },
    ],
    // For evaluation - updated to use ObjectId for ATSEN2 consistency
    targetInstructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
    targetInstructorName: { type: String },
    // Institution filtering - adapted for ATSEN2 structure
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
    institutionSlug: { type: String },
    // Scoping - updated to work with ATSEN2's room system
    createdFor: { type: String, enum: ["institution", "room", "global"], default: "institution" },
    targetRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const YuvrajPollResponseSchema = new mongoose.Schema(
  {
    pollId: { type: mongoose.Schema.Types.ObjectId, ref: "YuvrajPoll", required: true },
    // Updated to use ObjectId for ATSEN2 consistency
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String },
    optionId: { type: String },
    textAnswer: { type: String },
    targetInstructorId: { type: mongoose.Schema.Types.ObjectId, ref: "Instructor" },
    satisfactionLevel: { type: Number, min: 1, max: 10 },
    contentDeliveryRating: { type: Number, min: 1, max: 10 },
    recommendations: { type: String },
  },
  { timestamps: true }
);

export const YuvrajPollResponse =
  mongoose.models.YuvrajPollResponse ||
  mongoose.model("YuvrajPollResponse", YuvrajPollResponseSchema);

const YuvrajPoll =
  mongoose.models.YuvrajPoll ||
  mongoose.model("YuvrajPoll", YuvrajPollSchema);

export default YuvrajPoll;
