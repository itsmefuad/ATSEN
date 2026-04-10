import express from "express";
import { getLinkPreview } from "../controllers/linkPreviewController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get link preview
router.post("/", authMiddleware, getLinkPreview);

export default router;
