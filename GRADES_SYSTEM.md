# Comprehensive Grades System Documentation

## Overview
The Grades system provides a comprehensive grade management interface for both teachers and students, displaying all assessment marks, averages, and final grades in a structured table format.

## Features

### For Teachers (TeacherGrades Component)
1. **View all students** enrolled in the room with complete grade sheets
2. **Comprehensive grade table** showing:
   - Individual assignment marks and percentages
   - Individual project marks and percentages  
   - Individual quiz marks and percentages
   - Average for each assessment type
   - Overall assessment average
3. **Manual exam mark entry**:
   - Mid-term marks (0-25)
   - Final marks (0-35)
4. **Automatic total calculation**: Assessment Average + Mid-term + Final
5. **Color-coded grading** based on performance levels
6. **Edit functionality** for exam marks

### For Students (StudentGrades Component)
1. **Personal grade overview** with overall score card
2. **Detailed grade breakdown** showing the same table structure as teacher view
3. **Grade letter calculation** (A+, A, B, etc.)
4. **Grade scale reference** for understanding performance levels
5. **Read-only view** of their own grades only

## Database Schema

### Grade Model (Grade.js)
- `student`: Reference to Student
- `room`: Reference to Room
- `midTermMarks`: Number (0-25, manually entered)
- `finalMarks`: Number (0-35, manually entered)
- `averageAssessmentMarks`: Number (calculated automatically)
- `totalMarks`: Number (assessment average + mid + final)
- `lastUpdated`: Date
- `updatedBy`: Reference to Instructor

## API Endpoints

### Grade Routes (/api/grades)
- `GET /room/:roomId` - Get comprehensive grade sheet for all students (teacher view)
- `GET /room/:roomId/my-grades` - Get grade sheet for current student (student view)
- `PUT /room/:roomId/student/:studentId/exam-marks` - Update mid-term and final marks (teacher only)

## Grade Calculation Logic

### Assessment Average Calculation
1. **Collect all graded assessments**: assignments, projects, quizzes
2. **Convert to percentages**: (marks/maxMarks) * 100
3. **Calculate overall average**: Sum of all percentages / Total assessments
4. **Individual type averages**: Separate averages for assignments, projects, quizzes

### Total Marks Calculation
```
Total = Assessment Average + Mid-term Marks + Final Marks
```

### Grade Scale
- **A+**: 90-100%
- **A**: 85-89%
- **A-**: 80-84%
- **B+**: 75-79%
- **B**: 70-74%
- **B-**: 65-69%
- **C+**: 60-64%
- **C**: 55-59%
- **C-**: 50-54%
- **F**: 0-49%

## User Interface

### Teacher Interface
- **Student cards** with expandable grade tables
- **Color-coded scores** for quick performance assessment
- **Inline editing** for mid-term and final marks
- **Validation** for mark ranges (0-25 for mid-term, 0-35 for final)
- **Auto-refresh** after updates

### Student Interface
- **Overall score card** with prominent display
- **Detailed breakdown table** matching teacher view
- **Grade scale reference** for context
- **Performance indicators** with color coding

## Navigation
- **Teacher**: `/teacher/room/:roomId/grades`
- **Student**: `/student/room/:roomId/grades`

## Integration with Existing Systems

### Data Sources
- **Submissions**: Assignment and project grades from Submission model
- **Quiz Grades**: Quiz marks from QuizGrade model
- **Assessments**: Assessment details from Assessment model
- **Room Enrollment**: Student list from Room model

### Automatic Updates
- Grade calculations update automatically when:
  - New submissions are graded
  - Quiz grades are updated
  - Exam marks are modified

## Security & Permissions
- **Authentication required** for all grade operations
- **Students see only their own grades**
- **Teachers see all students in their rooms**
- **Exam mark updates require teacher authentication**
- **Grade history tracking** with updatedBy field

## Usage Flow

### Teacher Workflow
1. Navigate to Grades tab in room
2. View all students with their complete grade sheets
3. Review assessment performance and averages
4. Click "Edit Exam Marks" for any student
5. Enter mid-term (0-25) and final (0-35) marks
6. Save changes to update total scores

### Student Workflow
1. Navigate to Grades tab in room
2. View overall score card and grade letter
3. Review detailed breakdown of all assessments
4. Check individual marks and averages
5. Reference grade scale for context

## Performance Features
- **Efficient data aggregation** combining multiple models
- **Color-coded visualization** for quick assessment
- **Responsive design** for various screen sizes
- **Real-time calculation** of totals and averages
