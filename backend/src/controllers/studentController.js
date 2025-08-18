import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Student from "../models/student.js";
import Institution from "../models/institution.js";

// Register student
export async function registerStudent(req, res) {
  const { studentId, name, email, password, institution } = req.body;
  if (!studentId || !name || !email || !password || !institution) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Verify institution
  const inst = await Institution.findById(institution);
  if (!inst) {
    return res.status(400).json({ message: "Institution not found." });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const stud = await Student.create({
      studentId,
      name,
      email,
      password: hashed,
      institution,
    });

    const token = jwt.sign(
      { id: stud._id, role: "student", institution },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({ token, student: { id: stud._id, name: stud.name } });
  } catch (err) {
    console.error("Student register error:", err);
    res.status(500).json({ message: "Server error." });
  }
}

// Login student
export async function loginStudent(req, res) {
  const { email, password } = req.body;
  try {
    const stud = await Student.findOne({ email });
    if (!stud) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const ok = await bcrypt.compare(password, stud.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      { id: stud._id, role: "student", institution: stud.institution },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, student: { id: stud._id, name: stud.name } });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ message: "Server error." });
  }
}