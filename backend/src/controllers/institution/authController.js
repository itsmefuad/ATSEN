// backend/src/controllers/institution/authController.js

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import slugify from "slugify";
import Institution from "../../models/institution.js";

// Utility to generate an 8‐digit unique loginId
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

// Register a new institution
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

    const loginId = await generateLoginId();
    const hashed = await bcrypt.hash(password, 10);

    const inst = await Institution.create({
      name,
      eiin: eiin.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      phone,
      address,
      description,
      loginId
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
    console.error("Register institution error:", err);
    return res.status(500).json({ message: err.message });
  }
}

// Login an existing institution
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
    console.error("Login institution error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}