import mongoose from "mongoose";
const { Schema } = mongoose;

const forumContentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["announcement", "discussion"],
      default: "announcement",
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isApproved: {
      type: Boolean,
      default: function () {
        // Auto-approve announcements from teachers, require approval for student discussions
        return this.contentType === "announcement";
      },
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ForumContent =
  mongoose.models.ForumContent ||
  mongoose.model("ForumContent", forumContentSchema);
export default ForumContent;
