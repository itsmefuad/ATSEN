// Utility to help with room section management
// This file contains helper functions for working with room sections

export const timeSlots = [
  { startTime: "8:00 AM", endTime: "9:20 AM" },
  { startTime: "9:30 AM", endTime: "10:50 AM" },
  { startTime: "11:00 AM", endTime: "12:20 PM" },
  { startTime: "12:30 PM", endTime: "1:50 PM" },
  { startTime: "2:00 PM", endTime: "3:20 PM" },
  { startTime: "3:30 PM", endTime: "4:50 PM" },
];

export const availableDays = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
];

// Generate default sections with empty class timings
export function generateDefaultSections() {
  return [
    { sectionNumber: 1, classTimings: [] },
    { sectionNumber: 2, classTimings: [] },
    { sectionNumber: 3, classTimings: [] },
    { sectionNumber: 4, classTimings: [] },
    { sectionNumber: 5, classTimings: [] },
  ];
}

// Generate sample sections with distributed class timings
export function generateSampleSections() {
  const sampleTimings = [
    // Section 1
    [
      { day: "Saturday", startTime: "8:00 AM", endTime: "9:20 AM" },
      { day: "Monday", startTime: "11:00 AM", endTime: "12:20 PM" },
    ],
    // Section 2
    [
      { day: "Sunday", startTime: "9:30 AM", endTime: "10:50 AM" },
      { day: "Tuesday", startTime: "2:00 PM", endTime: "3:20 PM" },
    ],
    // Section 3
    [
      { day: "Monday", startTime: "8:00 AM", endTime: "9:20 AM" },
      { day: "Wednesday", startTime: "12:30 PM", endTime: "1:50 PM" },
    ],
    // Section 4
    [
      { day: "Tuesday", startTime: "11:00 AM", endTime: "12:20 PM" },
      { day: "Thursday", startTime: "3:30 PM", endTime: "4:50 PM" },
    ],
    // Section 5
    [
      { day: "Wednesday", startTime: "9:30 AM", endTime: "10:50 AM" },
      { day: "Thursday", startTime: "8:00 AM", endTime: "9:20 AM" },
    ],
  ];

  return sampleTimings.map((timings, index) => ({
    sectionNumber: index + 1,
    classTimings: timings,
  }));
}

// Validate section data
export function validateSections(sections) {
  const errors = [];

  if (!sections || !Array.isArray(sections)) {
    errors.push("Sections must be an array");
    return { isValid: false, errors };
  }

  if (sections.length !== 5) {
    errors.push("Room must have exactly 5 sections");
  }

  sections.forEach((section, index) => {
    if (!section.sectionNumber || section.sectionNumber !== index + 1) {
      errors.push(`Section ${index + 1} must have sectionNumber: ${index + 1}`);
    }

    if (!section.classTimings || !Array.isArray(section.classTimings)) {
      errors.push(`Section ${index + 1} must have classTimings array`);
    } else if (section.classTimings.length !== 2) {
      errors.push(`Section ${index + 1} must have exactly 2 class timings`);
    } else {
      section.classTimings.forEach((timing, timingIndex) => {
        if (!timing.day || !availableDays.includes(timing.day)) {
          errors.push(
            `Section ${index + 1}, timing ${
              timingIndex + 1
            }: Invalid day. Must be one of: ${availableDays.join(", ")}`
          );
        }

        const validStartTimes = timeSlots.map((slot) => slot.startTime);
        const validEndTimes = timeSlots.map((slot) => slot.endTime);

        if (!timing.startTime || !validStartTimes.includes(timing.startTime)) {
          errors.push(
            `Section ${index + 1}, timing ${
              timingIndex + 1
            }: Invalid start time. Must be one of: ${validStartTimes.join(
              ", "
            )}`
          );
        }

        if (!timing.endTime || !validEndTimes.includes(timing.endTime)) {
          errors.push(
            `Section ${index + 1}, timing ${
              timingIndex + 1
            }: Invalid end time. Must be one of: ${validEndTimes.join(", ")}`
          );
        }

        // Check if start and end times match valid time slot pairs
        const matchingSlot = timeSlots.find(
          (slot) =>
            slot.startTime === timing.startTime &&
            slot.endTime === timing.endTime
        );
        if (timing.startTime && timing.endTime && !matchingSlot) {
          errors.push(
            `Section ${index + 1}, timing ${timingIndex + 1}: Start time ${
              timing.startTime
            } and end time ${timing.endTime} do not form a valid time slot`
          );
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Check for scheduling conflicts within sections
export function checkSchedulingConflicts(sections) {
  const conflicts = [];
  const usedTimeSlots = new Map(); // key: "day-startTime-endTime", value: section number

  sections.forEach((section) => {
    section.classTimings.forEach((timing) => {
      const timeSlotKey = `${timing.day}-${timing.startTime}-${timing.endTime}`;

      if (usedTimeSlots.has(timeSlotKey)) {
        conflicts.push({
          timeSlot: timing,
          conflictingSections: [
            usedTimeSlots.get(timeSlotKey),
            section.sectionNumber,
          ],
        });
      } else {
        usedTimeSlots.set(timeSlotKey, section.sectionNumber);
      }
    });
  });

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}

// Format sections for display
export function formatSectionsForDisplay(sections) {
  return sections.map((section) => ({
    section: section.sectionNumber,
    classes: section.classTimings.map(
      (timing) => `${timing.day} ${timing.startTime} - ${timing.endTime}`
    ),
  }));
}
