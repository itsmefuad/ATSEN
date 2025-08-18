// backend/src/controllers/institutionController.js

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import slugify from "slugify";

import Institution from "../models/institution.js";
import Room from "../models/Room.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";

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

// Register a new institution (includes loginId generation)
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

    // generate a unique 8‐digit loginId
    const loginId = await generateLoginId();
    const hashed  = await bcrypt.hash(password, 10);

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

// Helper to find institution by _id, loginId, or slug
const findInstitutionByIdOrName = async (idOrName) => {
  if (mongoose.isValidObjectId(idOrName)) {
    const byId = await Institution.findById(idOrName).lean();
    if (byId) return byId;
  }

  const bySlug = await Institution
    .findOne({ slug: new RegExp(`^${idOrName}$`, "i") })
    .lean();
  if (bySlug) return bySlug;

  const byName = await Institution
    .findOne({ name: new RegExp(`^${idOrName}$`, "i") })
    .lean();
  return byName || null;
};

// List all instructors attached to an institution (optional search via query param)
export async function getInstitutionInstructors(req, res) {
  try {
    const { idOrName } = req.params;
    const { search = "" } = req.query;

    if (!idOrName) {
      return res
        .status(400)
        .json({ message: "idOrName parameter is required" });
    }

    // 1. Resolve the institution
    const institution = await findInstitutionByIdOrName(idOrName);
    if (!institution) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const instId = institution._id;
    const term   = search.trim();

    // 2. Build filter: only match the institutions array
    const filter = {
      institutions: instId
    };

    // 3. Optional name search
    if (term) {
      filter.name = { $regex: term, $options: "i" };
    }

    // 4. Fetch all linked instructors
    const list = await Instructor.find(filter)
      .lean();
      // .limit(50)    ← you can keep or remove this

    // 5. Send them back
    return res.json(list);
  } catch (err) {
    console.error("Get instructors error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}







// Add an instructor to an institution
export async function addInstructorToInstitution(req, res) {
  const { idOrName }     = req.params;
  const { instructorId } = req.body;

  try {
    // 1) Build filter for Institution (only cast _id when valid)
    let instFilter;
    if (mongoose.isValidObjectId(idOrName)) {
      instFilter = { _id: idOrName };
    } else {
      instFilter = {
        $or: [
          { loginId: idOrName },
          { slug:    idOrName }
        ]
      };
    }

    // 2) Look up the institution
    const inst = await Institution.findOne(instFilter);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found." });
    }

    // 3) Look up the instructor
    const ins = await Instructor.findById(instructorId);
    if (!ins) {
      return res.status(404).json({ message: "Instructor not found." });
    }

    // 4) Prevent duplicate linkage
    const instObjectId = inst._id.toString();
    if (ins.institutions?.map(id => id.toString()).includes(instObjectId)) {
      return res.status(400).json({ message: "Instructor already linked to this institution." });
    }

    // 5) Push and save the instructor
    ins.institutions = ins.institutions || [];
    ins.institutions.push(inst._id);
    await ins.save();

    return res.status(200).json({ message: "Instructor added to institution." });
  } catch (err) {
    console.error("Add instructor error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}


export async function getInstitutionDashboard(req, res) {
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
      activeStudents,
      totalInstructors
    ] = await Promise.all([
      Room.countDocuments({ institution: instId }),
      Room.countDocuments({ institution: instId, active: true }),
      Student.countDocuments({ institution: instId }),
      Student.countDocuments({ institution: instId}),
      Instructor.countDocuments({ institutions: instId })
    ]);

    return res.json({
      _id:             institution._id,
      name:            institution.name,
      eiin:            institution.eiin,
      email:           institution.email,
      phone:           institution.phone,
      address:         institution.address,
      description:     institution.description,
      slug:            institution.slug,

      totalRooms,
      activeRooms,
      totalStudents,
      activeStudents,

      totalInstructors   // <-- only this one
    });
  } catch (err) {
    console.error("Get dashboard error:", err);
    return res.status(500).json({ message: "Server error." });
  }
}





// Update institution settings
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
    if (name !== undefined)        updates.name = name;
    if (email !== undefined)       updates.email = email;
    if (phone !== undefined)       updates.phone = phone;
    if (address !== undefined)     updates.address = address;
    if (description !== undefined) updates.description = description;

    const updated = await Institution.findByIdAndUpdate(
      institution._id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    return res.json(updated);
  } catch (err) {
    console.error("Update settings error:", err);
    return res.status(500).json({ message: "Failed to update institution settings" });
  }
};
export async function addStudent(req, res) {
  const { idOrName } = req.params;
  const { studentId } = req.body;                // ← get it here

  if (!studentId) {
    return res.status(400).json({ message: "Missing studentId." });
  }

  // find institution
  const inst = await Institution.findOne(/* your filter */);
  if (!inst) return res.status(404).json({ message: "Institution not found." });

  // find the student
  const student = await Student.findById(studentId);
  if (!student) return res.status(404).json({ message: "Student not found." });

  // prevent duplicates
  if ((student.institutions || [])
        .map(id => id.toString())
        .includes(inst._id.toString())) {
    return res.status(400).json({ message: "Already linked." });
  }

  // push & save
  student.institutions = student.institutions || [];
  student.institutions.push(inst._id);
  await student.save();

  res.json({ message: "Added to institution." });
}











