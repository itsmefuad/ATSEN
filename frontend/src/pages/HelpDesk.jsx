import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { MessageSquare, Send, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { 
  listHelpDeskRequests, 
  createHelpDeskRequest, 
  updateHelpDeskStatus,
  getConsultationSlots 
} from "../services/helpDeskService.js";

export default function HelpDesk({ hideNavbar = false }) {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    category: "administration", 
    title: "", 
    description: "" 
  });
  const [responseForm, setResponseForm] = useState({ 
    requestId: null, 
    message: "", 
    status: "resolved" 
  });
  const [showResponseForm, setShowResponseForm] = useState(null);

  // Determine user roles
  const isStudent = user?.role === "student";
  const isInstructor = user?.role === "instructor";
  const isInstitution = user?.role === "institution";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch consultation slots
        const slotsData = await getConsultationSlots();
        setSlots(slotsData);
        
        // Fetch help desk requests (backend handles role-based filtering)
        const requestsData = await listHelpDeskRequests({});
        setRequests(requestsData);
      } catch (error) {
        console.error("Failed to fetch help desk data:", error);
        toast.error("Failed to load help desk data");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let description = form.description || '';
      
      // Determine institution context for the request
      let institutionId = null;
      let institutionSlug = null;
      
      if (user?.role === "student" && user.institutions && user.institutions.length > 0) {
        if (typeof user.institutions[0] === 'object') {
          institutionId = user.institutions[0]._id;
          institutionSlug = user.institutions[0].slug;
        } else {
          institutionId = user.institutions[0];
        }
      }
      
      const body = {
        ...form,
        createdBy: user?.id || user?._id,
        institutionId: institutionId,
        institutionSlug: institutionSlug,
        description: description,
        assigneeType: "institution", // Always assign to institution
      };
      
      const created = await createHelpDeskRequest(body);
      setRequests([created, ...requests]);
      setForm({ 
        category: "administration", 
        title: "", 
        description: "" 
      });
      toast.success("Help desk request created successfully");
    } catch (error) {
      console.error("Failed to create request:", error);
      toast.error("Failed to create help desk request");
    }
  };

  const canManage = isInstructor || isInstitution;

  const handleResponse = async (e) => {
    e.preventDefault();
    try {
      // Format response with actual name
      const respondedBy = isInstructor ? `${user?.name || 'Instructor'}` : 
                        isInstitution ? `${user?.name || user?.institution?.name || 'Institution'}` : 
                        (user?.name || 'Staff');
      
      const timelineEntry = {
        status: responseForm.status, 
        note: responseForm.message,
        by: respondedBy
      };
      
      const update = await updateHelpDeskStatus(responseForm.requestId, responseForm.status, timelineEntry);
      setRequests((prev) => prev.map(x => x._id === responseForm.requestId ? update : x));
      setResponseForm({ requestId: null, message: "", status: "resolved" });
      setShowResponseForm(null);
      toast.success("Response sent successfully");
    } catch (error) {
      console.error("Failed to send response:", error);
      toast.error("Failed to send response");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100">
        {!hideNavbar && <Navbar />}
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {!hideNavbar && <Navbar />}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-base-content">Help Desk</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Create Request (Students Only) */}
            {isStudent && (
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg">Create Request</h2>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <label className="label">
                        <span className="label-text">Type</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        <option value="administration">Administration help</option>
                        <option value="complaint">Report a complaint</option>
                        <option value="payment">Payment</option>
                        <option value="technical">Technical</option>
                        <option value="course">Course</option>
                        <option value="other">Other</option>
                      </select>
                    </div>


                    
                    <div>
                      <label className="label">
                        <span className="label-text">Title</span>
                      </label>
                      <input 
                        className="input input-bordered w-full" 
                        value={form.title} 
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="label">
                        <span className="label-text">Description</span>
                      </label>
                      <textarea 
                        className="textarea textarea-bordered w-full" 
                        rows={4} 
                        value={form.description} 
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                      />
                    </div>
                    
                    <button type="submit" className="btn btn-primary w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Response Form (Instructors/Institutions Only) */}
            {canManage && showResponseForm && (
              <div className="card bg-base-200 shadow-md">
                <div className="card-body">
                  <h2 className="card-title text-lg">Respond to Request</h2>
                  <form onSubmit={handleResponse} className="space-y-3">
                    <div>
                      <label className="label">
                        <span className="label-text">Status</span>
                      </label>
                      <select 
                        className="select select-bordered w-full" 
                        value={responseForm.status} 
                        onChange={(e) => setResponseForm({ ...responseForm, status: e.target.value })}
                      >
                        <option value="accepted">Accepted</option>
                        <option value="processing">Processing</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="label">
                        <span className="label-text">Response Message</span>
                      </label>
                      <textarea 
                        className="textarea textarea-bordered w-full" 
                        rows={4} 
                        value={responseForm.message} 
                        onChange={(e) => setResponseForm({ ...responseForm, message: e.target.value })}
                        placeholder="Enter your response to the student..."
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Send Response
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={() => {
                          setShowResponseForm(null);
                          setResponseForm({ requestId: null, message: "", status: "resolved" });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

                         {/* Requests Timeline */}
             <div className={`card bg-base-200 shadow-md ${isStudent ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
               <div className="card-body">
                 <h2 className="card-title text-lg">
                   {isStudent ? "My Requests" : 
                    isInstitution ? "Student Requests" : 
                    isInstructor ? "Assigned Requests" : "Requests Timeline"}
                 </h2>
                <div className="space-y-3">
                                     {requests.length === 0 ? (
                     <div className="text-center py-8">
                       <MessageSquare className="h-12 w-12 text-base-content/30 mx-auto mb-3" />
                       <p className="text-base-content/70">
                         {isStudent ? "You haven't created any help desk requests yet" : 
                          isInstitution ? "No student requests found" : 
                          isInstructor ? "No requests assigned to you" : "No help desk requests found"}
                       </p>
                     </div>
                  ) : (
                    requests.map((r) => {
                      
                      return (
                        <div key={r._id} className={`p-4 rounded-lg border-2 ${
                          r.status === 'resolved' || r.status === 'accepted' ? 'border-success bg-success/10' :
                          r.status === 'processing' ? 'border-warning bg-warning/10' :
                          r.status === 'rejected' ? 'border-error bg-error/10' :
                          'border-base-300 bg-base-100'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-medium text-base-content flex items-center gap-2">
                                {r.title}
                                {(r.status === 'resolved' || r.status === 'accepted') && (
                                  <CheckCircle className="h-4 w-4 text-success" />
                                )}
                              </div>
                              <div className="text-sm text-base-content/70">{r.category}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`badge ${
                                r.status === 'resolved' ? 'badge-success' :
                                r.status === 'accepted' ? 'badge-success' :
                                r.status === 'processing' ? 'badge-warning' :
                                r.status === 'rejected' ? 'badge-error' :
                                'badge-neutral'
                              }`}>
                                {r.status === 'resolved' ? '✅ Resolved' :
                                 r.status === 'accepted' ? '✅ Accepted' :
                                 r.status === 'processing' ? '⏳ Processing' :
                                 r.status === 'rejected' ? '❌ Rejected' :
                                 '⏰ Pending'}
                              </span>
                              {canManage && r.status !== 'resolved' && r.status !== 'rejected' && (
                                <button 
                                  className="btn btn-xs btn-primary" 
                                  onClick={() => {
                                    setShowResponseForm(r._id);
                                    setResponseForm({ ...responseForm, requestId: r._id });
                                  }}
                                >
                                  Respond
                                </button>
                              )}
                              {isStudent && r.status === 'resolved' && (
                                <button className="btn btn-xs btn-outline">View Response</button>
                              )}
                            </div>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-base-content/70 mb-2 whitespace-pre-line">{r.description}</p>
                            {r.timeline?.length > 0 && (
                              <div className="mt-3 space-y-2">
                                <div className="text-sm font-medium text-base-content">Response Timeline:</div>
                                {r.timeline.map((t, i) => (
                                  <div key={i} className="flex items-start gap-3">
                                    <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                      t.status === 'resolved' || t.status === 'accepted' ? 'bg-success' :
                                      t.status === 'processing' ? 'bg-warning' :
                                      t.status === 'rejected' ? 'bg-error' :
                                      'bg-base-content/40'
                                    }`}></span>
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-base-content">
                                        {new Date(t.at).toLocaleString()} — {t.status}
                                      </div>
                                      {t.note && (
                                        <div className={`mt-1 p-3 rounded-md border ${
                                          t.status === 'resolved' || t.status === 'accepted' ? 'bg-success/10 border-success/20' :
                                          t.status === 'processing' ? 'bg-warning/10 border-warning/20' :
                                          t.status === 'rejected' ? 'bg-error/10 border-error/20' :
                                          'bg-base-200 border-base-300'
                                        }`}>
                                          <div className="text-sm">
                                            <span className="font-semibold text-base-content">{t.by || 'Staff'}:</span>
                                            <span className="ml-2">{t.note}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
