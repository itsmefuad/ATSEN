import { json } from "express";
import Room from "../models/Room.js";

export async function getAllRooms(req, res) {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }); //newest first
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getAllRooms controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

export async function getRoomById(req, res) {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) return res.status(404).json({ message: "Room not found!" });

    res.status(200).json(room);
  } catch (error) {
    console.error("Error in getRoomById controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

export async function createRoom(req, res) {
  try {
    const { course_name, description } = req.body;
    const room = new Room({ course_name, description });

    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Error in createRoom controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateRoom(req, res) {
  try {
    const { course_name, description } = req.body;
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { course_name, description },
      {
        new: true,
      }
    );

    if (!updatedRoom)
      return res.status(404).json({ message: "Room not found" });

    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Error in updateRoom controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteRoom(req, res) {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);

    if (!deletedRoom)
      return res.status(404).json({ message: "Room not found" });

    res.status(200).json({ message: "Room deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteRoom controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
