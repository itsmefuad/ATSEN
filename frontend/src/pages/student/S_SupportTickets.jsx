import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router";
import { 
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  FileText,
  Star,
  ArrowLeft,
  Filter,
  Eye,
  EyeOff,
  ThumbsUp
} from "lucide-react";
import Navbar from "../../components/Navbar";
import api from "../../lib/axios";
import toast from "react-hot-toast";

const S_SupportTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    institution: "",
  });
  const [feedback, setFeedback] = useState({});
  const [showFeedbackForm, setShowFeedbackForm] = useState(null);

  const statusOptions = [
    { value: "", label: "All Statuses", color: "gray" },
    { value: "open", label: "Open", color: "blue" },
    { value: "in_progress", label: "In Progress", color: "yellow" },
    { value: "addressed", label: "Addressed", color: "green" },
    { value: "resolved", label: "Resolved", color: "gray" },
  ];

  useEffect(() => {
    if (!user?._id) return;
    fetchTickets();
  }, [user, filters]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      });

      const response = await api.get(`/support/students/${user._id}/tickets?${params}`);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsResolved = async (ticketId) => {
    try {
      const feedbackData = feedback[ticketId];
      await api.patch(`/support/tickets/${ticketId}/resolve`, feedbackData);
      toast.success("Ticket marked as resolved");
      setShowFeedbackForm(null);
      setFeedback(prev => ({ ...prev, [ticketId]: {} }));
      fetchTickets();
    } catch (error) {
      console.error("Error resolving ticket:", error);
      toast.error("Failed to resolve ticket");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "addressed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      addressed: "bg-green-100 text-green-800",
      resolved: "bg-gray-100 text-gray-800",
    };
    
    return `px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || "bg-gray-100 text-gray-800"}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "high": return "text-orange-600";
      case "urgent": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const uniqueInstitutions = [...new Set(tickets.map(t => t.institution.name))];

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading support tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Support Tickets</h1>
              <p className="text-gray-600">Track your support requests and communications</p>
            </div>
            
            <Link
              to="/student/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {statusOptions.slice(1).map((status) => {
            const count = tickets.filter(t => t.status === status.value).length;
            return (
              <div key={status.value} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{status.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-${status.color}-100`}>
                    {getStatusIcon(status.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.institution}
                onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Institutions</option>
                {uniqueInstitutions.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No support tickets</h3>
              <p className="text-gray-500 mb-6">
                {Object.values(filters).some(v => v) 
                  ? "No tickets match your current filters."
                  : "You haven't created any support tickets yet."
                }
              </p>
              <Link
                to="/student/dashboard"
                className="inline-flex items-center px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
              >
                Go to Institutions
              </Link>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket._id} className="bg-white rounded-lg border shadow-sm">
                {/* Ticket Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                        <span className={getStatusBadge(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority} priority
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span>{ticket.institution.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{ticket.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.status === "addressed" && (
                        <button
                          onClick={() => setShowFeedbackForm(ticket._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                      
                      <button
                        onClick={() => setExpandedTicket(
                          expandedTicket === ticket._id ? null : ticket._id
                        )}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                      >
                        {expandedTicket === ticket._id ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedTicket === ticket._id && (
                  <div className="p-4 bg-gray-50">
                    {/* Original Message */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Your Message</h4>
                      <div className="bg-white rounded p-3 border">
                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                      </div>
                    </div>

                    {/* Institution Response */}
                    {ticket.institutionResponse?.message ? (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Institution Response</h4>
                        <div className="bg-blue-50 rounded p-3 border border-blue-200">
                          <p className="text-gray-700 whitespace-pre-wrap">{ticket.institutionResponse.message}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            Responded by {ticket.institutionResponse.respondedBy} on{' '}
                            {formatDate(ticket.institutionResponse.respondedAt)}
                          </div>
                        </div>
                      </div>
                    ) : ticket.status !== "open" ? (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-700 text-sm">
                          Your request is being processed. You'll receive a response soon.
                        </p>
                      </div>
                    ) : null}

                    {/* Status Messages */}
                    {ticket.status === "addressed" && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-700 text-sm">
                          ✓ The institution has marked this issue as addressed. 
                          Please review their response and mark as resolved if your issue is fixed.
                        </p>
                      </div>
                    )}

                    {ticket.status === "resolved" && (
                      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-gray-700 text-sm">
                          ✓ This ticket was resolved on {formatDate(ticket.resolvedAt)}.
                        </p>
                        {ticket.studentFeedback && (
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Your feedback: {ticket.studentFeedback.comment}</p>
                            {ticket.studentFeedback.rating && (
                              <div className="flex items-center mt-1">
                                <span className="mr-1">Rating:</span>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < ticket.studentFeedback.rating 
                                        ? "text-yellow-400 fill-current" 
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback Form */}
                    {showFeedbackForm === ticket._id && (
                      <div className="mt-4 p-4 border border-green-200 rounded-lg bg-green-50">
                        <h4 className="font-medium text-gray-900 mb-3">Mark as Resolved</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Rate your experience (optional)
                            </label>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => setFeedback(prev => ({
                                    ...prev,
                                    [ticket._id]: { ...prev[ticket._id], rating }
                                  }))}
                                  className="p-1 hover:bg-green-100 rounded transition-colors"
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      rating <= (feedback[ticket._id]?.rating || 0)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Additional feedback (optional)
                            </label>
                            <textarea
                              value={feedback[ticket._id]?.comment || ""}
                              onChange={(e) => setFeedback(prev => ({
                                ...prev,
                                [ticket._id]: { ...prev[ticket._id], comment: e.target.value }
                              }))}
                              placeholder="How was your support experience?"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                              rows={3}
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkAsResolved(ticket._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                            >
                              <ThumbsUp className="h-4 w-4" />
                              Mark Resolved
                            </button>
                            <button
                              onClick={() => setShowFeedbackForm(null)}
                              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default S_SupportTickets;
