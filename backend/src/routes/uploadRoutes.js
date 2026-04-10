import express from "express";
import { uploadImage, uploadImageController, serveImage } from "../controllers/uploadController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Upload image route
router.post("/image", authMiddleware, uploadImage, uploadImageController);

// Serve uploaded images
router.get("/announcements/:filename", serveImage);

export default router;
