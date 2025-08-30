// Script to fix existing rooms where instructors assigned to sections
// are not properly added to the main room.instructors array

import mongoose from "mongoose";
import Room from "../src/models/Room.js";
import Instructor from "../src/models/instructor.js";
import dotenv from "dotenv";

dotenv.config();

async function fixRoomInstructors() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all rooms
    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms to check`);

    let fixedRooms = 0;
    let fixedInstructors = 0;

    for (const room of rooms) {
      console.log(`\nChecking room: ${room.room_name} (${room._id})`);

      // Get all unique instructor IDs from all sections
      const sectionInstructors = new Set();
      room.sections.forEach((section) => {
        if (section.instructors && Array.isArray(section.instructors)) {
          section.instructors.forEach((instructorId) => {
            sectionInstructors.add(instructorId.toString());
          });
        }
      });

      console.log(`  Section instructors: ${Array.from(sectionInstructors)}`);
      console.log(
        `  Current room instructors: ${room.instructors.map((id) =>
          id.toString()
        )}`
      );

      // Check which instructors are missing from room.instructors
      const currentRoomInstructors = room.instructors.map((id) =>
        id.toString()
      );
      const missingInstructors = Array.from(sectionInstructors).filter(
        (instructorId) => !currentRoomInstructors.includes(instructorId)
      );

      if (missingInstructors.length > 0) {
        console.log(
          `  Missing instructors in room.instructors: ${missingInstructors}`
        );

        // Add missing instructors to room.instructors
        await Room.findByIdAndUpdate(room._id, {
          $addToSet: {
            instructors: { $each: missingInstructors },
          },
        });

        // Update instructor records to include this room and section assignments
        for (const instructorId of missingInstructors) {
          const instructor = await Instructor.findById(instructorId);
          if (instructor) {
            // Add room to instructor's rooms array if not present
            if (!instructor.rooms.includes(room._id)) {
              await Instructor.findByIdAndUpdate(instructorId, {
                $addToSet: { rooms: room._id },
              });
            }

            // Check if instructor has roomSections entry for this room
            const existingRoomSection = instructor.roomSections.find(
              (rs) => rs.roomId.toString() === room._id.toString()
            );

            if (!existingRoomSection) {
              // Get sections where this instructor is assigned
              const instructorSections = [];
              room.sections.forEach((section) => {
                if (
                  section.instructors &&
                  section.instructors.includes(instructorId)
                ) {
                  instructorSections.push(section.sectionNumber);
                }
              });

              if (instructorSections.length > 0) {
                await Instructor.findByIdAndUpdate(instructorId, {
                  $addToSet: {
                    roomSections: {
                      roomId: room._id,
                      sectionNumbers: instructorSections,
                    },
                  },
                });
                console.log(
                  `    Added section assignments for instructor ${instructorId}: sections ${instructorSections}`
                );
              }
            }
            fixedInstructors++;
          }
        }

        fixedRooms++;
        console.log(`  ✅ Fixed room ${room.room_name}`);
      } else {
        console.log(`  ✅ Room ${room.room_name} is already correct`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Rooms checked: ${rooms.length}`);
    console.log(`Rooms fixed: ${fixedRooms}`);
    console.log(`Instructor records updated: ${fixedInstructors}`);

    mongoose.connection.close();
  } catch (error) {
    console.error("Error fixing room instructors:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
fixRoomInstructors();
