import { useState, useEffect } from "react";

const GradesTab = ({ roomId }) => {
  const [gradeData, setGradeData] = useState({
    students: [],
    assessments: []
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingGrade, setEditingGrade] = useState(null);
  const [newGrade, setNewGrade] = useState({
    marksObtained: "",
    feedback: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGradeData();
  }, [roomId]);

  const fetchGradeData = async () => {
    try {
      setLoading(true);
      // Mock data based on the UI image
      const mockData = {
        students: [
          {
            student: { _id: "1", name: "Student 1", email: "student1@example.com", studentId: "S001" },
            grades: {}
          },
          {
            student: { _id: "2", name: "Student 2", email: "student2@example.com", studentId: "S002" },
            grades: {}
          },
          {
            student: { _id: "3", name: "Student 3", email: "student3@example.com", studentId: "S003" },
            grades: {}
          },
          {
            student: { _id: "4", name: "Student 4", email: "student4@example.com", studentId: "S004" },
            grades: {}
          },
          {
            student: { _id: "5", name: "Student 5", email: "student5@example.com", studentId: "S005" },
            grades: {}
          },
          {
            student: { _id: "6", name: "Student 6", email: "student6@example.com", studentId: "S006" },
            grades: {}
          }
        ],
        assessments: [
          { _id: "a1", title: "Assignment 1", type: "assignment", totalMarks: 100 },
          { _id: "a2", title: "Quiz 1", type: "quiz", totalMarks: 50 },
          { _id: "a3", title: "Mid-term Exam", type: "midterm_exam", totalMarks: 200 },
          { _id: "a4", title: "Project 1", type: "project", totalMarks: 150 }
        ]
      };
      setGradeData(mockData);
    } catch (error) {
      console.error("Error fetching grade data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeEdit = (studentId, assessmentId, currentGrade = null) => {
    setEditingGrade({ studentId, assessmentId });
    setNewGrade({
      marksObtained: currentGrade ? currentGrade.marksObtained.toString() : "",
      feedback: currentGrade ? currentGrade.feedback || "" : ""
    });
  };

  const handleGradeSave = async () => {
    try {
      if (!editingGrade) return;

      const { studentId, assessmentId } = editingGrade;
      const assessment = gradeData.assessments.find(a => a._id === assessmentId);
      
      if (parseInt(newGrade.marksObtained) > assessment.totalMarks) {
        alert(`Marks cannot exceed ${assessment.totalMarks}`);
        return;
      }

      // Mock saving grade - replace with actual API call
      const updatedStudents = gradeData.students.map(studentData => {
        if (studentData.student._id === studentId) {
          return {
            ...studentData,
            grades: {
              ...studentData.grades,
              [assessmentId]: {
                _id: Date.now().toString(),
                marksObtained: parseInt(newGrade.marksObtained),
                feedback: newGrade.feedback,
                isGraded: true,
                gradedBy: { name: "Teacher Name" }
              }
            }
          };
        }
        return studentData;
      });

      setGradeData(prev => ({
        ...prev,
        students: updatedStudents
      }));

      setEditingGrade(null);
      setNewGrade({ marksObtained: "", feedback: "" });
    } catch (error) {
      console.error("Error saving grade:", error);
    }
  };

  const handleGradeCancel = () => {
    setEditingGrade(null);
    setNewGrade({ marksObtained: "", feedback: "" });
  };

  const calculatePercentage = (marks, totalMarks) => {
    return Math.round((marks / totalMarks) * 100);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading grades...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Students:</h3>
        
        {/* Grades Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-800 min-w-[200px]">Student</th>
                {gradeData.assessments.map((assessment) => (
                  <th key={assessment._id} className="text-center p-4 font-semibold text-gray-800 min-w-[120px]">
                    <div>{assessment.title}</div>
                    <div className="text-sm font-normal text-gray-600">/{assessment.totalMarks}</div>
                  </th>
                ))}
                <th className="text-center p-4 font-semibold text-gray-800 min-w-[100px]">Average</th>
              </tr>
            </thead>
            <tbody>
              {gradeData.students.map((studentData) => (
                <StudentRow
                  key={studentData.student._id}
                  studentData={studentData}
                  assessments={gradeData.assessments}
                  editingGrade={editingGrade}
                  newGrade={newGrade}
                  onGradeEdit={handleGradeEdit}
                  onGradeSave={handleGradeSave}
                  onGradeCancel={handleGradeCancel}
                  onNewGradeChange={setNewGrade}
                  calculatePercentage={calculatePercentage}
                  getGradeColor={getGradeColor}
                />
              ))}
            </tbody>
          </table>
        </div>

        {gradeData.students.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">No students enrolled in this room yet.</p>
          </div>
        )}
      </div>

      {/* Grade Statistics */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradeData.assessments.map((assessment) => {
            const grades = gradeData.students
              .map(s => s.grades[assessment._id])
              .filter(grade => grade && grade.isGraded);
            
            const average = grades.length > 0 
              ? grades.reduce((sum, grade) => sum + grade.marksObtained, 0) / grades.length
              : 0;
            
            const averagePercentage = (average / assessment.totalMarks) * 100;

            return (
              <div key={assessment._id} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">{assessment.title}</h4>
                <div className="space-y-1 text-sm">
                  <div>Graded: {grades.length}/{gradeData.students.length}</div>
                  <div className={`font-medium ${getGradeColor(averagePercentage)}`}>
                    Average: {average.toFixed(1)}/{assessment.totalMarks} ({averagePercentage.toFixed(1)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StudentRow = ({ 
  studentData, 
  assessments, 
  editingGrade, 
  newGrade, 
  onGradeEdit, 
  onGradeSave, 
  onGradeCancel, 
  onNewGradeChange, 
  calculatePercentage, 
  getGradeColor 
}) => {
  const calculateStudentAverage = () => {
    const gradedAssessments = assessments.filter(assessment => 
      studentData.grades[assessment._id] && studentData.grades[assessment._id].isGraded
    );
    
    if (gradedAssessments.length === 0) return null;
    
    const totalPercentage = gradedAssessments.reduce((sum, assessment) => {
      const grade = studentData.grades[assessment._id];
      return sum + calculatePercentage(grade.marksObtained, assessment.totalMarks);
    }, 0);
    
    return totalPercentage / gradedAssessments.length;
  };

  const studentAverage = calculateStudentAverage();

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {studentData.student.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-800">{studentData.student.name}</div>
            <div className="text-sm text-gray-600">{studentData.student.studentId}</div>
          </div>
        </div>
      </td>
      
      {assessments.map((assessment) => (
        <td key={assessment._id} className="p-4 text-center">
          <GradeCell
            studentId={studentData.student._id}
            assessment={assessment}
            grade={studentData.grades[assessment._id]}
            isEditing={editingGrade?.studentId === studentData.student._id && editingGrade?.assessmentId === assessment._id}
            newGrade={newGrade}
            onEdit={onGradeEdit}
            onSave={onGradeSave}
            onCancel={onGradeCancel}
            onNewGradeChange={onNewGradeChange}
            calculatePercentage={calculatePercentage}
            getGradeColor={getGradeColor}
          />
        </td>
      ))}
      
      <td className="p-4 text-center">
        {studentAverage !== null ? (
          <span className={`font-medium ${getGradeColor(studentAverage)}`}>
            {studentAverage.toFixed(1)}%
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
    </tr>
  );
};

const GradeCell = ({ 
  studentId, 
  assessment, 
  grade, 
  isEditing, 
  newGrade, 
  onEdit, 
  onSave, 
  onCancel, 
  onNewGradeChange, 
  calculatePercentage, 
  getGradeColor 
}) => {
  if (isEditing) {
    return (
      <div className="space-y-2">
        <input
          type="number"
          value={newGrade.marksObtained}
          onChange={(e) => onNewGradeChange({...newGrade, marksObtained: e.target.value})}
          className="w-20 p-1 border rounded text-center text-sm"
          min="0"
          max={assessment.totalMarks}
          placeholder="Marks"
        />
        <div className="flex space-x-1 justify-center">
          <button
            onClick={onSave}
            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
          >
            ✓
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (grade && grade.isGraded) {
    const percentage = calculatePercentage(grade.marksObtained, assessment.totalMarks);
    return (
      <button
        onClick={() => onEdit(studentId, assessment._id, grade)}
        className="group text-center hover:bg-blue-50 p-2 rounded transition-colors"
      >
        <div className={`font-medium ${getGradeColor(percentage)}`}>
          {grade.marksObtained}/{assessment.totalMarks}
        </div>
        <div className={`text-xs ${getGradeColor(percentage)}`}>
          {percentage}%
        </div>
        <div className="text-xs text-gray-400 group-hover:text-blue-600">
          Click to edit
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onEdit(studentId, assessment._id)}
      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors text-sm"
    >
      Grades
    </button>
  );
};

export default GradesTab;