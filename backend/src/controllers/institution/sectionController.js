// Section assignment controller for managing student and instructor section assignments
import mongoose from "mongoose";
import Room from "../../models/Room.js";
import Student from "../../models/student.js";
import Instructor from "../../models/instructor.js";
import { findInstitutionByIdOrName } from "./utils.js";

/**
 * Assign student to a specific section (1 section only)
 * POST /api/institutions/:idOrName/rooms/:roomId/assign-student-section
 */
export async function assignStudentToSection(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { studentId, sectionNumber } = req.body;

    // Validate input
    if (!studentId || !sectionNumber) {
      return res.status(400).json({
        message: "Student ID and section number are required",
      });
    }

    if (sectionNumber < 1 || sectionNumber > 5) {
      return res.status(400).json({
        message: "Section number must be between 1 and 5",
      });
    }

    // Validate IDs
    if (
      !mongoose.isValidObjectId(roomId) ||
      !mongoose.isValidObjectId(studentId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find institution
    const inst = await findInstitutionByIdOrName(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Find room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Find student
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if student is already in this room (remove from previous section if exists)
    const existingRoomSection = student.roomSections.find(
      (rs) => rs.roomId.toString() === roomId
    );
    if (existingRoomSection) {
      // Remove from previous section
      const prevSectionIndex = room.sections.findIndex(
        (s) => s.sectionNumber === existingRoomSection.sectionNumber
      );
      if (prevSectionIndex !== -1) {
        room.sections[prevSectionIndex].students = room.sections[
          prevSectionIndex
        ].students.filter((id) => id.toString() !== studentId);
      }
      // Update student's section assignment
      existingRoomSection.sectionNumber = sectionNumber;
    } else {
      // Add new room section assignment
      student.roomSections.push({
        roomId: roomId,
        sectionNumber: sectionNumber,
      });

      // Add student to room if not already there
      if (!room.students.includes(studentId)) {
        room.students.push(studentId);
      }
      if (!student.room.includes(roomId)) {
        student.room.push(roomId);
      }
    }

    // Add student to the specific section
    const sectionIndex = room.sections.findIndex(
      (s) => s.sectionNumber === sectionNumber
    );
    if (sectionIndex === -1) {
      return res.status(400).json({ message: "Section not found" });
    }

    if (!room.sections[sectionIndex].students.includes(studentId)) {
      room.sections[sectionIndex].students.push(studentId);
    }

    // Save changes
    await Promise.all([room.save(), student.save()]);

    res.status(200).json({
      message: `Student assigned to section ${sectionNumber} successfully`,
      studentId,
      sectionNumber,
      roomId,
    });
  } catch (error) {
    console.error("Error assigning student to section:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Assign instructor to sections (1-2 sections allowed)
 * POST /api/institutions/:idOrName/rooms/:roomId/assign-instructor-sections
 */
export async function assignInstructorToSections(req, res) {
  try {
    const { idOrName, roomId } = req.params;
    const { instructorId, sectionNumbers } = req.body;

    // Validate input
    if (!instructorId || !sectionNumbers || !Array.isArray(sectionNumbers)) {
      return res.status(400).json({
        message: "Instructor ID and section numbers array are required",
      });
    }

    if (sectionNumbers.length < 1 || sectionNumbers.length > 2) {
      return res.status(400).json({
        message: "Instructor can be assigned to 1-2 sections only",
      });
    }

    if (!sectionNumbers.every((num) => num >= 1 && num <= 5)) {
      return res.status(400).json({
        message: "All section numbers must be between 1 and 5",
      });
    }

    // Validate IDs
    if (
      !mongoose.isValidObjectId(roomId) ||
      !mongoose.isValidObjectId(instructorId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find institution
    const inst = await findInstitutionByIdOrName(idOrName);
    if (!inst) {
      return res.status(404).json({ message: "Institution not found" });
    }

    // Find room
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Find instructor
    const instructor = await Instructor.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Remove instructor from all sections first
    room.sections.forEach((section) => {
      section.instructors = section.instructors.filter(
        (id) => id.toString() !== instructorId
      );
    });

    // Update instructor's room section assignment
    const existingRoomSection = instructor.roomSections.find(
      (rs) => rs.roomId.toString() === roomId
    );
    if (existingRoomSection) {
      existingRoomSection.sectionNumbers = sectionNumbers;
    } else {
      instructor.roomSections.push({
        roomId: roomId,
        sectionNumbers: sectionNumbers,
      });

      // Add instructor to room if not already there
      if (!room.instructors.includes(instructorId)) {
        room.instructors.push(instructorId);
      }
      if (!instructor.rooms.includes(roomId)) {
        instructor.rooms.push(roomId);
      }
    }

    // Add instructor to the specified sections
    sectionNumbers.forEach((sectionNumber) => {
      const sectionIndex = room.sections.findIndex(
        (s) => s.sectionNumber === sectionNumber
      );
      if (
        sectionIndex !== -1 &&
        !room.sections[sectionIndex].instructors.includes(instructorId)
      ) {
        room.sections[sectionIndex].instructors.push(instructorId);
      }
    });

    // Save changes
    await Promise.all([room.save(), instructor.save()]);

    res.status(200).json({
      message: `Instructor assigned to sections ${sectionNumbers.join(
        ", "
      )} successfully`,
      instructorId,
      sectionNumbers,
      roomId,
    });
  } catch (error) {
    console.error("Error assigning instructor to sections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Get user's assigned sections for a room
 * GET /api/institutions/:idOrName/rooms/:roomId/user-sections/:userId
 */
export async function getUserSections(req, res) {
  try {
    const { idOrName, roomId, userId } = req.params;

    // Validate IDs
    if (
      !mongoose.isValidObjectId(roomId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find user in both collections
    const [student, instructor] = await Promise.all([
      Student.findById(userId),
      Instructor.findById(userId),
    ]);

    const user = student || instructor;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find user's section assignment for this room
    const roomSection = user.roomSections.find(
      (rs) => rs.roomId.toString() === roomId
    );
    if (!roomSection) {
      return res
        .status(404)
        .json({ message: "User not assigned to any section in this room" });
    }

    // Get room details with sections
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const userType = student ? "student" : "instructor";
    const assignedSections = student
      ? [roomSection.sectionNumber]
      : roomSection.sectionNumbers;

    // Get section details
    const sectionDetails = room.sections
      .filter((section) => assignedSections.includes(section.sectionNumber))
      .map((section) => ({
        sectionNumber: section.sectionNumber,
        classTimings: section.classTimings,
      }));

    res.status(200).json({
      userId,
      userType,
      roomId,
      assignedSections,
      sectionDetails,
    });
  } catch (error) {
    console.error("Error getting user sections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Remove user from all sections of a room
 * DELETE /api/institutions/:idOrName/rooms/:roomId/remove-user-sections/:userId
 */
export async function removeUserFromSections(req, res) {
  try {
    const { idOrName, roomId, userId } = req.params;

    // Validate IDs
    if (
      !mongoose.isValidObjectId(roomId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Find user in both collections
    const [student, instructor, room] = await Promise.all([
      Student.findById(userId),
      Instructor.findById(userId),
      Room.findById(roomId),
    ]);

    const user = student || instructor;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Remove user from all sections
    room.sections.forEach((section) => {
      section.students = section.students.filter(
        (id) => id.toString() !== userId
      );
      section.instructors = section.instructors.filter(
        (id) => id.toString() !== userId
      );
    });

    // Remove room section assignment from user
    user.roomSections = user.roomSections.filter(
      (rs) => rs.roomId.toString() !== roomId
    );

    // Remove room from user's rooms array
    user.room = user.room.filter((id) => id.toString() !== roomId);
    if (user.rooms) {
      user.rooms = user.rooms.filter((id) => id.toString() !== roomId);
    }

    // Remove user from room's users arrays
    room.students = room.students.filter((id) => id.toString() !== userId);
    room.instructors = room.instructors.filter(
      (id) => id.toString() !== userId
    );

    // Save changes
    await Promise.all([room.save(), user.save()]);

    res.status(200).json({
      message: "User removed from all sections successfully",
      userId,
      roomId,
    });
  } catch (error) {
    console.error("Error removing user from sections:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
