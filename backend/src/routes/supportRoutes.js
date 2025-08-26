import express from "express";
import {
  createSupportTicket,
  getStudentTickets,
  getInstitutionTickets,
  getSupportTicket,
  respondToTicket,
  markAsAddressed,
  markAsResolved,
  updateTicketPriority,
  getSupportStats,
  uploadSupportFiles,
} from "../controllers/supportController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Student routes
router.post("/tickets", authMiddleware, uploadSupportFiles, createSupportTicket);
router.get("/students/:studentId/tickets", authMiddleware, getStudentTickets);
router.patch("/tickets/:ticketId/resolve", authMiddleware, markAsResolved);

// Institution routes
router.get("/institution/tickets", authMiddleware, getInstitutionTickets);
router.get("/institution/stats", authMiddleware, getSupportStats);
router.patch("/tickets/:ticketId/respond", authMiddleware, uploadSupportFiles, respondToTicket);
router.patch("/tickets/:ticketId/address", authMiddleware, markAsAddressed);
router.patch("/tickets/:ticketId/priority", authMiddleware, updateTicketPriority);

// Common routes
router.get("/tickets/:ticketId", authMiddleware, getSupportTicket);

export default router;
