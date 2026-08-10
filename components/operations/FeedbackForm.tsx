"use client";

import { useState } from "react";

type FeedbackKind = "public" | "student" | "college";

function RatingField({ name, label }: { name: string; label: string }) {
  return (
    <label>
      {label}
      <select name={name} required>
        <option value="">Select</option>
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>{value} / 5</option>
        ))}
      </select>
    </label>
  );
}

export function FeedbackForm({ endpoint, kind = "public" }: { endpoint: string; kind?: FeedbackKind }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const rating = (name: string) => data[name] ? Number(data[name]) : undefined;
    const payload = kind === "public" ? {
      name: data.name,
      email: data.email,
      category: data.category,
      overallRating: rating("overallRating"),
      comments: data.comments,
      permissionToPublish: data.permissionToPublish === "on",
      consent: data.consent === "on",
      website: data.website,
    } : {
      trainerQuality: rating("trainerQuality"),
      technicalContent: rating("technicalContent"),
      practicalSessions: rating("practicalSessions"),
      courseMaterial: rating("courseMaterial"),
      communication: rating("communication"),
      interviewPreparation: rating("interviewPreparation"),
      courseRelevance: rating("courseRelevance"),
      studentParticipation: rating("studentParticipation"),
      overallRating: rating("overallRating"),
      liked: data.liked,
      improvements: data.improvements,
      comments: data.comments,
      coordinatorName: data.coordinatorName,
      designation: data.designation,
      wouldRecommend: data.wouldRecommend === "yes",
      permissionToPublish: data.permissionToPublish === "on",
      consent: data.consent === "on",
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      form.reset();
      setMessage("Thank you. Your feedback was submitted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Feedback could not be submitted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="public-feedback-form form-card" onSubmit={submit}>
      {kind === "public" ? <>
        <div className="form-grid">
          <label>Name (optional)<input name="name" maxLength={100} /></label>
          <label>Email (optional)<input name="email" type="email" maxLength={254} /></label>
          <label>Category<select name="category" required><option value="">Select</option>{["GENERAL", "TRAINING", "WEBSITE", "COUNSELING", "OTHER"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <RatingField name="overallRating" label="Overall rating" />
        </div>
        <label>Comments<textarea name="comments" minLength={5} maxLength={3000} required /></label>
        <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" />
      </> : <>
        <div className="form-grid">
          {kind === "college" && <>
            <label>Coordinator name<input name="coordinatorName" maxLength={100} /></label>
            <label>Designation<input name="designation" maxLength={100} /></label>
            <RatingField name="studentParticipation" label="Student participation" />
            <RatingField name="courseRelevance" label="Course relevance" />
          </>}
          <RatingField name="trainerQuality" label="Trainer quality" />
          <RatingField name="technicalContent" label="Technical content" />
          <RatingField name="practicalSessions" label="Practical sessions" />
          <RatingField name="courseMaterial" label="Course material" />
          <RatingField name="communication" label="Communication" />
          <RatingField name="interviewPreparation" label="Interview preparation" />
          <RatingField name="overallRating" label="Overall experience" />
        </div>
        <label>What did you like?<textarea name="liked" maxLength={2000} /></label>
        <label>What can we improve?<textarea name="improvements" maxLength={2000} /></label>
        <label>Additional comments<textarea name="comments" maxLength={3000} /></label>
        <label>Would you recommend SaiTech Labs?<select name="wouldRecommend"><option value="yes">Yes</option><option value="no">No</option></select></label>
      </>}
      <label className="check-label"><input type="checkbox" name="permissionToPublish" /> I permit SaiTech Labs to consider this feedback for a testimonial.</label>
      <label className="check-label"><input type="checkbox" name="consent" required /> I consent to this feedback being stored and reviewed.</label>
      <button className="button button-primary" disabled={busy}>{busy ? "Submitting..." : "Submit feedback"}</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
