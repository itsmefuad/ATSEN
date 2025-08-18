import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema(
  {
    user: { type: String, default: "Anonymous" },
    answers: { type: [String], default: [] },
  },
  { timestamps: true }
);

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [String], default: [] }, // empty for QnA
});

const PollingAndSurveySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["poll", "qna"], required: true },
    questions: { type: [QuestionSchema], default: [] },
    author: { type: String, default: "Instructor" },
  institution: { type: String, default: null },
    pinned: { type: Boolean, default: false },
    // store responses embedded for simplicity (small scale app)
    responses: { type: [ResponseSchema], default: [] },
  },
  { timestamps: true }
);

PollingAndSurveySchema.index({ pinned: -1, createdAt: -1 });

const PollingAndSurvey = mongoose.model(
  "PollingAndSurvey",
  PollingAndSurveySchema
);

export default PollingAndSurvey;
