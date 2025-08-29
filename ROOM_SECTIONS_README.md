# Room Sections Feature Documentation

## Overview

All rooms in the ATSEN system now include a **sections** attribute that provides structured class scheduling. Each room has exactly 5 sections, and each section has 2 class timings that need to be set when creating a room.

## Requirements

- **Sections per room**: Exactly 5 sections (numbered 1-5)
- **Class timings per section**: Exactly 2 class timings
- **Available days**: Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday (Friday is excluded)
- **Available time slots**:
  - 8:00 AM - 9:20 AM
  - 9:30 AM - 10:50 AM
  - 11:00 AM - 12:20 PM
  - 12:30 PM - 1:50 PM
  - 2:00 PM - 3:20 PM
  - 3:30 PM - 4:50 PM

## Data Structure

### Room Model Updates

```javascript
{
  room_name: String,
  description: String,
  institution: ObjectId,
  maxCapacity: Number,
  students: [ObjectId],
  instructors: [ObjectId],
  sections: [
    {
      sectionNumber: Number, // 1-5
      classTimings: [
        {
          day: String, // 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'
          startTime: String, // '8:00 AM', '9:30 AM', etc.
          endTime: String // '9:20 AM', '10:50 AM', etc.
        }
      ]
    }
  ],
  createTime: Date,
  timestamps: true
}
```

### Example Section Data

```javascript
{
  "sections": [
    {
      "sectionNumber": 1,
      "classTimings": [
        {
          "day": "Saturday",
          "startTime": "8:00 AM",
          "endTime": "9:20 AM"
        },
        {
          "day": "Monday",
          "startTime": "11:00 AM",
          "endTime": "12:20 PM"
        }
      ]
    },
    {
      "sectionNumber": 2,
      "classTimings": [
        {
          "day": "Sunday",
          "startTime": "9:30 AM",
          "endTime": "10:50 AM"
        },
        {
          "day": "Tuesday",
          "startTime": "2:00 PM",
          "endTime": "3:20 PM"
        }
      ]
    }
    // ... sections 3, 4, 5
  ]
}
```

## API Endpoints

### 1. Get Available Time Slots

**GET** `/api/rooms/time-slots`
**GET** `/api/institutions/:idOrName/rooms/time-slots`

Returns available days and time slots for creating room sections.

**Response:**

```javascript
{
  "timeSlots": [
    { "startTime": "8:00 AM", "endTime": "9:20 AM" },
    { "startTime": "9:30 AM", "endTime": "10:50 AM" },
    // ... more time slots
  ],
  "availableDays": ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
  "message": "Each section requires exactly 2 class timings"
}
```

### 2. Create Room with Sections

**POST** `/api/rooms`
**POST** `/api/institutions/:idOrName/rooms`

Create a new room with sections and class timings.

**Request Body:**

```javascript
{
  "room_name": "Computer Science 101",
  "description": "Introduction to Computer Science",
  "maxCapacity": 30,
  "sections": [
    {
      "sectionNumber": 1,
      "classTimings": [
        {
          "day": "Saturday",
          "startTime": "8:00 AM",
          "endTime": "9:20 AM"
        },
        {
          "day": "Monday",
          "startTime": "11:00 AM",
          "endTime": "12:20 PM"
        }
      ]
    }
    // ... 4 more sections
  ]
}
```

### 3. Get Room Sections

**GET** `/api/rooms/:id/sections`
**GET** `/api/institutions/:idOrName/rooms/:roomId/sections`

Get sections for a specific room.

**Response:**

```javascript
{
  "roomId": "roomObjectId",
  "roomName": "Computer Science 101",
  "sections": [
    // ... section data
  ]
}
```

### 4. Update Room Sections

**PUT** `/api/rooms/:id/sections`
**PUT** `/api/institutions/:idOrName/rooms/:roomId/sections`

Update sections for a specific room.

**Request Body:**

```javascript
{
  "sections": [
    // ... updated section data (must include all 5 sections)
  ]
}
```

### 5. Update Room (including sections)

**PUT** `/api/rooms/:id`
**PUT** `/api/institutions/:idOrName/rooms/:roomId`

Update room information including sections.

**Request Body:**

```javascript
{
  "room_name": "Updated Room Name",
  "description": "Updated description",
  "sections": [
    // ... section data (optional, if provided must include all 5 sections)
  ]
}
```

## Validation Rules

### Section Validation

1. Must have exactly 5 sections
2. Section numbers must be 1, 2, 3, 4, 5
3. Each section must have exactly 2 class timings
4. Days must be from the allowed list (Saturday-Thursday, excluding Friday)
5. Start and end times must match valid time slot pairs

### Time Slot Validation

- Start and end times must correspond to valid time slot pairs
- Invalid example: `startTime: "8:00 AM", endTime: "10:50 AM"` (mismatched pair)
- Valid example: `startTime: "8:00 AM", endTime: "9:20 AM"` (matching pair)

## Error Responses

### Validation Errors

```javascript
{
  "message": "Room must have exactly 5 sections with class timings"
}

{
  "message": "Section 3 must have exactly 2 class timings"
}

{
  "message": "Section 1, timing 2: Invalid day. Must be one of: Saturday, Sunday, Monday, Tuesday, Wednesday, Thursday"
}
```

## Frontend Integration

### Creating a Room with Sections

```javascript
const createRoomWithSections = async (roomData) => {
  try {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_name: roomData.name,
        description: roomData.description,
        sections: roomData.sections, // Must include all 5 sections
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create room");
    }

    const room = await response.json();
    return room;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};
```

### Getting Available Time Slots

```javascript
const getTimeSlots = async () => {
  try {
    const response = await fetch("/api/rooms/time-slots");
    const data = await response.json();
    return data; // { timeSlots, availableDays, message }
  } catch (error) {
    console.error("Error fetching time slots:", error);
    throw error;
  }
};
```

## Utilities

The system includes utility functions in `backend/src/utils/roomSectionUtils.js`:

- `validateSections(sections)` - Validate section data
- `generateDefaultSections()` - Generate empty default sections
- `generateSampleSections()` - Generate sample sections with distributed timings
- `checkSchedulingConflicts(sections)` - Check for time slot conflicts
- `formatSectionsForDisplay(sections)` - Format sections for UI display

## Testing

Use the sample script at `backend/scripts/createRoomWithSections.js` to test room creation with sections. The script includes:

- Sample room data with properly structured sections
- API usage examples
- Database connection and room creation function

## Migration Notes

Since the database has been cleared, all new rooms will be created with the sections attribute. The Room model includes:

- Default sections (5 empty sections) if no sections are provided
- Validation to ensure proper section structure
- Backward compatibility considerations for any existing data
