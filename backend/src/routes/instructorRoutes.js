// backend/src/routes/instructorRoutes.js
import { Router } from "express";
import {
  registerInstructor,
  loginInstructor,
  getInstructorRooms
} from "../controllers/instructorController.js";

import Instructor from "../models/instructor.js";  // ← import model

const router = Router();

router.post("/register", registerInstructor);
router.post("/login", loginInstructor);


router.get("/", async (req, res) => {
  try {
    // const { institutionSlug } = req.query;
    // let query = {};
    
    // // Filter by institution if provided
    // if (institutionSlug) {
    //   // Find instructors that belong to the specified institution
    //   query.institutions = { $in: [institutionSlug] };
    // }
    
    const instructors = await Instructor.find({}, "name email"); // optional projection
    res.json(instructors);
  } catch (err) {
    console.error("Failed to fetch instructors:", err);
    res.status(500).json({ message: "Could not fetch instructors." });
  }
});

router.get("/:instructorId/rooms", getInstructorRooms);

export default router;