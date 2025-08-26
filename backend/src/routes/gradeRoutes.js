import express from "express";
import {
  getRoomGrades,
  getStudentGrades,
  updateExamMarks
} from "../controllers/gradeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Add middleware to log all requests to grade routes
router.use((req, res, next) => {
  console.log(`Grade Route: ${req.method} ${req.path}`);
  next();
});

// Get comprehensive grade sheet for all students in a room (teacher view)
router.get("/room/:roomId", getRoomGrades);

// Get grade sheet for current student in a room (student view)
router.get("/room/:roomId/my-grades", getStudentGrades);

// Update mid-term and final marks for a student (teacher only) - TEMPORARILY WITHOUT AUTH
router.put("/room/:roomId/student/:studentId/exam-marks", updateExamMarks);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Grade routes working" });
});

// Test PUT route
router.put("/test-put", (req, res) => {
  console.log("Test PUT route called with body:", req.body);
  res.json({ message: "PUT route working", body: req.body });
});

export default router;
