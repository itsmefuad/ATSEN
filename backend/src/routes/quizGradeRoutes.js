import express from "express";
import {
  getQuizGrades,
  getMyQuizGrade,
  gradeQuiz,
  updateQuizGrade
} from "../controllers/quizGradeController.js";

const router = express.Router();

// Get all quiz grades for an assessment (teacher view)
router.get("/:assessmentId/grades", getQuizGrades);

// Get my quiz grade for an assessment (student view)
router.get("/:assessmentId/my-grade", getMyQuizGrade);

// Grade a quiz (teacher only)
router.post("/:assessmentId/grade/:studentId", gradeQuiz);

// Update grade for a quiz (teacher only)
router.put("/grade/:gradeId", updateQuizGrade);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Quiz grade routes working" });
});

export default router;
