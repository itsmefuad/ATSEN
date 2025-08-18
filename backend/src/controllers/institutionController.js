import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import slugify from "slugify";

import Institution from "../models/institution.js";
import Room from "../models/Room.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";

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

// Ensure slug exists
async function ensureSlug(inst) {
  if (!inst.slug) {
    inst.slug = slugify(inst.name, { lower: true, strict: true });
    await inst.save();
  }
  return inst.slug;
}

export async function registerInstitution(req, res) {
  const { name, eiin, email, password, phone, address, description } = req.body;
  if (!name || !eiin || !email || !password) {
    return res.status(400).json({ message: "All required fields must be provided." });
  }

  try {
    const existing = await Institution.findOne({ $or: [{ eiin }, { email }] });
    if (existing) {
      return res.status(409).json({
        message: "Institution with same EIIN or Email already exists."
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const inst = await Institution.create({
      name,
      eiin: eiin.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      phone,
      address,
      description
    });

    const slug = await ensureSlug(inst);

    const token = jwt.sign(
      { id: inst._id, role: "institution" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      token,
      institution: { id: inst._id, slug, name: inst.name }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function loginInstitution(req, res) {
  const { email, password } = req.body;

  try {
    const inst = await Institution.findOne({ email });
    if (!inst) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const matches = await bcrypt.compare(password, inst.password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const slug = await ensureSlug(inst);

    const token = jwt.sign(
      { id: inst._id, role: "institution" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      institution: { id: inst._id, slug, name: inst.name }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error." });
  }
}

const findInstitutionByIdOrName = async (idOrName) => {
  if (mongoose.isValidObjectId(idOrName)) {
    const instById = await Institution.findById(idOrName).lean();
    if (instById) return instById;
  }

  const instBySlug = await Institution
    .findOne({ slug: new RegExp(`^${idOrName}$`, "i") })
    .lean();
  if (instBySlug) return instBySlug;

  const instByName = await Institution
    .findOne({ name: new RegExp(`^${idOrName}$`, "i") })
    .lean();
  return instByName || null;
};

export const getInstitutionInstructors = async (req, res) => {
  try {
    const { idOrName } = req.params;
    const { search = "" } = req.query;

    if (!idOrName) {
      return res.status(400).json({ message: "idOrName parameter is required" });
    }

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const instId = institution._id;
    const filter = { institutions: instId };
    const term = search.trim();
    if (term) {
      filter.name = { $regex: term, $options: "i" };
    }

    const list = await Instructor.find(filter).lean().limit(50);
    return res.json(list);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

export const getInstitutionDashboard = async (req, res) => {
  try {
    const { idOrName } = req.params;
    if (!idOrName) {
      return res.status(400).json({ message: "idOrName parameter is required" });
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

    const activeStudents = totalStudents;

    return res.json({
      _id: institution._id,
      name: institution.name,
      eiin: institution.eiin,
      email: institution.email,
      phone: institution.phone,
      address: institution.address,
      description: institution.description,
      slug: institution.slug,
      totalRooms,
      activeRooms,
      totalStudents,
      activeStudents,
      totalInstructors,
      activeInstructors
    });
  } catch {
    return res.status(500).json({ message: "Server error." });
  }
};

export const updateInstitutionSettings = async (req, res) => {
  try {
    const { idOrName } = req.params;
    if (!idOrName) {
      return res.status(400).json({ message: "idOrName parameter is required" });
    }

    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const { name, email, phone, address, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (description !== undefined) updates.description = description;

    const updated = await Institution.findByIdAndUpdate(
      institution._id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    return res.json(updated);
  } catch {
    return res.status(500).json({ message: "Failed to update institution settings" });
  }
};