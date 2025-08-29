// Test script for room sections functionality
import https from "https";
import http from "http";

const BASE_URL = "http://localhost:5001/api";

// Simple fetch implementation for Node.js
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === "https:" ? https : http;

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = lib.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            json: () => Promise.resolve(json),
          });
        } catch (e) {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            text: () => Promise.resolve(data),
          });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Test data for creating a room with sections
const testRoomData = {
  room_name: "Test Computer Science Room",
  description: "Test room for CS course with sections",
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

async function testTimeSlots() {
  console.log("🔍 Testing time slots endpoint...");
  try {
    const response = await fetch(`${BASE_URL}/rooms/time-slots`);
    const data = await response.json();
    console.log("✅ Time slots retrieved successfully:");
    console.log("  Available days:", data.availableDays.length);
    console.log("  Time slots:", data.timeSlots.length);
    console.log("  Message:", data.message);
    return true;
  } catch (error) {
    console.log("❌ Error testing time slots:", error.message);
    return false;
  }
}

async function testCreateRoom() {
  console.log("\n🏗️  Testing room creation with sections...");
  try {
    const response = await fetch(`${BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testRoomData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("❌ Room creation failed:", errorData.message);
      return null;
    }

    const room = await response.json();
    console.log("✅ Room created successfully:");
    console.log("  Room ID:", room._id);
    console.log("  Room Name:", room.room_name);
    console.log("  Sections:", room.sections.length);

    // Display sections
    room.sections.forEach((section) => {
      console.log(`  Section ${section.sectionNumber}:`);
      section.classTimings.forEach((timing, index) => {
        console.log(
          `    Class ${index + 1}: ${timing.day} ${timing.startTime} - ${
            timing.endTime
          }`
        );
      });
    });

    return room._id;
  } catch (error) {
    console.log("❌ Error creating room:", error.message);
    return null;
  }
}

async function testGetRoomSections(roomId) {
  console.log("\n📋 Testing get room sections...");
  try {
    const response = await fetch(`${BASE_URL}/rooms/${roomId}/sections`);
    const data = await response.json();
    console.log("✅ Room sections retrieved successfully:");
    console.log("  Room:", data.roomName);
    console.log("  Sections:", data.sections.length);
    return true;
  } catch (error) {
    console.log("❌ Error getting room sections:", error.message);
    return false;
  }
}

async function testUpdateRoomSections(roomId) {
  console.log("\n📝 Testing update room sections...");
  try {
    // Modify one section's timing
    const updatedSections = [...testRoomData.sections];
    updatedSections[0].classTimings[0] = {
      day: "Saturday",
      startTime: "9:30 AM",
      endTime: "10:50 AM",
    };

    const response = await fetch(`${BASE_URL}/rooms/${roomId}/sections`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sections: updatedSections }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("❌ Section update failed:", errorData.message);
      return false;
    }

    const data = await response.json();
    console.log("✅ Room sections updated successfully");
    console.log(
      "  Updated section 1, class 1:",
      data.sections[0].classTimings[0].day,
      data.sections[0].classTimings[0].startTime,
      "-",
      data.sections[0].classTimings[0].endTime
    );
    return true;
  } catch (error) {
    console.log("❌ Error updating room sections:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Starting Room Sections Feature Tests\n");
  console.log("=".repeat(50));

  // Test 1: Get time slots
  const timeSlotsWorking = await testTimeSlots();

  // Test 2: Create room with sections
  const roomId = await testCreateRoom();

  if (roomId) {
    // Test 3: Get room sections
    await testGetRoomSections(roomId);

    // Test 4: Update room sections
    await testUpdateRoomSections(roomId);
  }

  console.log("\n" + "=".repeat(50));
  console.log("🏁 Tests completed!");

  if (timeSlotsWorking && roomId) {
    console.log("✅ All main functionality is working correctly");
    console.log("\nNext steps:");
    console.log("1. Update frontend to use the new room sections");
    console.log("2. Add UI for selecting days and time slots");
    console.log("3. Add validation in the frontend forms");
    console.log("4. Test with institution-specific endpoints");
  } else {
    console.log("❌ Some tests failed - check the backend logs");
  }
}

// Run the tests
runTests().catch(console.error);
