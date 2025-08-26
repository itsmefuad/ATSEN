# Grading System Documentation

## Overview
The grading system allows teachers to assign marks and provide feedback to student submissions for assignments and projects.

## Features

### For Teachers (T_AssignmentDetail.jsx)
1. **View all submissions** for an assessment with grading status
2. **Grade submissions** with a numerical mark out of:
   - **Assignments**: 10 marks
   - **Projects**: 15 marks
3. **Provide feedback** through a text area
4. **Edit existing grades** and feedback
5. **Visual indicators** showing graded vs ungraded submissions

### For Students (S_AssignmentDetail.jsx)
1. **View their own grade** when available
2. **See teacher feedback** provided with the grade
3. **View percentage score** calculated automatically
4. **Download their submitted files**

## Backend Changes

### Database Schema (Submission.js)
Added new fields to the Submission model:
- `marks`: Number (0 to max marks based on assessment type)
- `maxMarks`: Number (auto-set based on assessment type)
- `teacherFeedback`: String (optional feedback from teacher)
- `isGraded`: Boolean (indicates if submission has been graded)
- `gradedAt`: Date (when the grading was done)
- `gradedBy`: ObjectId (reference to the instructor who graded)

### API Endpoints (submissionController.js, submissionRoutes.js)
- `POST /submissions/grade/:submissionId` - Grade a submission
- `PUT /submissions/grade/:submissionId` - Update existing grade
- Enhanced existing endpoints to include grading information

## Frontend Changes

### Teacher Interface
- **Grading Interface**: In-line form for entering marks and feedback
- **Grade Display**: Shows existing grades and feedback
- **Status Indicators**: Visual badges showing graded status and scores
- **Edit Functionality**: Teachers can modify existing grades

### Student Interface  
- **Grade Display**: Prominent display of score and percentage
- **Feedback Section**: Displays teacher feedback when available
- **Grading Status**: Visual indicators for graded vs ungraded submissions

## Usage Flow

### Teacher Workflow
1. Navigate to assignment detail page
2. View list of student submissions
3. Click "Grade" button on ungraded submission
4. Enter marks (0-10 for assignments, 0-15 for projects)
5. Add optional feedback
6. Click "Save" to submit grade
7. Can edit grades later using "Edit Grade" button

### Student Workflow
1. Navigate to assignment detail page
2. View submission status
3. If graded, see score, percentage, and feedback
4. Download submitted files if needed

## Validation
- Marks must be within valid range (0-10 for assignments, 0-15 for projects)
- Only one submission per student per assessment
- Teachers can only grade submitted work
- Students can only view their own grades

## Security
- Authentication required for all grading operations
- Students can only view their own submissions and grades
- Teachers need proper authorization to grade submissions
