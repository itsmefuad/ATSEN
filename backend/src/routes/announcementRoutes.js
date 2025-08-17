import express from "express";
import { getAnnouncements, getAnnouncement, createAnnouncement } from "../controllers/announcementController.js";

const router = express.Router();

router.get("/", getAnnouncements);
router.get("/:id", getAnnouncement);
router.post("/", createAnnouncement);

export default router;
