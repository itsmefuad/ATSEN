// Script to demonstrate how to create a room with sections and class timings
// This script can be used for testing the new room creation functionality

import mongoose from "mongoose";
import Room from "../src/models/Room.js";
import dotenv from "dotenv";

dotenv.config();

const sampleRoomData = {
  room_name: "Computer Science 101",
  description: "Introduction to Computer Science",
  maxCapacity: 30,
  sections: [
    {
      sectionNumber: 1,
      classTimings: [
        {
          day: "Saturday",
          startTime: "8:00 AM",
          endTime: "9:20 AM",
        },
        {
          day: "Monday",
          startTime: "11:00 AM",
          endTime: "12:20 PM",
        },
      ],
    },
    {
      sectionNumber: 2,
      classTimings: [
        {
          day: "Sunday",
          startTime: "9:30 AM",
          endTime: "10:50 AM",
        },
        {
          day: "Tuesday",
          startTime: "2:00 PM",
          endTime: "3:20 PM",
        },
      ],
    },
    {
      sectionNumber: 3,
      classTimings: [
        {
          day: "Monday",
          startTime: "8:00 AM",
          endTime: "9:20 AM",
        },
        {
          day: "Wednesday",
          startTime: "12:30 PM",
          endTime: "1:50 PM",
        },
      ],
    },
    {
      sectionNumber: 4,
      classTimings: [
        {
          day: "Tuesday",
          startTime: "11:00 AM",
          endTime: "12:20 PM",
        },
        {
          day: "Thursday",
          startTime: "3:30 PM",
          endTime: "4:50 PM",
        },
      ],
    },
    {
      sectionNumber: 5,
      classTimings: [
        {
          day: "Wednesday",
          startTime: "9:30 AM",
          endTime: "10:50 AM",
        },
        {
          day: "Thursday",
          startTime: "8:00 AM",
          endTime: "9:20 AM",
        },
      ],
    },
  ],
};

// API request examples
const apiExamples = {
  // Example 1: Create room via general rooms API
  createRoomGeneral: {
    method: "POST",
    url: "/api/rooms",
    body: sampleRoomData,
  },

  // Example 2: Create room via institution API
  createRoomInstitution: {
    method: "POST",
    url: "/api/institutions/{institutionId}/rooms",
    body: sampleRoomData,
  },

  // Example 3: Get available time slots
  getTimeSlots: {
    method: "GET",
    url: "/api/rooms/time-slots",
  },

  // Example 4: Update room sections
  updateRoom: {
    method: "PUT",
    url: "/api/rooms/{roomId}",
    body: {
      room_name: "Updated Room Name",
      description: "Updated description",
      sections: sampleRoomData.sections,
    },
  },
};

// Function to connect to database and create a sample room
async function createSampleRoom() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const room = new Room(sampleRoomData);
    const savedRoom = await room.save();

    console.log("Sample room created successfully:");
    console.log("Room ID:", savedRoom._id);
    console.log("Room Name:", savedRoom.room_name);
    console.log("Sections:", savedRoom.sections.length);

    // Display sections with timings
    savedRoom.sections.forEach((section, index) => {
      console.log(`\nSection ${section.sectionNumber}:`);
      section.classTimings.forEach((timing, timingIndex) => {
        console.log(
          `  Class ${timingIndex + 1}: ${timing.day} ${timing.startTime} - ${
            timing.endTime
          }`
        );
      });
    });

    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating sample room:", error);
    mongoose.connection.close();
  }
}

// Display API usage examples
console.log("=== ROOM CREATION WITH SECTIONS - API EXAMPLES ===\n");
console.log("Available Time Slots:");
console.log(
  "- Days: Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday (Friday excluded)"
);
console.log(
  "- Time Slots: 8:00 AM-9:20 AM, 9:30 AM-10:50 AM, 11:00 AM-12:20 PM, 12:30 PM-1:50 PM, 2:00 PM-3:20 PM, 3:30 PM-4:50 PM"
);
console.log("\nRequirements:");
console.log("- Each room must have exactly 5 sections");
console.log("- Each section must have exactly 2 class timings");
console.log("- Section numbers must be 1-5");

console.log("\n=== API Examples ===\n");
Object.entries(apiExamples).forEach(([key, example]) => {
  console.log(`${key.toUpperCase()}:`);
  console.log(`${example.method} ${example.url}`);
  if (example.body) {
    console.log("Body:", JSON.stringify(example.body, null, 2));
  }
  console.log("---\n");
});

// Uncomment the line below to actually create a sample room in the database
// createSampleRoom();

export { sampleRoomData, apiExamples };
