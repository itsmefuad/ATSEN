import express from "express";
import {
  getInstitutionAnnouncements,
  getAnnouncementsForUser,
  createInstitutionAnnouncement,
  updateInstitutionAnnouncement,
  deleteInstitutionAnnouncement,
  togglePinInstitutionAnnouncement,
} from "../controllers/institutionAnnouncementController.js";

const router = express.Router();

// Get all announcements for an institution
// GET /api/institution-announcements/:idOrName
router.get("/:idOrName", getInstitutionAnnouncements);

// Get announcements for a user (student/instructor) based on their institutions
// GET /api/institution-announcements/user/:userType/:userId
router.get("/user/:userType/:userId", getAnnouncementsForUser);

// Create a new institution announcement
// POST /api/institution-announcements/:idOrName
router.post("/:idOrName", createInstitutionAnnouncement);

// Update an institution announcement
// PUT /api/institution-announcements/:idOrName/:announcementId
router.put("/:idOrName/:announcementId", updateInstitutionAnnouncement);

// Delete an institution announcement
// DELETE /api/institution-announcements/:idOrName/:announcementId
router.delete("/:idOrName/:announcementId", deleteInstitutionAnnouncement);

// Toggle pin status of an institution announcement
// PATCH /api/institution-announcements/:idOrName/:announcementId/toggle-pin
router.patch(
  "/:idOrName/:announcementId/toggle-pin",
  togglePinInstitutionAnnouncement
);

export default router;
