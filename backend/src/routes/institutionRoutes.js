// backend/routes/institutionRoutes.js

import { Router } from "express";
import {
  registerInstitution,
  loginInstitution,
  getInstitutionDashboard,
  getInstitutionInstructors
} from "../controllers/institutionController.js";

const router = Router();

router.post("/register", registerInstitution);
router.post("/login", loginInstitution);

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