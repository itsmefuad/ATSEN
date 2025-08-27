# Institution Announcement System

## Overview

The Institution Announcement System allows institutions to create, manage, and distribute announcements to all their students and instructors. This feature enables institution-wide communication beyond individual room announcements.

## Features

### For Institutions:

- **Create Announcements**: Post institution-wide announcements visible to all students and instructors
- **Edit Announcements**: Modify existing announcements with updated information
- **Pin Announcements**: Pin important announcements to keep them at the top
- **Delete Announcements**: Remove outdated or incorrect announcements
- **Tag System**: Categorize announcements with tags for better organization

### For Students & Instructors:

- **View Announcements**: See all announcements from their associated institutions
- **Automatic Updates**: Real-time display of new announcements
- **Institution Context**: Clear identification of which institution posted each announcement

## Backend Implementation

### Models

#### InstitutionAnnouncement Model

Located at: `backend/src/models/InstitutionAnnouncement.js`

Fields:

- `title`: String (required) - The announcement title
- `content`: String (required) - The announcement content
- `institution`: ObjectId (required) - Reference to the institution
- `author`: ObjectId (required) - Reference to the institution that created it
- `isPinned`: Boolean (default: false) - Whether the announcement is pinned
- `tags`: Array of Strings - Tags for categorization
- `isActive`: Boolean (default: true) - For soft deletion
- `createdAt`, `updatedAt`: Timestamps

### Controllers

#### Institution Announcement Controller

Located at: `backend/src/controllers/institutionAnnouncementController.js`

API Endpoints:

- `GET /api/institution-announcements/:idOrName` - Get all announcements for an institution
- `GET /api/institution-announcements/user/:userType/:userId` - Get announcements for a user
- `POST /api/institution-announcements/:idOrName` - Create a new announcement
- `PUT /api/institution-announcements/:idOrName/:announcementId` - Update an announcement
- `DELETE /api/institution-announcements/:idOrName/:announcementId` - Delete an announcement
- `PATCH /api/institution-announcements/:idOrName/:announcementId/toggle-pin` - Toggle pin status

### Routes

Located at: `backend/src/routes/institutionAnnouncementRoutes.js`

Added to server at: `backend/src/server.js`

## Frontend Implementation

### Components

#### CreateInstitutionAnnouncement

Located at: `frontend/src/components/institution/CreateInstitutionAnnouncement.jsx`

Features:

- Form to create new announcements
- Input fields for title, content, tags, and pin status
- Validation and error handling
- Success notifications

#### InstitutionAnnouncementCard

Located at: `frontend/src/components/institution/InstitutionAnnouncementCard.jsx`

Features:

- Display announcement content
- Edit functionality with inline form
- Pin/unpin toggle
- Delete functionality
- Tag display
- Date formatting

#### InstitutionAnnouncementsWidget

Located at: `frontend/src/components/common/InstitutionAnnouncementsWidget.jsx`

Features:

- Displays announcements for students/instructors
- Read-only view optimized for dashboard display
- Institution branding
- Responsive design

### Dashboard Integration

#### Institution Dashboard

File: `frontend/src/pages/institution/I_Dashboard.jsx`

Added:

- Full announcement management section
- Create announcement component
- List of all institution announcements
- Edit/delete capabilities

#### Student Dashboard

File: `frontend/src/pages/student/S_Dashboard.jsx`

Added:

- Institution announcements widget below room cards
- Shows announcements from all associated institutions
- Read-only display

#### Teacher Dashboard

File: `frontend/src/pages/teacher/T_Dashboard.jsx`

Added:

- Institution announcements widget below room cards
- Shows announcements from all associated institutions
- Read-only display

## Usage Instructions

### For Institution Administrators:

1. **Creating an Announcement:**

   - Navigate to your institution dashboard
   - Scroll down to the "Institution Announcements" section
   - Click "Post an Announcement"
   - Fill in the title, content, and optional tags
   - Check "Pin this announcement" if it's important
   - Click "Create Announcement"

2. **Editing an Announcement:**

   - In the announcements list, click the three-dot menu on any announcement
   - Select "Edit"
   - Modify the content as needed
   - Click "Save Changes"

3. **Pinning/Unpinning:**

   - Click the three-dot menu on any announcement
   - Select "Pin" or "Unpin"
   - Pinned announcements appear at the top of the list

4. **Deleting an Announcement:**
   - Click the three-dot menu on any announcement
   - Select "Delete"
   - Confirm the deletion

### For Students and Instructors:

1. **Viewing Announcements:**

   - Go to your dashboard
   - Scroll down below your room cards
   - All announcements from your institutions will be displayed
   - Pinned announcements appear first

2. **Understanding Announcements:**
   - Each announcement shows the institution name
   - Creation and update dates are displayed
   - Tags help categorize the content
   - Pinned announcements have a pin icon

## Database Schema

```javascript
{
  _id: ObjectId,
  title: "Important Notice",
  content: "This is an important announcement...",
  institution: ObjectId("institution_id"),
  author: ObjectId("institution_id"),
  isPinned: true,
  tags: ["important", "urgent"],
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

## API Examples

### Create Announcement

```javascript
POST /api/institution-announcements/my-institution
{
  "title": "Holiday Notice",
  "content": "Classes will be closed tomorrow due to holiday.",
  "tags": ["holiday", "schedule"],
  "isPinned": false
}
```

### Get User Announcements

```javascript
GET / api / institution - announcements / user / student / user_id;

Response: [
  {
    _id: "announcement_id",
    title: "Holiday Notice",
    content: "Classes will be closed tomorrow...",
    institution: {
      _id: "institution_id",
      name: "University Name",
    },
    isPinned: false,
    tags: ["holiday", "schedule"],
    createdAt: "2024-01-15T10:00:00Z",
  },
];
```

## Security Considerations

- Only institutions can create, edit, and delete their own announcements
- Students and instructors can only view announcements from their associated institutions
- Soft deletion is used to maintain data integrity
- Input validation and sanitization on both frontend and backend

## Future Enhancements

- Rich text editor for announcement content
- File attachments for announcements
- Email notifications for new announcements
- Announcement categories and filtering
- Read receipts and analytics
- Scheduled announcements
- Announcement templates
