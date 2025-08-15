// backend/models/Institution.js
import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    eiin:        { type: String, required: true, unique: true },
    email:       { type: String, required: true },
    phone:       { type: String },
    address:     { type: String },
    description: { type: String },
    active:      { type: Boolean, default: true },

    // ← NEW: array of Room _ids
    rooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
      }
    ],
  },
  {
    collection: "institutions",
    timestamps: true,    // auto-manages createdAt & updatedAt
  }
);

export default mongoose.model(
  "Institution",
  institutionSchema,
  "institutions"
);