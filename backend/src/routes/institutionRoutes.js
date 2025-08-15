import { Router } from "express";
import { getInstitutionDashboard } from "../controllers/institutionController.js";

const router = Router();

// Dynamic: idOrName can be ObjectId or name (case-insensitive exact match)
router.get("/:idOrName/dashboard", getInstitutionDashboard);

export default router;