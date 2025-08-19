import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { yuvrajGetRole, yuvrajIsPrivileged, yuvrajGetInstitution, yuvrajSetInstitution } from "../services/yuvraj_auth.js";
import {
  createPollingAndSurvey,
  getPollingAndSurveyById,
  updatePollingAndSurvey,
  deletePollingAndSurvey,
  submitResponse,
  listResponses,
  getPollingSummary,
} from "../services/pollingandsurvey_api.js";
import YuvrajModernHeader from "../components/yuvraj_ModernHeader.jsx";
import YuvrajModernActionButton from "../components/yuvraj_ModernActionButton.jsx";
import YuvrajLiquidGlassCard from "../components/yuvraj_LiquidGlassCard.jsx";
import { Link } from "react-router-dom";

const EnhancedField = ({ label, children, required = false }) => (
  <div className="space-y-2">
    <label className="block">
      <span className="text-sm font-medium text-white/90">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </span>
    </label>
    {children}
  </div>
);

const QuestionCard = ({ question, index, type, isPrivileged, onUpdate, onRemove, studentAnswer, onStudentAnswerChange }) => (
  <YuvrajLiquidGlassCard variant="default" className="p-6">
    {isPrivileged ? (
      <div className="space-y-4">
        <input
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
          placeholder={`Question ${index + 1}`}
          value={question.text}
          onChange={(e) => onUpdate(index, { text: e.target.value })}
        />

        {type === "poll" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, oi) => (
                <input
                  key={oi}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                  value={question.options?.[oi] || ""}
                  placeholder={`Option ${oi + 1}`}
                  onChange={(e) => {
                    const newOpts = (question.options || []).slice();
                    newOpts[oi] = e.target.value;
                    onUpdate(index, { options: newOpts });
                  }}
                />
              ))}
            </div>

            <div className="p-4 bg-white/5 rounded-xl">
              <div className="text-sm font-medium text-white/90 mb-3">Preview</div>
              <div className="space-y-2">
                {(question.options || Array.from({ length: 4 })).map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
                    <input type="radio" name={`preview-${index}`} className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2" />
                    <span className="text-sm text-white/80">{opt || `Option ${oi + 1}`}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="text-sm text-white/60">
            {type === "poll" ? `${question.options?.filter(o => o?.trim()).length || 0} options` : "Text response"}
          </div>
          <YuvrajModernActionButton
            variant="danger"
            size="small"
            onClick={() => onRemove(index)}
          >
            Remove
          </YuvrajModernActionButton>
        </div>
      </div>
    ) : (
      <div className="space-y-4">
        <div className="font-semibold text-lg text-white/95">{question.text}</div>
        
        {type === "qna" ? (
          <textarea
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 resize-none"
            placeholder="Your answer..."
            rows={3}
            value={studentAnswer || ""}
            onChange={(e) => onStudentAnswerChange(index, e.target.value)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(question.options || []).map((opt, oi) => (
              <label key={oi} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer border border-white/10">
                <input
                  type="radio"
                  name={`answer-${index}`}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2"
                  value={String(oi)}
                  checked={studentAnswer === String(oi)}
                  onChange={(e) => onStudentAnswerChange(index, e.target.value)}
                />
                <span className="text-sm text-white/90">{opt || `Option ${oi + 1}`}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    )}
  </YuvrajLiquidGlassCard>
);

const Yuvraj_PollingAndSurveyEditor = () => {
  const { id, institution, role: roleParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCreate = !id || id === "new";
  const [role, setRole] = useState("student");
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(searchParams.get("type") || "poll");
  const [questions, setQuestions] = useState([]);
  const [isMandatory, setIsMandatory] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [responses, setResponses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setRole(roleParam || yuvrajGetRole());
    setIsPrivileged(yuvrajIsPrivileged() || roleParam === 'admin' || roleParam === 'instructor');
    
    // ensure localStorage has an institution so other services send correct header
    const effectiveInstitution = institution || yuvrajGetInstitution();
    try { yuvrajSetInstitution(effectiveInstitution); } catch (e) {}
    
    // open reports if URL contains #reports
    if (window.location && window.location.hash && window.location.hash.includes("reports")) {
      setHistoryOpen(true);
    }
    
    if (!isCreate) {
      getPollingAndSurveyById(id).then((d) => {
        if (!d) return;
        setTitle(d.title || "");
        setType(d.type || "poll");
        setQuestions(d.questions || []);
        setIsMandatory(d.isMandatory || false);
        // initialize student answers for viewing mode
        setStudentAnswers((d.questions || []).map(() => ""));
      });
    }
    
    // prevent students from accessing the create/new editor
    if (isCreate && roleParam !== 'admin') {
      const effectiveInstitution = institution || yuvrajGetInstitution();
      const safePrefix = effectiveInstitution ? `/${effectiveInstitution}/${role || 'student'}` : `/${role || 'student'}`;
      navigate(`${safePrefix}/PollingAndSurvey`, { replace: true });
    }
  }, [id, isCreate, institution, roleParam, navigate]);

  useEffect(() => {
    if (type === "qna") {
      // ensure exactly one question for qna
      setQuestions((prev) => {
        const firstText = prev && prev[0] ? prev[0].text : "";
        return [{ text: firstText || "", options: [] }];
      });
    } else if (type === "poll") {
      // ensure each question has options (at least two placeholders)
      setQuestions((prev) => (prev && prev.length ? prev.map((q) => ({
        text: q.text || "",
        options: q.options && q.options.length ? q.options : ["", ""],
      })) : [{ text: "", options: ["", ""] }]));
    }
  }, [type]);

  useEffect(() => {
    if (!id) return;
    if (!isCreate) {
      listResponses(id).then(setResponses).catch(() => setResponses([]));
      if (historyOpen) {
        getPollingSummary(id).then((s) => {
          setResponses((prev) => prev || []);
          setSummary(s);
        }).catch(() => setSummary(null));
      }
    }
  }, [historyOpen, id, isCreate]);

  useEffect(() => {
    setStudentAnswers((prev) => {
      if (!questions || questions.length === 0) return [];
      return questions.map((_, i) => (prev && prev[i] ? prev[i] : ""));
    });
  }, [questions]);

  if (role !== "admin" && !isCreate && type === "admin") {
    return <div className="p-6 text-white">Not allowed</div>;
  }

  const addQuestion = () => {
    setQuestions((s) => [...s, { text: "", options: ["", ""] }]);
  };

  const updateQuestion = (idx, patch) => {
    setQuestions((s) => s.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (idx) => {
    setQuestions((s) => s.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    
    if (!title || !title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }
    if (!questions || questions.length === 0) {
      setErrorMessage("Add at least one question before submitting.");
      return;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !q.text.trim()) {
        setErrorMessage(`Question ${i + 1} must have text.`);
        return;
      }
      if (type === "poll") {
        const validOpts = (q.options || []).filter((o) => o && o.trim());
        if (validOpts.length < 2) {
          setErrorMessage(`Question ${i + 1} needs at least 2 options.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const body = { title: title.trim(), type, questions, author: "Instructor", isMandatory };
      const effectiveInstitution = institution || yuvrajGetInstitution();
      const safePrefix = effectiveInstitution ? `/${effectiveInstitution}/${role || 'student'}` : `/${role || 'student'}`;
      
      if (isCreate) {
        await createPollingAndSurvey(body);
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          navigate(`${safePrefix}/PollingAndSurvey`, { replace: true });
        }, 2000);
      } else {
        await updatePollingAndSurvey(id, body);
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          navigate(`${safePrefix}/PollingAndSurvey`, { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      setErrorMessage("Failed to save: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id || isCreate) return;
    
    setIsDeleting(true);
    try {
      await deletePollingAndSurvey(id);
      const effectiveInstitution = institution || yuvrajGetInstitution();
      navigate(`/${effectiveInstitution || 'yuvraj'}/${role || 'admin'}/PollingAndSurvey`, { replace: true });
    } catch (e) {
      console.error(e);
      alert("Failed to delete form: " + (e?.message || String(e)));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!studentAnswers.some(a => a?.trim())) {
      alert("Please provide at least one answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const answers = studentAnswers.length ? studentAnswers.map((a, i) => {
        if (type === 'poll') {
          const opts = (questions && questions[i] && questions[i].options) || [];
          const idx = Number(a);
          return (opts && opts[idx]) ? opts[idx] : (a || '');
        }
        return a;
      }) : questions.map((q) => q._selected || "");
      
      await submitResponse(id, { user: "Student", answers });
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
      }, 2000);
    } catch (e) {
      console.error(e);
      alert("Failed to submit: " + (e?.message || String(e)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const prefix = institution ? `/${institution}/${role || 'student'}` : `/${role || 'student'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background orbs for iOS 26 aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl p-6">
        <YuvrajModernHeader
          title={isCreate ? "Create Form" : (historyOpen ? "View Results" : "Edit Form")}
          subtitle={isCreate ? "Design interactive polls and surveys" : (historyOpen ? "Analyze responses and feedback" : "Update form details")}
          variant="announcements"
          showNavigation={true}
          currentView="forms"
        />

        <div className="glass-morphism rounded-3xl p-8">
          {!historyOpen ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-200">
                  {errorMessage}
                </div>
              )}

              {/* Title Field */}
              <EnhancedField label="Title" required>
                {(role === 'admin' || isCreate) ? (
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200"
                    placeholder="Enter form title..."
                    maxLength={100}
                  />
                ) : (
                  <div className="p-4 border border-white/20 rounded-2xl text-white bg-white/10">
                    {title || 'Untitled form'}
                  </div>
                )}
              </EnhancedField>

              {/* Type Selection */}
              {(role === 'admin' || isCreate) && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setType("poll")}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                        type === "poll"
                          ? "bg-blue-500/80 text-white shadow-lg"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      📊 Poll
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("qna")}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                        type === "qna"
                          ? "bg-blue-500/80 text-white shadow-lg"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      ❓ Q&A
                    </button>
                  </div>
                  
                  {/* Mandatory/Optional Toggle */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isMandatory"
                      checked={isMandatory}
                      onChange={(e) => setIsMandatory(e.target.checked)}
                      className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="isMandatory" className="text-sm text-white/90 cursor-pointer">
                      🔴 Make this form mandatory for students to respond
                    </label>
                  </div>
                </div>
              )}

              {/* Questions Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white/90">Questions</h3>
                  {(role === 'admin' || isCreate) && (
                    <YuvrajModernActionButton
                      variant="secondary"
                      size="small"
                      icon="➕"
                      onClick={addQuestion}
                    >
                      Add Question
                    </YuvrajModernActionButton>
                  )}
                </div>

                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                  {questions.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-medium text-white/80 mb-2">No questions yet</h3>
                      <p className="text-white/60">Add your first question to get started.</p>
                    </div>
                  )}
                  
                  {questions.map((q, idx) => (
                    <QuestionCard
                      key={idx}
                      question={q}
                      index={idx}
                      type={type}
                      isPrivileged={role === 'admin' || isCreate}
                      onUpdate={updateQuestion}
                      onRemove={removeQuestion}
                      studentAnswer={studentAnswers[idx]}
                      onStudentAnswerChange={(idx, value) => {
                        const newAnswers = [...studentAnswers];
                        newAnswers[idx] = value;
                        setStudentAnswers(newAnswers);
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex gap-3">
                  <Link to={`${prefix}/PollingAndSurvey`}>
                    <YuvrajModernActionButton variant="ghost" size="medium">
                      Cancel
                    </YuvrajModernActionButton>
                  </Link>
                  
                  {!isCreate && isPrivileged && (
                    <YuvrajModernActionButton
                      variant="danger"
                      size="medium"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </YuvrajModernActionButton>
                  )}
                </div>

                <div className="flex gap-3">
                  {role !== "admin" && !isCreate ? (
                    <YuvrajModernActionButton
                      variant="primary"
                      size="large"
                      icon="📤"
                      onClick={handleAnswerSubmit}
                      disabled={isSubmitting || !studentAnswers.some(a => a?.trim())}
                      loading={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Response"}
                    </YuvrajModernActionButton>
                  ) : (
                    <YuvrajModernActionButton
                      type="submit"
                      variant="primary"
                      size="large"
                      icon="✨"
                      disabled={isSubmitting || !title.trim() || questions.length === 0}
                      loading={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : (isCreate ? 'Create Form' : 'Update Form')}
                    </YuvrajModernActionButton>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="flex items-start justify-between gap-4 p-6 bg-white/5 rounded-2xl">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">Results</h3>
                  <div className="text-lg text-white/90">{title || 'Untitled form'}</div>
                </div>
                <div className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-blue-500/80 to-purple-600/80">
                  {(type || 'poll').toUpperCase()}
                </div>
              </div>

              {/* Response Count - Only show for privileged users */}
              {isPrivileged && (
                <div className="flex items-center gap-4 p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl">
                  <div className="text-3xl font-bold text-emerald-400">
                    {summary ? summary.totalResponses : responses.length}
                  </div>
                  <div className="text-white/90">responses received</div>
                </div>
              )}

              {/* Results Display */}
              {(summary ? summary.totalResponses === 0 : responses.length === 0) ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-medium text-white/80 mb-2">No responses yet</h3>
                  <p className="text-white/60">Responses will appear here once students start participating.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Render results based on summary or responses - Only for privileged users */}
                  {isPrivileged ? (
                    summary ? (
                      summary.questions.map((sq, qi) => (
                        <YuvrajLiquidGlassCard key={qi} variant="default" className="p-6">
                          <div className="font-semibold text-white/95 mb-4 text-lg">{sq.text || `Question ${qi + 1}`}</div>
                          {sq.options.map((opt, oi) => {
                            const count = opt.count || 0;
                            const totalForQ = sq.totalForQuestion || 0;
                            const pct = totalForQ > 0 ? Math.round((count / totalForQ) * 100) : 0;
                            return (
                              <div key={oi} className="mb-4">
                                <div className="flex justify-between text-sm text-white/90 mb-2">
                                  <div>{opt.text || `Option ${oi + 1}`}</div>
                                  <div className="font-semibold">{count} • {pct}%</div>
                                </div>
                                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                  <div 
                                    style={{ width: `${pct}%` }} 
                                    className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-1000 ease-out"
                                  />
                                </div>
                              </div>
                            );
                          })}
                          {sq.otherCount > 0 && (
                            <div className="mt-3 text-sm text-white/70">Other responses: {sq.otherCount}</div>
                          )}
                        </YuvrajLiquidGlassCard>
                      ))
                    ) : (
                      questions.map((q, qi) => {
                        if (type === 'poll') {
                          const opts = q.options || [];
                          const counts = opts.map(() => 0);
                          let totalForQ = 0;
                          responses.forEach((r) => {
                            const answer = (r.answers && r.answers[qi]) || '';
                            if (!answer) return;
                            const idx = opts.indexOf(answer);
                            if (idx >= 0) counts[idx]++;
                            totalForQ += 1;
                          });
                          return (
                            <YuvrajLiquidGlassCard key={qi} variant="default" className="p-6">
                              <div className="font-semibold text-white/95 mb-4 text-lg">{q.text || `Question ${qi + 1}`}</div>
                              {opts.map((opt, oi) => {
                                const count = counts[oi] || 0;
                                const pct = totalForQ > 0 ? Math.round((count / totalForQ) * 100) : 0;
                                return (
                                  <div key={oi} className="mb-4">
                                    <div className="flex justify-between text-sm text-white/90 mb-2">
                                      <div>{opt || `Option ${oi + 1}`}</div>
                                      <div className="font-semibold">{count} • {pct}%</div>
                                    </div>
                                    <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                      <div 
                                        style={{ width: `${pct}%` }} 
                                        className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-1000 ease-out"
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </YuvrajLiquidGlassCard>
                          );
                        }
                        const totalForQ = responses.reduce((acc, r) => acc + ((r.answers && r.answers[qi]) ? 1 : 0), 0);
                        return (
                          <YuvrajLiquidGlassCard key={qi} variant="default" className="p-6">
                            <div className="font-semibold text-white/95 mb-2 text-lg">{q.text || `Question ${qi + 1}`}</div>
                            <div className="text-white/70 mb-4">{totalForQ} responses</div>
                            {role === 'admin' && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-white/80 mb-2">All responses:</div>
                                {(responses || []).filter((r) => (r.answers && r.answers[qi])).map((r, ri) => (
                                  <div key={ri} className="p-3 bg-white/10 rounded-xl text-sm text-white/90 break-words">
                                    {r.answers[qi]}
                                  </div>
                                ))}
                                {((responses || []).filter((r) => (r.answers && r.answers[qi])).length === 0) && (
                                  <div className="text-sm text-white/60">No textual responses</div>
                                )}
                              </div>
                            )}
                          </YuvrajLiquidGlassCard>
                        );
                      })
                    )
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-medium text-white/80 mb-2">Results Not Available</h3>
                      <p className="text-white/60">Only instructors and administrators can view form results.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative p-12 bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 rounded-3xl shadow-2xl flex flex-col items-center gap-6 text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Success!</h3>
              <p className="text-white/90">
                {isCreate ? "Form created successfully!" : (role !== "admin" ? "Response submitted successfully!" : "Form updated successfully!")}
              </p>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-white transition-all duration-2000 ease-linear" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative p-8 bg-gradient-to-br from-red-500/90 to-red-600/90 rounded-3xl shadow-2xl max-w-md mx-4">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-4">Delete Form?</h3>
              <p className="text-white/90 mb-6">
                This action cannot be undone. The form and all responses will be permanently removed.
              </p>
              <div className="flex gap-3 justify-center">
                <YuvrajModernActionButton
                  variant="secondary"
                  size="medium"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </YuvrajModernActionButton>
                <YuvrajModernActionButton
                  variant="danger"
                  size="medium"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </YuvrajModernActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Yuvraj_PollingAndSurveyEditor;
