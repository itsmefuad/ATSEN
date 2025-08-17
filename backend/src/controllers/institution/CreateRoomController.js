// backend/src/controllers/institution/CreateRoomController.js
import mongoose from "mongoose";
import Institution from "../../models/institution.js";
import Room from "../../models/Room.js";

/**
 * POST /api/institutions/:idOrName/add-room
 */
export async function createRoom(req, res) {
  try {
    const { idOrName } = req.params;
    const {
      room_name,
      description,
      maxCapacity,
      instructors = [],
      createTime: createTimeRaw
    } = req.body;

    // basic validation
    if (!room_name) {
      return res.status(400).json({ message: "room_name is required" });
    }
    if (description == null) {
      return res.status(400).json({ message: "description is required" });
    }

    // resolve institution
    const inst = mongoose.Types.ObjectId.isValid(idOrName)
      ? await Institution.findById(idOrName)
      : await Institution.findOne({ name: idOrName });

    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // parse or default createTime
    const createTime = createTimeRaw
      ? new Date(createTimeRaw)
      : new Date();

    // create the room with createTime
    const room = await Room.create({
      room_name,
      description,
      maxCapacity,
      instructors: Array.isArray(instructors) ? instructors : [],
      institution: inst._id,
      createTime
    });

    return res.status(201).json(room);
  } catch (err) {
    console.error("Error in createRoom:", err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: err.errors });
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

    const inst = mongoose.Types.ObjectId.isValid(idOrName)
      ? await Institution.findById(idOrName)
      : await Institution.findOne({ name: idOrName });

    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    const rooms = await Room.find({ institution: inst._id });
    return res.json(rooms);
  } catch (err) {
    console.error("Error in listRooms:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}