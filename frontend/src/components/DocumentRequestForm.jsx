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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-sky-500 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Request Document</h2>
              <p className="text-sm text-gray-600">From {institution.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type *
            </label>
            <input
              type="text"
              name="documentType"
              value={formData.documentType}
              onChange={handleInputChange}
              placeholder="e.g., Transcript, Certificate, Letter of Recommendation"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Please provide additional details about your document request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
              required
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="h-4 w-4 text-sky-600 border-gray-300 focus:ring-sky-500"
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
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
