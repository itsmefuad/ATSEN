// backend/controllers/roomsController.js
import axios from "axios";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { json } from "express";
import Room from "../models/Room.js";
import Student from "../models/student.js";
import Instructor from "../models/instructor.js";

dotenv.config();

export async function getAllRooms(req, res) {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error in getAllRooms controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

export async function getRoomById(req, res) {
  try {
    const room = await Room.findById(req.params.id)
      .populate("students", "name email")
      .populate("instructors", "name email");

    if (!room) return res.status(404).json({ message: "Room not found!" });

    res.status(200).json(room);
  } catch (error) {
    console.error("Error in getRoomById controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

export async function getRoomWithUserSections(req, res) {
  try {
    const room = await Room.findById(req.params.id)
      .populate("students", "name email")
      .populate("instructors", "name email")
      .populate("sections.students", "name email")
      .populate("sections.instructors", "name email");

    if (!room) return res.status(404).json({ message: "Room not found!" });

    const userId = req.user.id;
    const userRole = req.user.role;

    let userSections = [];

    if (userRole === "student") {
      // Find student's section in this room
      const student = await Student.findById(userId);
      if (student) {
        const roomSection = student.roomSections.find(
          (rs) => rs.roomId.toString() === req.params.id
        );
        if (roomSection) {
          userSections = [roomSection.sectionNumber];
        }
      }
    } else if (userRole === "instructor") {
      // Find instructor's sections in this room
      const instructor = await Instructor.findById(userId);
      if (instructor) {
        const roomSection = instructor.roomSections.find(
          (rs) => rs.roomId.toString() === req.params.id
        );
        if (roomSection) {
          userSections = roomSection.sectionNumbers;
        }
      }
    }

    // Add user sections to the response
    const roomWithSections = {
      ...room.toObject(),
      userSections,
    };

    res.status(200).json(roomWithSections);
  } catch (error) {
    console.error("Error in getRoomWithUserSections controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

export async function createRoom(req, res) {
  try {
    const { room_name, description, sections } = req.body;

    // Validate that sections are provided and contain class timings
    if (!sections || sections.length < 1) {
      return res.status(400).json({
        message: "Room must have at least 1 section with class timings",
      });
    }

    // Validate that each section has at least 1 class timing
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.classTimings || section.classTimings.length < 1) {
        return res.status(400).json({
          message: `Section ${i + 1} must have at least 1 class timing`,
        });
      }
      // Ensure section number is correct
      section.sectionNumber = i + 1;
    }

    const room = new Room({ room_name, description, sections });
    const savedRoom = await room.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    console.error("Error in createRoom controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateRoom(req, res) {
  try {
    const { room_name, description, sections } = req.body;

    const updateData = {};
    if (room_name) updateData.room_name = room_name;
    if (description) updateData.description = description;

    // If sections are provided, validate them
    if (sections) {
      if (sections.length < 1) {
        return res.status(400).json({
          message: "Room must have at least 1 section",
        });
      }

      // Validate each section
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (!section.classTimings || section.classTimings.length < 1) {
          return res.status(400).json({
            message: `Section ${i + 1} must have at least 1 class timing`,
          });
        }
        // Ensure section number is correct
        section.sectionNumber = i + 1;
      }
      updateData.sections = sections;
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedRoom)
      return res.status(404).json({ message: "Room not found" });

    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Error in updateRoom controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Room deletion is now handled exclusively by institutions
// See: backend/src/controllers/institution/CreateRoomController.js

async function getZoomAccessToken() {
  const tokenUrl = "https://zoom.us/oauth/token";

  const basicAuth = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString("base64");

  const { data } = await axios.post(
    `${tokenUrl}?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    null,
    { headers: { Authorization: `Basic ${basicAuth}` } }
  );

  return data.access_token; // valid ~1 hour
}

export async function createMeeting(req, res) {
  const { id: roomId } = req.params;
  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // ⬇ Replace generateZoomToken() with OAuth token fetch
    const accessToken = await getZoomAccessToken();

    const { data } = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: `Room ${roomId} Live Session`,
        type: 1, // instant meeting
        settings: {
          host_video: true,
          participant_video: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(201).json({
      meetingId: data.id,
      join_url: data.join_url,
    });
  } catch (err) {
    console.error("Zoom API error status:", err.response?.status);
    console.error("Zoom API error body:", err.response?.data);
    res.status(500).json({
      message: "Failed to create Zoom meeting",
      zoomError: err.response?.data || err.message,
    });
  }
}

// Get available time slots for sections
export async function getAvailableTimeSlots(req, res) {
  try {
    const timeSlots = [
      { startTime: "8:00 AM", endTime: "9:20 AM" },
      { startTime: "9:30 AM", endTime: "10:50 AM" },
      { startTime: "11:00 AM", endTime: "12:20 PM" },
      { startTime: "12:30 PM", endTime: "1:50 PM" },
      { startTime: "2:00 PM", endTime: "3:20 PM" },
      { startTime: "3:30 PM", endTime: "4:50 PM" },
    ];

    const availableDays = [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
    ];

    res.status(200).json({
      timeSlots,
      availableDays,
      message:
        "Each room requires at least 1 section. Each section requires at least 1 class timing. Additional sections and class timings can be added as needed.",
    });
  } catch (error) {
    console.error("Error in getAvailableTimeSlots controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Get room sections by room ID
export async function getRoomSections(req, res) {
  try {
    const room = await Room.findById(req.params.id).select(
      "sections room_name"
    );

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      roomId: room._id,
      roomName: room.room_name,
      sections: room.sections,
    });
  } catch (error) {
    console.error("Error in getRoomSections controller", error);
    res.status(500).json({ message: "Internal Server error" });
  }
}

// Update room sections specifically
export async function updateRoomSections(req, res) {
  try {
    const { sections } = req.body;

    // Validate sections
    if (!sections || sections.length < 1) {
      return res.status(400).json({
        message: "Room must have at least 1 section with class timings",
      });
    }

    // Validate that each section has at least 1 class timing
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section.classTimings || section.classTimings.length < 1) {
        return res.status(400).json({
          message: `Section ${i + 1} must have at least 1 class timing`,
        });
      }
      // Ensure section number is correct
      section.sectionNumber = i + 1;
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { sections },
      { new: true }
    ).select("sections room_name");

    if (!updatedRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({
      roomId: updatedRoom._id,
      roomName: updatedRoom.room_name,
      sections: updatedRoom.sections,
    });
  } catch (error) {
    console.error("Error in updateRoomSections controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
