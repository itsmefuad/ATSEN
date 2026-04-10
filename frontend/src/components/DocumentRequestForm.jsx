import { useState } from "react";
import { X, FileText, AlertCircle, Send } from "lucide-react";
import { createDocumentRequest } from "../services/documentService";
import toast from "react-hot-toast";

const DocumentRequestForm = ({ institution, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    documentType: "",
    description: "",
    urgency: "Standard"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createDocumentRequest({
        ...formData,
        institutionId: institution._id
      });

      toast.success("Document request submitted successfully!");
      setFormData({
        documentType: "",
        description: "",
        urgency: "Standard"
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to submit document request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const urgencyOptions = [
    { value: "Standard", label: "Standard", color: "text-gray-600" },
    { value: "Priority", label: "Priority", color: "text-amber-600" },
    { value: "Urgent", label: "Urgent", color: "text-red-600" }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-primary mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-base-content">Request Document</h2>
              <p className="text-sm text-base-content/70">From {institution.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base-200 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-base-content/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Document Type *
            </label>
            <input
              type="text"
              name="documentType"
              value={formData.documentType}
              onChange={handleInputChange}
              placeholder="e.g., Transcript, Certificate, Letter of Recommendation"
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-base-100 text-base-content"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Please provide additional details about your document request..."
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-base-100 text-base-content"
              required
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Urgency Level
            </label>
            <div className="space-y-2">
              {urgencyOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="urgency"
                    value={option.value}
                    checked={formData.urgency === option.value}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary border-base-300 focus:ring-primary"
                  />
                  <span className={`ml-3 text-sm font-medium ${option.color}`}>
                    {option.label}
                    {option.value === "Urgent" && (
                      <AlertCircle className="h-4 w-4 inline ml-1" />
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Urgency Note */}
          {formData.urgency === "Urgent" && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <p className="text-sm text-red-700">
                  Urgent requests may be subject to additional fees and will be prioritized for processing.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-base-content border border-base-300 rounded-md hover:bg-base-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-primary text-primary-content rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentRequestForm;
