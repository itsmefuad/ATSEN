import express from "express";
import {
  createDocumentRequest,
  getStudentDocuments,
  updateDocumentStatusByStudent,
  getInstitutionDocuments,
  updateDocumentStatusByInstitution,
  getDocumentDetails,
  getDocumentStatistics
} from "../controllers/documentController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Student Routes
router.post("/request", authMiddleware, createDocumentRequest);
router.get("/student/my-documents", authMiddleware, getStudentDocuments);
router.put("/student/:documentId/status", authMiddleware, updateDocumentStatusByStudent);

// Institution Routes
router.get("/institution/documents", authMiddleware, getInstitutionDocuments);
router.put("/institution/:documentId/status", authMiddleware, updateDocumentStatusByInstitution);
router.get("/institution/statistics", authMiddleware, getDocumentStatistics);

// Shared Routes
router.get("/:documentId", authMiddleware, getDocumentDetails);

export default router;
