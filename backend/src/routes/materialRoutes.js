import express from "express";
import {
  getMaterialsByRoom,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialById
} from "../controllers/materialController.js";

const router = express.Router();

// Routes for materials
router.get("/room/:roomId", getMaterialsByRoom);
router.post("/room/:roomId", createMaterial);
router.get("/:id", getMaterialById);
router.put("/:id", updateMaterial);
router.delete("/:id", deleteMaterial);

export default router;