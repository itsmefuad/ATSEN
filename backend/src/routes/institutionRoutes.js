// backend/routes/institutionRoutes.js

import { Router } from "express";
import {
  getInstitutionDashboard,
  getInstitutionInstructors
} from "../controllers/institutionController.js";

const router = Router();

// List instructors for this institution (optionally filtered by ?search=…)
router.get(
  "/:idOrName/instructors",
  getInstitutionInstructors
);

// Dynamic: idOrName can be ObjectId or name (case-insensitive exact match)
router.get(
  "/:idOrName/dashboard",
  getInstitutionDashboard
);

export default router;