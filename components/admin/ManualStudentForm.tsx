"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { currentStatuses, qualifications } from "@/lib/validation";

type BatchOption = { id: string; label: string };

export function ManualStudentForm({ batches }: { batches: BatchOption[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"), aadhaarNumber: form.get("aadhaarNumber"),
          email: form.get("email"), phone: form.get("phone"), qualification: form.get("qualification"),
          graduationYear: form.get("graduationYear"), collegeName: form.get("collegeName"),
          state: form.get("state"), currentStatus: form.get("currentStatus"), batchId: form.get("batchId"),
          courseFee: form.get("courseFee"), discount: form.get("discount") || "0",
          enrollmentStatus: form.get("enrollmentStatus"), notes: form.get("notes") || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Student could not be created.");
      router.push(`/admin/students/${result.studentId}`);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Student could not be created.");
      setBusy(false);
    }
  }

  return <form className="admin-settings-form" onSubmit={submit}>
    <div className="form-grid"><label>Student name<input name="fullName" minLength={2} maxLength={100} required /></label><label>Aadhaar card number<input name="aadhaarNumber" inputMode="numeric" pattern="[0-9]{12}" minLength={12} maxLength={12} autoComplete="off" placeholder="12-digit Aadhaar number" required /></label></div>
    <div className="form-grid"><label>Email<input name="email" type="email" maxLength={254} required /></label><label>Mobile number<input name="phone" inputMode="tel" maxLength={20} required /></label></div>
    <div className="form-grid"><label>Qualification<select name="qualification" required>{qualifications.map(value => <option key={value}>{value}</option>)}</select></label><label>Graduation year<input name="graduationYear" type="number" min={2000} max={new Date().getFullYear() + 8} required /></label></div>
    <div className="form-grid"><label>College name<input name="collegeName" minLength={2} maxLength={160} required /></label><label>State<input name="state" minLength={2} maxLength={80} required /></label></div>
    <label>Current status<select name="currentStatus" required>{currentStatuses.map(value => <option key={value}>{value}</option>)}</select></label>
    <label>Course and batch<select name="batchId" required><option value="">Select batch</option>{batches.map(batch => <option key={batch.id} value={batch.id}>{batch.label}</option>)}</select></label>
    <div className="form-grid"><label>Course fee<input name="courseFee" type="number" min="0" step="0.01" required /></label><label>Discount<input name="discount" type="number" min="0" step="0.01" defaultValue="0" /></label></div>
    <label>Enrollment status<select name="enrollmentStatus" defaultValue="ENROLLED"><option>PENDING</option><option>CONFIRMED</option><option>ENROLLED</option><option>ACTIVE</option></select></label>
    <label>Internal notes<textarea name="notes" maxLength={1000} placeholder="Optional enrollment notes" /></label>
    <button className="admin-primary" disabled={busy || batches.length === 0}>{busy ? "Creating student..." : "Create student and enrollment"}</button>
    {!batches.length && <p className="admin-alert error">Create an available batch before adding a student.</p>}
    {message && <p className="admin-alert error" role="status">{message}</p>}
  </form>;
}
