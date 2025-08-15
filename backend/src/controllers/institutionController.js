import mongoose from "mongoose";
import Institution from "../models/institution.js";
import Room from "../models/Room.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";

const findInstitutionByIdOrName = async (idOrName) => {
  if (mongoose.isValidObjectId(idOrName)) {
    const byId = await Institution.findById(idOrName).lean();
    if (byId) return byId;
  }
  // Case-insensitive name match (exact)
  return Institution.findOne({ name: new RegExp(`^${idOrName}$`, "i") }).lean();
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

    // If you later add student.active, compute activeStudents similarly
    const activeStudents = totalStudents;

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