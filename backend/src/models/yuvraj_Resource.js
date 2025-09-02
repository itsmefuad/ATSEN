import mongoose from "mongoose";

const YuvrajResourceItemSchema = new mongoose.Schema(
  {
    // Reference to room - follows the same pattern as Materials
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "youtube",
        "slides"
      ],
      required: true,
    },
    url: { type: String },
    content: { type: String },
    order: { type: Number, default: 0 },
    // Track who uploaded the resource - optional like Materials
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: false,
      default: undefined
    },
    // Institution tracking is optional - resources are tied to rooms
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: false },
  },
  { timestamps: true }
);

// Remove the course concept and integrate directly with rooms
const YuvrajResourceItem =
  mongoose.models.YuvrajResourceItem ||
  mongoose.model("YuvrajResourceItem", YuvrajResourceItemSchema);

export default YuvrajResourceItem;
