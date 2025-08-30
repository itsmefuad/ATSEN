// src/controllers/auth.js

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Instructor from "../models/instructor.js";
import Room from "../models/Room.js";

// Register instructor
export async function registerInstructor(req, res) {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create instructor record (no more instructorId or institutions)
    const instr = await Instructor.create({
      name,
      email,
      password: hashed,
    });

    // Sign token without institutions
    const token = jwt.sign(
      { id: instr._id, role: "instructor" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return minimal payload
    res
      .status(201)
      .json({ token, instructor: { id: instr._id, name: instr.name } });
  } catch (err) {
    console.error("Instructor register error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

// Login instructor
export async function loginInstructor(req, res) {
  const { email, password } = req.body;

  try {
    // Find by email only
    const instr = await Instructor.findOne({ email });
    if (!instr) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare hash
    const ok = await bcrypt.compare(password, instr.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Sign token without institutions
    const token = jwt.sign(
      { id: instr._id, role: "instructor" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, instructor: { id: instr._id, name: instr.name } });
  } catch (err) {
    console.error("Instructor login error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

// Get rooms assigned to an instructor
export async function getInstructorRooms(req, res) {
  try {
    const { instructorId } = req.params;

    const rooms = await Room.find({ instructors: instructorId })
      .populate("students", "name email")
      .populate("instructors", "name email")
      .select("room_name description createdAt students instructors sections")
      .sort({ createdAt: -1 });

    // Filter sections to only include those where the instructor is assigned
    const filteredRooms = rooms.map((room) => {
      const instructorSections = room.sections.filter(
        (section) =>
          section.instructors &&
          section.instructors.some(
            (instId) => instId.toString() === instructorId.toString()
          )
      );

      return {
        ...room.toObject(),
        sections: instructorSections,
      };
    });

    res.json(filteredRooms);
  } catch (err) {
    console.error("Get instructor rooms error:", err);
    res.status(500).json({ message: "Server error." });
  }
}
