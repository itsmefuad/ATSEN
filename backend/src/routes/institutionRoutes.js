// backend/src/routes/institutionRoutes.js

import { Router } from "express";
import {
  registerInstitution,
  loginInstitution,
  getInstitutionDashboard,
  getInstitutionInstructors,
  updateInstitutionSettings,
  addInstructorToInstitution,
  addStudent
} from "../controllers/institutionController.js";

const router = Router();

// Register and login
router.post("/register", registerInstitution);
router.post("/login",    loginInstitution);

// List instructors for an institution
router.get("/:idOrName/instructors", getInstitutionInstructors);

// Add an instructor to an institution
router.post("/:idOrName/add-instructor", addInstructorToInstitution);

// Fetch dashboard data
router.get("/:idOrName/dashboard", getInstitutionDashboard);

// Update institution settings
router.put("/:idOrName/settings", updateInstitutionSettings);

router.post("/:idOrName/add-student", addStudent);

export default router;