import express from "express";
import {
  createRoom,
  deleteRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
} from "../controllers/roomsController.js";

const router = express.Router();

router.get("/", getAllRooms);
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.put("/:id", updateRoom);
router.delete("/:id", deleteRoom);

export default router;
