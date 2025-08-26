import { useState, useEffect } from "react";
import { TrendingUp, Award, Calendar, FileText } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const StudentGrades = ({ roomId }) => {
  const [gradesData, setGradesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGrades();
  }, [roomId]);

  const fetchMyGrades = async () => {
    try {
      const response = await api.get(`/grades/room/${roomId}/my-grades`);
      setGradesData(response.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to fetch grades");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return "A";
    if (percentage >= 85) return "A-";
    if (percentage >= 80) return "B+";
    if (percentage >= 75) return "B";
    if (percentage >= 70) return "B-";
    if (percentage >= 65) return "C+";
    if (percentage >= 60) return "C";
    if (percentage >= 55) return "C-";
    if (percentage >= 50) return "D";
    return "F";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-2">Loading your grades...</span>
      </div>
    );
  }

  if (!gradesData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-base-content/70 mb-2">
          No grades available
        </h3>
        <p className="text-base-content/50">
          Your grades will appear here once your instructor has graded your work.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">My Grades</h2>
      </div>

      {/* Overall Score Card */}
      <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Overall Score</h2>
              <p className="opacity-80">Your current standing in this course</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">
                {gradesData.totalMarks.toFixed(1)}/100
              </div>
              <div className="text-xl font-semibold">
                {getGradeLetter(gradesData.totalMarks)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Grade Table */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Grade Breakdown
          </h3>

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
                    {gradesData.assessmentMarks.assignments.length > 0 ? (
                      <div className="space-y-1">
                        {gradesData.assessmentMarks.assignments.map((assignment, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{assignment.title}:</span> {assignment.marks}/{assignment.maxMarks} ({assignment.percentage.toFixed(1)}%)
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-base-content/50">No assignments graded</span>
                    )}
                  </td>
                  <td className={`font-bold ${getGradeColor(gradesData.averages.assignments)}`}>
                    {gradesData.averages.assignments.toFixed(1)}%
                  </td>
                </tr>

                {/* Projects */}
                <tr>
                  <td className="font-medium">Projects</td>
                  <td>
                    {gradesData.assessmentMarks.projects.length > 0 ? (
                      <div className="space-y-1">
                        {gradesData.assessmentMarks.projects.map((project, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{project.title}:</span> {project.marks}/{project.maxMarks} ({project.percentage.toFixed(1)}%)
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-base-content/50">No projects graded</span>
                    )}
                  </td>
                  <td className={`font-bold ${getGradeColor(gradesData.averages.projects)}`}>
                    {gradesData.averages.projects.toFixed(1)}%
                  </td>
                </tr>

                {/* Quizzes */}
                <tr>
                  <td className="font-medium">Quizzes</td>
                  <td>
                    {gradesData.assessmentMarks.quizzes.length > 0 ? (
                      <div className="space-y-1">
                        {gradesData.assessmentMarks.quizzes.map((quiz, index) => (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{quiz.title}:</span> {quiz.marks}/{quiz.maxMarks} ({quiz.percentage.toFixed(1)}%)
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-base-content/50">No quizzes graded</span>
                    )}
                  </td>
                  <td className={`font-bold ${getGradeColor(gradesData.averages.quizzes)}`}>
                    {gradesData.averages.quizzes.toFixed(1)}%
                  </td>
                </tr>

                {/* Overall Assessment Average */}
                <tr className="bg-base-200">
                  <td className="font-bold">Assessment Average (40)</td>
                  <td>
                    <span className="font-medium">{((gradesData.overallAverage * 40) / 100).toFixed(1)}/40</span>
                  </td>
                  <td className={`font-bold text-lg ${getGradeColor(gradesData.overallAverage)}`}>
                    {gradesData.overallAverage.toFixed(1)}%
                  </td>
                </tr>

                {/* Mid-term */}
                <tr>
                  <td className="font-medium">Mid-term Exam (25)</td>
                  <td>
                    {gradesData.midTermMarks !== null ? (
                      <span className="font-medium">{gradesData.midTermMarks}/25</span>
                    ) : (
                      <span className="text-base-content/50">Not graded yet</span>
                    )}
                  </td>
                  <td>
                    {gradesData.midTermMarks !== null ? (
                      <span className={`font-bold ${getGradeColor((gradesData.midTermMarks / 25) * 100)}`}>
                        {((gradesData.midTermMarks / 25) * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-base-content/50">-</span>
                    )}
                  </td>
                </tr>

                {/* Final */}
                <tr>
                  <td className="font-medium">Final Exam (35)</td>
                  <td>
                    {gradesData.finalMarks !== null ? (
                      <span className="font-medium">{gradesData.finalMarks}/35</span>
                    ) : (
                      <span className="text-base-content/50">Not graded yet</span>
                    )}
                  </td>
                  <td>
                    {gradesData.finalMarks !== null ? (
                      <span className={`font-bold ${getGradeColor((gradesData.finalMarks / 35) * 100)}`}>
                        {((gradesData.finalMarks / 35) * 100).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-base-content/50">-</span>
                    )}
                  </td>
                </tr>

                {/* Exam Total Summary */}
                <tr className="bg-base-200">
                  <td className="font-bold">Exam Total (60)</td>
                  <td>
                    <span className="font-medium">
                      {((gradesData.midTermMarks || 0) + (gradesData.finalMarks || 0)).toFixed(1)}/60
                    </span>
                  </td>
                  <td className={`font-bold text-lg ${getGradeColor(((((gradesData.midTermMarks || 0) + (gradesData.finalMarks || 0)) / 60) * 100))}`}>
                    {((((gradesData.midTermMarks || 0) + (gradesData.finalMarks || 0)) / 60) * 100).toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grade Scale Reference */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="text-lg font-bold mb-4">Grade Scale</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-green-600 font-bold text-lg">A</div>
              <div className="text-sm text-base-content/60">90-100%</div>
            </div>
            <div className="text-center">
              <div className="text-green-500 font-bold text-lg">A-</div>
              <div className="text-sm text-base-content/60">85-89%</div>
            </div>
            <div className="text-center">
              <div className="text-blue-600 font-bold text-lg">B+</div>
              <div className="text-sm text-base-content/60">80-84%</div>
            </div>
            <div className="text-center">
              <div className="text-blue-500 font-bold text-lg">B</div>
              <div className="text-sm text-base-content/60">75-79%</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold text-lg">B-</div>
              <div className="text-sm text-base-content/60">70-74%</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-600 font-bold text-lg">C+</div>
              <div className="text-sm text-base-content/60">65-69%</div>
            </div>
            <div className="text-center">
              <div className="text-yellow-500 font-bold text-lg">C</div>
              <div className="text-sm text-base-content/60">60-64%</div>
            </div>
            <div className="text-center">
              <div className="text-orange-600 font-bold text-lg">C-</div>
              <div className="text-sm text-base-content/60">55-59%</div>
            </div>
            <div className="text-center">
              <div className="text-orange-500 font-bold text-lg">D</div>
              <div className="text-sm text-base-content/60">50-54%</div>
            </div>
            <div className="text-center">
              <div className="text-red-600 font-bold text-lg">F</div>
              <div className="text-sm text-base-content/60">0-49%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGrades;
