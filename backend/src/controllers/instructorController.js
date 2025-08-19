// src/controllers/auth.js

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Instructor from "../models/instructor.js";

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