// backend/controllers/institutionController.js

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Institution from "../models/institution.js";
import Room from "../models/Room.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";

// Register institution
// Utility to generate an 8-digit unique loginId
async function generateLoginId() {
  let unique = false;
  let loginId;
  while (!unique) {
    loginId = Math.floor(10000000 + Math.random() * 90000000).toString();
    const exists = await Institution.findOne({ loginId });
    if (!exists) unique = true;
  }
  return loginId;
}

// Register institution
export async function registerInstitution(req, res) {
  const { name, eiin, email, password, phone, address, description } = req.body;
  if (!name || !eiin || !email || !password) {
    return res.status(400).json({ message: "All required fields must be provided." });
  }

  try {
    // Check for duplicates
    const existing = await Institution.findOne({ $or: [{ eiin }, { email }] });
    if (existing) {
      return res.status(409).json({ message: "Institution with same EIIN or Email already exists." });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Generate unique loginId
    const loginId = await generateLoginId();

    // Create institution
    const inst = await Institution.create({
      name,
      eiin: eiin.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      loginId,
      phone,
      address,
      description
    });

    const token = jwt.sign(
      { id: inst._id, role: "institution" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      institution: { id: inst._id, name: inst.name, eiin: inst.eiin, loginId: inst.loginId }
    });
  } catch (err) {
    console.error("Institution register error:", err);
    return res.status(500).json({ message: err.message });
  }
}


// Login institution
export async function loginInstitution(req, res) {
  const { email, password } = req.body;
  try {
    const inst = await Institution.findOne({ email });
    if (!inst) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const ok = await bcrypt.compare(password, inst.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: inst._id, role: "institution" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, institution: { id: inst._id, name: inst.name } });
  } catch (err) {
    console.error("Institution login error:", err);
    res.status(500).json({ message: "Server error." });
  }
}



/**
 * Resolve idOrName (ObjectId or case-insensitive name) to an Institution doc
 */
const findInstitutionByIdOrName = async (idOrName) => {
  if (mongoose.isValidObjectId(idOrName)) {
    const byId = await Institution.findById(idOrName).lean();
    if (byId) return byId;
  }
  return Institution.findOne({
    name: new RegExp(`^${idOrName}$`, "i")
  }).lean();
};

/**
 * GET /api/institutions/:idOrName/instructors
 * Optional query: ?search=foobar
 */
export const getInstitutionInstructors = async (req, res) => {
  try {
    const { idOrName } = req.params;
    const { search = "" } = req.query;

    if (!idOrName) {
      return res
        .status(400)
        .json({ message: "idOrName parameter is required" });
    }

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const instId = institution._id;

    // Build filter
    const filter = { institutions: instId };
    const term = search.trim();
    if (term) {
      filter.name = { $regex: term, $options: "i" };
    }

    // Query and return
    const list = await Instructor.find(filter)
      .lean()
      .limit(50);

    return res.json(list);
  } catch (err) {
    console.error("Error in getInstitutionInstructors:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/institutions/:idOrName/dashboard
 */
export const getInstitutionDashboard = async (req, res) => {
  try {
    const { idOrName } = req.params;
    if (!idOrName) {
      return res
        .status(400)
        .json({ message: "idOrName parameter is required" });
    }

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const instId = institution._id;

    const [
      totalRooms,
      activeRooms,
      totalStudents,
      totalInstructors,
      activeInstructors
    ] = await Promise.all([
      Room.countDocuments({ institution: instId }),
      Room.countDocuments({ institution: instId, active: true }),
      Student.countDocuments({ institution: instId }),
      Instructor.countDocuments({ institution: instId }),
      Instructor.countDocuments({ institution: instId, active: true })
    ]);

    const activeStudents = totalStudents; // adjust if you add student.active later

    return res.json({
      ...institution,
      totalRooms,
      activeRooms,
      totalStudents,
      activeStudents,
      totalInstructors,
      activeInstructors
    });
  } catch (err) {
    console.error("Error in getInstitutionDashboard:", err);
    return res.status(500).json({ message: "Server error" });
  }
};