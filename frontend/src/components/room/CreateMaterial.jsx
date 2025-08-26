import { useState } from "react";
import { Plus, X, FileText, File, Link, Upload, Paperclip } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const CreateMaterial = ({ roomId, onMaterialCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    section: "course_materials",
    linkUrl: "", // For link attachment
    pdfFile: null, // For PDF attachment
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Validate form
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('section', formData.section);
      formDataToSend.append('fileName', formData.title);

      // Add link if provided
      if (formData.linkUrl.trim()) {
        formDataToSend.append('fileUrl', formData.linkUrl);
      }

      // Add PDF if provided
      if (formData.pdfFile) {
        formDataToSend.append('pdfFile', formData.pdfFile);
      }

      const response = await api.post(`/materials/room/${roomId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Material uploaded successfully!");
      setFormData({
        title: "",
        description: "",
        section: "course_materials",
        linkUrl: "",
        pdfFile: null,
      });
      setIsOpen(false);
      onMaterialCreated(response.data);
    } catch (error) {
      console.error("Error creating material:", error);
      toast.error(`Failed to upload material: ${error.response?.data?.details || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      section: "course_materials",
      linkUrl: "",
      pdfFile: null,
    });
    setErrors({});
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="card bg-gradient-to-r from-secondary/5 to-primary/5 border-2 border-dashed border-secondary/30 hover:border-secondary/50 hover:from-secondary/10 hover:to-primary/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
      >
        <div className="card-body py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition-colors duration-300">
              <Upload className="h-6 w-6 text-secondary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-secondary">Upload New Material</h3>
              <p className="text-sm text-base-content/60">Click to add course materials, books, or research papers</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-secondary/5 via-base-100 to-primary/5 border-2 border-secondary/20 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-secondary/10 rounded-full">
              <Upload className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-secondary">Upload New Material</h3>
          </div>
          <button
            onClick={handleCancel}
            className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title *</span>
            </label>
            <input
              type="text"
              placeholder="Enter material title..."
              className={`input input-bordered ${errors.title ? 'border-red-300 focus:border-red-500' : ''}`}
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              required
            />
            {errors.title && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.title}</span>
              </label>
            )}
          </div>

          {/* Description Field */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description *</span>
            </label>
            <textarea
              placeholder="Describe this material..."
              className={`textarea textarea-bordered h-24 ${errors.description ? 'border-red-300 focus:border-red-500' : ''}`}
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              required
            />
            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-red-500">{errors.description}</span>
              </label>
            )}
          </div>

          {/* Section Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Section</span>
            </label>
            <select
              className="select select-bordered"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            >
              <option value="course_materials">Course Materials</option>
              <option value="reference_books">Reference Books</option>
              <option value="articles_research">Articles/Research Papers</option>
            </select>
          </div>

          {/* Attach Link and PDF (Optional) - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Attach Link (Optional) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Attach Link (optional)</span>
              </label>
              <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-base-300">
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <Link className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium mb-2 block">Add a link to this material</span>
                  <input
                    type="url"
                    placeholder="Enter link URL..."
                    className="input input-bordered w-full"
                    value={formData.linkUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, linkUrl: e.target.value });
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Attach PDF (Optional) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Attach PDF (optional)</span>
              </label>
              <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-base-300">
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                  <Paperclip className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium mb-2 block">Add a pdf to this material</span>
                  <input
                    type="file"
                    accept=".pdf"
                    className="file-input file-input-bordered w-full"
                    onChange={(e) => {
                      setFormData({ ...formData, pdfFile: e.target.files[0] });
                    }}
                  />
                  <div className="text-xs text-base-content/60 mt-1">
                    Only PDF files are allowed (max 10MB)
                  </div>
                </div>
              </div>
            </div>
          </div>          

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMaterial;
