import { useState } from "react";
import { Plus, X, Tag, Pin, Link, Youtube, FileText, Globe, Eye } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const CreateInstitutionAnnouncement = ({
  institutionId,
  onAnnouncementCreated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    isPinned: false,
    externalLinks: [],
  });
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Function to fetch link preview
  const fetchLinkPreview = async (url) => {
    if (!url || !url.trim()) return;
    
    setPreviewLoading(true);
    setPreviewUrl(url);
    try {
      const response = await api.post('/link-preview', { url });
      setPreviewData(response.data);
    } catch (error) {
      console.error('Error fetching link preview:', error);
      setPreviewData({ error: 'Failed to load preview' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setLoading(true);
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await api.post(
        `/institution-announcements/${institutionId}`,
        {
          title: formData.title,
          content: formData.content,
          tags,
          externalLinks: formData.externalLinks,
          isPinned: formData.isPinned,
        }
      );

      toast.success("Announcement created successfully!");
      setFormData({ title: "", content: "", tags: "", isPinned: false, externalLinks: [] });
      setIsOpen(false);
      if (onAnnouncementCreated) {
        onAnnouncementCreated(response.data);
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(
        `Failed to create announcement: ${
          error.response?.data?.details || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: "", content: "", tags: "", isPinned: false, externalLinks: [] });
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="card bg-gradient-to-r from-[#00A2E8]/5 to-blue-500/5 border-2 border-dashed border-[#00A2E8]/30 hover:border-[#00A2E8]/50 hover:from-[#00A2E8]/10 hover:to-blue-500/10 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
      >
        <div className="card-body py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-primary">
                Post an Announcement
              </h3>
              <p className="text-sm text-base-content/60">
                Click to create a new institution-wide announcement
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
              Create Institution Announcement
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
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Title</span>
            </label>
            <input
              type="text"
              placeholder="Enter announcement title..."
              className="input input-bordered"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Content</span>
            </label>
            <textarea
              placeholder="Write your announcement content..."
              className="textarea textarea-bordered h-32"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (comma-separated)
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., important, news, urgent"
              className="input input-bordered"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>

                     <div className="form-control">
             <label className="label">
               <span className="label-text font-medium flex items-center gap-2">
                 <Link className="h-4 w-4" />
                 External Links
               </span>
             </label>
             <div className="space-y-4">
               {formData.externalLinks.map((link, index) => (
                 <div key={index} className="border border-base-300 rounded-lg p-4 bg-base-50">
                   <div className="flex gap-2 mb-3">
                     <select
                       className="select select-bordered select-sm"
                       value={link.type}
                       onChange={(e) => {
                         const newLinks = [...formData.externalLinks];
                         newLinks[index] = { ...newLinks[index], type: e.target.value };
                         setFormData({ ...formData, externalLinks: newLinks });
                       }}
                     >
                       <option value="youtube">YouTube</option>
                       <option value="document">Document</option>
                       <option value="website">Website</option>
                     </select>
                     <input
                       type="text"
                       placeholder="Link title"
                       className="input input-bordered input-sm flex-1"
                       value={link.title}
                       onChange={(e) => {
                         const newLinks = [...formData.externalLinks];
                         newLinks[index] = { ...newLinks[index], title: e.target.value };
                         setFormData({ ...formData, externalLinks: newLinks });
                       }}
                     />
                     <input
                       type="url"
                       placeholder="URL"
                       className="input input-bordered input-sm flex-1"
                       value={link.url}
                       onChange={(e) => {
                         const newLinks = [...formData.externalLinks];
                         newLinks[index] = { ...newLinks[index], url: e.target.value };
                         setFormData({ ...formData, externalLinks: newLinks });
                       }}
                     />
                     <button
                       type="button"
                       onClick={() => fetchLinkPreview(link.url)}
                       className="btn btn-sm btn-outline"
                       disabled={!link.url || previewLoading}
                     >
                       {previewLoading ? (
                         <span className="loading loading-spinner loading-xs"></span>
                       ) : (
                         <Eye className="h-3 w-3" />
                       )}
                       Preview
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         setFormData({
                           ...formData,
                           externalLinks: formData.externalLinks.filter((_, i) => i !== index)
                         });
                       }}
                       className="btn btn-sm btn-ghost btn-circle text-error"
                     >
                       <X className="h-3 w-3" />
                     </button>
                   </div>
                   
                   {/* Link Preview Section */}
                   {previewData && previewUrl === link.url && (
                     <div className="mt-3 p-3 bg-base-100 rounded border">
                       <div className="flex items-center justify-between mb-2">
                         <h4 className="text-sm font-medium">Link Preview</h4>
                         <button
                           type="button"
                           onClick={() => {
                             setPreviewData(null);
                             setPreviewUrl("");
                           }}
                           className="btn btn-xs btn-ghost"
                         >
                           <X className="h-2 w-2" />
                         </button>
                       </div>
                       
                       {previewData.error ? (
                         <div className="text-sm text-error">{previewData.error}</div>
                       ) : (
                         <div className="space-y-2">
                           {previewData.image && (
                             <img 
                               src={previewData.image} 
                               alt="Preview" 
                               className="w-full h-32 object-cover rounded"
                             />
                           )}
                           {previewData.title && (
                             <h5 className="text-sm font-medium">{previewData.title}</h5>
                           )}
                           {previewData.description && (
                             <p className="text-xs text-base-content/70 line-clamp-2">
                               {previewData.description}
                             </p>
                           )}
                           {previewData.siteName && (
                             <p className="text-xs text-base-content/50">{previewData.siteName}</p>
                           )}
                         </div>
                       )}
                     </div>
                   )}
                 </div>
               ))}
               <button
                 type="button"
                 onClick={() => {
                   setFormData({
                     ...formData,
                     externalLinks: [...formData.externalLinks, { type: 'website', title: '', url: '' }]
                   });
                 }}
                 className="btn btn-sm btn-primary"
               >
                 <Plus className="h-3 w-3" />
                 Add External Link
               </button>
             </div>
           </div>



          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text font-medium flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pin this announcement
              </span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={formData.isPinned}
                onChange={(e) =>
                  setFormData({ ...formData, isPinned: e.target.checked })
                }
              />
            </label>
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
              className="btn bg-[#00A2E8] hover:bg-[#0082c4] text-white border-none"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                "Create Announcement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInstitutionAnnouncement;
