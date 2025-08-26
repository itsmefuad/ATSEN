# Student Messaging System Documentation

## Overview
The messaging system provides a private chat room for students within each course room, accessible only to enrolled students (not teachers). The system is integrated into the Discussion Forum section with tabs to switch between Discussion Forum and Room Chat.

## Features

### 🎯 **Student-Only Access**
- Only enrolled students can access the room chat
- Teachers cannot view or participate in student chats
- Each room has its own separate chat space

### 💬 **Chat Functionality**
- **Real-time messaging** with text messages
- **File sharing** (images, PDFs, documents up to 10MB)
- **Reply to messages** for threaded conversations
- **Edit messages** (within 24 hours, text only)
- **Delete messages** (own messages only)
- **Message reactions** with emoji support
- **Message search** with searchable chat history

### 🔍 **Search & History**
- **Searchable chat history** across all messages
- **File name search** to find shared files quickly
- **Persistent message storage** - all chat history is saved

### 📁 **File Sharing**
- **Image preview** for uploaded images
- **File download** for documents and other files
- **File type validation** (images, PDFs, documents, text files)
- **File size limit** of 10MB per file

### 🎨 **User Interface**
- **Tab-based navigation** between Discussion Forum and Room Chat
- **Message bubbles** with sender identification
- **Timestamp display** for all messages
- **Date separators** for easier navigation
- **Responsive design** works on all screen sizes

## Technical Implementation

### Backend Architecture

#### Models
- **ChatMessage.js** - Message storage with support for text, file, and image types
- **Reaction system** with emoji support
- **Reply threading** for conversation context
- **Soft delete** for message removal

#### API Endpoints (`/api/chat/`)
- `GET /room/:roomId/messages` - Fetch room messages with pagination
- `POST /room/:roomId/message` - Send text message
- `POST /room/:roomId/file` - Send file message
- `PUT /message/:messageId` - Edit message (24-hour limit)
- `DELETE /message/:messageId` - Delete message
- `POST /message/:messageId/reaction` - Add/remove emoji reaction
- `GET /download/:messageId` - Download file from message
- `GET /room/:roomId/search` - Search messages

#### Security
- **JWT Authentication** required for all endpoints
- **Room access validation** - only enrolled students can access
- **File upload validation** with type and size restrictions
- **Message ownership validation** for edit/delete operations

### Frontend Components

#### RoomChat.jsx
- **Main chat interface** with message display and input
- **File upload handling** with drag-and-drop support
- **Real-time message updates** and smooth scrolling
- **Search functionality** with results display
- **Message actions** (reply, edit, delete, react)

#### StudentDiscussionForum.jsx (Updated)
- **Tab navigation** between Discussion Forum and Room Chat
- **Seamless integration** with existing forum functionality
- **State management** for active tab switching

## Usage Guide

### For Students

#### Accessing Chat
1. Navigate to any course room
2. Go to the Discussion Forum section
3. Click on the "Room Chat" tab (second tab)
4. Start chatting with classmates!

#### Sending Messages
1. **Text Messages**: Type in the input box and press Enter or click Send
2. **File Messages**: Click the paperclip icon to select files
3. **Replies**: Click "Reply" on any message to respond in context

#### Managing Messages
1. **Edit**: Click the three dots menu → Edit (within 24 hours)
2. **Delete**: Click the three dots menu → Delete (your messages only)
3. **React**: Click the three dots menu → React, then choose an emoji

#### Searching
1. Click the search icon in the chat header
2. Type your search query
3. Press Enter to see matching messages

### File Sharing
- **Supported formats**: Images (JPEG, PNG, GIF, WebP), PDFs, Word documents, text files
- **Size limit**: 10MB per file
- **Preview**: Images show thumbnails, files show download links
- **Download**: Click on any file to download it

## Database Schema

### ChatMessage Collection
```javascript
{
  room: ObjectId,              // Reference to Room
  sender: ObjectId,            // Reference to Student
  messageType: String,         // 'text', 'file', 'image'
  content: String,             // Message text (for text messages)
  fileName: String,            // Original filename (for files)
  filePath: String,            // Server file path (for files)
  fileSize: Number,            // File size in bytes
  isEdited: Boolean,           // Whether message was edited
  editedAt: Date,              // When message was last edited
  replyTo: ObjectId,           // Reference to replied message
  reactions: [{
    student: ObjectId,         // Student who reacted
    emoji: String              // Emoji used
  }],
  isDeleted: Boolean,          // Soft delete flag
  deletedAt: Date,             // When message was deleted
  createdAt: Date,             // When message was created
  updatedAt: Date              // When message was last updated
}
```

## API Examples

### Send Text Message
```javascript
POST /api/chat/room/64a7b8c9d1e2f3g4h5i6j7k8/message
Authorization: Bearer <student_jwt_token>
Content-Type: application/json

{
  "content": "Hello everyone! How's the assignment going?",
  "replyTo": "64a7b8c9d1e2f3g4h5i6j7k9" // Optional
}
```

### Send File Message
```javascript
POST /api/chat/room/64a7b8c9d1e2f3g4h5i6j7k8/file
Authorization: Bearer <student_jwt_token>
Content-Type: multipart/form-data

file: <file_blob>
replyTo: "64a7b8c9d1e2f3g4h5i6j7k9" // Optional
```

### Search Messages
```javascript
GET /api/chat/room/64a7b8c9d1e2f3g4h5i6j7k8/search?query=assignment&page=1&limit=20
Authorization: Bearer <student_jwt_token>
```

## Security Features

### Access Control
- **Student-only access**: Teachers cannot view or join student chats
- **Room enrollment verification**: Only students enrolled in the room can chat
- **JWT authentication**: All requests require valid student tokens

### Content Security
- **File type validation**: Only safe file types are allowed
- **File size limits**: Prevents server storage abuse
- **Message ownership**: Students can only edit/delete their own messages
- **Time-limited editing**: Messages can only be edited within 24 hours

### Privacy
- **Room isolation**: Each room has completely separate chat spaces
- **No cross-room visibility**: Students can only see chats from rooms they're enrolled in
- **Teacher exclusion**: Instructors have no access to student chat content

## Future Enhancements

### Potential Features
- **Message notifications** for new activity
- **Online status indicators** for active students
- **Message threading** improvements
- **Voice message support**
- **Video call integration**
- **Message encryption** for enhanced privacy
- **Chat moderation tools** (if needed)
- **Export chat history** functionality

This messaging system provides a comprehensive communication platform for students while maintaining privacy and security boundaries with teaching staff.
