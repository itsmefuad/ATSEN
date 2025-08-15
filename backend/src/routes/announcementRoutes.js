import express from "express";
import {
  getAnnouncementsByRoom,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  addComment,
  deleteComment
} from "../controllers/announcementController.js";

const router = express.Router();

// Routes for announcements
router.get("/room/:roomId", getAnnouncementsByRoom);
router.post("/room/:roomId", createAnnouncement);
router.put("/:id", updateAnnouncement);
router.delete("/:id", deleteAnnouncement);

// Routes for comments
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;