// backend/src/controllers/institution/CreateRoomController.js
import mongoose from "mongoose";
import Institution from "../../models/institution.js";
import Room from "../../models/Room.js";

/**
 * POST /api/institutions/:idOrName/add-room
 */
export async function createRoom(req, res) {
  try {
    // debug incoming body if needed:
    // console.log("createRoom req.body:", req.body);

    const { idOrName } = req.params;
    const { room_name, description, maxCapacity, instructors = [] } = req.body;

    // basic validation for required fields declared in the Room schema
    if (!room_name) {
      return res.status(400).json({ message: "room_name is required" });
    }
    if (typeof description === "undefined" || description === null) {
      return res.status(400).json({ message: "description is required" });
    }

    // find institution by id or name
    const inst = mongoose.Types.ObjectId.isValid(idOrName)
      ? await Institution.findById(idOrName)
      : await Institution.findOne({ name: idOrName });

    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const room = await Room.create({
      room_name,
      description,
      maxCapacity,
      instructors: Array.isArray(instructors) ? instructors : [],
      institution: inst._id,
    });

    return res.status(201).json(room);
  } catch (err) {
    console.error("Error in createRoom:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation failed", errors: err.errors });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /api/institutions/:idOrName/rooms
 */
export async function listRooms(req, res) {
  try {
    const { idOrName } = req.params;

    // find institution by id or name
    const inst = mongoose.Types.ObjectId.isValid(idOrName)
      ? await Institution.findById(idOrName)
      : await Institution.findOne({ name: idOrName });

    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // fetch all rooms for that institution
    const rooms = await Room.find({ institution: inst._id });
    return res.json(rooms);
  } catch (err) {
    console.error("Error in listRooms:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}