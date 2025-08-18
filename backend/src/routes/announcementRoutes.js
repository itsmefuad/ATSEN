import express from "express";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncementsByRoom,
  updateAnnouncement,
  togglePinAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

// Get all announcements for a specific room
router.get("/room/:roomId", getAnnouncementsByRoom);

// Create a new announcement for a room
router.post("/room/:roomId", createAnnouncement);

// Update an announcement
router.put("/:id", updateAnnouncement);

// Delete an announcement
router.delete("/:id", deleteAnnouncement);

// Toggle pin status of an announcement
router.patch("/:id/pin", togglePinAnnouncement);

export default router;
