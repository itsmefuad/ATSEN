import { Router } from "express";
import {
  registerInstructor,
  loginInstructor
} from "../controllers/instructorController.js";

const router = Router();

router.post("/register", registerInstructor);
router.post("/login", loginInstructor);

export default router;