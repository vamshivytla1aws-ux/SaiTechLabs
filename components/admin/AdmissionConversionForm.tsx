"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdmissionConversionForm({ id, batches, aadhaarNumber }: { id: string; batches: { id: string; label: string }[]; aadhaarNumber?: string | null }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/admin/admissions/${id}/convert`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ batchId: form.get("batchId"), aadhaarNumber: form.get("aadhaarNumber"), courseFee: form.get("courseFee"), discount: form.get("discount") || "0", enrollmentStatus: form.get("enrollmentStatus") }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.message);
      router.push(`/admin/students/${result.studentId}`); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Conversion failed."); setBusy(false); }
  }
  return <form className="admin-settings-form" onSubmit={submit}><label>Batch<select name="batchId" required><option value="">Select batch</option>{batches.map((batch) => <option key={batch.id} value={batch.id}>{batch.label}</option>)}</select></label><label>Aadhaar card number *<input name="aadhaarNumber" inputMode="numeric" pattern="[0-9]{12}" minLength={12} maxLength={12} autoComplete="off" defaultValue={aadhaarNumber ?? ""} placeholder="12-digit Aadhaar number" required /></label><label>Course fee<input name="courseFee" type="number" min="0" step="0.01" required/></label><label>Discount<input name="discount" type="number" min="0" step="0.01" defaultValue="0"/></label><label>Enrollment status<select name="enrollmentStatus" defaultValue="ENROLLED"><option>PENDING</option><option>CONFIRMED</option><option>ENROLLED</option><option>ACTIVE</option></select></label><button className="admin-primary" disabled={busy}>{busy ? "Converting..." : "Convert to student"}</button>{message && <p className="admin-alert error" role="status">{message}</p>}</form>;
}
