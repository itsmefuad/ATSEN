// backend/src/routes/institution/InstitutionRoomRoutes.js
import express from "express";
import { createRoom, listRooms } from "../../controllers/institution/CreateRoomController.js";

const router = express.Router();

// GET  /api/institutions/:idOrName/rooms
router.get("/:idOrName/rooms", listRooms);

// POST /api/institutions/:idOrName/add-room
router.post("/:idOrName/add-room", createRoom);

export default router;