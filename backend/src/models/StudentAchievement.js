import mongoose from "mongoose";
const { Schema } = mongoose;

const studentAchievementSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    achievement: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    pointsEarned: {
      type: Number,
      required: true,
      min: 0
    },
    dateEarned: {
      type: Date,
      default: Date.now
    },
    criteriaMetValue: {
      type: Number,
      required: true // The actual value that met the criteria (e.g., 85 for 85% average)
    }
  },
  { timestamps: true }
);

// Ensure one achievement per student per room
studentAchievementSchema.index({ student: 1, achievement: 1, room: 1 }, { unique: true });

const StudentAchievement = mongoose.models.StudentAchievement || mongoose.model("StudentAchievement", studentAchievementSchema);
export default StudentAchievement;
