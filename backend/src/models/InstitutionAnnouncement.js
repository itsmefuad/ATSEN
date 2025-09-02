import mongoose from "mongoose";
const { Schema } = mongoose;

const institutionAnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    institution: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "Institution",
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    externalLinks: [
      {
        url: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          trim: true,
        },
        type: {
          type: String,
          enum: ['youtube', 'document', 'website'],
          default: 'website',
        },
      },
    ],
    images: [
      {
        url: {
          type: String,
          trim: true,
        },
        alt: {
          type: String,
          trim: true,
        },
        caption: {
          type: String,
          trim: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
institutionAnnouncementSchema.index({
  institution: 1,
  isPinned: -1,
  createdAt: -1,
});

const InstitutionAnnouncement =
  mongoose.models.InstitutionAnnouncement ||
  mongoose.model("InstitutionAnnouncement", institutionAnnouncementSchema);

export default InstitutionAnnouncement;
