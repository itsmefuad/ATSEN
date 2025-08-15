import express from "express";
import {
  getAssessmentsByRoom,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentById,
  toggleAssessmentPublish
} from "../controllers/assessmentController.js";

const router = express.Router();

// Routes for assessments
router.get("/room/:roomId", getAssessmentsByRoom);
router.post("/room/:roomId", createAssessment);
router.get("/:id", getAssessmentById);
router.put("/:id", updateAssessment);
router.delete("/:id", deleteAssessment);
router.patch("/:id/publish", toggleAssessmentPublish);

export default router;