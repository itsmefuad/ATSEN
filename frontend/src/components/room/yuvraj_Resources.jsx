import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, 
  Youtube, 
  FileText, 
  Link, 
  Trash2, 
  Edit3, 
  Download,
  Eye,
  GripVertical
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../lib/axios";

const YuvrajResources = ({ roomId, user }) => {
  console.log("YuvrajResources props - roomId:", roomId, "user:", user);
  
  const [resources, setResources] = useState({ videos: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState("youtube");
  const [formData, setFormData] = useState({ title: "", type: "youtube", url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [viewingResource, setViewingResource] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const isInstructor = user?.role === "instructor";
  const canManage = isInstructor;
  
  console.log("User role:", user?.role, "isInstructor:", isInstructor, "canManage:", canManage);

     useEffect(() => {
     fetchResources();
   }, [roomId]);



     const fetchResources = async () => {
     try {
       setLoading(true);
       console.log("Fetching resources for room:", roomId);
       console.log("Current user:", user);
       const apiUrl = `/yuvraj-resources/room/${roomId}/grouped`;
       console.log("API URL:", apiUrl);
       const response = await api.get(apiUrl);
       console.log("Resources response:", response.data);
       setResources(response.data);
     } catch (error) {
       console.error("Error fetching resources:", error);
       console.error("Error details:", error.response?.data || error.message);
       toast.error("Failed to fetch resources");
     } finally {
       setLoading(false);
     }
   };

     const handleSubmit = async (e) => {
     e.preventDefault();
     if (!formData.url.trim()) return;



         try {
       setSubmitting(true);
       
       let finalTitle = formData.title.trim();
       if (!finalTitle) {
         finalTitle = await generateTitleFromUrl(formData.url.trim(), formData.type);
       }

             const payload = {
         title: finalTitle,
         type: formData.type,
         url: formData.url.trim()
       };

      // Add optional fields only if available
      if (user?.id) {
        payload.uploadedBy = user.id;
      }

      if (user?.role === 'institution' && user?.id) {
        payload.institutionId = user.id;
      } else if (user?.institutions?.[0]) {
        payload.institutionId = user.institutions[0];
      }

      if (editingResource) {
        await api.put(`/yuvraj-resources/${editingResource._id}`, payload);
        toast.success("Resource updated successfully!");
      } else {
        await api.post(`/yuvraj-resources/room/${roomId}`, payload);
        toast.success("Resource added successfully!");
      }
      
             setFormData({ title: "", type: "youtube", url: "" });
       setEditingResource(null);
       setShowAddModal(false);
       fetchResources();
    } catch (error) {
      console.error("Error saving resource:", error);
      toast.error(editingResource ? "Failed to update resource" : "Failed to add resource");
    } finally {
      setSubmitting(false);
    }
  };

  const generateTitleFromUrl = async (url, type) => {
    if (type === "youtube") {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (videoId) {
        return `YouTube Video - ${videoId}`;
      }
    }
    return `New ${type.charAt(0).toUpperCase() + type.slice(1)} Resource`;
  };

  const getVideoId = (url) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId;
  };

  const getEmbedUrl = (url, type) => {
    switch (type) {
      case 'youtube':
        const videoId = getVideoId(url);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      case 'doc':
        return url.replace('/edit', '/preview');
      case 'slides':
        return url.replace('/edit', '/embed');
      case 'sheet':
        return url.replace('/edit', '/preview');
      default:
        return url;
    }
  };

  const handleDelete = async (resourceId) => {
    if (!canManage) return;
    
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await api.delete(`/yuvraj-resources/${resourceId}`);
        toast.success("Resource deleted successfully!");
        fetchResources();
      } catch (error) {
        console.error("Error deleting resource:", error);
        toast.error("Failed to delete resource");
      }
    }
  };

  const closeViewer = () => {
    setViewingResource(null);
  };

  const selectVideo = (video) => {
    setSelectedVideo(video);
    setSelectedDocument(null); // Clear document selection
  };

  const selectDocument = (document) => {
    setSelectedDocument(document);
    setSelectedVideo(null); // Clear video selection
  };

  const handleDragStart = (e, resourceId, type) => {
    if (!canManage) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ resourceId, type }));
  };

  const handleDragOver = (e) => {
    if (!canManage) return;
    e.preventDefault();
  };

  const handleDrop = async (e, targetType, targetIndex) => {
    if (!canManage) return;
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { resourceId, type } = data;
      
      if (type !== targetType) return;

      const items = Array.from(resources[type]);
      const sourceIndex = items.findIndex(item => item._id === resourceId);
      if (sourceIndex === -1) return;

      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(targetIndex, 0, reorderedItem);

      // Update local state immediately for smooth UX
      setResources(prev => ({
        ...prev,
        [type]: items
      }));

      // Update order in backend
      const updates = items.map((item, index) => ({
        id: item._id,
        order: index
      }));

      await Promise.all(
        updates.map(update => 
          api.put(`/yuvraj-resources/${update.id}`, { order: update.order })
        )
      );
      
      toast.success("Resource order updated!");
    } catch (error) {
      console.error("Error updating resource order:", error);
      toast.error("Failed to update resource order");
      fetchResources(); // Revert on error
    }
  };

  const renderResourceItem = (resource, index, type) => (
    <div
      key={resource._id}
      draggable={canManage}
      onDragStart={canManage ? (e) => handleDragStart(e, resource._id, type) : undefined}
      onDragOver={canManage ? (e) => handleDragOver(e) : undefined}
      onDrop={canManage ? (e) => handleDrop(e, type, index) : undefined}
      className={`p-3 border rounded-lg mb-2 bg-base-100 hover:bg-base-200 transition-colors ${canManage ? 'cursor-move' : 'cursor-default'}`}
    >
      <div className="flex items-center gap-3">
        {canManage && (
          <div className="cursor-grab text-base-content/50 hover:text-base-content">
            <GripVertical size={16} />
          </div>
        )}
        
                 <div className={`flex-1 min-w-0 cursor-pointer transition-colors ${
           (type === "videos" && selectedVideo?._id === resource._id) ||
           (type === "documents" && selectedDocument?._id === resource._id)
             ? "text-primary font-medium"
             : ""
         }`} onClick={() => {
           if (type === "videos") {
             selectVideo(resource);
           } else {
             selectDocument(resource);
           }
         }}>
           <h4 className="font-medium text-sm truncate">{resource.title}</h4>
           <p className="text-xs text-base-content/60 truncate">
             {resource.url}
           </p>
         </div>

                 <div className="flex items-center gap-2">
           {/* Selection indicator */}
           {(type === "videos" && selectedVideo?._id === resource._id) ||
            (type === "documents" && selectedDocument?._id === resource._id) ? (
             <div className="w-2 h-2 bg-primary rounded-full"></div>
           ) : null}
           
           {canManage ? (
             <>
               <button
                 onClick={() => {
                   setEditingResource(resource);
                   setFormData({
                     title: resource.title,
                     type: resource.type,
                     url: resource.url
                   });
                   setShowAddModal(true);
                 }}
                 className="btn btn-ghost btn-xs"
               >
                 <Edit3 size={14} />
               </button>
               <button
                 onClick={() => handleDelete(resource._id)}
                 className="btn btn-ghost btn-xs text-error hover:bg-error/10"
               >
                 <Trash2 size={14} />
               </button>
             </>
           ) : (
             <div className="flex items-center gap-1">
               <button
                 onClick={() => setViewingResource(resource)}
                 className="btn btn-ghost btn-xs"
                 title="View in popup"
               >
                 <Eye size={14} />
               </button>
               {resource.type !== 'youtube' && resource.type !== 'text' && (
                 <a
                   href={resource.url}
                   download
                   className="btn btn-ghost btn-xs text-primary"
                   title="Download document"
                 >
                   <Download size={14} />
                 </a>
               )}
             </div>
           )}
         </div>
      </div>
    </div>
  );

  const renderResourceSection = (type, title, icon, resources) => (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-header p-4 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-lg font-semibold">{title}</h3>
            <span className="badge badge-neutral">{resources.length}</span>
          </div>
                     {canManage && (
             <button
                                           onClick={() => {
                 // Set the correct resource type based on section
                 const resourceType = type === "videos" ? "youtube" : "pdf";
                 setSelectedType(resourceType);
                 setFormData({ title: "", type: resourceType, url: "" });
                 setEditingResource(null);
                 setShowAddModal(true);
               }}
               className="btn btn-primary btn-sm"
             >
               <Plus size={16} />
               Add {title.slice(0, -1)}
             </button>
           )}
        </div>
      </div>
      
      <div className="card-body p-0">
        <div className="p-4">
          {resources.length === 0 ? (
            <div className="text-center py-8 text-base-content/50">
              <p>No {title.toLowerCase()} yet</p>
              {canManage && (
                <p className="text-sm mt-1">Click "Add {title.slice(0, -1)}" to get started</p>
              )}
            </div>
          ) : (
            <>
              {/* Drop zone at the top */}
              {canManage && (
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, type, 0)}
                  className="h-2 bg-base-200 rounded mb-2 hover:bg-primary/20 transition-colors"
                />
              )}
              
              {resources.map((resource, index) => (
                <React.Fragment key={resource._id}>
                  {renderResourceItem(resource, index, type)}
                  
                  {/* Drop zone between items */}
                  {canManage && index < resources.length - 1 && (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, type, index + 1)}
                      className="h-2 bg-base-200 rounded my-2 hover:bg-primary/20 transition-colors"
                    />
                  )}
                </React.Fragment>
              ))}
              
              {/* Drop zone at the bottom */}
              {canManage && resources.length > 0 && (
                <div
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, type, resources.length)}
                  className="h-2 bg-base-200 rounded mt-2 hover:bg-primary/20 transition-colors"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  console.log("YuvrajResources render - loading:", loading, "resources:", resources, "user:", user);
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

         return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Additional Resources</h2>
            <p className="text-sm text-base-content/60 mt-1">
              Click on any resource to view it in the integrated player below
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchResources}
              className="btn btn-outline btn-sm"
            >
              🔄 Refresh
            </button>
            {canManage && (
              <button
                           onClick={() => {
                 setSelectedType("youtube");
                 setFormData({ title: "", type: "youtube", url: "" });
                 setEditingResource(null);
                 setShowAddModal(true);
               }}
              className="btn btn-primary"
            >
              <Plus size={18} />
              Add Resource
            </button>
            )}
          </div>
        </div>

        {/* Resource Summary for Students */}
        {!canManage && (resources.videos.length > 0 || resources.documents.length > 0) && (
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-red-500">
                <Youtube className="h-8 w-8" />
              </div>
              <div className="stat-title">Video Resources</div>
              <div className="stat-value text-red-500">{resources.videos.length}</div>
              <div className="stat-desc">Available for viewing</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-blue-500">
                <FileText className="h-8 w-8" />
              </div>
              <div className="stat-title">Document Resources</div>
              <div className="stat-value text-blue-500">{resources.documents.length}</div>
              <div className="stat-desc">Available for download</div>
            </div>
            
            {(selectedVideo || selectedDocument) && (
              <div className="stat">
                <div className="stat-figure text-green-500">
                  <Eye className="h-8 w-8" />
                </div>
                <div className="stat-title">Currently Viewing</div>
                <div className="stat-value text-green-500">✓</div>
                <div className="stat-desc">
                  {selectedVideo ? 'Video Player Active' : 'Document Viewer Active'}
                </div>
              </div>
            )}
          </div>
        )}

             <div className="grid gap-6">
         {renderResourceSection(
           "videos",
           "Video Resources",
           <Youtube className="h-5 w-5 text-red-500" />,
           resources.videos || []
         )}
         
         {renderResourceSection(
           "documents",
           "Document Resources", 
           <FileText className="h-5 w-5 text-blue-500" />,
           resources.documents || []
         )}
       </div>

             {/* Integrated Video Player Section */}
      {selectedVideo && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-header p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold">Video Player</h3>
                <span className="badge badge-error badge-sm">YOUTUBE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-sm">
                    ⋮
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <a 
                        href={selectedVideo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Youtube className="h-4 w-4" />
                        Open on YouTube
                      </a>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedVideo.url);
                          toast.success('Video URL copied to clipboard!');
                        }}
                        className="flex items-center gap-2"
                      >
                        📋 Copy URL
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          const videoId = getVideoId(selectedVideo.url);
                          const shareUrl = `https://youtu.be/${videoId}`;
                          navigator.clipboard.writeText(shareUrl);
                          toast.success('Short URL copied to clipboard!');
                        }}
                        className="flex items-center gap-2"
                      >
                        🔗 Copy Short URL
                      </button>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="btn btn-ghost btn-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-4">
            <div className="aspect-video w-full border border-base-300 rounded-lg overflow-hidden bg-black">
              <iframe
                src={getEmbedUrl(selectedVideo.url, selectedVideo.type)}
                title={selectedVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-lg mb-2">{selectedVideo.title}</h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href={selectedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-error btn-sm"
                >
                  <Youtube className="h-4 w-4 mr-1" />
                  Open on YouTube
                </a>
                <button
                  onClick={() => {
                    const videoId = getVideoId(selectedVideo.url);
                    const shareUrl = `https://youtu.be/${videoId}`;
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Short URL copied!');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  🔗 Share
                </button>
                <a
                  href={`https://www.youtube.com/watch?v=${getVideoId(selectedVideo.url)}&t=0s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  ⏰ Watch from start
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Integrated Document Viewer Section */}
      {selectedDocument && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-header p-4 border-b border-base-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Document Viewer</h3>
                <span className="badge badge-info badge-sm">{selectedDocument.type.toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-sm">
                    <Download className="h-4 w-4" />
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <a 
                        href={selectedDocument.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Open in new tab
                      </a>
                    </li>
                    {selectedDocument.type !== 'youtube' && selectedDocument.type !== 'text' && (
                      <li>
                        <a 
                          href={selectedDocument.url} 
                          download 
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download document
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="btn btn-ghost btn-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
          <div className="card-body p-4">
            <div className="w-full h-96 border border-base-300 rounded-lg overflow-hidden">
              {selectedDocument.type === 'pdf' ? (
                <iframe
                  src={selectedDocument.url}
                  title={selectedDocument.title}
                  className="w-full h-full"
                  frameBorder="0"
                />
              ) : selectedDocument.type === 'doc' || selectedDocument.type === 'slides' || selectedDocument.type === 'sheet' ? (
                <iframe
                  src={getEmbedUrl(selectedDocument.url, selectedDocument.type)}
                  title={selectedDocument.title}
                  className="w-full h-full"
                  frameBorder="0"
                />
              ) : selectedDocument.type === 'link' ? (
                <iframe
                  src={selectedDocument.url}
                  title={selectedDocument.title}
                  className="w-full h-full"
                  frameBorder="0"
                />
              ) : (
                <div className="p-6 bg-base-200 h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <FileText className="h-12 w-12 text-base-content/40 mx-auto mb-4" />
                    <p className="text-sm text-base-content/70 mb-3">Text Content:</p>
                    <div className="p-4 bg-base-100 rounded-lg text-left">
                      <p className="whitespace-pre-wrap text-sm">{selectedDocument.content || selectedDocument.url}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-lg mb-2">{selectedDocument.title}</h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href={selectedDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Open in new tab
                </a>
                {selectedDocument.type !== 'youtube' && selectedDocument.type !== 'text' && (
                  <a
                    href={selectedDocument.url}
                    download
                    className="btn btn-secondary btn-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedDocument.url);
                    toast.success('URL copied to clipboard!');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  📋 Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

                           {/* Add/Edit Modal */}
       {showAddModal && (
         <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">
              {editingResource ? "Edit Resource" : "Add New Resource"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Resource Type</span>
                </label>
                                 <select
                   value={formData.type}
                   onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                   className="select select-bordered w-full"
                   disabled={!!editingResource}
                 >
                  <option value="youtube">YouTube Video</option>
                  <option value="pdf">PDF Document</option>
                  <option value="doc">Google Doc</option>
                  <option value="slides">Google Slides</option>
                  <option value="sheet">Google Sheet</option>
                  <option value="link">Web Link</option>
                  <option value="text">Text Content</option>
                </select>
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Title (Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Resource title or leave empty for auto-generation"
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">URL or Content</span>
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Enter URL or content"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingResource(null);
                    setFormData({ title: "", type: "youtube", url: "" });
                  }}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : editingResource ? (
                    "Update Resource"
                  ) : (
                    "Add Resource"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
       )}

       {/* Resource Viewer Modal */}
       {viewingResource && (
                  <div className="modal modal-open" onClick={closeViewer}>
           <div className="modal-box max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-lg">{viewingResource.title}</h3>
               <button
                 onClick={closeViewer}
                 className="btn btn-ghost btn-sm"
               >
                 ✕
               </button>
             </div>
             
             <div className="space-y-4">
               {viewingResource.type === 'youtube' ? (
                 <div className="aspect-video w-full">
                   <iframe
                     src={getEmbedUrl(viewingResource.url, viewingResource.type)}
                     title={viewingResource.title}
                     className="w-full h-full rounded-lg"
                     frameBorder="0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                   />
                 </div>
               ) : viewingResource.type === 'pdf' ? (
                 <div className="w-full h-96">
                   <iframe
                     src={viewingResource.url}
                     title={viewingResource.title}
                     className="w-full h-full rounded-lg"
                     frameBorder="0"
                   />
                 </div>
               ) : viewingResource.type === 'doc' || viewingResource.type === 'slides' || viewingResource.type === 'sheet' ? (
                 <div className="w-full h-96">
                   <iframe
                     src={getEmbedUrl(viewingResource.url, viewingResource.type)}
                     title={viewingResource.title}
                     className="w-full h-full rounded-lg"
                     frameBorder="0"
                   />
                 </div>
               ) : viewingResource.type === 'link' ? (
                 <div className="w-full h-96">
                   <iframe
                     src={viewingResource.url}
                     title={viewingResource.title}
                     className="w-full h-full rounded-lg"
                     frameBorder="0"
                   />
                 </div>
               ) : (
                 <div className="p-4 bg-base-200 rounded-lg">
                   <p className="text-sm text-base-content/70 mb-2">Content:</p>
                   <p className="whitespace-pre-wrap">{viewingResource.content || viewingResource.url}</p>
                 </div>
               )}
               
               <div className="flex justify-between items-center text-sm text-base-content/60">
                 <span>Type: {viewingResource.type}</span>
                 <div className="flex gap-2">
                   <a
                     href={viewingResource.url}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="link link-primary"
                   >
                     Open in new tab
                   </a>
                   {viewingResource.type !== 'youtube' && (
                     <a
                       href={viewingResource.url}
                       download
                       className="link link-secondary"
                     >
                       Download
                     </a>
                   )}
                 </div>
               </div>
               
               <div className="modal-action">
                 <button
                   onClick={closeViewer}
                   className="btn btn-primary"
                 >
                   Close
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };

export default YuvrajResources;
