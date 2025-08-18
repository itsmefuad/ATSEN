import express from "express";
import YuvrajAnnouncement from "../models/yuvraj_Announcement.js";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 7, 50);
    const institution = req.query.institution || req.header("x-institution-id") || null;
    const filter = {};
    if (institution) filter.institution = institution;
    const items = await YuvrajAnnouncement.find(filter)
      .sort({ pinned: -1, createdAt: -1 })
      .limit(limit);
    res.json(items);
  } catch (error) {
    console.error("Error in GET /:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await YuvrajAnnouncement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    const inst = req.header("x-institution-id");
    if (inst && item.institution && String(item.institution) !== String(inst)) return res.status(403).json({ message: "Forbidden" });
    res.json(item);
  } catch (error) {
    console.error("Error in GET /:id:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/", yuvrajAdminOnly, async (req, res) => {
  try {
    console.log("Creating announcement with body:", req.body);
    const body = { ...(req.body || {}) };
    if (!body.institution) body.institution = req.header("x-institution-id") || null;
    
    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const created = await YuvrajAnnouncement.create(body);
    console.log("Announcement created successfully:", created._id);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error in POST /:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.put("/:id", yuvrajAdminOnly, async (req, res) => {
  try {
    console.log("Updating announcement:", req.params.id, "with body:", req.body);
    const item = await YuvrajAnnouncement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    const inst = req.header("x-institution-id");
    if (inst && item.institution && String(item.institution) !== String(inst)) return res.status(403).json({ message: "Forbidden" });
    
    // Validate required fields
    if (!req.body.title || !req.body.title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    
    const updated = await YuvrajAnnouncement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    console.log("Announcement updated successfully:", updated._id);
    res.json(updated);
  } catch (error) {
    console.error("Error in PUT /:id:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.delete("/:id", yuvrajAdminOnly, async (req, res) => {
  try {
    const item = await YuvrajAnnouncement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Not found" });
    const inst = req.header("x-institution-id");
    if (inst && item.institution && String(item.institution) !== String(inst)) return res.status(403).json({ message: "Forbidden" });
    await YuvrajAnnouncement.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error in DELETE /:id:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;


