import express from "express";
import {
  getRoomMessages,
  sendTextMessage,
  sendFileMessage,
  editMessage,
  deleteMessage,
  addReaction,
  downloadChatFile,
  searchMessages,
  uploadChatFile
} from "../controllers/chatController.js";

const router = express.Router();

// Get messages for a room
router.get("/room/:roomId/messages", getRoomMessages);

// Search messages in a room
router.get("/room/:roomId/search", searchMessages);

// Send text message
router.post("/room/:roomId/message", sendTextMessage);

// Send file message
router.post("/room/:roomId/file", uploadChatFile, sendFileMessage);

// Edit message
router.put("/message/:messageId", editMessage);

// Delete message
router.delete("/message/:messageId", deleteMessage);

// Add/remove reaction
router.post("/message/:messageId/reaction", addReaction);

// Download file
router.get("/download/:messageId", downloadChatFile);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Chat routes working" });
});

export default router;
