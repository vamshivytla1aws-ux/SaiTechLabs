"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ShieldCheck } from "lucide-react";

type Question = { id: string; position: number; technology: string; difficulty: string; questionText: string; maxScore: number; answerText: string; savedAt: string | null };
type Interview = { candidateName: string; technologies: string[]; experienceRange: string; difficulty: string; durationMinutes: number; questionCount: number; expiresAt: string; status: string; startedAt: string | null; deadline: string | null; submittedAt: string | null; result: string | null; questions: Question[]; serverNow: string };

async function api(url: string, method = "POST", body?: unknown) {
  const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, cache: "no-store" });
  const data = await response.json().catch(() => ({ message: "Request failed." }));
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

export function CandidateInterview({ token, initial }: { token: string; initial: Interview }) {
  const base = `/api/interviews/${encodeURIComponent(token)}`;
  const [interview, setInterview] = useState(initial);
  const [accepted, setAccepted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(initial.questions[0]?.answerText ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [saveState, setSaveState] = useState("Saved");
  const [remaining, setRemaining] = useState(() => initial.deadline ? Math.max(0, new Date(initial.deadline).getTime() - new Date(initial.serverNow).getTime()) : 0);
  const clockOffset = useRef(new Date(initial.serverNow).getTime() - Date.now());
  const current = interview.questions[index];
  const locked = ["SUBMITTED", "EVALUATING", "COMPLETED"].includes(interview.status);

  const logEvent = useCallback((type: string) => { void fetch(`${base}/integrity`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type }), keepalive: true }); }, [base]);

  useEffect(() => { if (["INVITED", "OPENED"].includes(initial.status)) void fetch(`${base}/open`, { method: "POST" }); }, [base, initial.status]);
  useEffect(() => {
    if (interview.status !== "IN_PROGRESS" || !interview.deadline) return;
    const tick = () => setRemaining(Math.max(0, new Date(interview.deadline!).getTime() - (Date.now() + clockOffset.current)));
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [interview.status, interview.deadline]);
  useEffect(() => { if (interview.status === "IN_PROGRESS" && remaining === 0 && interview.deadline) void submit(true); }, [remaining, interview.deadline, interview.status]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (interview.status !== "IN_PROGRESS") return;
    const visibility = () => { if (document.hidden) logEvent("TAB_HIDDEN"); };
    const blur = () => logEvent("WINDOW_BLUR");
    document.addEventListener("visibilitychange", visibility); window.addEventListener("blur", blur);
    return () => { document.removeEventListener("visibilitychange", visibility); window.removeEventListener("blur", blur); };
  }, [interview.status, logEvent]);
  useEffect(() => {
    if (!current || interview.status !== "IN_PROGRESS" || answer === current.answerText) return;
    const timer = window.setTimeout(async () => {
      try { await api(`${base}/answers`, "PUT", { questionId: current.id, answerText: answer }); setInterview((value) => ({ ...value, questions: value.questions.map((question) => question.id === current.id ? { ...question, answerText: answer } : question) })); setSaveState("Saved"); }
      catch { setSaveState("Save failed — retrying"); }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [answer, base, current, interview.status]);

  async function start() { setBusy(true); setMessage(""); try { const data = await api(`${base}/start`); clockOffset.current = new Date(data.interview.serverNow).getTime() - Date.now(); setRemaining(Math.max(0, new Date(data.interview.deadline).getTime() - new Date(data.interview.serverNow).getTime())); setInterview(data.interview); setAnswer(data.interview.questions[0]?.answerText ?? ""); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not start."); } finally { setBusy(false); } }
  async function move(next: number) {
    if (current && answer !== current.answerText) { try { await api(`${base}/answers`, "PUT", { questionId: current.id, answerText: answer }); } catch { setMessage("Your latest answer could not be saved. Please try again."); return; } }
    setInterview((value) => ({ ...value, questions: value.questions.map((question) => question.id === current?.id ? { ...question, answerText: answer } : question) }));
    setIndex(next); setAnswer(interview.questions[next]?.answerText ?? ""); setMessage("");
  }
  async function submit(automatic = false) {
    if (busy || locked) return;
    if (!automatic && !window.confirm("Submit your interview? You will not be able to edit answers afterward.")) return;
    setBusy(true); setMessage(automatic ? "Time is up. Submitting your saved answers..." : "Submitting and evaluating your answers...");
    try {
      if (current && answer !== current.answerText && remaining > 0) await api(`${base}/answers`, "PUT", { questionId: current.id, answerText: answer });
      const data = await api(`${base}/submit`); setInterview((value) => ({ ...value, status: data.status, result: data.result ?? null })); setMessage(data.message || "Your interview was submitted successfully.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Submission failed. Please try again."); setBusy(false); }
  }

  const time = useMemo(() => `${String(Math.floor(remaining / 60_000)).padStart(2, "0")}:${String(Math.floor((remaining % 60_000) / 1000)).padStart(2, "0")}`, [remaining]);
  if (interview.status === "CANCELLED") return <State title="Interview unavailable" text="This interview is no longer available." />;
  if (interview.status === "EXPIRED" || (!interview.startedAt && new Date(interview.expiresAt) <= new Date())) return <State title="Invitation expired" text="Please contact SaiTech Labs admissions for a new invitation." />;
  if (locked) return <State title="Interview submitted" text={message || (interview.status === "COMPLETED" ? "Your assessment is complete. SaiTech Labs admissions will contact you." : "Your answers are secure and evaluation is in progress.")} success />;
  if (!interview.startedAt) return <main className="interview-welcome"><div className="interview-intro"><span className="interview-icon"><ShieldCheck /></span><p className="admin-kicker">Text-based Mock AI Interview</p><h1>Welcome, {interview.candidateName}</h1><p>{interview.technologies.join(" + ")} · {interview.questionCount} questions · {interview.durationMinutes} minutes</p></div><section className="interview-rules"><h2>Interview rules</h2><ul><li>Complete the interview independently.</li><li>Copy and paste are disabled.</li><li>Leaving the interview window may be recorded.</li><li>The timer cannot be paused after you start.</li><li>Answers autosave as you type.</li><li>Submit before time expires.</li></ul><label><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} /> I understand the interview instructions</label><button className="interview-primary" disabled={!accepted || busy} onClick={start}>{busy ? "Starting..." : "Start interview"}</button>{message && <p className="interview-message error"><AlertTriangle />{message}</p>}</section></main>;
  return <main className="interview-session"><header><div><small>Question {index + 1} of {interview.questions.length}</small><strong>{interview.technologies.join(" + ")}</strong></div><div className={`interview-timer ${remaining < 300_000 ? "urgent" : ""}`}><Clock3 />{time}</div></header><div className="interview-progress"><span style={{ width: `${((index + 1) / interview.questions.length) * 100}%` }} /></div><section className="interview-question"><div className="interview-tags"><span>{current.technology}</span><span>{current.difficulty}</span><span>{current.maxScore} points</span></div><h1>{current.questionText}</h1><label>Your answer<textarea value={answer} onChange={(event) => { setAnswer(event.target.value); setSaveState("Saving..."); }} onPaste={(event) => { event.preventDefault(); logEvent("PASTE_ATTEMPT"); setMessage("Paste is disabled for this assessment."); }} onCopy={(event) => { event.preventDefault(); logEvent("COPY_ATTEMPT"); }} placeholder="Write your answer in your own words..." maxLength={12_000} /></label><div className="interview-save"><CheckCircle2 />{saveState}</div>{message && <p className="interview-message"><AlertTriangle />{message}</p>}</section><footer><button disabled={index === 0 || busy} onClick={() => move(index - 1)}><ChevronLeft />Previous</button>{index < interview.questions.length - 1 ? <button className="interview-primary" disabled={busy} onClick={() => move(index + 1)}>Save & next<ChevronRight /></button> : <button className="interview-primary submit" disabled={busy} onClick={() => submit(false)}>{busy ? "Submitting..." : "Submit interview"}</button>}</footer></main>;
}

function State({ title, text, success = false }: { title: string; text: string; success?: boolean }) { return <main className="interview-state"><span className={success ? "success" : ""}>{success ? <CheckCircle2 /> : <AlertTriangle />}</span><h1>{title}</h1><p>{text}</p></main>; }
