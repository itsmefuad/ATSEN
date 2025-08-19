// backend/src/routes/institutionRoutes.js

import { Router } from "express";
import {
  registerInstitution,
  loginInstitution,
  getInstitutionDashboard,
  getInstitutionInstructors,
  getInstitutionStudents,
  updateInstitutionSettings,
  addInstructorToInstitution,
  addStudent,
  removeStudent
} from "../controllers/institutionController.js";

const router = Router();

// Register and login
router.post("/register", registerInstitution);
router.post("/login",    loginInstitution);

// List instructors for an institution
router.get("/:idOrName/instructors", getInstitutionInstructors);

// List students for an institution
router.get("/:idOrName/students", getInstitutionStudents);

// Add an instructor to an institution
router.post("/:idOrName/add-instructor", addInstructorToInstitution);

// Fetch dashboard data
router.get("/:idOrName/dashboard", getInstitutionDashboard);

// Update institution settings
router.put("/:idOrName/settings", updateInstitutionSettings);

router.post("/:idOrName/add-student", addStudent);
router.post("/:idOrName/remove-student", removeStudent);

export default router;