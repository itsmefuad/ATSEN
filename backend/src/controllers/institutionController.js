import mongoose from "mongoose";
import Institution from "../models/institution.js";
import Room from "../models/Room.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";

/**
 * Resolve idOrName (ObjectId or case-insensitive name) to an Institution doc
 */
const findInstitutionByIdOrName = async (idOrName) => {
  if (mongoose.isValidObjectId(idOrName)) {
    const byId = await Institution.findById(idOrName).lean();
    if (byId) return byId;
  }
  return Institution.findOne({
    name: new RegExp(`^${idOrName}$`, "i"),
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
    const filter = { institutions: instId };
    const term = search.trim();
    if (term) {
      filter.name = { $regex: term, $options: "i" };
    }

    const list = await Instructor.find(filter).lean().limit(50);
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
      activeInstructors,
    ] = await Promise.all([
      Room.countDocuments({ institution: instId }),
      Room.countDocuments({ institution: instId, active: true }),
      Student.countDocuments({ institution: instId }),
      Instructor.countDocuments({ institution: instId }),
      Instructor.countDocuments({ institution: instId, active: true }),
    ]);

    const activeStudents = totalStudents; // adjust if you add student.active later

    return res.json({
      ...institution,
      totalRooms,
      activeRooms,
      totalStudents,
      activeStudents,
      totalInstructors,
      activeInstructors,
    });
  } catch (err) {
    console.error("Error in getInstitutionDashboard:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/institutions/:idOrName/settings
 * Body may include: name, email, phone, address, description
 */
export const updateInstitutionSettings = async (req, res) => {
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

    // Restrict to allowed fields
    const { name, email, phone, address, description } = req.body;
    const updates = {};
    if (name !== undefined)       updates.name = name;
    if (email !== undefined)      updates.email = email;
    if (phone !== undefined)      updates.phone = phone;
    if (address !== undefined)    updates.address = address;
    if (description !== undefined) updates.description = description;

    const updated = await Institution.findByIdAndUpdate(
      institution._id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    return res.json(updated);
  } catch (err) {
    console.error("Error in updateInstitutionSettings:", err);
    return res
      .status(500)
      .json({ message: "Failed to update institution settings" });
  }
};