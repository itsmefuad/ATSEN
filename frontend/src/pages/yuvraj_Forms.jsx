import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import { useParams, useLocation } from "react-router-dom";
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
  EyeOff,
  TrendingUp,
  Award,
  BarChart,
  PieChart,
  Edit2,
  Trash2,
  Save,
  X
} from "lucide-react";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from "../lib/axios.js";
import toast from "react-hot-toast";

export default function YuvrajForms({ hideNavbar = false }) {
  const { user } = useAuth();
  const { idOrName, id } = useParams(); // For institution routes and room routes
  const location = useLocation();
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
  
     // Report visibility - show everything by default for institutions
   const [showReport, setShowReport] = useState(true);
   const [showDetailedReport, setShowDetailedReport] = useState(true);
   const [showChart, setShowChart] = useState(true);
  
  // Enhanced evaluation form state
  const [evaluationQuestions, setEvaluationQuestions] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([
    { type: 'slider', question: 'Rate your overall satisfaction with the instructor', min: 1, max: 10 },
    { type: 'slider', question: 'How effectively was the content delivered?', min: 1, max: 10 }
  ]);
  
  // Form management
  const [editingForm, setEditingForm] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleting, setDeleting] = useState(false);

  const isInstitution = user?.role === "institution";
  const isInstructor = user?.role === "instructor";
  const isStudent = user?.role === "student";
  const canCreate = isInstitution || isInstructor;
  
  // Determine if we're in an institution context or room context
  const isInInstitutionContext = Boolean(idOrName && !location.pathname.includes('/room/'));
  const isInRoomContext = Boolean(id && location.pathname.includes('/room/'));
  const isStudentInstitutionContext = Boolean(idOrName && location.pathname.includes('/student/') && !location.pathname.includes('/room/'));
  
  // For students, try to get institution context from user.institutions if available
  const getStudentInstitutionContext = () => {
    if (user?.role === 'student' && user?.institutions && user.institutions.length > 0) {
      if (typeof user.institutions[0] === 'object' && user.institutions[0].slug) {
        return user.institutions[0].slug;
      }
      // If it's just an ID, we'll need to handle this differently
      return user.institutions[0];
    }
    return null;
  };
  
  const currentInstitutionSlug = isInInstitutionContext ? idOrName : 
                                (isStudentInstitutionContext ? idOrName : 
                                (user?.role === 'institution' ? user?.slug : 
                                getStudentInstitutionContext()));
  const currentInstitutionId = isInInstitutionContext ? user?.id : 
                              (user?.role === 'student' ? user?.institutions?.[0] : null);
  const currentRoomId = isInRoomContext ? id : null;
  
  // Debug logging
  console.log("Forms Context Debug:", {
    userRole: user?.role,
    userInstitutions: user?.institutions,
    isInInstitutionContext,
    isInRoomContext,
    isStudentInstitutionContext,
    currentInstitutionSlug,
    currentInstitutionId,
    currentRoomId,
    pathname: location.pathname,
    idOrName,
    id
  });

  // Fetch forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (isInRoomContext) {
          // Room-specific forms - include both roomId and studentId
          params.append("roomId", currentRoomId);
          if (isStudent && user?._id) {
            params.append("studentId", user._id);
          }
        } else if (isInInstitutionContext || isStudentInstitutionContext) {
          // Institution context from URL
          params.append("institutionSlug", currentInstitutionSlug);
          if (isStudent && user?._id) {
            params.append("studentId", user._id);
          }
        } else if (user?.role === "institution") {
          params.append("institutionSlug", user.slug);
        } else if (currentInstitutionSlug && user?.role === "student") {
          // Student with institution context from user.institutions
          params.append("institutionSlug", currentInstitutionSlug);
          if (user?._id) {
            params.append("studentId", user._id);
          }
        } else if (user?.institutions?.[0] && user?.role === "student") {
          // Fallback: use institution ID if slug not available
          params.append("institutionId", user.institutions[0]);
          if (user?._id) {
            params.append("studentId", user._id);
          }
        } else if (isStudent && user?._id) {
          // Final fallback for students without institution context
          params.append("studentId", user._id);
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
  }, [user, isInInstitutionContext, isInRoomContext, isStudentInstitutionContext, currentInstitutionSlug, currentRoomId]);

  // Fetch rooms and instructors for form creation
  useEffect(() => {
    const fetchData = async () => {
      if (!canCreate) return;
      
      try {
        if (isInstitution) {
          // Fetch rooms for this institution
          const institutionSlug = isInInstitutionContext ? currentInstitutionSlug : user.slug;
          const roomsResponse = await api.get(`/institutions/${institutionSlug}/rooms`);
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
  }, [user, canCreate, isInstitution, isInInstitutionContext, currentInstitutionSlug]);

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
        customQuestions: createData.kind === 'evaluation' ? customQuestions : [],
        institutionSlug: isInInstitutionContext ? currentInstitutionSlug : user?.slug,
        institutionId: isInInstitutionContext ? currentInstitutionId : (user?.role === "institution" ? user._id : user.institutions?.[0]),
        createdBy: user._id
      };

      await api.post("/yuvraj-polls", payload);
      
      // Refresh forms list
      const params = new URLSearchParams();
      if (isInRoomContext) {
        params.append("roomId", currentRoomId);
        if (isStudent && user?._id) {
          params.append("studentId", user._id);
        }
      } else if (isInInstitutionContext || isStudentInstitutionContext) {
        params.append("institutionSlug", currentInstitutionSlug);
        if (isStudent && user?._id) {
          params.append("studentId", user._id);
        }
      } else if (user?.role === "institution") {
        params.append("institutionSlug", user.slug);
      } else if (currentInstitutionSlug && user?.role === "student") {
        // Student with institution context from user.institutions
        params.append("institutionSlug", currentInstitutionSlug);
        if (user?._id) {
          params.append("studentId", user._id);
        }
      } else if (user?.institutions?.[0] && user?.role === "student") {
        // Fallback: use institution ID if slug not available
        params.append("institutionId", user.institutions[0]);
        if (user?._id) {
          params.append("studentId", user._id);
        }
      } else if (isStudent && user?._id) {
        // Final fallback for students without institution context
        params.append("studentId", user._id);
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
      setCustomQuestions([
        { type: 'slider', question: 'Rate your overall satisfaction with the instructor', min: 1, max: 10 },
        { type: 'slider', question: 'How effectively was the content delivered?', min: 1, max: 10 }
      ]);
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
        studentId: user._id,
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
    return formDetail.responses?.some(r => String(r.studentId._id || r.studentId) === String(user._id));
  }, [formDetail, isStudent, user?._id]);

  // Check if a form has been responded to by current user
  const hasUserResponded = useMemo(() => {
    if (!isStudent) return false;
    return (formId) => {
      const form = forms.find(f => f._id === formId);
      if (!form) return false;
      return form.responses?.some(r => String(r.studentId._id || r.studentId) === String(user._id));
    };
  }, [forms, isStudent, user?._id]);

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

  // Chart data preparation
  const getPollChartData = () => {
    if (!formDetail || formDetail.poll.kind !== 'poll') return [];
    
    return formDetail.poll.options.map((option) => {
      const votes = formDetail.responses.filter(r => r.optionId === option.id).length;
      const total = Math.max(formDetail.responses.length, 1);
      const percentage = Math.round((votes / total) * 100);
      
      return {
        name: option.label.length > 15 ? option.label.substring(0, 15) + '...' : option.label,
        fullName: option.label,
        votes,
        percentage,
        optionId: option.id
      };
    });
  };

  const getEvaluationStats = () => {
    if (!formDetail || formDetail.poll.kind !== 'evaluation') return null;
    
    const responses = formDetail.responses;
    if (responses.length === 0) return null;

    const satisfactionLevels = responses.filter(r => r.satisfactionLevel).map(r => r.satisfactionLevel);
    const contentDeliveryRatings = responses.filter(r => r.contentDeliveryRating).map(r => r.contentDeliveryRating);

    const avgSatisfaction = satisfactionLevels.length > 0 
      ? satisfactionLevels.reduce((a, b) => a + b, 0) / satisfactionLevels.length 
      : 0;
    
    const avgContentDelivery = contentDeliveryRatings.length > 0 
      ? contentDeliveryRatings.reduce((a, b) => a + b, 0) / contentDeliveryRatings.length 
      : 0;

    // Distribution data for charts
    const satisfactionDistribution = {};
    const contentDeliveryDistribution = {};
    
    for (let i = 1; i <= 10; i++) {
      satisfactionDistribution[i] = satisfactionLevels.filter(level => level === i).length;
      contentDeliveryDistribution[i] = contentDeliveryRatings.filter(level => level === i).length;
    }

    return {
      totalResponses: responses.length,
      avgSatisfaction: avgSatisfaction.toFixed(1),
      avgContentDelivery: avgContentDelivery.toFixed(1),
      satisfactionDistribution: Object.entries(satisfactionDistribution).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
        percentage: Math.round((count / satisfactionLevels.length) * 100) || 0
      })).filter(item => item.count > 0),
      contentDeliveryDistribution: Object.entries(contentDeliveryDistribution).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
        percentage: Math.round((count / contentDeliveryRatings.length) * 100) || 0
      })).filter(item => item.count > 0)
    };
  };

  const getBestOption = () => {
    if (!formDetail || formDetail.poll.kind !== 'poll') return null;
    
    const chartData = getPollChartData();
    if (chartData.length === 0) return null;
    
    return chartData.reduce((best, current) => 
      current.votes > best.votes ? current : best
    );
  };

  // Color palette for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Handle form deletion
  const handleDeleteForm = async (formId) => {
    if (!isInstitution || !formId) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this form? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      setDeleting(true);
      await api.delete(`/yuvraj-polls/${formId}`);
      
      // Remove from local state
      setForms(forms.filter(form => form._id !== formId));
      
      // Clear active form if it was the deleted one
      if (activeForm === formId) {
        setActiveForm(null);
        setFormDetail(null);
      }
      
      toast.success('Form deleted successfully');
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    } finally {
      setDeleting(false);
    }
  };

  // Handle form title editing
  const handleEditFormTitle = async (formId, newTitle) => {
    if (!isInstitution || !formId || !newTitle.trim()) return;
    
    try {
      const response = await api.patch(`/yuvraj-polls/${formId}`, { title: newTitle.trim() });
      
      // Update local state
      setForms(forms.map(form => 
        form._id === formId ? { ...form, title: newTitle.trim() } : form
      ));
      
      // Update form detail if it's the active form
      if (activeForm === formId && formDetail) {
        setFormDetail({
          ...formDetail,
          poll: { ...formDetail.poll, title: newTitle.trim() }
        });
      }
      
      setEditingForm(null);
      setEditTitle('');
      toast.success('Form title updated successfully');
    } catch (error) {
      console.error('Error updating form title:', error);
      toast.error('Failed to update form title');
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
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-base-content">
                Forms {isInRoomContext ? "- Room Specific" : ""}
              </h1>
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
                      <div className="py-4 text-center">
                        <p className="text-base-content/70 text-sm">No forms available.</p>
                      </div>
                    ) : (
                      forms.map((form) => (
                          <div
                            key={form._id}
                            className={`p-3 rounded-lg border transition-all duration-200 ${
                              activeForm === form._id 
                                ? 'bg-primary/10 border-primary shadow-sm' 
                              : 'bg-base-100 border-base-300 hover:bg-base-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            {editingForm === form._id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  className="input input-sm input-bordered flex-1"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleEditFormTitle(form._id, editTitle);
                                    }
                                    if (e.key === 'Escape') {
                                      setEditingForm(null);
                                      setEditTitle('');
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFormTitle(form._id, editTitle);
                                  }}
                                  className="btn btn-sm btn-primary btn-circle"
                                >
                                  <Save className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingForm(null);
                                    setEditTitle('');
                                  }}
                                  className="btn btn-sm btn-ghost btn-circle"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div 
                                className="flex items-center justify-between flex-1 cursor-pointer"
                                onClick={() => setActiveForm(form._id)}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <h3 className="font-semibold text-base-content truncate">{form.title}</h3>
                                </div>
                                <div className="flex items-center gap-1">
                                  {isInstitution && (
                                    <div className="flex items-center gap-1 mr-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingForm(form._id);
                                          setEditTitle(form.title);
                                        }}
                                        className="btn btn-xs btn-ghost btn-circle opacity-60 hover:opacity-100"
                                        title="Edit form title"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteForm(form._id);
                                        }}
                                        className="btn btn-xs btn-ghost btn-circle text-error opacity-60 hover:opacity-100"
                                        title="Delete form"
                                        disabled={deleting}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                  {getFormTypeIcon(form.kind)}
                                  <span className={`badge badge-sm ${getFormTypeBadge(form.kind)}`}>
                                    {form.kind}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {!editingForm || editingForm !== form._id ? (
                            <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => setActiveForm(form._id)}
                            >
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
                          ) : null}
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
                            <div className="space-y-6">
                              {/* Control Buttons */}
                              <div className="flex gap-2 flex-wrap">
                                                                 <button
                                   onClick={() => setShowChart(!showChart)}
                                   className="btn btn-sm btn-primary"
                                 >
                                   <PieChart className="h-4 w-4" />
                                   {showChart ? 'Hide Chart' : 'Show Chart'}
                                 </button>
                                <button
                                  onClick={() => setShowReport(!showReport)}
                                  className="btn btn-sm btn-ghost"
                                >
                                  {showReport ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  {showReport ? 'Hide' : 'Show'} Results
                                </button>
                                <button
                                  onClick={() => setShowDetailedReport(!showDetailedReport)}
                                  className="btn btn-sm btn-ghost"
                                >
                                  <Users className="h-4 w-4" />
                                  {showDetailedReport ? 'Hide' : 'Show'} Details
                                </button>
                              </div>

                                                             {/* Chart View */}
                               {showChart && (
                                 <div className="card bg-base-100 shadow-sm">
                                   <div className="card-body">
                                     <h4 className="card-title text-lg flex items-center gap-2">
                                       <PieChart className="h-5 w-5" />
                                       Poll Results Chart
                                     </h4>
                                     <div className="h-80">
                                       <ResponsiveContainer width="100%" height="100%">
                                         <RechartsPieChart>
                                           <Pie
                                             data={getPollChartData()}
                                             cx="50%"
                                             cy="50%"
                                             labelLine={false}
                                             label={({ percentage }) => `${percentage}%`}
                                             outerRadius={80}
                                             fill="#8884d8"
                                             dataKey="votes"
                                             animationDuration={1000}
                                             animationBegin={0}
                                           >
                                             {getPollChartData().map((entry, index) => (
                                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                             ))}
                                           </Pie>
                                           <Tooltip formatter={(value, name) => [value, 'Votes']} />
                                           <Legend />
                                         </RechartsPieChart>
                                       </ResponsiveContainer>
                                     </div>
                                   </div>
                                 </div>
                               )}

                              {/* Results Summary */}
                              {showReport && (
                                <div className="space-y-4">
                                  {formDetail.poll.options.map((option) => {
                                    const votes = formDetail.responses.filter(r => r.optionId === option.id).length;
                                    const total = Math.max(formDetail.responses.length, 1);
                                    const percentage = Math.round((votes / total) * 100);
                                    const bestOption = getBestOption();
                                    const isBest = bestOption && bestOption.optionId === option.id;
                                    
                                    return (
                                      <div key={option.id} className={`space-y-2 p-3 rounded-lg border-2 transition-all ${
                                        isBest 
                                          ? 'border-success bg-success/10 shadow-lg' 
                                          : 'border-base-300'
                                      }`}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{option.label}</span>
                                            {isBest && (
                                              <div className="badge badge-success gap-1">
                                                <Award className="h-3 w-3" />
                                                Best Result
                                              </div>
                                            )}
                                          </div>
                                          <span className="text-sm text-base-content/70">{votes} votes ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-base-300 rounded-full h-3">
                                          <div 
                                            className={`h-3 rounded-full transition-all duration-500 ${
                                              isBest ? 'bg-success' : 'bg-primary'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Detailed Student Responses */}
                              {showDetailedReport && (
                                <div className="card bg-base-100 shadow-sm">
                                  <div className="card-body">
                                    <h4 className="card-title text-lg flex items-center gap-2">
                                      <Users className="h-5 w-5" />
                                      Student Responses Details
                                    </h4>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                      {formDetail.responses.length === 0 ? (
                                        <p className="text-base-content/50 text-center py-4">No responses yet</p>
                                      ) : (
                                        formDetail.responses.map((response) => {
                                          const selectedOption = formDetail.poll.options.find(opt => opt.id === response.optionId);
                                          return (
                                            <div key={response._id} className="p-3 bg-base-200 rounded-lg border border-base-300">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-sm">
                                                  {response.studentName || response.studentId?.name || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-base-content/60">
                                                  {new Date(response.createdAt).toLocaleString()}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm text-base-content/70">Selected:</span>
                                                <span className="badge badge-primary badge-sm">
                                                  {selectedOption?.label || 'Unknown option'}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
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
                            <div className="space-y-6">
                              {/* Control Buttons */}
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => setShowChart(!showChart)}
                                  className="btn btn-sm btn-primary"
                                >
                                  <PieChart className="h-4 w-4" />
                                  {showChart ? 'Hide Statistics' : 'Show Statistics'}
                                </button>
                                <button
                                  onClick={() => setShowDetailedReport(!showDetailedReport)}
                                  className="btn btn-sm btn-ghost"
                                >
                                  <Users className="h-4 w-4" />
                                  {showDetailedReport ? 'Hide' : 'Show'} Details
                                </button>
                              </div>

                              {/* Statistics Overview */}
                              {(() => {
                                const stats = getEvaluationStats();
                                return stats && showChart && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Summary Cards */}
                                    <div className="card bg-base-100 shadow-sm">
                                      <div className="card-body">
                                        <h4 className="card-title text-lg">Overall Statistics</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="text-center p-4 bg-primary/10 rounded-lg">
                                            <div className="text-2xl font-bold text-primary">
                                              {stats.avgSatisfaction}
                                            </div>
                                            <div className="text-sm text-base-content/70">Avg Satisfaction</div>
                                          </div>
                                          <div className="text-center p-4 bg-success/10 rounded-lg">
                                            <div className="text-2xl font-bold text-success">
                                              {stats.avgContentDelivery}
                                            </div>
                                            <div className="text-sm text-base-content/70">Avg Content Delivery</div>
                                          </div>
                                        </div>
                                        <div className="text-center mt-4">
                                          <span className="text-lg font-semibold">{stats.totalResponses}</span>
                                          <span className="text-base-content/70 ml-1">Total Responses</span>
                                        </div>
                                      </div>
                                    </div>

                                                                         {/* Satisfaction Distribution Chart */}
                                     <div className="card bg-base-100 shadow-sm">
                                       <div className="card-body">
                                         <h4 className="card-title text-lg">Satisfaction Distribution</h4>
                                         <div className="h-64">
                                           <ResponsiveContainer width="100%" height="100%">
                                             <RechartsPieChart>
                                               <Pie
                                                 data={stats.satisfactionDistribution}
                                                 cx="50%"
                                                 cy="50%"
                                                 labelLine={false}
                                                 label={({ rating, count, percentage }) => `${rating}: ${count} (${percentage}%)`}
                                                 outerRadius={60}
                                                 fill="#8884d8"
                                                 dataKey="count"
                                                 animationDuration={1000}
                                                 animationBegin={0}
                                               >
                                                 {stats.satisfactionDistribution.map((entry, index) => (
                                                   <Cell key={`satisfaction-${index}`} fill={COLORS[index % COLORS.length]} />
                                                 ))}
                                               </Pie>
                                               <Tooltip formatter={(value, name) => [value, 'Responses']} />
                                               <Legend />
                                             </RechartsPieChart>
                                           </ResponsiveContainer>
                                         </div>
                                       </div>
                                     </div>

                                     {/* Content Delivery Distribution Chart */}
                                     <div className="card bg-base-100 shadow-sm">
                                       <div className="card-body">
                                         <h4 className="card-title text-lg">Content Delivery Distribution</h4>
                                         <div className="h-64">
                                           <ResponsiveContainer width="100%" height="100%">
                                             <RechartsPieChart>
                                               <Pie
                                                 data={stats.contentDeliveryDistribution}
                                                 cx="50%"
                                                 cy="50%"
                                                 labelLine={false}
                                                 label={({ rating, count, percentage }) => `${rating}: ${count} (${percentage}%)`}
                                                 outerRadius={60}
                                                 fill="#8884d8"
                                                 dataKey="count"
                                                 animationDuration={1000}
                                                 animationBegin={0}
                                               >
                                                 {stats.contentDeliveryDistribution.map((entry, index) => (
                                                   <Cell key={`content-${index}`} fill={COLORS[index % COLORS.length]} />
                                                 ))}
                                               </Pie>
                                               <Tooltip formatter={(value, name) => [value, 'Responses']} />
                                               <Legend />
                                             </RechartsPieChart>
                                           </ResponsiveContainer>
                                         </div>
                                       </div>
                                     </div>

                                    {/* Percentage Breakdown */}
                                    <div className="card bg-base-100 shadow-sm">
                                      <div className="card-body">
                                        <h4 className="card-title text-lg">Rating Percentages</h4>
                                        <div className="space-y-3">
                                          {stats.satisfactionDistribution.map((item) => (
                                            <div key={`satisfaction-${item.rating}`} className="flex items-center justify-between">
                                              <span className="text-sm">Rating {item.rating}</span>
                                              <div className="flex items-center gap-2">
                                                <div className="w-20 bg-base-300 rounded-full h-2">
                                                  <div 
                                                    className="bg-primary h-2 rounded-full" 
                                                    style={{ width: `${item.percentage}%` }}
                                                  />
                                                </div>
                                                <span className="text-sm font-medium">{item.percentage}%</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                              
                              

                              {/* Detailed Student Analysis */}
                              {showDetailedReport && (
                                <div className="card bg-base-100 shadow-sm">
                                  <div className="card-body">
                                    <h4 className="card-title text-lg flex items-center gap-2">
                                      <Users className="h-5 w-5" />
                                      Student Evaluation Analysis
                                    </h4>
                                    <div className="space-y-4">
                                      {formDetail.responses.map((response) => (
                                        <div key={response._id} className="p-4 bg-base-200 rounded-lg">
                                          <div className="flex justify-between items-center mb-3">
                                            <h5 className="font-semibold">
                                              {response.studentName || response.studentId?.name || 'Anonymous'}
                                            </h5>
                                            <span className="text-xs text-base-content/60">
                                              {new Date(response.createdAt).toLocaleDateString()}
                                            </span>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <div className="text-sm text-base-content/70 mb-2">Satisfaction Level</div>
                                              <div className="flex items-center gap-2">
                                                <div className="w-full bg-base-300 rounded-full h-2">
                                                  <div 
                                                    className="bg-primary h-2 rounded-full" 
                                                    style={{ width: `${(response.satisfactionLevel || 0) * 10}%` }}
                                                  />
                                                </div>
                                                <span className="text-sm font-bold">
                                                  {response.satisfactionLevel || 0}/10
                                                </span>
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <div className="text-sm text-base-content/70 mb-2">Content Delivery</div>
                                              <div className="flex items-center gap-2">
                                                <div className="w-full bg-base-300 rounded-full h-2">
                                                  <div 
                                                    className="bg-success h-2 rounded-full" 
                                                    style={{ width: `${(response.contentDeliveryRating || 0) * 10}%` }}
                                                  />
                                                </div>
                                                <span className="text-sm font-bold">
                                                  {response.contentDeliveryRating || 0}/10
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {response.recommendations && (
                                            <div className="mt-3 p-3 bg-base-100 rounded">
                                              <div className="text-xs text-base-content/70 mb-1">Detailed Feedback:</div>
                                              <p className="text-sm">{response.recommendations}</p>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
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
                    <div className="space-y-4">
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

                      {/* Custom Evaluation Questions */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="label">
                              <span className="label-text font-semibold">Evaluation Questions</span>
                            </label>
                            <p className="text-xs text-base-content/60">Create custom questions to gather detailed feedback</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomQuestions([...customQuestions, { type: 'slider', question: '', min: 1, max: 10 }]);
                            }}
                            className="btn btn-sm btn-primary"
                          >
                            <Plus className="h-4 w-4" />
                            Add Question
                          </button>
                        </div>
                        
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {customQuestions.map((question, index) => (
                            <div key={index} className="p-3 border border-base-300 rounded-lg bg-base-50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="badge badge-primary badge-sm">Q{index + 1}</span>
                                  <select
                                    className="select select-bordered select-sm"
                                    value={question.type}
                                    onChange={(e) => {
                                      const newQuestions = [...customQuestions];
                                      newQuestions[index] = { ...newQuestions[index], type: e.target.value };
                                      if (e.target.value === 'slider') {
                                        newQuestions[index] = { ...newQuestions[index], min: 1, max: 10 };
                                        delete newQuestions[index].options;
                                      } else if (e.target.value === 'multiple_choice') {
                                        newQuestions[index] = { ...newQuestions[index], options: ['Option 1', 'Option 2'] };
                                        delete newQuestions[index].min;
                                        delete newQuestions[index].max;
                                      } else if (e.target.value === 'text') {
                                        delete newQuestions[index].options;
                                        delete newQuestions[index].min;
                                        delete newQuestions[index].max;
                                      }
                                      setCustomQuestions(newQuestions);
                                    }}
                                  >
                                    <option value="slider">Level Slider (1-10)</option>
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="text">Text Answer</option>
                                  </select>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
                                  }}
                                  className="btn btn-sm btn-ghost btn-circle text-error"
                                >
                                  ✕
                                </button>
                              </div>
                              
                              <input
                                type="text"
                                className="input input-bordered input-sm w-full mb-2"
                                placeholder="Enter your question..."
                                value={question.question}
                                onChange={(e) => {
                                  const newQuestions = [...customQuestions];
                                  newQuestions[index] = { ...newQuestions[index], question: e.target.value };
                                  setCustomQuestions(newQuestions);
                                }}
                              />
                              
                              {question.type === 'slider' && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="label label-text-alt">Min Value</label>
                                    <input
                                      type="number"
                                      className="input input-bordered input-sm w-full"
                                      value={question.min || 1}
                                      onChange={(e) => {
                                        const newQuestions = [...customQuestions];
                                        newQuestions[index] = { ...newQuestions[index], min: parseInt(e.target.value) || 1 };
                                        setCustomQuestions(newQuestions);
                                      }}
                                    />
                                  </div>
                                  <div>
                                    <label className="label label-text-alt">Max Value</label>
                                    <input
                                      type="number"
                                      className="input input-bordered input-sm w-full"
                                      value={question.max || 10}
                                      onChange={(e) => {
                                        const newQuestions = [...customQuestions];
                                        newQuestions[index] = { ...newQuestions[index], max: parseInt(e.target.value) || 10 };
                                        setCustomQuestions(newQuestions);
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              {question.type === 'multiple_choice' && (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="label label-text-alt">Options</label>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newQuestions = [...customQuestions];
                                        const currentOptions = newQuestions[index].options || [];
                                        newQuestions[index] = {
                                          ...newQuestions[index],
                                          options: [...currentOptions, '']
                                        };
                                        setCustomQuestions(newQuestions);
                                      }}
                                      className="btn btn-xs btn-primary"
                                    >
                                      <Plus className="h-3 w-3" />
                                      Add Option
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {(question.options || ['Option 1', 'Option 2']).map((option, optIndex) => (
                                      <div key={optIndex} className="flex items-center gap-2">
                                        <span className="text-xs text-base-content/60 min-w-0 flex-shrink-0">
                                          {optIndex + 1}.
                                        </span>
                                        <input
                                          type="text"
                                          className="input input-bordered input-xs flex-1"
                                          placeholder={`Option ${optIndex + 1}`}
                                          value={option}
                                          onChange={(e) => {
                                            const newQuestions = [...customQuestions];
                                            const newOptions = [...(newQuestions[index].options || [])];
                                            newOptions[optIndex] = e.target.value;
                                            newQuestions[index] = {
                                              ...newQuestions[index],
                                              options: newOptions
                                            };
                                            setCustomQuestions(newQuestions);
                                          }}
                                        />
                                        {(question.options || []).length > 2 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const newQuestions = [...customQuestions];
                                              const newOptions = [...(newQuestions[index].options || [])];
                                              newOptions.splice(optIndex, 1);
                                              newQuestions[index] = {
                                                ...newQuestions[index],
                                                options: newOptions
                                              };
                                              setCustomQuestions(newQuestions);
                                            }}
                                            className="btn btn-xs btn-ghost btn-circle text-error"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="text-xs text-base-content/60 mt-2">
                                    Add multiple choice options for students to select from.
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {customQuestions.length === 0 && (
                          <div className="text-center py-6 text-base-content/50">
                            No custom questions added. Default satisfaction and content delivery questions will be used.
                          </div>
                        )}
                      </div>
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
    </div>
  );
}
