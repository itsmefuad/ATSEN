# Quiz Grading System Documentation

## Overview
The quiz grading system allows teachers to assign marks and provide feedback to students for quizzes, similar to the assignment and project grading system but without file submissions.

## Features

### For Teachers
1. **View all students** enrolled in the room for a specific quiz
2. **Grade students** with a numerical mark out of 15 (fixed for quizzes)
3. **Provide feedback** through a text area
4. **Edit existing grades** and feedback
5. **Visual indicators** showing graded vs ungraded students

### For Students
1. **View their own grade** when available
2. **See teacher feedback** provided with the grade
3. **View percentage score** calculated automatically

## Database Schema

### QuizGrade Model (QuizGrade.js)
- `assessment`: Reference to Assessment (quiz only)
- `student`: Reference to Student
- `marks`: Number (0 to 15)
- `maxMarks`: Number (default 15)
- `teacherFeedback`: String (optional feedback)
- `isGraded`: Boolean (indicates if graded)
- `gradedAt`: Date (when graded)
- `gradedBy`: Reference to Instructor

## API Endpoints

### Quiz Grade Routes (/api/quiz-grades)
- `GET /:assessmentId/grades` - Get all quiz grades for an assessment (teacher view)
- `GET /:assessmentId/my-grade` - Get my quiz grade (student view)
- `POST /:assessmentId/grade/:studentId` - Grade a quiz (teacher only)
- `PUT /grade/:gradeId` - Update existing grade (teacher only)

## Frontend Components

### Teacher Interface (T_QuizDetail.jsx)
- **Student List**: Shows all enrolled students with grading status
- **Grading Interface**: In-line form for entering marks and feedback
- **Grade Display**: Shows existing grades and feedback
- **Edit Functionality**: Teachers can modify existing grades

### Student Interface (S_QuizDetail.jsx)
- **Grade Display**: Prominent display of score and percentage
- **Feedback Section**: Displays teacher feedback when available
- **Quiz Information**: Shows quiz details and maximum marks

## Usage Flow

### Teacher Workflow
1. Navigate to quiz by clicking on a quiz in the assessment list
2. View list of all enrolled students
3. Click "Grade" button on ungraded student
4. Enter marks (0-15) and optional feedback
5. Click "Save" to submit grade
6. Can edit grades later using "Edit Grade" button

### Student Workflow
1. Navigate to quiz by clicking on a quiz in the assessment list
2. View grade status (graded/not graded)
3. If graded, see score, percentage, and feedback
4. View quiz information and details

## Key Differences from Assignment/Project System
- **No file submissions**: Quizzes don't require file uploads
- **Fixed maximum marks**: All quizzes have 15 marks maximum
- **All enrolled students shown**: Teachers see all students, not just those who submitted
- **Direct grading**: No submission step required before grading

## Navigation
- **Teacher**: `/teacher/room/:roomId/quiz/:assessmentId`
- **Student**: `/student/room/:roomId/quiz/:assessmentId`

## Security
- Authentication required for all operations
- Students can only view their own grades
- Teachers can only grade students in their rooms
- Grade records are linked to the teacher who created them
