import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  getRoomWithUserSections,
  updateRoom,
  getAvailableTimeSlots,
  getRoomSections,
  updateRoomSections,
} from "../controllers/roomsController.js";

import { createMeeting } from "../controllers/roomsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getAllRooms);
router.get("/time-slots", getAvailableTimeSlots);
router.get("/:id", getRoomById);
router.get("/:id/with-sections", authMiddleware, getRoomWithUserSections);
router.get("/:id/sections", getRoomSections);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.put("/:id/sections", updateRoomSections);
// DELETE route removed - rooms should only be deleted by institutions

router.post("/:id/meeting", createMeeting);

export default router;
