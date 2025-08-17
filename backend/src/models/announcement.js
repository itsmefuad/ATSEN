import mongoose from "mongoose";
const { Schema } = mongoose;

const announcementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "instructors",
      required: false,
      default: undefined
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
);

const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
export default Announcement;
