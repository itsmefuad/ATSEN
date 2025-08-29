// Simple test to check if Room model works
import mongoose from "mongoose";
import Room from "../src/models/Room.js";
import dotenv from "dotenv";

dotenv.config();

console.log("Testing Room model with sections...");

// Test room data
const testRoom = {
  room_name: "Test Room",
  description: "Test Description",
  sections: [
    {
      sectionNumber: 1,
      classTimings: [
        { day: "Saturday", startTime: "8:00 AM", endTime: "9:20 AM" },
        { day: "Monday", startTime: "11:00 AM", endTime: "12:20 PM" },
      ],
    },
    {
      sectionNumber: 2,
      classTimings: [
        { day: "Sunday", startTime: "9:30 AM", endTime: "10:50 AM" },
        { day: "Tuesday", startTime: "2:00 PM", endTime: "3:20 PM" },
      ],
    },
    {
      sectionNumber: 3,
      classTimings: [
        { day: "Monday", startTime: "8:00 AM", endTime: "9:20 AM" },
        { day: "Wednesday", startTime: "12:30 PM", endTime: "1:50 PM" },
      ],
    },
    {
      sectionNumber: 4,
      classTimings: [
        { day: "Tuesday", startTime: "11:00 AM", endTime: "12:20 PM" },
        { day: "Thursday", startTime: "3:30 PM", endTime: "4:50 PM" },
      ],
    },
    {
      sectionNumber: 5,
      classTimings: [
        { day: "Wednesday", startTime: "9:30 AM", endTime: "10:50 AM" },
        { day: "Thursday", startTime: "8:00 AM", endTime: "9:20 AM" },
      ],
    },
  ],
};

async function testModel() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    console.log("Creating test room...");
    const room = new Room(testRoom);

    console.log("Validating room...");
    await room.validate();
    console.log("Validation passed!");

    console.log("Saving room...");
    const savedRoom = await room.save();
    console.log("Room saved successfully!");
    console.log("Room ID:", savedRoom._id);
    console.log("Sections count:", savedRoom.sections.length);

    // Display sections
    savedRoom.sections.forEach((section) => {
      console.log(`Section ${section.sectionNumber}:`);
      section.classTimings.forEach((timing, index) => {
        console.log(
          `  Class ${index + 1}: ${timing.day} ${timing.startTime} - ${
            timing.endTime
          }`
        );
      });
    });

    console.log("\n✅ Room model test completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        console.error(`  ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
}

testModel();
