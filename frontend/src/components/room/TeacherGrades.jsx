import { useState, useEffect } from "react";
import { Users, FileText, Edit, Save, X, TrendingUp } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const TeacherGrades = ({ roomId }) => {
  const [gradesData, setGradesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [examMarks, setExamMarks] = useState({
    midTermMarks: '',
    finalMarks: ''
  });

  console.log('TeacherGrades component rendered with roomId:', roomId);

  useEffect(() => {
    fetchRoomGrades();
  }, [roomId]);

  const fetchRoomGrades = async () => {
    try {
      console.log('Fetching grades for room:', roomId);
      const response = await api.get(`/grades/room/${roomId}`);
      console.log('Grades response:', response.data);
      setGradesData(response.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to fetch grades");
    } finally {
      setLoading(false);
    }
  };

  const handleEditExamMarks = (studentData) => {
    setEditingStudent(studentData.student._id);
    setExamMarks({
      midTermMarks: studentData.midTermMarks || '',
      finalMarks: studentData.finalMarks || ''
    });
  };

  const handleSaveExamMarks = async (studentId) => {
    try {
      // Validate inputs
      const midTerm = examMarks.midTermMarks === '' ? null : parseFloat(examMarks.midTermMarks);
      const final = examMarks.finalMarks === '' ? null : parseFloat(examMarks.finalMarks);

      if (midTerm !== null && (midTerm < 0 || midTerm > 25)) {
        toast.error("Mid-term marks must be between 0 and 25");
        return;
      }

      if (final !== null && (final < 0 || final > 35)) {
        toast.error("Final marks must be between 0 and 35");
        return;
      }

      await api.put(`/grades/room/${roomId}/student/${studentId}/exam-marks`, {
        midTermMarks: midTerm,
        finalMarks: final
      });

      toast.success("Exam marks updated successfully!");
      setEditingStudent(null);
      setExamMarks({ midTermMarks: '', finalMarks: '' });
      fetchRoomGrades(); // Refresh data
    } catch (error) {
      console.error("Error updating exam marks:", error);
      toast.error("Failed to update exam marks");
    }
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setExamMarks({ midTermMarks: '', finalMarks: '' });
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-600"; // A
    if (percentage >= 85) return "text-green-500"; // A-
    if (percentage >= 80) return "text-blue-600";  // B+
    if (percentage >= 75) return "text-blue-500";  // B
    if (percentage >= 70) return "text-blue-400";  // B-
    if (percentage >= 65) return "text-yellow-600"; // C+
    if (percentage >= 60) return "text-yellow-500"; // C
    if (percentage >= 55) return "text-orange-600"; // C-
    if (percentage >= 50) return "text-orange-500"; // D
    return "text-red-600"; // F
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading grades...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Grade Management</h2>
      </div>

      {gradesData.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content/70 mb-2">
            No students enrolled
          </h3>
          <p className="text-base-content/50">
            There are no students enrolled in this room yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {gradesData.map((studentData) => (
            <div key={studentData.student._id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                {/* Student Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center">
                        <span className="text-lg font-bold">
                          {studentData.student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{studentData.student.name}</h3>
                      <p className="text-sm text-base-content/60">{studentData.student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getGradeColor(studentData.totalMarks)}`}>
                      {studentData.totalMarks.toFixed(1)}/100
                    </div>
                    <div className="text-sm text-base-content/60">Total Score</div>
                  </div>
                </div>

                {/* Grades Table */}
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Assessment Type</th>
                        <th>Assessments</th>
                        <th>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Assignments */}
                      <tr>
                        <td className="font-medium">Assignments</td>
                        <td>
                          {studentData.assessmentMarks.assignments.length > 0 ? (
                            <div className="space-y-1">
                              {studentData.assessmentMarks.assignments.map((assignment, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{assignment.title}:</span> {assignment.marks}/{assignment.maxMarks} ({assignment.percentage.toFixed(1)}%)
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-base-content/50">No assignments graded</span>
                          )}
                        </td>
                        <td className={`font-bold ${getGradeColor(studentData.averages.assignments)}`}>
                          {studentData.averages.assignments.toFixed(1)}%
                        </td>
                      </tr>

                      {/* Projects */}
                      <tr>
                        <td className="font-medium">Projects</td>
                        <td>
                          {studentData.assessmentMarks.projects.length > 0 ? (
                            <div className="space-y-1">
                              {studentData.assessmentMarks.projects.map((project, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{project.title}:</span> {project.marks}/{project.maxMarks} ({project.percentage.toFixed(1)}%)
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-base-content/50">No projects graded</span>
                          )}
                        </td>
                        <td className={`font-bold ${getGradeColor(studentData.averages.projects)}`}>
                          {studentData.averages.projects.toFixed(1)}%
                        </td>
                      </tr>

                      {/* Quizzes */}
                      <tr>
                        <td className="font-medium">Quizzes</td>
                        <td>
                          {studentData.assessmentMarks.quizzes.length > 0 ? (
                            <div className="space-y-1">
                              {studentData.assessmentMarks.quizzes.map((quiz, index) => (
                                <div key={index} className="text-sm">
                                  <span className="font-medium">{quiz.title}:</span> {quiz.marks}/{quiz.maxMarks} ({quiz.percentage.toFixed(1)}%)
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-base-content/50">No quizzes graded</span>
                          )}
                        </td>
                        <td className={`font-bold ${getGradeColor(studentData.averages.quizzes)}`}>
                          {studentData.averages.quizzes.toFixed(1)}%
                        </td>
                      </tr>

                      {/* Overall Assessment Average */}
                      <tr className="bg-base-200">
                        <td className="font-bold">Assessment Average (40)</td>
                        <td>
                          <span className="font-medium">{((studentData.overallAverage * 40) / 100).toFixed(1)}/40</span>
                        </td>
                        <td className={`font-bold text-lg ${getGradeColor(studentData.overallAverage)}`}>
                          {studentData.overallAverage.toFixed(1)}%
                        </td>
                      </tr>

                      {/* Mid-term and Final */}
                      <tr>
                        <td className="font-medium">Mid-term (25)</td>
                        <td>
                          {editingStudent === studentData.student._id ? (
                            <input
                              type="number"
                              min="0"
                              max="25"
                              step="0.5"
                              className="input input-bordered input-sm w-20"
                              value={examMarks.midTermMarks}
                              onChange={(e) => setExamMarks(prev => ({ ...prev, midTermMarks: e.target.value }))}
                              placeholder="0-25"
                            />
                          ) : (
                            <span className="font-medium">
                              {studentData.midTermMarks !== null ? studentData.midTermMarks : '-'}
                            </span>
                          )}
                        </td>
                        <td>-</td>
                      </tr>

                      <tr>
                        <td className="font-medium">Final (35)</td>
                        <td>
                          {editingStudent === studentData.student._id ? (
                            <input
                              type="number"
                              min="0"
                              max="35"
                              step="0.5"
                              className="input input-bordered input-sm w-20"
                              value={examMarks.finalMarks}
                              onChange={(e) => setExamMarks(prev => ({ ...prev, finalMarks: e.target.value }))}
                              placeholder="0-35"
                            />
                          ) : (
                            <span className="font-medium">
                              {studentData.finalMarks !== null ? studentData.finalMarks : '-'}
                            </span>
                          )}
                        </td>
                        <td>-</td>
                      </tr>

                      {/* Exam Total Summary */}
                      <tr className="bg-base-200">
                        <td className="font-bold">Exam Total (60)</td>
                        <td>
                          <span className="font-medium">
                            {((studentData.midTermMarks || 0) + (studentData.finalMarks || 0)).toFixed(1)}/60
                          </span>
                        </td>
                        <td className={`font-bold text-lg ${getGradeColor(((((studentData.midTermMarks || 0) + (studentData.finalMarks || 0)) / 60) * 100))}`}>
                          {((((studentData.midTermMarks || 0) + (studentData.finalMarks || 0)) / 60) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                  {editingStudent === studentData.student._id ? (
                    <>
                      <button
                        onClick={() => handleSaveExamMarks(studentData.student._id)}
                        className="btn btn-success btn-sm"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="btn btn-error btn-sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditExamMarks(studentData)}
                      className="btn btn-primary btn-sm"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Exam Marks
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherGrades;
