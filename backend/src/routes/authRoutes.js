// backend/src/routes/authRoutes.js
import { Router } from "express";
import { universalLogin } from "../controllers/authController.js";

const router = Router();

// Universal login endpoint - automatically detects user role
router.post("/login", universalLogin);

export default router;
