import mongoose from "mongoose";

const supportTicketSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Academic Support",
      "Technical Issues",
      "Account Management", 
      "Course Registration",
      "Payment & Billing",
      "General Inquiry",
      "Other"
    ],
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ["open", "in_progress", "addressed", "resolved"],
    default: "open",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  institutionResponse: {
    message: String,
    respondedBy: {
      type: String, // Institution admin name
      default: "Support Team",
    },
    respondedAt: Date,
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      uploadedAt: Date,
    }],
  },
  addressedAt: Date,
  resolvedAt: Date,
  studentFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: String,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
supportTicketSchema.index({ student: 1, status: 1 });
supportTicketSchema.index({ institution: 1, status: 1 });
supportTicketSchema.index({ createdAt: -1 });

export default mongoose.model("SupportTicket", supportTicketSchema);
