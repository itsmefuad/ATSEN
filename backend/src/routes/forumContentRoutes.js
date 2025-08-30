import express from "express";
import {
  createForumContent,
  deleteForumContent,
  getForumContentByRoom,
  updateForumContent,
  togglePinForumContent,
  approveDiscussion,
  rejectDiscussion,
  getPendingDiscussions,
} from "../controllers/forumContentController.js";

const router = express.Router();

// Get all forum content for a specific room
router.get("/room/:roomId", getForumContentByRoom);

// Get pending discussions for approval (instructor only)
router.get("/room/:roomId/pending", getPendingDiscussions);

// Create a new forum content item for a room
router.post("/room/:roomId", createForumContent);

// Update a forum content item
router.put("/:id", updateForumContent);

// Delete a forum content item
router.delete("/:id", deleteForumContent);

// Toggle pin status of a forum content item
router.patch("/:id/pin", togglePinForumContent);

// Approve a discussion (instructor only)
router.patch("/:id/approve", approveDiscussion);

// Reject a discussion (instructor only)
router.patch("/:id/reject", rejectDiscussion);

export default router;
