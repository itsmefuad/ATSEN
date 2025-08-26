import mongoose from "mongoose";
const { Schema } = mongoose;

const materialSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    section: { 
      type: String, 
      required: true, 
      enum: ['course_materials', 'reference_books', 'articles_research'] 
    },
    fileType: { 
      type: String, 
      required: true,
      enum: ['link', 'text', 'pdf', 'link_and_pdf']
    },
    fileUrl: { type: String, required: false, default: "" },
    fileName: { type: String, required: true },
    // PDF-specific fields
    filePath: { type: String, required: false }, // File system path for PDFs
    originalFileName: { type: String, required: false }, // Original uploaded filename
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "instructors",
      required: false,
      default: undefined
    },
    isExpanded: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Material = mongoose.models.Material || mongoose.model("Material", materialSchema);
export default Material;
