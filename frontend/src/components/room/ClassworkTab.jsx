import { useState, useEffect } from "react";

const ClassworkTab = ({ roomId }) => {
  const [assessments, setAssessments] = useState({
    assignments: [],
    quizzes: [],
    exams: [],
    projects: []
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    type: "assignment",
    totalMarks: "",
    dueDate: "",
    instructions: "",
    isPublished: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [roomId]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      // Mock data based on the UI image
      const mockAssessments = {
        assignments: [
          { _id: "1", title: "Assignment 1", type: "assignment", totalMarks: 100, dueDate: "2024-02-15", isPublished: true, createdAt: new Date().toISOString() },
          { _id: "2", title: "Assignment 2", type: "assignment", totalMarks: 100, dueDate: "2024-02-20", isPublished: true, createdAt: new Date().toISOString() },
          { _id: "3", title: "Assignment 3", type: "assignment", totalMarks: 100, dueDate: "2024-02-25", isPublished: false, createdAt: new Date().toISOString() }
        ],
        quizzes: [
          { _id: "4", title: "Quiz 1", type: "quiz", totalMarks: 50, dueDate: "2024-02-10", isPublished: true, createdAt: new Date().toISOString() },
          { _id: "5", title: "Quiz 2", type: "quiz", totalMarks: 50, dueDate: "2024-02-17", isPublished: true, createdAt: new Date().toISOString() },
          { _id: "6", title: "Quiz 3", type: "quiz", totalMarks: 50, dueDate: "2024-02-24", isPublished: false, createdAt: new Date().toISOString() },
          { _id: "7", title: "Quiz 4", type: "quiz", totalMarks: 50, dueDate: "2024-03-03", isPublished: false, createdAt: new Date().toISOString() }
        ],
        exams: [
          { _id: "8", title: "Mid-term exam", type: "midterm_exam", totalMarks: 200, dueDate: "2024-03-15", isPublished: true, createdAt: new Date().toISOString() },
          { _id: "9", title: "Final exam", type: "final_exam", totalMarks: 300, dueDate: "2024-05-20", isPublished: false, createdAt: new Date().toISOString() }
        ],
        projects: [
          { _id: "10", title: "Project 1", type: "project", totalMarks: 150, dueDate: "2024-04-10", isPublished: true, createdAt: new Date().toISOString() },
          { _id: "11", title: "Project 2", type: "project", totalMarks: 150, dueDate: "2024-05-15", isPublished: false, createdAt: new Date().toISOString() }
        ]
      };
      setAssessments(mockAssessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssessment = async (e) => {
    e.preventDefault();
    try {
      // Mock adding assessment - replace with actual API call
      const newAssessmentData = {
        _id: Date.now().toString(),
        title: newAssessment.title,
        description: newAssessment.description,
        type: newAssessment.type,
        totalMarks: parseInt(newAssessment.totalMarks),
        dueDate: newAssessment.dueDate,
        instructions: newAssessment.instructions,
        isPublished: newAssessment.isPublished,
        instructor: { name: "Teacher Name" },
        createdAt: new Date().toISOString()
      };
      
      const category = newAssessment.type === "midterm_exam" || newAssessment.type === "final_exam" ? "exams" : 
                      newAssessment.type === "assignment" ? "assignments" :
                      newAssessment.type === "quiz" ? "quizzes" : "projects";
      
      setAssessments(prev => ({
        ...prev,
        [category]: [...prev[category], newAssessmentData]
      }));
      
      setNewAssessment({
        title: "",
        description: "",
        type: "assignment",
        totalMarks: "",
        dueDate: "",
        instructions: "",
        isPublished: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding assessment:", error);
    }
  };

  const handleTogglePublish = async (assessmentId, category) => {
    try {
      // Mock toggling publish status - replace with actual API call
      setAssessments(prev => ({
        ...prev,
        [category]: prev[category].map(assessment => 
          assessment._id === assessmentId 
            ? { ...assessment, isPublished: !assessment.isPublished }
            : assessment
        )
      }));
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  const handleDeleteAssessment = async (assessmentId, category) => {
    try {
      // Mock deleting assessment - replace with actual API call
      setAssessments(prev => ({
        ...prev,
        [category]: prev[category].filter(assessment => assessment._id !== assessmentId)
      }));
    } catch (error) {
      console.error("Error deleting assessment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Assessment Button */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          Add an assessment
        </button>
      </div>

      {/* Add Assessment Form */}
      {showAddForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Create New Assessment</h3>
          <form onSubmit={handleAddAssessment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Assessment title"
                value={newAssessment.title}
                onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newAssessment.type}
                onChange={(e) => setNewAssessment({...newAssessment, type: e.target.value})}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="midterm_exam">Mid-term Exam</option>
                <option value="final_exam">Final Exam</option>
                <option value="project">Project</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Total marks"
                value={newAssessment.totalMarks}
                onChange={(e) => setNewAssessment({...newAssessment, totalMarks: e.target.value})}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
              <input
                type="date"
                placeholder="Due date"
                value={newAssessment.dueDate}
                onChange={(e) => setNewAssessment({...newAssessment, dueDate: e.target.value})}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <textarea
              placeholder="Description (optional)"
              value={newAssessment.description}
              onChange={(e) => setNewAssessment({...newAssessment, description: e.target.value})}
              className="w-full p-3 border rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
              placeholder="Instructions for students (optional)"
              value={newAssessment.instructions}
              onChange={(e) => setNewAssessment({...newAssessment, instructions: e.target.value})}
              className="w-full p-3 border rounded-lg h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={newAssessment.isPublished}
                onChange={(e) => setNewAssessment({...newAssessment, isPublished: e.target.checked})}
                className="rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-gray-700">
                Publish immediately
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assessments Display */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Assessments:</h3>
        
        {/* Assignments */}
        <AssessmentSection 
          title="Assignments"
          assessments={assessments.assignments}
          category="assignments"
          onTogglePublish={handleTogglePublish}
          onDelete={handleDeleteAssessment}
        />

        <hr className="border-gray-300 my-6" />

        {/* Quizzes */}
        <AssessmentSection 
          title="Quizzes"
          assessments={assessments.quizzes}
          category="quizzes"
          onTogglePublish={handleTogglePublish}
          onDelete={handleDeleteAssessment}
        />

        <hr className="border-gray-300 my-6" />

        {/* Exams */}
        <AssessmentSection 
          title="Exams"
          assessments={assessments.exams}
          category="exams"
          onTogglePublish={handleTogglePublish}
          onDelete={handleDeleteAssessment}
        />

        <hr className="border-gray-300 my-6" />

        {/* Projects */}
        <AssessmentSection 
          title="Projects"
          assessments={assessments.projects}
          category="projects"
          onTogglePublish={handleTogglePublish}
          onDelete={handleDeleteAssessment}
        />
      </div>
    </div>
  );
};

const AssessmentSection = ({ title, assessments, category, onTogglePublish, onDelete }) => {
  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="space-y-2">
        {assessments.map((assessment) => (
          <AssessmentItem 
            key={assessment._id} 
            assessment={assessment} 
            category={category}
            onTogglePublish={onTogglePublish}
            onDelete={onDelete}
          />
        ))}
        {assessments.length === 0 && (
          <p className="text-gray-500 italic">No {title.toLowerCase()} created yet.</p>
        )}
      </div>
    </div>
  );
};

const AssessmentItem = ({ assessment, category, onTogglePublish, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "midterm_exam": return "Mid-term Exam";
      case "final_exam": return "Final Exam";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      assessment.isPublished 
        ? "bg-green-50 border-green-200" 
        : "bg-yellow-50 border-yellow-200"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h5 className="font-medium text-gray-800">{assessment.title}</h5>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              assessment.isPublished 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {assessment.isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>Type: {getTypeLabel(assessment.type)}</span>
            <span>Marks: {assessment.totalMarks}</span>
            <span>Due: {formatDate(assessment.dueDate)}</span>
          </div>
          {assessment.description && (
            <p className="text-sm text-gray-600 mt-2">{assessment.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onTogglePublish(assessment._id, category)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              assessment.isPublished
                ? "bg-yellow-600 text-white hover:bg-yellow-700"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {assessment.isPublished ? "Unpublish" : "Publish"}
          </button>
          <button
            onClick={() => onDelete(assessment._id, category)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete assessment"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassworkTab;