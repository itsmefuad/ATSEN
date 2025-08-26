import { useState } from "react";
import { Plus, Calendar, X } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const CreateAssessment = ({
  roomId,
  onAssessmentCreated,
  existingAssessments,
  defaultType,
  isPermanent,
}) => {
  const [isExpanded, setIsExpanded] = useState(isPermanent ? true : false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title:
      defaultType === "final_exam"
        ? "Final Exam"
        : defaultType === "mid_term_exam"
        ? "Mid-term Exam"
        : "",
    description: "",
    topics: "",
    date: "",
    assessmentType: defaultType || "quiz",
  });

  // Check if description is required based on assessment type
  const isDescriptionRequired =
    formData.assessmentType === "final_exam" ||
    formData.assessmentType === "mid_term_exam";

  const assessmentTypes = isPermanent
    ? [
        { value: "final_exam", label: "Final Exam" },
        { value: "mid_term_exam", label: "Mid-term Exam" },
      ]
    : [
        { value: "quiz", label: "Quiz" },
        { value: "assignment", label: "Assignment" },
        { value: "project", label: "Project" },
      ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    // Description is required only for final_exam and mid_term_exam
    if (isDescriptionRequired && !formData.description.trim()) {
      newErrors.description = "Description is required for exams";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const topicsArray = formData.topics
        .split(",")
        .map((topic) => topic.trim())
        .filter((topic) => topic.length > 0);

      const response = await api.post(`/assessments/room/${roomId}`, {
        ...formData,
        topics: topicsArray,
      });

      onAssessmentCreated(response.data);

      // Reset form
      setFormData({
        title:
          defaultType === "final_exam"
            ? "Final Exam"
            : defaultType === "mid_term_exam"
            ? "Mid-term Exam"
            : "",
        description: "",
        topics: "",
        date: "",
        assessmentType: defaultType || "quiz",
      });

      if (!isPermanent) {
        setIsExpanded(false);
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create assessment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCancel = () => {
    if (!isPermanent) {
      setIsExpanded(false);
    }
    setFormData({
      title:
        defaultType === "final_exam"
          ? "Final Exam"
          : defaultType === "mid_term_exam"
          ? "Mid-term Exam"
          : "",
      description: "",
      topics: "",
      date: "",
      assessmentType: defaultType || "quiz",
    });
    setErrors({});
  };

  if (!isExpanded && !isPermanent) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="card bg-gradient-to-r from-[#00A2E8]/5 to-blue-500/5 border-2 border-dashed border-[#00A2E8]/30 hover:border-[#00A2E8]/50 hover:from-[#00A2E8]/10 hover:to-blue-500/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
      >
        <div className="card-body py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-primary">
                Add Assessment
              </h3>
              <p className="text-sm text-base-content/60">
                Click to add a new quiz, assignment, or project
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-[#00A2E8]/5 via-base-100 to-blue-500/5 border-2 border-[#00A2E8]/20 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-primary">
              Create New Assessment
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assessment Type - Only show for non-permanent assessments */}
          {!isPermanent && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Assessment Type *
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.assessmentType}
                onChange={(e) =>
                  handleInputChange("assessmentType", e.target.value)
                }
              >
                {assessmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title *</span>
            </label>
            <input
              type="text"
              placeholder="Enter assessment title..."
              className={`input input-bordered ${
                errors.title ? "border-red-300 focus:border-red-500" : ""
              }`}
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
            {errors.title && (
              <label className="label">
                <span className="label-text-alt text-red-500">
                  {errors.title}
                </span>
              </label>
            )}
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Description {isDescriptionRequired ? "*" : "(Optional)"}
              </span>
            </label>
            <textarea
              placeholder={
                isDescriptionRequired
                  ? "Describe this assessment..."
                  : "Describe this assessment (optional)..."
              }
              className={`textarea textarea-bordered h-24 ${
                errors.description ? "border-red-300 focus:border-red-500" : ""
              }`}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-red-500">
                  {errors.description}
                </span>
              </label>
            )}
          </div>

          {/* Topics */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Topics (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Enter topics separated by commas..."
              className="input input-bordered"
              value={formData.topics}
              onChange={(e) => handleInputChange("topics", e.target.value)}
            />
            <label className="label">
              <span className="label-text-alt">
                e.g., Topic 1, Topic 2, Topic 3
              </span>
            </label>
          </div>

          {/* Date */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Date *</span>
            </label>
            <input
              type="datetime-local"
              className={`input input-bordered ${
                errors.date ? "border-red-300 focus:border-red-500" : ""
              }`}
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
            />
            {errors.date && (
              <label className="label">
                <span className="label-text-alt text-red-500">
                  {errors.date}
                </span>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-[#00A2E8] hover:bg-[#0082c4] text-white border-none flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading loading-spinner loading-sm"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {isPermanent ? "Create Exam" : "Create Assessment"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssessment;
