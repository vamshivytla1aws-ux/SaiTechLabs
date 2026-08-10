"use client";

import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import type { AdmissionFormData, ApiResponse } from "@/types/forms";

const initialData: AdmissionFormData = { studentName: "", email: "", phone: "", course: "", qualification: "", currentStatus: "", graduationYear: "", collegeName: "", state: "", trainingMode: "", message: "", consent: false, website: "" };

export function AdmissionForm() {
  const [data, setData] = useState(initialData);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const update = (key: keyof AdmissionFormData, value: string | boolean) => setData(old => ({ ...old, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.checkValidity() || status === "submitting") { event.currentTarget.reportValidity(); return; }
    setStatus("submitting"); setFeedback("");
    try {
      const response = await fetch("/api/admissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json() as ApiResponse;
      if (!response.ok || !result.success) { setStatus("error"); setFeedback(result.message || "Something went wrong. Please try again."); return; }
      setData(initialData); setReferenceId(result.referenceId ?? ""); setStatus("success");
    } catch { setStatus("error"); setFeedback("We could not submit your enquiry. Please check your connection and try again."); }
  };

  if (status === "success") return <div className="form-success" role="status"><CheckCircle2 /><h2>Thank you!</h2><p>Your admission enquiry has been received.<br />Our SaiTech Labs team will contact you shortly.</p>{referenceId && <p className="reference-id"><strong>Reference ID</strong><span>{referenceId}</span></p>}<button className="button button-outline" type="button" onClick={() => { setReferenceId(""); setStatus("idle"); }}>Submit another enquiry</button></div>;

  return <form className="premium-form" onSubmit={submit}>
    <div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={data.website} onChange={e => update("website", e.target.value)} /></label></div>
    <div className="form-grid">
      <label>Student Name *<input required minLength={2} maxLength={100} autoComplete="name" value={data.studentName} onChange={e => update("studentName", e.target.value)} placeholder="Enter your full name" /></label>
      <label>Email *<input required maxLength={254} type="email" autoComplete="email" value={data.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" /></label>
      <label>Phone Number *<input required type="tel" pattern="[0-9+ ()-]{10,20}" autoComplete="tel" value={data.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 00000 00000" /></label>
      <label>Select Course *<select required value={data.course} onChange={e => update("course", e.target.value)}><option value="">Choose a course</option><option>60-Day Intensive Program</option><option>Cloud</option><option>AI & Machine Learning</option><option>DevOps</option><option>Databricks & Data Engineering</option><option>Interview Preparation</option></select></label>
      <label>Select Qualification *<select required value={data.qualification} onChange={e => update("qualification", e.target.value)}><option value="">Choose qualification</option><option>B.Tech</option><option>M.Tech</option><option>B.Sc / BCA</option><option>M.Sc / MCA</option><option>Other</option></select></label>
      <label>Current Status *<select required value={data.currentStatus} onChange={e => update("currentStatus", e.target.value)}><option value="">Choose current status</option><option>B.Tech 3rd Year</option><option>B.Tech Final Year</option><option>Recent Graduate</option><option>Working Professional</option><option>Other</option></select></label>
      <label>Graduation Year *<input required type="number" min="2000" max="2034" value={data.graduationYear} onChange={e => update("graduationYear", e.target.value)} placeholder="2027" /></label>
      <label>College Name *<input required minLength={2} maxLength={160} value={data.collegeName} onChange={e => update("collegeName", e.target.value)} placeholder="Your college or institution" /></label>
      <label>Select State *<select required value={data.state} onChange={e => update("state", e.target.value)}><option value="">Choose state</option><option>Andhra Pradesh</option><option>Telangana</option><option>Karnataka</option><option>Tamil Nadu</option><option>Kerala</option><option>Other</option></select></label>
      <fieldset><legend>Preferred Training Mode *</legend><div className="radio-row">{["Classroom", "Online", "Either"].map(mode => <label key={mode} className="radio"><input type="radio" required name="trainingMode" value={mode} checked={data.trainingMode === mode} onChange={() => update("trainingMode", mode)} />{mode}</label>)}</div></fieldset>
      <label className="full">Message <span>(Optional)</span><textarea rows={4} maxLength={1500} value={data.message} onChange={e => update("message", e.target.value)} placeholder="Tell us what you would like to learn" /></label>
      <label className="checkbox full"><input required type="checkbox" checked={data.consent} onChange={e => update("consent", e.target.checked)} /><span>I agree to be contacted by SaiTech Labs regarding training programs.</span></label>
    </div>
    {status === "error" && <p className="form-error" role="alert"><AlertCircle />{feedback}</p>}
    <p className="form-note">Your information is used only to respond to your training enquiry.</p><button className="button button-primary submit-button" disabled={status === "submitting"} type="submit">{status === "submitting" ? "Submitting..." : "Submit admission"}{status !== "submitting" && <Send />}</button>
  </form>;
}
