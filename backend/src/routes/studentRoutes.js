// backend/src/routes/studentRoutes.js

import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  getAllStudents
} from "../controllers/studentController.js";

const router = Router();

// GET  /api/students
router.get("/", getAllStudents);

// POST /api/students/register
router.post("/register", registerStudent);

// POST /api/students/login
router.post("/login",    loginStudent);

export default router;