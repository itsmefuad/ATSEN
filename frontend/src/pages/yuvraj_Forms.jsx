import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  BarChart3, 
  MessageSquare, 
  Star, 
  CheckCircle,
  Clock,
  Users,
  Eye,
  EyeOff
} from "lucide-react";
import api from "../lib/axios.js";
import toast from "react-hot-toast";

export default function YuvrajForms() {
  const { user } = useAuth();
  const [forms, setForms] = useState([]);
  const [activeForm, setActiveForm] = useState(null);
  const [formDetail, setFormDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createData, setCreateData] = useState({
    title: "",
    description: "",
    kind: "poll",
    options: "",
    targetInstructorId: "",
    createdFor: "institution",
    targetRoomId: ""
  });
  
  // Response state
  const [selectedOption, setSelectedOption] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [satisfactionLevel, setSatisfactionLevel] = useState(5);
  const [contentDeliveryRating, setContentDeliveryRating] = useState(5);
  const [recommendations, setRecommendations] = useState("");
  
  // Data for dropdowns
  const [rooms, setRooms] = useState([]);
  const [instructors, setInstructors] = useState([]);
  
  // Report visibility
  const [showReport, setShowReport] = useState(false);

  const isInstitution = user?.role === "institution";
  const isInstructor = user?.role === "instructor";
  const isStudent = user?.role === "student";
  const canCreate = isInstitution || isInstructor;

  // Fetch forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (user?.role === "institution") {
          params.append("institutionSlug", user.slug);
        } else if (user?.institutions?.[0]) {
          params.append("institutionId", user.institutions[0]);
        }
        
        const response = await api.get(`/yuvraj-polls?${params.toString()}`);
        setForms(response.data);
      } catch (error) {
        console.error("Error fetching forms:", error);
        toast.error("Failed to load forms");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchForms();
    }
  }, [user]);

  // Fetch rooms and instructors for form creation
  useEffect(() => {
    const fetchData = async () => {
      if (!canCreate) return;
      
      try {
        if (isInstitution) {
          // Fetch rooms for this institution
          const roomsResponse = await api.get(`/institutions/${user.slug}/rooms`);
          setRooms(Array.isArray(roomsResponse.data) ? roomsResponse.data : roomsResponse.data.rooms || []);
          
          // Fetch instructors
          const instructorsResponse = await api.get(`/instructors`);
          setInstructors(instructorsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchData();
  }, [user, canCreate, isInstitution]);

  // Fetch form details
  useEffect(() => {
    const fetchFormDetail = async () => {
      if (!activeForm) {
        setFormDetail(null);
        return;
      }

      try {
        const response = await api.get(`/yuvraj-polls/${activeForm}`);
        setFormDetail(response.data);
      } catch (error) {
        console.error("Error fetching form detail:", error);
        toast.error("Failed to load form details");
      }
    };

    fetchFormDetail();
  }, [activeForm]);

  const handleCreateForm = async (e) => {
    e.preventDefault();
    if (!createData.title.trim()) return;
    
    try {
      setSubmitting(true);
      
      const options = createData.kind === 'poll' 
        ? createData.options.split("\n")
            .map((line, idx) => ({ id: `${idx+1}`, label: line.trim() }))
            .filter(o => o.label)
        : [];

      const payload = {
        ...createData,
        options,
        institutionSlug: user?.slug,
        institutionId: user?.role === "institution" ? user.id : user.institutions?.[0],
        createdBy: user.id
      };

      await api.post("/yuvraj-polls", payload);
      
      // Refresh forms list
      const params = new URLSearchParams();
      if (user?.role === "institution") {
        params.append("institutionSlug", user.slug);
      } else if (user?.institutions?.[0]) {
        params.append("institutionId", user.institutions[0]);
      }
      const response = await api.get(`/yuvraj-polls?${params.toString()}`);
      setForms(response.data);
      
      // Reset form
      setCreateData({
        title: "",
        description: "",
        kind: "poll",
        options: "",
        targetInstructorId: "",
        createdFor: "institution",
        targetRoomId: ""
      });
      setShowCreateForm(false);
      toast.success("Form created successfully!");
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error("Failed to create form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!formDetail || !isStudent) return;
    
    try {
      setSubmitting(true);
      
      const payload = {
        studentId: user.id,
        studentName: user.name,
        optionId: selectedOption,
        textAnswer,
        satisfactionLevel,
        contentDeliveryRating,
        recommendations,
        targetInstructorId: formDetail.poll.targetInstructorId
      };

      await api.post(`/yuvraj-polls/${activeForm}/vote`, payload);
      
      // Refresh form details
      const response = await api.get(`/yuvraj-polls/${activeForm}`);
      setFormDetail(response.data);
      
      // Reset response form
      setSelectedOption("");
      setTextAnswer("");
      setSatisfactionLevel(5);
      setContentDeliveryRating(5);
      setRecommendations("");
      
      toast.success("Response submitted successfully!");
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error(error.response?.data?.message || "Failed to submit response");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current user has already responded
  const hasResponded = useMemo(() => {
    if (!isStudent || !formDetail) return false;
    return formDetail.responses?.some(r => String(r.studentId._id || r.studentId) === String(user.id));
  }, [formDetail, isStudent, user?.id]);

  const getFormTypeIcon = (kind) => {
    switch (kind) {
      case 'poll': return <BarChart3 className="h-4 w-4" />;
      case 'qna': return <MessageSquare className="h-4 w-4" />;
      case 'evaluation': return <Star className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getFormTypeBadge = (kind) => {
    const badges = {
      poll: "badge-primary",
      qna: "badge-warning", 
      evaluation: "badge-success"
    };
    return badges[kind] || "badge-primary";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-base-content">Forms</h1>
          </div>
          
          {canCreate && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
              disabled={submitting}
            >
              <Plus className="h-4 w-4" />
              Create Form
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Forms List */}
          <div className="lg:col-span-1">
            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg">Available Forms</h2>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {forms.length === 0 ? (
                    <p className="text-base-content/70 text-sm py-4">No forms available.</p>
                  ) : (
                    forms.map((form) => (
                      <div
                        key={form._id}
                        onClick={() => setActiveForm(form._id)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all duration-200 ${
                          activeForm === form._id 
                            ? 'bg-primary/10 border-primary shadow-sm' 
                            : 'bg-base-100 border-base-300 hover:bg-base-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-base-content truncate">{form.title}</h3>
                          <div className="flex items-center gap-1">
                            {getFormTypeIcon(form.kind)}
                            <span className={`badge badge-sm ${getFormTypeBadge(form.kind)}`}>
                              {form.kind}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-base-content/60">
                            {new Date(form.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="text-xs text-base-content/60">
                              {form.createdFor === 'room' ? 'Room' : 'Global'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Details */}
          <div className="lg:col-span-2">
            <div className="card bg-base-200 shadow-md min-h-96">
              <div className="card-body">
                {!formDetail ? (
                  <div className="flex items-center justify-center h-64 text-base-content/50">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select a form to view details</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Form Header */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getFormTypeIcon(formDetail.poll.kind)}
                        <h2 className="text-2xl font-bold text-base-content">{formDetail.poll.title}</h2>
                        <span className={`badge ${getFormTypeBadge(formDetail.poll.kind)}`}>
                          {formDetail.poll.kind}
                        </span>
                      </div>
                      {formDetail.poll.description && (
                        <p className="text-base-content/70">{formDetail.poll.description}</p>
                      )}
                    </div>

                    {/* Poll Type Content */}
                    {formDetail.poll.kind === 'poll' && (
                      <div>
                        {isStudent && (
                          <div className="space-y-4">
                            {hasResponded ? (
                              <div className="alert alert-success">
                                <CheckCircle className="h-4 w-4" />
                                <span>You have already responded to this poll</span>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {formDetail.poll.options.map((option) => (
                                  <label key={option.id} className="flex items-center gap-3 p-3 rounded-lg border border-base-300 hover:bg-base-100 cursor-pointer">
                                    <input
                                      type="radio"
                                      name="pollOption"
                                      className="radio radio-primary"
                                      checked={selectedOption === option.id}
                                      onChange={() => setSelectedOption(option.id)}
                                    />
                                    <span className="text-base-content">{option.label}</span>
                                  </label>
                                ))}
                                <button
                                  onClick={handleSubmitResponse}
                                  disabled={!selectedOption || submitting}
                                  className="btn btn-primary"
                                >
                                  {submitting ? (
                                    <>
                                      <span className="loading loading-spinner loading-sm"></span>
                                      Submitting...
                                    </>
                                  ) : (
                                    "Submit Response"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {(canCreate) && (
                          <div className="space-y-4">
                            {formDetail.poll.options.map((option) => {
                              const votes = formDetail.responses.filter(r => r.optionId === option.id).length;
                              const total = Math.max(formDetail.responses.length, 1);
                              const percentage = Math.round((votes / total) * 100);
                              
                              return (
                                <div key={option.id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{option.label}</span>
                                    <span className="text-sm text-base-content/70">{votes} votes ({percentage}%)</span>
                                  </div>
                                  <div className="w-full bg-base-300 rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                                      style={{ width: `${percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Q&A Type Content */}
                    {formDetail.poll.kind === 'qna' && (
                      <div className="space-y-4">
                        {isStudent && (
                          <div>
                            {hasResponded ? (
                              <div className="alert alert-success">
                                <CheckCircle className="h-4 w-4" />
                                <span>Your response has been submitted</span>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <textarea
                                  className="textarea textarea-bordered w-full"
                                  rows={4}
                                  placeholder="Enter your answer here..."
                                  value={textAnswer}
                                  onChange={(e) => setTextAnswer(e.target.value)}
                                />
                                <button
                                  onClick={handleSubmitResponse}
                                  disabled={!textAnswer.trim() || submitting}
                                  className="btn btn-primary"
                                >
                                  {submitting ? (
                                    <>
                                      <span className="loading loading-spinner loading-sm"></span>
                                      Submitting...
                                    </>
                                  ) : (
                                    "Submit Answer"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {canCreate && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">Responses</h3>
                              <button
                                onClick={() => setShowReport(!showReport)}
                                className="btn btn-sm btn-ghost"
                              >
                                {showReport ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showReport ? 'Hide' : 'Show'} Responses
                              </button>
                            </div>
                            
                            {showReport && (
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {formDetail.responses.length === 0 ? (
                                  <p className="text-base-content/50 text-center py-4">No responses yet</p>
                                ) : (
                                  formDetail.responses.map((response) => (
                                    <div key={response._id} className="p-3 bg-base-100 rounded-lg border border-base-300">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-sm">
                                          {response.studentName || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-base-content/60">
                                          {new Date(response.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-base-content/80">{response.textAnswer}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Evaluation Type Content */}
                    {formDetail.poll.kind === 'evaluation' && (
                      <div className="space-y-4">
                        {isStudent && (
                          <div>
                            {hasResponded ? (
                              <div className="alert alert-success">
                                <CheckCircle className="h-4 w-4" />
                                <span>Your evaluation has been submitted</span>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div>
                                  <label className="label">
                                    <span className="label-text">How satisfied are you with {formDetail.poll.targetInstructorName || 'the instructor'}? (1-10)</span>
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="range"
                                      min="1"
                                      max="10"
                                      value={satisfactionLevel}
                                      onChange={(e) => setSatisfactionLevel(parseInt(e.target.value))}
                                      className="range range-primary flex-1"
                                    />
                                    <span className="badge badge-primary">{satisfactionLevel}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="label">
                                    <span className="label-text">How well did they deliver the study content? (1-10)</span>
                                  </label>
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="range"
                                      min="1"
                                      max="10"
                                      value={contentDeliveryRating}
                                      onChange={(e) => setContentDeliveryRating(parseInt(e.target.value))}
                                      className="range range-primary flex-1"
                                    />
                                    <span className="badge badge-primary">{contentDeliveryRating}</span>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="label">
                                    <span className="label-text">Any recommendations or feedback?</span>
                                  </label>
                                  <textarea
                                    className="textarea textarea-bordered w-full"
                                    rows={3}
                                    placeholder="Optional feedback..."
                                    value={recommendations}
                                    onChange={(e) => setRecommendations(e.target.value)}
                                  />
                                </div>
                                
                                <button
                                  onClick={handleSubmitResponse}
                                  disabled={submitting}
                                  className="btn btn-primary"
                                >
                                  {submitting ? (
                                    <>
                                      <span className="loading loading-spinner loading-sm"></span>
                                      Submitting...
                                    </>
                                  ) : (
                                    "Submit Evaluation"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {isInstitution && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">Evaluation Results</h3>
                              <button
                                onClick={() => setShowReport(!showReport)}
                                className="btn btn-sm btn-ghost"
                              >
                                {showReport ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                {showReport ? 'Hide' : 'Show'} Results
                              </button>
                            </div>
                            
                            {showReport && (
                              <div className="space-y-3 max-h-96 overflow-y-auto">
                                {formDetail.responses.length === 0 ? (
                                  <p className="text-base-content/50 text-center py-4">No evaluations yet</p>
                                ) : (
                                  formDetail.responses.map((response) => (
                                    <div key={response._id} className="p-4 bg-base-100 rounded-lg border border-base-300">
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium">
                                          {response.studentName || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-base-content/60">
                                          {new Date(response.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div className="text-center p-2 bg-base-200 rounded">
                                          <div className="text-sm text-base-content/70">Satisfaction</div>
                                          <div className="text-lg font-bold text-primary">
                                            {response.satisfactionLevel || '-'}/10
                                          </div>
                                        </div>
                                        <div className="text-center p-2 bg-base-200 rounded">
                                          <div className="text-sm text-base-content/70">Content Delivery</div>
                                          <div className="text-lg font-bold text-primary">
                                            {response.contentDeliveryRating || '-'}/10
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {response.recommendations && (
                                        <div className="mt-2 p-3 bg-base-200 rounded">
                                          <div className="text-xs text-base-content/70 mb-1">Feedback:</div>
                                          <p className="text-base-content/80">{response.recommendations}</p>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
              <h3 className="font-bold text-lg mb-4">Create New Form</h3>
              
              <form onSubmit={handleCreateForm} className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Form Type</span>
                  </label>
                  <select
                    className="select select-bordered w-full"
                    value={createData.kind}
                    onChange={(e) => setCreateData({ ...createData, kind: e.target.value })}
                  >
                    <option value="poll">Poll</option>
                    <option value="qna">Q&A</option>
                    {isInstitution && <option value="evaluation">Evaluation</option>}
                  </select>
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Enter form title..."
                    value={createData.title}
                    onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="label">
                    <span className="label-text">Description</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={2}
                    placeholder="Optional description..."
                    value={createData.description}
                    onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  />
                </div>
                
                {createData.kind === 'poll' && (
                  <div>
                    <label className="label">
                      <span className="label-text">Options (one per line)</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full"
                      rows={4}
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                      value={createData.options}
                      onChange={(e) => setCreateData({ ...createData, options: e.target.value })}
                      required
                    />
                  </div>
                )}
                
                {createData.kind === 'evaluation' && isInstitution && (
                  <div>
                    <label className="label">
                      <span className="label-text">Select Instructor to Evaluate</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={createData.targetInstructorId}
                      onChange={(e) => setCreateData({ ...createData, targetInstructorId: e.target.value })}
                      required
                    >
                      <option value="">Choose an instructor...</option>
                      {instructors.map((instructor) => (
                        <option key={instructor._id} value={instructor._id}>
                          {instructor.name} ({instructor.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Visibility</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={createData.createdFor}
                      onChange={(e) => setCreateData({ ...createData, createdFor: e.target.value })}
                    >
                      {isInstitution && <option value="institution">Institution-wide</option>}
                      <option value="room">Specific Room</option>
                    </select>
                  </div>
                  
                  {createData.createdFor === 'room' && (
                    <div>
                      <label className="label">
                        <span className="label-text">Select Room</span>
                      </label>
                      <select
                        className="select select-bordered w-full"
                        value={createData.targetRoomId}
                        onChange={(e) => setCreateData({ ...createData, targetRoomId: e.target.value })}
                        required
                      >
                        <option value="">Choose a room...</option>
                        {rooms.map((room) => (
                          <option key={room._id} value={room._id}>
                            {room.room_name || room.name || 'Room'}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Form"
                    )}
                  </button>
                </div>
              </form>
            </div>
            <div className="modal-backdrop" onClick={() => setShowCreateForm(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
