import mongoose from "mongoose";

const helpDeskRequestSchema = new mongoose.Schema(
  {
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Student", 
      required: true 
    },
    assigneeType: { 
      type: String, 
      enum: ["instructor", "institution"], 
      required: true 
    },
    assigneeId: { 
      type: mongoose.Schema.Types.ObjectId 
    },
    // Institution filtering
    institutionId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Institution" 
    },
    institutionSlug: { 
      type: String 
    },
    category: {
      type: String,
      enum: [
        "consultation",
        "administration",
        "complaint",
        "payment",
        "technical",
        "course",
        "instructor",
        "other",
      ],
      required: true,
    },
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ["pending", "accepted", "processing", "rejected", "resolved"], 
      default: "pending" 
    },
    timeline: [
      {
        status: String,
        note: String,
        at: { type: Date, default: Date.now },
        by: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const consultationSlotSchema = new mongoose.Schema(
  {
    instructorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Instructor", 
      required: true 
    },
    weekday: { 
      type: Number, 
      min: 0, 
      max: 6, 
      required: true 
    },
    startMinutes: { 
      type: Number, 
      required: true 
    },
    endMinutes: { 
      type: Number, 
      required: true 
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
helpDeskRequestSchema.index({ createdBy: 1, status: 1 });
helpDeskRequestSchema.index({ institutionId: 1, status: 1 });
helpDeskRequestSchema.index({ assigneeId: 1, status: 1 });
helpDeskRequestSchema.index({ createdAt: -1 });

consultationSlotSchema.index({ instructorId: 1, weekday: 1 });

export const HelpDeskRequest =
  mongoose.models.HelpDeskRequest ||
  mongoose.model("HelpDeskRequest", helpDeskRequestSchema);

export const ConsultationSlot =
  mongoose.models.ConsultationSlot ||
  mongoose.model("ConsultationSlot", consultationSlotSchema);
