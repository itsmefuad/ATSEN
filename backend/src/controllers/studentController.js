import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Student from "../models/student.js";

// Register student
export async function registerStudent(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const stud = await Student.create({
      name,
      email,
      password: hashed,
    });

    const token = jwt.sign(
      { id: stud._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res
      .status(201)
      .json({ token, student: { id: stud._id, name: stud.name } });
  } catch (err) {
    console.error("Student register error:", err);
    return res.status(500).json({ message: "Server error." });
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
      { id: stud._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token, student: { id: stud._id, name: stud.name } });
  } catch (err) {
    console.error("Student login error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}

export async function getAllStudents(req, res) {
  try {
    // exclude passwords
    const students = await Student.find({}, "-password");
    return res.status(200).json(students);
  } catch (err) {
    console.error("getAllStudents error:", err);
    return res.status(500).json({ message: err.message });
  }
}

