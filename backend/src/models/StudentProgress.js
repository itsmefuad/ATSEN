import mongoose from "mongoose";
const { Schema } = mongoose;

const studentProgressSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  achievementCounts: {
    bronze: { type: Number, default: 0 },
    silver: { type: Number, default: 0 },
    gold: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    legendary: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  categoryStats: {
    academic: { count: { type: Number, default: 0 }, points: { type: Number, default: 0 } },
    assessment: { count: { type: Number, default: 0 }, points: { type: Number, default: 0 } },
    progress: { count: { type: Number, default: 0 }, points: { type: Number, default: 0 } },
    improvement: { count: { type: Number, default: 0 }, points: { type: Number, default: 0 } },
    milestone: { count: { type: Number, default: 0 }, points: { type: Number, default: 0 } }
  },
  recentAchievements: [{
    achievement: { type: Schema.Types.ObjectId, ref: "Achievement" },
    earnedDate: { type: Date, default: Date.now }
  }],
  currentStreak: {
    type: Number,
    default: 0
  },
  bestStreak: {
    type: Number,
    default: 0
  },
  averageGrade: {
    type: Number,
    default: 0
  },
  totalAssessments: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const StudentProgress = mongoose.model("StudentProgress", studentProgressSchema);
export default StudentProgress;
