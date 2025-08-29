# Class Routine Implementation

## Overview

A class routine component has been implemented that displays the weekly schedule for both students and instructors in their respective dashboards. The routine appears beside the room cards and shows class timings in a tabular format similar to a traditional class schedule.

## Features

### 🎯 Class Routine Component (`ClassRoutine.jsx`)

- **Time Slots**: Displays 6 time periods from 8:00 AM to 4:50 PM
- **Weekly View**: Shows Saturday through Friday schedule (full week)
- **Course Codes**: Generates course codes from room names for easy identification
- **Section Filtering**: Shows only sections assigned to the specific user (student/instructor)
- **Personal Schedule**: Displays "My Class Routine" with class count
- **User Context**: Different messages for students vs instructors
- **Responsive Design**: Adapts to different screen sizes with horizontal scrolling on mobile
- **Empty State**: Shows appropriate message when no classes are assigned to the user

### 📚 Student Dashboard Integration

- **Grouped by Institution**: Class routine appears for each institution's rooms
- **Grid Layout**: 2/3 width for room cards, 1/3 width for class routine on large screens
- **Section-Based**: Shows only classes for sections the student is enrolled in
- **Personal Filter**: Backend filters sections to only include student's assignments

### 👨‍🏫 Teacher Dashboard Integration

- **Unified View**: Shows all assigned rooms' schedules in one routine
- **Grid Layout**: 2/3 width for room cards, 1/3 width for class routine on large screens
- **Section Management**: Displays only sections the instructor teaches
- **Teaching Filter**: Backend filters sections to only include instructor's assignments

## Technical Implementation

### Backend Updates

1. **Student Controller** (`studentController.js`):

   - Added `sections` field to room population in `getStudentRooms`
   - **Section Filtering**: Filters sections to only show those where the student is assigned
   - Uses `section.students` array to check student membership

2. **Instructor Controller** (`instructorController.js`):
   - Added `sections` field selection in `getInstructorRooms`
   - **Section Filtering**: Filters sections to only show those where the instructor is assigned
   - Uses `section.instructors` array to check instructor assignment

### Frontend Components

1. **ClassRoutine Component**:

   - Processes room sections and class timings
   - **User-Specific Filtering**: Only displays sections assigned to the current user
   - Generates course codes automatically
   - Creates time slot grid with proper styling
   - Handles empty states gracefully with user context
   - Shows class count and personal schedule information

2. **Dashboard Updates**:
   - Modified grid layouts to accommodate routine
   - Responsive design with proper column distribution
   - **User ID Passing**: Passes userId to ClassRoutine for better context
   - Maintained existing functionality while adding routine

## Data Structure

The routine uses the following data from the Room model:

```javascript
{
  sections: [
    {
      sectionNumber: 1,
      classTimings: [
        {
          day: "Monday",
          startTime: "8:00 AM",
          endTime: "9:20 AM",
        },
      ],
    },
  ];
}
```

## Visual Design

- **Table Format**: Clean, bordered table similar to traditional class schedules
- **Color Coding**: Dark background for scheduled classes, light for empty slots
- **Compact Layout**: Optimized for sidebar placement beside room cards
- **Typography**: Small, readable fonts with proper contrast

## Usage

The class routine automatically appears when:

1. User has enrolled/assigned rooms with scheduled classes
2. Rooms have sections with defined class timings
3. **User is assigned to specific sections** (students in section.students, instructors in section.instructors)
4. Class timings fall within the supported time slots

The routine now shows:

- **For Students**: Only sections they are enrolled in
- **For Instructors**: Only sections they are assigned to teach
- **Personal Context**: "My Class Routine" with total class count
- **User-Specific Messages**: Different empty states for students vs instructors

## Browser Compatibility

- Works with all modern browsers
- Responsive design supports mobile and desktop
- Horizontal scrolling ensures table remains usable on small screens

## Future Enhancements

- Click-to-navigate to specific room/section
- Color coding by subject/course type
- Export routine as PDF/image
- Filter by specific sections or courses
- Integration with calendar applications
