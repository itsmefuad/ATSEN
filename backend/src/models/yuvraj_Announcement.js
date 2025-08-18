import mongoose from "mongoose";

const yuvrajAnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    author: { type: String, default: "Admin" },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

yuvrajAnnouncementSchema.index({ pinned: -1, createdAt: -1 });

const YuvrajAnnouncement = mongoose.model(
  "YuvrajAnnouncement",
  yuvrajAnnouncementSchema
);

export default YuvrajAnnouncement;


