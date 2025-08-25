import mongoose from "mongoose";

const studentDocumentSchema = new mongoose.Schema(
  {
    // Request Details
    documentType: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    urgency: {
      type: String,
      enum: ["Standard", "Priority", "Urgent"],
      default: "Standard",
      required: true
    },
    
    // Relationships
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    
    // Status Tracking
    status: {
      type: String,
      enum: ["Requested", "Received", "Approved", "Dispatched", "Document Received"],
      default: "Requested",
      required: true
    },
    
    // Status History for Tracking
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["Requested", "Received", "Approved", "Dispatched", "Document Received"]
        },
        updatedAt: {
          type: Date,
          default: Date.now
        },
        updatedBy: {
          type: String, // "student" or "institution"
          required: true
        }
      }
    ],
    
    // Additional Fields
    institutionNotes: {
      type: String,
      trim: true
    },
    estimatedDelivery: {
      type: Date
    },
    actualDelivery: {
      type: Date
    }
  },
  { 
    timestamps: true,
    // Add index for better query performance
    indexes: [
      { student: 1, institution: 1 },
      { status: 1, urgency: 1 },
      { createdAt: -1 }
    ]
  }
);

// Add a pre-save middleware to update status history
studentDocumentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    // Determine who updated the status based on the status type
    let updatedBy = 'institution';
    if (this.status === 'Requested' || this.status === 'Document Received') {
      updatedBy = 'student';
    }
    
    this.statusHistory.push({
      status: this.status,
      updatedAt: new Date(),
      updatedBy: updatedBy
    });
  }
  next();
});

// Virtual for checking if urgent
studentDocumentSchema.virtual('isUrgent').get(function() {
  return this.urgency === 'Urgent';
});

// Virtual for getting current status with timestamp
studentDocumentSchema.virtual('currentStatusInfo').get(function() {
  const currentStatus = this.statusHistory[this.statusHistory.length - 1];
  return currentStatus || { status: this.status, updatedAt: this.createdAt };
});

export default mongoose.model("StudentDocument", studentDocumentSchema);
