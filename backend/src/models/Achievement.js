import mongoose from "mongoose";
const { Schema } = mongoose;

const achievementSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['academic', 'participation', 'consistency', 'improvement'],
      required: true
    },
    badgeColor: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      required: true
    },
    badgeIcon: {
      type: String,
      required: true // Icon name for lucide-react
    },
    pointsRequired: {
      type: Number,
      required: true,
      min: 0
    },
    criteriaType: {
      type: String,
      enum: ['total_marks', 'average_marks', 'assessment_count', 'consistency_streak', 'improvement_rate'],
      required: true
    },
    criteriaValue: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Achievement = mongoose.models.Achievement || mongoose.model("Achievement", achievementSchema);
export default Achievement;
