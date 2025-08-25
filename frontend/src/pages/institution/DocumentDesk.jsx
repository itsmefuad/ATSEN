import { useState, useEffect } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Truck, 
  Package, 
  AlertTriangle,
  Filter,
  Calendar,
  User
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { 
  getInstitutionDocuments, 
  updateInstitutionDocumentStatus,
  getDocumentStatistics 
} from "../../services/documentService";
import toast from "react-hot-toast";

const DocumentDesk = () => {
  const [documents, setDocuments] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    institutionNotes: "",
    estimatedDelivery: ""
  });

  useEffect(() => {
    fetchDocuments();
    fetchStatistics();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await getInstitutionDocuments();
      setDocuments(response.documents);
    } catch (error) {
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await getDocumentStatistics();
      setStatistics(response);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const handleStatusUpdate = async (documentId, statusData) => {
    try {
      await updateInstitutionDocumentStatus(documentId, statusData);
      toast.success("Document status updated successfully!");
      fetchDocuments();
      fetchStatistics();
      setShowUpdateModal(false);
      setSelectedDocument(null);
    } catch (error) {
      toast.error(error.message || "Failed to update document status");
    }
  };

  const openUpdateModal = (document) => {
    setSelectedDocument(document);
    setUpdateData({
      status: getNextStatus(document.status),
      institutionNotes: document.institutionNotes || "",
      estimatedDelivery: document.estimatedDelivery ? 
        new Date(document.estimatedDelivery).toISOString().split('T')[0] : ""
    });
    setShowUpdateModal(true);
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      "Requested": "Received",
      "Received": "Approved", 
      "Approved": "Dispatched"
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  const canUpdateStatus = (status) => {
    return ["Requested", "Received", "Approved"].includes(status);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Requested":
        return <Clock className="h-5 w-5 text-gray-500" />;
      case "Received":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "Approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Dispatched":
        return <Truck className="h-5 w-5 text-amber-500" />;
      case "Document Received":
        return <Package className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Requested":
        return "text-gray-600 bg-gray-100";
      case "Received":
        return "text-blue-600 bg-blue-100";
      case "Approved":
        return "text-green-600 bg-green-100";
      case "Dispatched":
        return "text-amber-600 bg-amber-100";
      case "Document Received":
        return "text-green-700 bg-green-200";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Standard":
        return "text-gray-600 bg-gray-100";
      case "Priority":
        return "text-amber-600 bg-amber-100";
      case "Urgent":
        return "text-red-600 bg-red-100 border-red-200";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const statusMatch = filter === "all" || doc.status === filter;
    const urgencyMatch = urgencyFilter === "all" || doc.urgency === urgencyFilter;
    return statusMatch && urgencyMatch;
  });

  // Sort urgent documents first
  const sortedDocuments = filteredDocuments.sort((a, b) => {
    if (a.urgency === "Urgent" && b.urgency !== "Urgent") return -1;
    if (b.urgency === "Urgent" && a.urgency !== "Urgent") return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Desk</h1>
            <p className="text-gray-600">Manage student document requests and track their progress</p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-sky-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.totalDocuments}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Today</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.todayRequests}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgent</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.urgentCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-amber-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.statusStatistics
                        .filter(s => !["Document Received"].includes(s._id))
                        .reduce((sum, s) => sum + s.count, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics.statusStatistics
                        .find(s => s._id === "Document Received")?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <div className="flex space-x-2">
                {[
                  { key: "all", label: "All" },
                  { key: "Requested", label: "Requested" },
                  { key: "Received", label: "Received" },
                  { key: "Approved", label: "Approved" },
                  { key: "Dispatched", label: "Dispatched" },
                  { key: "Document Received", label: "Completed" }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === filterOption.key
                        ? "bg-sky-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Urgency</label>
              <div className="flex space-x-2">
                {[
                  { key: "all", label: "All" },
                  { key: "Urgent", label: "Urgent" },
                  { key: "Priority", label: "Priority" },
                  { key: "Standard", label: "Standard" }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    onClick={() => setUrgencyFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      urgencyFilter === filterOption.key
                        ? "bg-sky-500 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {sortedDocuments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">No document requests match your current filters.</p>
              </div>
            ) : (
              sortedDocuments.map(document => (
                <div 
                  key={document._id} 
                  className={`bg-white rounded-lg shadow-sm border p-6 ${
                    document.urgency === "Urgent" 
                      ? "border-red-200 bg-red-50" 
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {document.documentType}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(document.urgency)}`}>
                          {document.urgency}
                        </span>
                        {document.urgency === "Urgent" && (
                          <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{document.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <User className="h-4 w-4 mr-1" />
                        <span>{document.student.name}</span>
                        <span className="mx-2">•</span>
                        <span>{document.student.email}</span>
                        <span className="mx-2">•</span>
                        <span>Requested on {new Date(document.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center">
                        {getStatusIcon(document.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </div>

                      {document.institutionNotes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Notes:</strong> {document.institutionNotes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6">
                      {canUpdateStatus(document.status) && (
                        <button
                          onClick={() => openUpdateModal(document)}
                          className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm"
                        >
                          Update Status
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 overflow-x-auto">
                      {["Requested", "Received", "Approved", "Dispatched", "Document Received"].map((status, index) => {
                        const isCompleted = document.statusHistory?.some(h => h.status === status) || 
                                           (status === document.status);
                        const isCurrent = status === document.status;
                        
                        return (
                          <div key={status} className="flex items-center whitespace-nowrap">
                            <div className={`w-3 h-3 rounded-full ${
                              isCompleted 
                                ? isCurrent 
                                  ? "bg-sky-500" 
                                  : "bg-green-500"
                                : "bg-gray-300"
                            }`}></div>
                            <span className={`ml-2 text-xs ${
                              isCompleted ? "text-gray-900" : "text-gray-500"
                            }`}>
                              {status}
                            </span>
                            {index < 4 && <div className="w-8 h-px bg-gray-300 ml-2"></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Update Document Status
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="Received">Received</option>
                    <option value="Approved">Approved</option>
                    <option value="Dispatched">Dispatched</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institution Notes (Optional)
                  </label>
                  <textarea
                    value={updateData.institutionNotes}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, institutionNotes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                    placeholder="Add any notes for the student..."
                  />
                </div>

                {updateData.status === "Dispatched" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={updateData.estimatedDelivery}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedDocument._id, updateData)}
                  className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDesk;
