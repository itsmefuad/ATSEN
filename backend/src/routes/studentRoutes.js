// backend/src/routes/studentRoutes.js

import { Router } from "express";
import {
  registerStudent,
  loginStudent,
  getAllStudents,
  getStudentRooms,
  getStudentById
} from "../controllers/studentController.js";

const router = Router();

// GET  /api/students
router.get("/", getAllStudents);

// GET /api/students/:studentId
router.get("/:studentId", getStudentById);

// GET /api/students/:studentId/rooms
router.get("/:studentId/rooms", getStudentRooms);

// POST /api/students/register
router.post("/register", registerStudent);

// POST /api/students/login
router.post("/login",    loginStudent);

export default router;