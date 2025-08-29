import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
} from "../controllers/roomsController.js";

import { createMeeting } from "../controllers/roomsController.js";

const router = express.Router();

router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.put("/:id", updateRoom);
// DELETE route removed - rooms should only be deleted by institutions

router.post("/:id/meeting", createMeeting);

export default router;
