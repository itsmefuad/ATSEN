import express from "express";
import {
  getGradesByRoom,
  upsertGrade,
  getStudentGrades,
  deleteGrade,
  getGradeStatistics
} from "../controllers/gradeController.js";

const router = express.Router();

// Routes for grades
router.get("/room/:roomId", getGradesByRoom);
router.get("/room/:roomId/statistics", getGradeStatistics);
router.get("/student/:studentId/room/:roomId", getStudentGrades);
router.put("/student/:studentId/assessment/:assessmentId", upsertGrade);
router.delete("/:id", deleteGrade);

export default router;