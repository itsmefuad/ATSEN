// backend/src/routes/institution/InstitutionRoomRoutes.js

import express from "express";
import {
  createRoom,
  listRooms
} from "../../controllers/institution/CreateRoomController.js";

const router = express.Router({ mergeParams: true });

// GET  /api/institutions/:idOrName/rooms
router.get("/", listRooms);

// POST /api/institutions/:idOrName/rooms
router.post("/", createRoom);
router.post("/add-room", createRoom);



export default router;