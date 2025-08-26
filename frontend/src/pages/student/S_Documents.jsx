import { useState, useEffect } from "react";
import { FileText, Clock, CheckCircle, Truck, Package, AlertTriangle } from "lucide-react";
import Navbar from "../../components/Navbar";
import { getStudentDocuments, updateStudentDocumentStatus } from "../../services/documentService";
import toast from "react-hot-toast";

const S_Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await getStudentDocuments();
      setDocuments(response.documents);
    } catch (error) {
      toast.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReceived = async (documentId) => {
    try {
      await updateStudentDocumentStatus(documentId);
      toast.success("Document marked as received!");
      fetchDocuments(); // Refresh the list
    } catch (error) {
      toast.error(error.message || "Failed to update document status");
    }
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
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === "all") return true;
    if (filter === "pending") return !["Document Received"].includes(doc.status);
    if (filter === "completed") return doc.status === "Document Received";
    if (filter === "urgent") return doc.urgency === "Urgent";
    return true;
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Document Requests</h1>
            <p className="text-gray-600">Track your document requests and their status</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-sky-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-amber-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {documents.filter(doc => !["Document Received"].includes(doc.status)).length}
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
                    {documents.filter(doc => doc.status === "Document Received").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {documents.filter(doc => doc.urgency === "Urgent").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex space-x-2">
              {[
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "completed", label: "Completed" },
                { key: "urgent", label: "Urgent" }
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

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocuments.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">
                  {filter === "all" 
                    ? "You haven't made any document requests yet."
                    : `No ${filter} document requests found.`
                  }
                </p>
              </div>
            ) : (
              filteredDocuments.map(document => (
                <div key={document._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {document.documentType}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(document.urgency)}`}>
                          {document.urgency}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{document.description}</p>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span>Institution: {document.institution.name}</span>
                        <span className="mx-2">•</span>
                        <span>Requested on {new Date(document.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center">
                        {getStatusIcon(document.status)}
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status}
                        </span>
                      </div>
                    </div>

                    <div className="ml-6">
                      {document.status === "Dispatched" && (
                        <button
                          onClick={() => handleMarkAsReceived(document._id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                        >
                          Mark as Received
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      {["Requested", "Received", "Approved", "Dispatched", "Document Received"].map((status, index) => {
                        const isCompleted = document.statusHistory?.some(h => h.status === status) || 
                                           (status === document.status);
                        const isCurrent = status === document.status;
                        
                        return (
                          <div key={status} className="flex items-center">
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
    </div>
  );
};

export default S_Documents;
