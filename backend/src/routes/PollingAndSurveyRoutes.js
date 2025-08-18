import express from "express";
import PollingAndSurvey from "../models/PollingAndSurvey.js";
import { yuvrajAdminOnly } from "../middlewares/yuvraj_adminOnly.js";

const router = express.Router();

// list
router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 200);
  // support scoping to an institution (query param or header)
  const institution = req.query.institution || req.header("x-institution-id") || null;
  const filter = {};
  if (institution) filter.institution = institution;
  const items = await PollingAndSurvey.find(filter)
    .sort({ pinned: -1, createdAt: -1 })
    .limit(limit);
  res.json(items);
});

// get one
router.get("/:id", async (req, res) => {
  const item = await PollingAndSurvey.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  // if caller provided institution header, enforce same institution
  const inst = req.header("x-institution-id");
  if (inst && item.institution && String(item.institution) !== String(inst)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json(item);
});

// create (instructor only)
router.post("/", yuvrajAdminOnly, async (req, res) => {
  // allow institution to be provided in body or via header
  const body = { ...req.body };
  if (!body.institution) body.institution = req.header("x-institution-id") || null;
  const created = await PollingAndSurvey.create(body);
  res.status(201).json(created);
});

// update (instructor only)
router.put("/:id", yuvrajAdminOnly, async (req, res) => {
  // Ensure institution match when header present
  const item = await PollingAndSurvey.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  const inst = req.header("x-institution-id");
  if (inst && item.institution && String(item.institution) !== String(inst)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const updated = await PollingAndSurvey.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

// delete
router.delete("/:id", yuvrajAdminOnly, async (req, res) => {
  const item = await PollingAndSurvey.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  const inst = req.header("x-institution-id");
  if (inst && item.institution && String(item.institution) !== String(inst)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  await PollingAndSurvey.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

// submit a response (students)
router.post("/:id/responses", async (req, res) => {
  const item = await PollingAndSurvey.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  const inst = req.header("x-institution-id");
  if (inst && item.institution && String(item.institution) !== String(inst)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const resp = {
    user: req.body.user || "Anonymous",
    answers: req.body.answers || [],
  };
  item.responses.push(resp);
  await item.save();
  res.status(201).json(resp);
});

// list responses (instructor only)
router.get("/:id/responses", yuvrajAdminOnly, async (req, res) => {
  const item = await PollingAndSurvey.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  const inst = req.header("x-institution-id");
  if (inst && item.institution && String(item.institution) !== String(inst)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  res.json(item.responses || []);
});

// summary / aggregated results (instructor only)
router.get("/:id/summary", yuvrajAdminOnly, async (req, res) => {
  const item = await PollingAndSurvey.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  const inst = req.header("x-institution-id");
  if (inst && item.institution && String(item.institution) !== String(inst)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const totalResponses = (item.responses || []).length;

  const questionsSummary = (item.questions || []).map((q, qi) => {
    const opts = q.options || [];
    const counts = opts.map(() => 0);
    let other = 0;
    let totalForQ = 0;

    (item.responses || []).forEach((r) => {
      const ans = (r.answers && r.answers[qi]) || "";
      if (ans === null || ans === undefined || String(ans).trim() === "") return;
      totalForQ += 1;
      const idx = opts.indexOf(ans);
      if (idx >= 0) counts[idx] += 1;
      else other += 1;
    });

    const options = opts.map((text, oi) => ({ text, count: counts[oi] }));
    return { text: q.text, options, otherCount: other, totalForQuestion: totalForQ };
  });

  res.json({ totalResponses, questions: questionsSummary });
});

export default router;
