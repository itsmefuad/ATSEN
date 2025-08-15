import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    name: String,
    eiin: String,
    email: String,
    phone: String,
    address: String,
    description: String,
    active: Boolean,
    createdAt: Date,
    updatedAt: Date
  },
  {
    collection: "institutions" // explicitly match your DB collection name
  }
);

// Also explicitly pass the collection name to be extra safe:
export default mongoose.model("Institution", institutionSchema, "institutions");