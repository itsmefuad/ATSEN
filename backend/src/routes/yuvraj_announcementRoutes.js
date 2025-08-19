import express from "express";
import mongoose from "mongoose";
import YuvrajAnnouncement from "../models/yuvraj_Announcement.js";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 7, 50);
  const institution = req.query.institution || req.header("x-institution-id") || null;
  const filter = {};
  if (institution) filter.institution = institution;
  const items = await YuvrajAnnouncement.find(filter)
    .sort({ pinned: -1, createdAt: -1 })
    .limit(limit);
  res.json(items);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
  try {
    const item = await YuvrajAnnouncement.findById(id);
    if (!item) return res.status(404).json({ message: "Not found" });
    const inst = req.header("x-institution-id");
    if (inst && item.institution && String(item.institution) !== String(inst)) return res.status(403).json({ message: "Forbidden" });
    res.json(item);
  } catch (err) {
    console.error('Error in GET /api/yuvraj/announcements/:id', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post("/", yuvrajAdminOnly, async (req, res) => {
  const body = { ...(req.body || {}) };
  if (!body.institution) body.institution = req.header("x-institution-id") || null;
  const created = await YuvrajAnnouncement.create(body);
  res.status(201).json(created);
});

router.put("/:id", yuvrajAdminOnly, async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
  try {
    const item = await YuvrajAnnouncement.findById(id);
    if (!item) return res.status(404).json({ message: "Not found" });
    const inst = req.header("x-institution-id");
    if (inst && item.institution && String(item.institution) !== String(inst)) return res.status(403).json({ message: "Forbidden" });
    const updated = await YuvrajAnnouncement.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    console.error('Error in PUT /api/yuvraj/announcements/:id', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete("/:id", yuvrajAdminOnly, async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid id" });
  try {
    const item = await YuvrajAnnouncement.findById(id);
    if (!item) return res.status(404).json({ message: "Not found" });
    const inst = req.header("x-institution-id");
    if (inst && item.institution && String(item.institution) !== String(inst)) return res.status(403).json({ message: "Forbidden" });
    await YuvrajAnnouncement.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (err) {
    console.error('Error in DELETE /api/yuvraj/announcements/:id', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


