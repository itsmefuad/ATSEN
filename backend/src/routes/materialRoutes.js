import express from "express";
import {
  createMaterial,
  deleteMaterial,
  getMaterialsByRoom,
  updateMaterial,
  toggleMaterialExpansion,
  downloadMaterial,
  uploadMiddleware,
} from "../controllers/materialController.js";

const router = express.Router();

router.get("/room/:roomId", getMaterialsByRoom);
router.post("/room/:roomId", uploadMiddleware, createMaterial);
router.put("/:id", uploadMiddleware, updateMaterial);
router.delete("/:id", deleteMaterial);
router.patch("/:id/toggle", toggleMaterialExpansion);
router.get("/:id/download", downloadMaterial);

export default router;
