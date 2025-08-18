import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useRole } from "../components/RoleContext.jsx";
import { createPollingAndSurvey, updatePollingAndSurvey, getPollingAndSurveyById, submitResponse } from "../services/pollingandsurvey_api.js";

const Field = ({ label, children }) => (
  <label className="form-control w-full">
    <div className="label">
      <span className="label-text text-white/90">{label}</span>
    </div>
    {children}
  </label>
);

const Yuvraj_PollingAndSurveyEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCreate = !id || id === "new";
  const { role, setRole, institution: ctxInstitution, setInstitution } = useRole();
  const [isPrivileged, setIsPrivileged] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(searchParams.get("type") || "poll");
  const [questions, setQuestions] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [responses, setResponses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { institution, role: roleParam } = useParams();

  useEffect(() => {
    // Determine role: URL param > localStorage override > default
  const currentRole = roleParam || role || "student";
  setIsPrivileged(currentRole === 'admin' || currentRole === 'instructor');
    
    // ensure localStorage has an institution so other services send correct header
  const effectiveInstitution = institution || ctxInstitution || "defaultInstitution"; // Persist under expected key for services
  try { if (!ctxInstitution && institution) setInstitution(institution); } catch (e) {}
    
    // prevent students from accessing the create/new editor
    if (isCreate && !isPrivileged) {
      const effectiveInstitution = institution || "defaultInstitution";
      const safePrefix = effectiveInstitution ? `/${effectiveInstitution}/${role || 'student'}` : `/${effectiveInstitution}/${role || 'student'}`;
      navigate(`${safePrefix}/PollingAndSurvey`, { replace: true });
      return;
    }
    
    // For students viewing existing forms, ensure they can't change the form type
    if (!isPrivileged && !isCreate) {
      // Students should only see the form as it was created, not be able to modify type
      // The type will be loaded from the existing form data
    }
    
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
        // initialize student answers for viewing mode
        setStudentAnswers((d.questions || []).map(() => ""));
      });
    }
  }, [id, isCreate, institution, roleParam, isPrivileged]);

  useEffect(() => {
    // Only allow type changes for privileged users
    if (!isPrivileged && !isCreate) {
      return; // Students cannot change form type
    }
    
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
  }, [type, isPrivileged, isCreate]);

  useEffect(() => {
    if (!id) return;
    if (!isCreate) {
      // listResponses(id).then(setResponses).catch(() => setResponses([])); // This line was removed as per the edit hint
      if (historyOpen) {
        // getPollingSummary(id).then((s) => { // This line was removed as per the edit hint
        //   setResponses((prev) => prev || []);
        //   setSummary(s);
        // }).catch(() => setSummary(null));
      }
    }
  }, [historyOpen, id]);

  useEffect(() => {
    setStudentAnswers((prev) => {
      if (!questions || questions.length === 0) return [];
      return questions.map((_, i) => (prev && prev[i] ? prev[i] : ""));
    });
  }, [questions]);

  // Prevent students from editing existing forms
  if (!isPrivileged && !isCreate) {
    // Students can only view and respond to forms, not edit them
    // This is handled in the UI by hiding edit controls
  }
  
  if (role !== "admin" && !isCreate && type === "admin") {
    return <div className="p-6 text-white">Not allowed</div>;
  }

  const addQuestion = () => {
    // Only privileged users can add questions
    if (!isPrivileged) return;
    setQuestions((s) => [...s, { text: "", options: ["", ""] }]);
  };

  const updateQuestion = (idx, patch) => {
    // Only privileged users can update questions
    if (!isPrivileged) return;
    setQuestions((s) => s.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (idx) => {
    // Only privileged users can remove questions
    if (!isPrivileged) return;
    setQuestions((s) => s.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    // Prevent students from submitting form updates
    if (!isPrivileged && !isCreate) {
      setErrorMessage("Students cannot modify forms.");
      return;
    }
    
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
    try {
      const body = { title, type, questions, author: "Instructor" };
      const effectiveInstitution = institution || "defaultInstitution"; // Placeholder
      const safePrefix = effectiveInstitution ? `/${effectiveInstitution}/${role || 'student'}` : `/${role || 'student'}`;
      if (isCreate) {
        await createPollingAndSurvey(body);
        setShowConfirmation(true);
        setTimeout(() => {
          setShowConfirmation(false);
          // go back to the base list route
          navigate(`/PollingAndSurvey`, { replace: true });
        }, 1400);
      } else {
        await updatePollingAndSurvey(id, body);
        navigate(`/PollingAndSurvey`, { replace: true });
      }
    } catch (err) {
      console.error(err);
      const msg = err?.message || String(err);
      setErrorMessage("Failed to save: " + msg);
    }
  };

  const handleAnswerSubmit = async () => {
    try {
      const answers = studentAnswers.length ? studentAnswers.map((a, i) => {
        if (type === 'poll') {
          const opts = (questions && questions[i] && questions[i].options) || [];
          const idx = Number(a);
          return (opts && opts[idx]) ? opts[idx] : (a || '');
        }
        return a;
      }) : questions.map((q) => q._selected || "");
      // submit student response to backend
      if (id) {
        // Ensure backend receives the response and then redirect to results
        await submitResponse(id, { user: 'Student', answers });
      }
      // show confirmation animation used for instructor create
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        // After confirmation, go to the results view for this form (if id available)
        if (id) {
          // After submit, show results for the same form
          navigate(`/PollingAndSurvey/${id}/results`, { replace: true });
        }
      }, 1400);
    } catch (e) {
      console.error(e);
      alert("Failed to submit: " + (e?.message || String(e)));
    }
  };

  const prefix = institution ? `/${institution}/${role || 'student'}` : `/${role || 'student'}`;
  const encodedPrefix = institution ? `/${encodeURIComponent(institution)}/${role || 'student'}` : `/${role || 'student'}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-500 to-indigo-600 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/atsen-circular-logo.svg" alt="ATSEN" className="h-10 w-10 drop-shadow" />
            <span className="hidden text-white/90 sm:inline">ATSEN</span>
          </div>
          <nav className="flex items-center gap-4">
            <div className={`rounded-full px-4 py-2 text-white shadow backdrop-blur transition-all bg-white/40`}>Home</div>
            <div className={`rounded-full px-4 py-2 text-white shadow backdrop-blur transition-all bg-white/20`}>Dashboard</div>
            <div className={`rounded-full px-4 py-2 text-white shadow backdrop-blur transition-all bg-white/20`}>Notifications</div>
            <div className={`rounded-full px-4 py-2 text-white shadow backdrop-blur transition-all bg-white/20`}>Profile</div>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white/10 p-6 shadow-2xl backdrop-blur">
          {!historyOpen ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 mb-2 rounded bg-red-600 text-white">{errorMessage}</div>
              )}
            <Field label="Title">
              {(role === 'admin' || isCreate) ? (
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input input-bordered w-full" placeholder="Enter options for a query." />
              ) : (
                <div className="p-2 border border-white/10 rounded text-white">{title || 'Untitled form'}</div>
              )}
            </Field>

            {/* Only show type switching for privileged users creating new forms */}
            {(isPrivileged && isCreate) ? (
              <div className="flex gap-2">
                <button type="button" onClick={() => setType("poll")} className={`rounded-full px-4 py-2 ${type === "poll" ? "bg-green-600 text-white" : "bg-white/20 text-white"}`}>Poll</button>
                <button type="button" onClick={() => setType("qna")} className={`rounded-full px-4 py-2 ${type === "qna" ? "bg-green-600 text-white" : "bg-white/20 text-white"}`}>QnA</button>
              </div>
            ) : (
              /* Show form type as read-only for students */
              <div className="flex gap-2">
                <div className={`rounded-full px-4 py-2 ${type === "poll" ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}>
                  {(type || 'poll').toUpperCase()}
                </div>
              </div>
            )}

            {/* Scrollable card for questions */}
            <div className="max-h-[52vh] overflow-y-auto p-4 space-y-4">
              {questions.length === 0 && (
                <div className="p-6 rounded-xl bg-white/20 shadow text-white">No queries yet. Add a question below.</div>
              )}
              {questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white shadow-md bg-opacity-90 text-black">
                  {(isPrivileged || isCreate) ? (
                    <>
                      <input className="input input-bordered w-full mb-3" placeholder={`Query ${idx + 1}`} value={q.text} onChange={(e) => updateQuestion(idx, { text: e.target.value })} />

                      {type === "poll" && (
                        <>
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {Array.from({ length: 4 }).map((_, oi) => (
                              <input
                                key={oi}
                                className="input input-bordered"
                                value={q.options?.[oi] || ""}
                                placeholder={`Option ${oi + 1}`}
                                onChange={(e) => {
                                  const newOpts = (q.options || []).slice();
                                  newOpts[oi] = e.target.value;
                                  updateQuestion(idx, { options: newOpts });
                                }}
                              />
                            ))}
                          </div>

                          <div className="mb-3">
                            <div className="text-sm font-medium mb-2">Preview</div>
                            <div className="space-y-2">
                              {(q.options || Array.from({ length: 4 })).map((opt, oi) => (
                                <label key={oi} className="flex items-center gap-2">
                                  <input type="radio" name={`preview-${idx}`} className="radio" />
                                  <span className="text-sm">{opt || `Option ${oi + 1}`}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between">
                        <button type="button" onClick={() => removeQuestion(idx)} className="btn btn-ghost">Remove</button>
                        <div className="text-sm opacity-70">{q.options?.length || 0} options</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold mb-2 text-lg">{q.text}</div>
                      {type === "qna" ? (
                        <textarea className="textarea textarea-bordered w-full" placeholder="Your answer" value={studentAnswers[idx] || ""} onChange={(e) => {
                          const v = e.target.value;
                          setStudentAnswers((s) => { const copy = s.slice(); copy[idx] = v; return copy; });
                        }} />
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {(q.options || []).map((opt, oi) => (
                            <label key={oi} className="flex items-center gap-2 p-2 rounded bg-white/5">
                              <input
                                type="radio"
                                name={`answer-${idx}`}
                                className="radio"
                                value={String(oi)}
                                checked={studentAnswers[idx] === String(oi)}
                                onChange={(e) => {
                                  const val = e.target.value; // index as string
                                  setStudentAnswers((s) => { const copy = s.slice(); copy[idx] = val; return copy; });
                                }}
                              />
                              <span className="text-sm">{opt || `Option ${oi + 1}`}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}

              </div>

            <div className="flex items-center justify-between mt-4">
            </div>

            <div className="flex items-center justify-between mt-4">
              <button type="button" onClick={() => navigate(`${prefix}/PollingAndSurvey`)} className="px-4 py-2 rounded-full bg-green-600 text-white shadow">Form List</button>

              <div className="flex gap-3">
                <button type="button" onClick={() => navigate(`${prefix}/PollingAndSurvey`)} className="px-4 py-2 rounded-full bg-white/20 text-white">Cancel</button>
                {role !== "admin" && !isCreate ? (
                  <button type="button" onClick={handleAnswerSubmit} className="px-4 py-2 rounded-full bg-green-600 text-white shadow">Submit</button>
                ) : (
                  <button type="submit" className="px-4 py-2 rounded-full bg-green-600 text-white shadow">{isCreate ? 'Submit' : 'Resubmit'}</button>
                )}
              </div>
            </div>
            </form>
          ) : null}

          {historyOpen && (
            <div className="mt-4 bg-white/10 p-4 rounded">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">Results</h3>
                  <div className="text-lg font-bold text-white mt-1">{title || 'Untitled form'}</div>
                </div>
                <div>
                  <div className="px-2 py-1 rounded text-xs font-semibold text-white" style={{ background: type === 'poll' ? '#059669' : '#2563EB' }}>{(type || 'poll').toUpperCase()}</div>
                </div>
              </div>
              <div className="mt-2 mb-3 flex items-center gap-3">
                <div className="px-3 py-2 bg-emerald-600 text-white rounded-lg font-semibold">{summary ? summary.totalResponses : responses.length}</div>
                <div className="text-sm text-white/80">responses received</div>
              </div>

              {(summary ? summary.totalResponses === 0 : responses.length === 0) && (
                <div className="text-sm text-white/80">No responses yet.</div>
              )}

              {summary ? (
                summary.questions.map((sq, qi) => (
                  <div key={qi} className="mt-3 p-3 bg-white/5 rounded">
                    <div className="font-semibold text-white mb-2">{sq.text || `Question ${qi + 1}`}</div>
                    {sq.options.map((opt, oi) => {
                      const count = opt.count || 0;
                      const totalForQ = sq.totalForQuestion || 0;
                      const pct = totalForQ > 0 ? Math.round((count / totalForQ) * 100) : 0;
                      return (
                        <div key={oi} className="mb-2">
                          <div className="flex justify-between text-sm text-white/90 mb-1">
                            <div>{opt.text || `Option ${oi + 1}`}</div>
                            <div className="font-semibold">{count} • {pct}%</div>
                          </div>
                          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div style={{ width: `${pct}%` }} className="h-2 bg-emerald-500" />
                          </div>
                        </div>
                      );
                    })}
                    {sq.otherCount > 0 && (
                      <div className="mt-2 text-sm text-white/80">Other responses: {sq.otherCount}</div>
                    )}
                  </div>
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
                      <div key={qi} className="mt-3 p-3 bg-white/5 rounded">
                        <div className="font-semibold text-white mb-2">{q.text || `Question ${qi + 1}`}</div>
                        {opts.map((opt, oi) => {
                          const count = counts[oi] || 0;
                          const pct = totalForQ > 0 ? Math.round((count / totalForQ) * 100) : 0;
                          return (
                            <div key={oi} className="mb-2">
                              <div className="flex justify-between text-sm text-white/90 mb-1">
                                <div>{opt || `Option ${oi + 1}`}</div>
                                <div className="font-semibold">{count} • {pct}%</div>
                              </div>
                              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div style={{ width: `${pct}%` }} className="h-2 bg-emerald-500" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  const totalForQ = responses.reduce((acc, r) => acc + ((r.answers && r.answers[qi]) ? 1 : 0), 0);
                  return (
                    <div key={qi} className="mt-3 p-3 bg-white/5 rounded">
                      <div className="font-semibold text-white mb-1">{q.text || `Question ${qi + 1}`}</div>
                      <div className="text-sm text-white/90">{totalForQ} responses</div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {showConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative p-8 bg-white rounded-xl shadow-2xl flex flex-col items-center gap-4">
              <svg width="72" height="72" viewBox="0 0 72 72" className="overflow-visible">
                <circle cx="36" cy="36" r="34" fill="none" stroke="#10B981" strokeWidth="4" className="opacity-20" />
                <path d="M22 37 L31 46 L50 27" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: 'dash 0.9s ease forwards 0.2s' }} />
              </svg>
              <div className="text-lg font-semibold">Your form has been created.</div>
            </div>
            <style>{`@keyframes dash { to { stroke-dashoffset: 0; } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
};

export default Yuvraj_PollingAndSurveyEditor;
