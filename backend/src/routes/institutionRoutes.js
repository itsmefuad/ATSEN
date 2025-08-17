import { Router } from "express";
import {
  getInstitutionDashboard,
  getInstitutionInstructors,
  updateInstitutionSettings   // ← import this
} from "../controllers/institutionController.js";

const router = Router();

// List instructors
router.get("/:idOrName/instructors", getInstitutionInstructors);

// Fetch dashboard data
router.get("/:idOrName/dashboard", getInstitutionDashboard);

// Update settings
router.put("/:idOrName/settings", updateInstitutionSettings);

export default router;