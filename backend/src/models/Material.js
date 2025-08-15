import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    type: {
      type: String,
      enum: ["course_outline", "course_policy", "reference_book", "research_paper", "lecture_note", "other"],
      required: true
    },
    category: {
      type: String,
      enum: ["course_materials", "reference_books", "articles_research_papers"],
      required: true
    },
    author: {
      type: String
    },
    fileUrl: {
      type: String
    },
    fileName: {
      type: String
    },
    fileSize: {
      type: Number
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
      required: true
    }
  },
  { timestamps: true }
);

const Material = mongoose.models.Material || mongoose.model("Material", materialSchema);

export default Material;