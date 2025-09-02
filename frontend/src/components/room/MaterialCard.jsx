import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  File,
  Link,
  Trash2,
  Edit,
  Download,
  Calendar,
  User,
  X,
  Paperclip,
  Eye,
} from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const MaterialCard = ({ material, onUpdate, onDelete, isStudent = false }) => {
  const [isExpanded, setIsExpanded] = useState(material.isExpanded || false);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: material.title,
    description: material.description,
    section: material.section,
    linkUrl: material.fileUrl || "",
    pdfFile: null,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const handleToggleExpansion = async () => {
    try {
      const response = await api.patch(`/materials/${material._id}/toggle`);
      setIsExpanded(!isExpanded);
      onUpdate(response.data);
    } catch (error) {
      console.error("Error toggling material expansion:", error);
      toast.error("Failed to toggle material expansion");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this material?")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/materials/${material._id}`);
      toast.success("Material deleted successfully!");
      onDelete(material._id);
    } catch (error) {
      console.error("Error deleting material:", error);
      toast.error("Failed to delete material");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
    setEditFormData({
      title: material.title,
      description: material.description,
      section: material.section,
      attachmentType: material.fileType === "link" ? "link" : "",
      attachmentData: material.fileUrl || "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setEditErrors({});

    // Validate form
    const newErrors = {};

    if (!editFormData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!editFormData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      return;
    }

    setEditLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", editFormData.title);
      formDataToSend.append("description", editFormData.description);
      formDataToSend.append("section", editFormData.section);
      formDataToSend.append("fileName", editFormData.title);

      // Add link if provided
      if (editFormData.linkUrl.trim()) {
        formDataToSend.append("fileUrl", editFormData.linkUrl);
      }

      // Add PDF if provided
      if (editFormData.pdfFile) {
        formDataToSend.append("pdfFile", editFormData.pdfFile);
      }

      const response = await api.put(
        `/materials/${material._id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Material updated successfully!");
      onUpdate(response.data);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating material:", error);
      toast.error(
        `Failed to update material: ${
          error.response?.data?.details || error.message
        }`
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditErrors({});
    setEditFormData({
      title: material.title,
      description: material.description,
      section: material.section,
      linkUrl: material.fileUrl || "",
      pdfFile: null,
    });
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "link":
        return <Link className="h-5 w-5 text-green-500" />;
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "link_and_pdf":
        return (
          <div className="flex gap-1">
            <Link className="h-4 w-4 text-green-500" />
            <File className="h-4 w-4 text-red-500" />
          </div>
        );
      case "text":
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="card bg-base-100 border border-base-300 hover:shadow-lg transition-all duration-300">
        <div className="card-body p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer"
              onClick={handleToggleExpansion}
            >
              <div className="flex items-center justify-center w-6 h-6">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>

              <div className="flex items-center gap-2">
                {getFileIcon(material.fileType)}
                <div>
                  <h3 className="font-semibold text-base-content">
                    {material.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isStudent && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    className="btn btn-ghost btn-sm"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    className="btn btn-ghost btn-sm text-error"
                    title="Delete"
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="border-t pt-4">
                <div className="text-base-content/80 mb-3 whitespace-pre-wrap">
                  {material.description.split("\n").map((line, index) => {
                    // Check if line contains a URL
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    const parts = line.split(urlRegex);

                    return (
                      <div key={index} className={line === "" ? "h-4" : ""}>
                        {parts.map((part, partIndex) => {
                          if (urlRegex.test(part)) {
                            return (
                              <a
                                key={partIndex}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00A2E8] hover:text-[#0082c4] underline"
                              >
                                {part}
                              </a>
                            );
                          }
                          return part;
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* File Preview - For link and PDF materials in all sections */}
                {(material.fileType === "link" ||
                  material.fileType === "pdf" ||
                  material.fileType === "link_and_pdf") && (
                  <div className="bg-base-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(material.fileType)}
                      <div className="flex-1">
                        <p className="font-medium">{material.title}</p>
                        <p className="text-sm text-base-content/60">
                          {formatDate(material.createdAt)}
                        </p>
                      </div>
                      {/* Show buttons for all sections */}
                      <div className="flex gap-2">
                        {/* View Link button - only if link exists */}
                        {(material.fileType === "link" ||
                          material.fileType === "link_and_pdf") &&
                          material.fileUrl && (
                            <button
                              onClick={() =>
                                window.open(material.fileUrl, "_blank")
                              }
                              className="btn bg-[#00A2E8] hover:bg-[#0082c4] text-white border-none btn-sm"
                            >
                              <Link className="h-4 w-4 mr-1" />
                              View Link
                            </button>
                          )}

                        {/* View PDF button - only if PDF exists */}
                        {(material.fileType === "pdf" ||
                          material.fileType === "link_and_pdf") &&
                          material.filePath && (
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await api.get(
                                      `/materials/${material._id}/download`
                                    );
                                    // Open the direct URL in new tab
                                    window.open(response.data.downloadUrl, '_blank');
                                  } catch (error) {
                                    console.error("View error:", error);
                                    toast.error("Failed to view PDF");
                                  }
                                }}
                                className="btn btn-primary btn-sm"
                                title="View PDF in new tab"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View PDF
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await api.get(
                                      `/materials/${material._id}/download`
                                    );
                                    // Create a temporary link to trigger download
                                    const link = document.createElement("a");
                                    link.href = response.data.downloadUrl;
                                    link.setAttribute(
                                      "download",
                                      material.originalFileName ||
                                        material.fileName
                                    );
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                    toast.success("Download started!");
                                  } catch (error) {
                                    console.error("Download error:", error);
                                    toast.error("Failed to download PDF");
                                  }
                                }}
                                className="btn btn-secondary btn-sm"
                                title="Download PDF to your device"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-sm text-base-content/60 mt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(material.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Teacher</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#00A2E8]/10 rounded-full">
                    <Edit className="h-5 w-5 text-[#00A2E8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#00A2E8]">
                    Edit Material
                  </h3>
                </div>
                <button
                  onClick={handleEditCancel}
                  className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Title Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Title *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter material title..."
                    className={`input input-bordered ${
                      editErrors.title
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                    value={editFormData.title}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        title: e.target.value,
                      });
                      if (editErrors.title)
                        setEditErrors({ ...editErrors, title: null });
                    }}
                    required
                  />
                  {editErrors.title && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">
                        {editErrors.title}
                      </span>
                    </label>
                  )}
                </div>

                {/* Description Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Description *
                    </span>
                  </label>
                  <textarea
                    placeholder="Describe this material..."
                    className={`textarea textarea-bordered h-24 ${
                      editErrors.description
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                    value={editFormData.description}
                    onChange={(e) => {
                      setEditFormData({
                        ...editFormData,
                        description: e.target.value,
                      });
                      if (editErrors.description)
                        setEditErrors({ ...editErrors, description: null });
                    }}
                    required
                  />
                  {editErrors.description && (
                    <label className="label">
                      <span className="label-text-alt text-red-500">
                        {editErrors.description}
                      </span>
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
                    value={editFormData.section}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        section: e.target.value,
                      })
                    }
                  >
                    <option value="course_materials">Course Materials</option>
                    <option value="reference_books">Reference Books</option>
                    <option value="articles_research">
                      Articles/Research Papers
                    </option>
                  </select>
                </div>

                {/* Attach Link (Optional) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Attach Link (optional)
                    </span>
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-base-300">
                    <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                      <Link className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium mb-2 block">
                        Add a link to this material
                      </span>
                      <input
                        type="url"
                        placeholder="Enter link URL..."
                        className="input input-bordered w-full"
                        value={editFormData.linkUrl}
                        onChange={(e) => {
                          setEditFormData({
                            ...editFormData,
                            linkUrl: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Attach PDF (Optional) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Attach PDF (optional)
                    </span>
                  </label>
                  <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-base-300">
                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                      <Paperclip className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium mb-2 block">
                        Add a pdf to this material
                      </span>
                      <input
                        type="file"
                        accept=".pdf"
                        className="file-input file-input-bordered w-full"
                        onChange={(e) => {
                          setEditFormData({
                            ...editFormData,
                            pdfFile: e.target.files[0],
                          });
                        }}
                      />
                      <div className="text-xs text-base-content/60 mt-1">
                        {material.fileType === "pdf" ||
                        material.fileType === "link_and_pdf"
                          ? "Leave empty to keep current PDF, or select new file to replace"
                          : "Only PDF files are allowed (max 10MB)"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="btn btn-ghost"
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    disabled={editLoading}
                  >
                    {editLoading ? "Updating..." : "Update Material"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MaterialCard;
