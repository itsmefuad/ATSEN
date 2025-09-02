import { useState } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const SupportDeskForm = ({ institution, isOpen, onClose, onSuccess, student }) => {
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    description: "",
    priority: "medium",
  });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Academic Support",
    "Technical Issues",
    "Account Management",
    "Course Registration",
    "Payment & Billing",
    "General Inquiry",
    "Other"
  ];

  const priorities = [
    { value: "low", label: "Low", color: "text-green-600" },
    { value: "medium", label: "Medium", color: "text-yellow-600" },
    { value: "high", label: "High", color: "text-orange-600" },
    { value: "urgent", label: "Urgent", color: "text-red-600" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    if (attachments.length + validFiles.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} files.`);
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.subject || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("studentId", student._id);
      submitData.append("institutionId", institution._id);
      submitData.append("category", formData.category);
      submitData.append("subject", formData.subject);
      submitData.append("description", formData.description);
      submitData.append("priority", formData.priority);

      // Add attachments
      attachments.forEach(file => {
        submitData.append("attachments", file);
      });

      await api.post("/support/tickets", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Support request submitted successfully!");
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        category: "",
        subject: "",
        description: "",
        priority: "medium",
      });
      setAttachments([]);
    } catch (error) {
      console.error("Error submitting support request:", error);
      toast.error(error.response?.data?.message || "Failed to submit support request");
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-base-100 border-b border-base-300 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-base-content">Contact Support</h3>
            <p className="text-sm text-base-content/70">{institution.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-base-content/40 hover:text-base-content/60 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Query Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-base-100 text-base-content"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Priority Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {priorities.map(priority => (
                <label
                  key={priority.value}
                  className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                    formData.priority === priority.value
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-base-content/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      priority.value === "low" ? "bg-green-500" :
                      priority.value === "medium" ? "bg-yellow-500" :
                      priority.value === "high" ? "bg-orange-500" : "bg-red-500"
                    }`} />
                    <span className={`text-sm font-medium ${priority.color}`}>
                      {priority.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              maxLength={200}
              placeholder="Brief description of your issue"
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-base-100 text-base-content"
            />
            <p className="mt-1 text-xs text-base-content/60">
              {formData.subject.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Query Details <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={6}
              maxLength={2000}
              placeholder="Please provide detailed information about your query or issue..."
              className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none bg-base-100 text-base-content"
            />
            <p className="mt-1 text-xs text-base-content/60">
              {formData.description.length}/2000 characters
            </p>
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-base-300 rounded-md p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
                className="sr-only"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-8 w-8 text-base-content/40 mb-2" />
                <span className="text-sm text-base-content/70">
                  Click to upload files or drag and drop
                </span>
                <span className="text-xs text-base-content/60 mt-1">
                  Maximum 5 files, 10MB each
                </span>
              </label>
            </div>

            {/* Attached Files */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-base-200 rounded border border-base-300"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-base-content/60 mr-2" />
                      <span className="text-sm text-base-content truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-base-content/60 ml-2">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Important Note */}
          <div className="flex items-start p-4 bg-blue-50 rounded-md">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Please note:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Support requests are typically responded to within 24-48 hours</li>
                <li>For urgent matters, please contact the institution directly</li>
                <li>You will receive email notifications for updates on your request</li>
              </ul>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-base-content bg-base-100 border border-base-300 rounded-md hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-primary-content bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportDeskForm;
