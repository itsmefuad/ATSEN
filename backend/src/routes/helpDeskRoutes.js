import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getConsultationSlots,
  createConsultationSlot,
  listHelpDeskRequests,
  createHelpDeskRequest,
  updateHelpDeskStatus,
  getHelpDeskRequest,
  deleteHelpDeskRequest
} from "../controllers/helpDeskController.js";

const router = express.Router();

// Consultation slots
router.get("/consultation-slots", authMiddleware, getConsultationSlots);
router.post("/consultation-slots", authMiddleware, createConsultationSlot);

// Help desk requests
router.get("/requests", authMiddleware, listHelpDeskRequests);
router.post("/requests", authMiddleware, createHelpDeskRequest);
router.get("/requests/:id", authMiddleware, getHelpDeskRequest);
router.put("/requests/:id/status", authMiddleware, updateHelpDeskStatus);
router.delete("/requests/:id", authMiddleware, deleteHelpDeskRequest);

export default router;
