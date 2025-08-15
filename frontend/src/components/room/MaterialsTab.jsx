import { useState, useEffect } from "react";

const MaterialsTab = ({ roomId }) => {
  const [materials, setMaterials] = useState({
    course_materials: [],
    reference_books: [],
    articles_research_papers: []
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    type: "course_outline",
    category: "course_materials",
    author: "",
    fileUrl: "",
    fileName: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [roomId]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      // Mock data based on the UI image
      const mockMaterials = {
        course_materials: [
          { _id: "1", title: "Course Outline", type: "course_outline", author: "", createdAt: new Date().toISOString() },
          { _id: "2", title: "Course policy", type: "course_policy", author: "", createdAt: new Date().toISOString() }
        ],
        reference_books: [
          { _id: "3", title: "Book 1", type: "reference_book", author: "writer", createdAt: new Date().toISOString() },
          { _id: "4", title: "Book 2", type: "reference_book", author: "writer", createdAt: new Date().toISOString() },
          { _id: "5", title: "Book 3", type: "reference_book", author: "writer", createdAt: new Date().toISOString() }
        ],
        articles_research_papers: [
          { _id: "6", title: "Paper 1", type: "research_paper", author: "author", createdAt: new Date().toISOString() },
          { _id: "7", title: "Article 1", type: "research_paper", author: "author", createdAt: new Date().toISOString() }
        ]
      };
      setMaterials(mockMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    try {
      // Mock adding material - replace with actual API call
      const newMaterialData = {
        _id: Date.now().toString(),
        title: newMaterial.title,
        description: newMaterial.description,
        type: newMaterial.type,
        category: newMaterial.category,
        author: newMaterial.author,
        fileUrl: newMaterial.fileUrl,
        fileName: newMaterial.fileName,
        instructor: { name: "Teacher Name" },
        createdAt: new Date().toISOString()
      };
      
      setMaterials(prev => ({
        ...prev,
        [newMaterial.category]: [...prev[newMaterial.category], newMaterialData]
      }));
      
      setNewMaterial({
        title: "",
        description: "",
        type: "course_outline",
        category: "course_materials",
        author: "",
        fileUrl: "",
        fileName: ""
      });
      setShowUploadForm(false);
    } catch (error) {
      console.error("Error uploading material:", error);
    }
  };

  const handleDeleteMaterial = async (materialId, category) => {
    try {
      // Mock deleting material - replace with actual API call
      setMaterials(prev => ({
        ...prev,
        [category]: prev[category].filter(material => material._id !== materialId)
      }));
    } catch (error) {
      console.error("Error deleting material:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading materials...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Materials Button */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <button
          onClick={() => setShowUploadForm(true)}
          className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          Upload materials
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Upload New Material</h3>
          <form onSubmit={handleUploadMaterial} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Material title"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newMaterial.category}
                onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="course_materials">Course Materials</option>
                <option value="reference_books">Reference Books</option>
                <option value="articles_research_papers">Articles/Research Papers</option>
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newMaterial.type}
                onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="course_outline">Course Outline</option>
                <option value="course_policy">Course Policy</option>
                <option value="reference_book">Reference Book</option>
                <option value="research_paper">Research Paper</option>
                <option value="lecture_note">Lecture Note</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Author (optional)"
                value={newMaterial.author}
                onChange={(e) => setNewMaterial({...newMaterial, author: e.target.value})}
                className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <textarea
              placeholder="Description (optional)"
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
              className="w-full p-3 border rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials Display */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
        {/* Course Materials Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Course materials:</h3>
          <div className="space-y-2">
            {materials.course_materials.map((material) => (
              <MaterialItem 
                key={material._id} 
                material={material} 
                onDelete={() => handleDeleteMaterial(material._id, "course_materials")}
              />
            ))}
            {materials.course_materials.length === 0 && (
              <p className="text-gray-500 italic">No course materials uploaded yet.</p>
            )}
          </div>
        </div>

        <hr className="border-gray-300 my-6" />

        {/* Reference Books Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Reference books:</h3>
          <div className="space-y-2">
            {materials.reference_books.map((material) => (
              <MaterialItem 
                key={material._id} 
                material={material} 
                onDelete={() => handleDeleteMaterial(material._id, "reference_books")}
              />
            ))}
            {materials.reference_books.length === 0 && (
              <p className="text-gray-500 italic">No reference books added yet.</p>
            )}
          </div>
        </div>

        <hr className="border-gray-300 my-6" />

        {/* Articles/Research Papers Section */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Articles/Research papers:</h3>
          <div className="space-y-2">
            {materials.articles_research_papers.map((material) => (
              <MaterialItem 
                key={material._id} 
                material={material} 
                onDelete={() => handleDeleteMaterial(material._id, "articles_research_papers")}
              />
            ))}
            {materials.articles_research_papers.length === 0 && (
              <p className="text-gray-500 italic">No articles or research papers added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MaterialItem = ({ material, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{material.title}</h4>
          {material.author && (
            <p className="text-sm text-gray-600">{material.author}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete material"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MaterialsTab;