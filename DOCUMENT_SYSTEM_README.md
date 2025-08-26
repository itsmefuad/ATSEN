# Document Request & Tracking System

## Overview

The Document Request & Tracking System is a comprehensive feature for the ATSEN project that allows students to request documents from their associated institutions and provides a complete tracking system similar to order delivery services.

## Features

### For Students
- **View Associated Institutions**: Students can see all institutions they are enrolled with
- **Request Documents**: Submit document requests with detailed information
- **Track Status**: Monitor document request progress through various stages
- **Urgency Levels**: Set priority levels (Standard, Priority, Urgent)
- **Mark as Received**: Confirm receipt of dispatched documents

### For Institutions
- **Document Desk**: Centralized dashboard for managing all document requests
- **Status Management**: Update document status through workflow stages
- **Priority Handling**: Urgent documents are highlighted in red
- **Statistics Dashboard**: View analytics and performance metrics
- **Notes System**: Add internal notes for document requests

## Document Workflow

### Status Flow
1. **Requested** (Student initiates)
2. **Received** (Institution acknowledges)
3. **Approved** (Institution approves for processing)
4. **Dispatched** (Institution sends document)
5. **Document Received** (Student confirms receipt)

### Status Update Rules
- Students can only update status to "Document Received" from "Dispatched"
- Institutions can update to "Received", "Approved", or "Dispatched"
- Status can only move forward in the workflow

## API Endpoints

### Student Endpoints
- `POST /api/documents/request` - Create new document request
- `GET /api/documents/student/my-documents` - Get all student's documents
- `PUT /api/documents/student/:documentId/status` - Mark document as received

### Institution Endpoints
- `GET /api/documents/institution/documents` - Get all institution's document requests
- `PUT /api/documents/institution/:documentId/status` - Update document status
- `GET /api/documents/institution/statistics` - Get document statistics

### Shared Endpoints
- `GET /api/documents/:documentId` - Get specific document details

## Database Models

### StudentDocument Model
```javascript
{
  documentType: String,        // Type of document requested
  description: String,         // Detailed description
  urgency: String,            // Standard, Priority, Urgent
  student: ObjectId,          // Reference to Student
  institution: ObjectId,      // Reference to Institution
  status: String,             // Current status
  statusHistory: Array,       // History of status changes
  institutionNotes: String,   // Internal notes
  estimatedDelivery: Date,    // Expected delivery date
  actualDelivery: Date        // Actual delivery date
}
```

## Frontend Components

### Student Components
- **S_Documents.jsx** - Main document management page for students
- **InstitutionCard.jsx** - Display institution info with request button
- **DocumentRequestForm.jsx** - Form for submitting document requests

### Institution Components
- **DocumentDesk.jsx** - Main document management dashboard for institutions

## Usage Instructions

### For Students
1. Navigate to Dashboard → My Institutions tab
2. Click "Request Document" on any institution card
3. Fill out the document request form
4. Track progress in Dashboard → My Documents tab
5. Mark documents as received when they arrive

### For Institutions
1. Access Document Desk from institution dashboard
2. View all document requests with filtering options
3. Update document statuses as they progress
4. Add notes and estimated delivery dates
5. Monitor urgent requests (highlighted in red)

## Installation & Setup

### Backend Setup
1. New model: `StudentDocument.js` added to `/src/models/`
2. New controller: `documentController.js` added to `/src/controllers/`
3. New routes: `documentRoutes.js` added to `/src/routes/`
4. Updated models: `student.js` and `institution.js` with document references

### Frontend Setup
1. New service: `documentService.js` for API calls
2. New pages: `S_Documents.jsx`, `DocumentDesk.jsx`
3. New components: `DocumentRequestForm.jsx`, `InstitutionCard.jsx`
4. Updated routing in `App.jsx`
5. Enhanced student dashboard with institution management

### Database Seeding
Run the seed script to create test data:
```bash
node backend/scripts/seedDocumentData.js
```

## Test Credentials
After running the seed script:
- **Student**: john.student@test.com / password123
- **Institution**: test@university.edu / password123

## Security Features
- JWT-based authentication
- Role-based access control
- User-specific data filtering
- Status update validation
- Input sanitization and validation

## Performance Optimizations
- Database indexes on frequently queried fields
- Efficient population of related documents
- Pagination support for large datasets
- Optimized filtering and sorting

## Future Enhancements
- Email notifications for status updates
- Document upload/attachment support
- Bulk document request processing
- Advanced analytics and reporting
- Mobile app integration
- Document templates system
