import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Instructor from "../models/instructor.js";
import Institution from "../models/institution.js";

// Register instructor
export async function registerInstructor(req, res) {
  const { instructorId, name, email, password, institutions } = req.body;
  if (!instructorId || !name || !email || !password || !institutions?.length) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Verify each institution exists
  for (let instId of institutions) {
    const inst = await Institution.findById(instId);
    if (!inst) {
      return res.status(400).json({ message: `Institution ${instId} not found.` });
    }
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const instr = await Instructor.create({
      instructorId,
      name,
      email,
      password: hashed,
      institutions,
    });

    const token = jwt.sign(
      { id: instr._id, role: "instructor", institutions },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token, instructor: { id: instr._id, name: instr.name } });
  } catch (err) {
    console.error("Instructor register error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

// Login instructor
export async function loginInstructor(req, res) {
  const { email, password } = req.body;
  try {
    const instr = await Instructor.findOne({ email });
    if (!instr) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const ok = await bcrypt.compare(password, instr.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      { id: instr._id, role: "instructor", institutions: instr.institutions },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, instructor: { id: instr._id, name: instr.name } });
  } catch (err) {
    console.error("Instructor login error:", err);
    res.status(500).json({ message: "Server error." });
  }
}