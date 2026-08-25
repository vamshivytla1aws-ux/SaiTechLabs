"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Option = { id: string; label: string };

async function submitJson(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Request failed.");
  return result;
}

function useOperation() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function run(url: string, body: unknown, form?: HTMLFormElement) { setBusy(true); setMessage(""); try { const result = await submitJson(url, body); form?.reset(); setMessage("Saved successfully."); router.refresh(); return result; } catch (error) { setMessage(error instanceof Error ? error.message : "Request failed."); } finally { setBusy(false); } }
  return { busy, message, run };
}

export function CourseForm() {
  const operation = useOperation();
  return <form className="admin-settings-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); void operation.run("/api/admin/courses", { name: data.get("name"), slug: data.get("slug"), shortDescription: data.get("shortDescription"), description: data.get("description"), durationDays: data.get("durationDays") }, form); }}><label>Name<input name="name" required /></label><label>Slug<input name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /></label><label>Short description<input name="shortDescription" maxLength={240} required /></label><label>Description<textarea name="description" maxLength={4000} required /></label><label>Duration (days)<input name="durationDays" type="number" min={1} max={1000} required /></label><button className="admin-primary" disabled={operation.busy}>{operation.busy ? "Saving..." : "Create course"}</button>{operation.message && <p role="status">{operation.message}</p>}</form>;
}

export function BatchForm({ courses }: { courses: Option[] }) {
  const operation = useOperation();
  return <form className="admin-settings-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); void operation.run("/api/admin/batches", { courseId: data.get("courseId"), name: data.get("name"), code: data.get("code"), startDate: data.get("startDate"), endDate: data.get("endDate"), mode: data.get("mode"), capacity: data.get("capacity"), status: data.get("status") }, form); }}><label>Course<select name="courseId" required><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.label}</option>)}</select></label><label>Batch name<input name="name" required /></label><label>Code<input name="code" pattern="[A-Za-z0-9-]{3,30}" required /></label><div className="form-grid"><label>Start date<input name="startDate" type="date" required /></label><label>End date<input name="endDate" type="date" required /></label></div><div className="form-grid"><label>Mode<select name="mode"><option>CLASSROOM</option><option>ONLINE</option><option>HYBRID</option></select></label><label>Capacity<input name="capacity" type="number" min={1} max={2000} required /></label></div><label>Status<select name="status"><option>PLANNED</option><option>OPEN</option><option>ACTIVE</option><option>COMPLETED</option><option>CANCELLED</option></select></label><button className="admin-primary" disabled={operation.busy}>{operation.busy ? "Saving..." : "Create batch"}</button>{operation.message && <p role="status">{operation.message}</p>}</form>;
}

export function TrainerForm({ adminUsers = [] }: { adminUsers?: Option[] }) {
  const operation = useOperation();
  return <form className="admin-settings-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); void operation.run("/api/admin/trainers", { name: data.get("name"), email: data.get("email"), phone: data.get("phone"), specialization: data.get("specialization"), bio: data.get("bio") || undefined, experienceSummary: data.get("experienceSummary") || undefined, adminUserId: data.get("adminUserId") || null }, form); }}><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><label>Phone<input name="phone" required /></label><label>Specialization<input name="specialization" required /></label><label>Linked trainer login<select name="adminUserId"><option value="">No portal login</option>{adminUsers.map((user)=><option value={user.id} key={user.id}>{user.label}</option>)}</select></label><label>Experience summary<textarea name="experienceSummary" maxLength={1000} /></label><label>Bio<textarea name="bio" maxLength={2000} /></label><button className="admin-primary" disabled={operation.busy}>{operation.busy ? "Saving..." : "Create trainer"}</button>{operation.message && <p role="status">{operation.message}</p>}</form>;
}

export function AdminUserForm() {
  const operation = useOperation();
  return <form className="admin-settings-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); void operation.run("/api/admin/users", { name: data.get("name"), email: data.get("email"), password: data.get("password"), role: data.get("role") }, form); }}><label>Name<input name="name" required /></label><label>Email<input name="email" type="email" required /></label><label>Temporary password<input name="password" type="password" minLength={12} required /><small>At least 12 characters with upper, lower, number, and symbol.</small></label><label>Role<select name="role"><option>ADMIN</option><option>COUNSELOR</option><option>ACCOUNTANT</option><option>TRAINER</option><option>SUPER_ADMIN</option></select></label><button className="admin-primary" disabled={operation.busy}>{operation.busy ? "Saving..." : "Create administrator"}</button>{operation.message && <p role="status">{operation.message}</p>}</form>;
}

export function AdminUserAction({ id, role, isActive, isSelf }: { id: string; role: string; isActive: boolean; isSelf: boolean }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function update(body: unknown) { setBusy(true); setMessage(""); try { const response = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); const result = await response.json(); if (!response.ok) throw new Error(result.message); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Update failed."); } finally { setBusy(false); } }
  if (isSelf) return <small>Current account</small>;
  return <div className="queue-action"><select defaultValue={role} disabled={busy} onChange={(event) => void update({ role: event.target.value })}>{["SUPER_ADMIN", "ADMIN", "COUNSELOR", "ACCOUNTANT", "TRAINER"].map((value) => <option key={value}>{value}</option>)}</select><button className="admin-secondary" disabled={busy} onClick={() => void update({ isActive: !isActive })}>{isActive ? "Deactivate" : "Activate"}</button><details><summary>Reset password</summary><form onSubmit={(event) => { event.preventDefault(); const password = new FormData(event.currentTarget).get("password"); void update({ newPassword: password }); }}><input name="password" type="password" minLength={12} required/><button className="admin-secondary">Reset</button></form></details>{message && <small>{message}</small>}</div>;
}

export function AttendanceForm({ batchId, students, trainers }: { batchId: string; students: Option[]; trainers: Option[] }) {
  const operation = useOperation();
  return <form className="admin-settings-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const records = students.map((student) => ({ studentId: student.id, status: String(data.get(`status-${student.id}`)), notes: String(data.get(`notes-${student.id}`) || "") || undefined })); void operation.run(`/api/admin/batches/${batchId}/attendance`, { sessionDate: data.get("sessionDate"), topic: data.get("topic"), trainerId: data.get("trainerId") || null, records }, form); }}><div className="form-grid"><label>Session date<input name="sessionDate" type="date" required /></label><label>Trainer<select name="trainerId"><option value="">Not specified</option>{trainers.map((trainer) => <option value={trainer.id} key={trainer.id}>{trainer.label}</option>)}</select></label></div><label>Topic<input name="topic" maxLength={300} required /></label><div className="admin-table-wrap"><table className="admin-table attendance-entry"><thead><tr><th>Student</th><th>Status</th><th>Notes</th></tr></thead><tbody>{students.map((student) => <tr key={student.id}><td>{student.label}</td><td><select name={`status-${student.id}`} defaultValue="PRESENT"><option>PRESENT</option><option>ABSENT</option><option>LATE</option><option>EXCUSED</option></select></td><td><input name={`notes-${student.id}`} maxLength={500} /></td></tr>)}</tbody></table></div><button className="admin-primary" disabled={operation.busy || students.length === 0}>{operation.busy ? "Saving..." : "Save attendance session"}</button>{operation.message && <p role="status">{operation.message}</p>}</form>;
}

export function TrainerAssignmentForm({ trainers, batchId }: { trainers: Option[]; batchId: string }) {
  const operation = useOperation();
  return <form className="admin-action-form inline" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const trainerId = String(data.get("trainerId")); void operation.run(`/api/admin/trainers/${trainerId}/assign`, { batchId, role: data.get("role") }, form); }}><label>Trainer<select name="trainerId" required><option value="">Select trainer</option>{trainers.map((trainer) => <option value={trainer.id} key={trainer.id}>{trainer.label}</option>)}</select></label><label>Role<select name="role"><option>TRAINER</option><option>LEAD_TRAINER</option><option>MENTOR</option><option>GUEST</option></select></label><button className="admin-primary" disabled={operation.busy}>Assign</button>{operation.message && <p role="status">{operation.message}</p>}</form>;
}

export function PaymentForm({ enrollmentId }: { enrollmentId: string }) {
  const operation = useOperation();
  return <form className="admin-settings-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); void operation.run(`/api/admin/enrollments/${enrollmentId}/payments`, { amount: data.get("amount"), paymentDate: data.get("paymentDate"), paymentMethod: data.get("paymentMethod"), referenceNumber: data.get("referenceNumber") || undefined, status: data.get("status"), notes: data.get("notes") || undefined }, form); }}><div className="form-grid"><label>Amount<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>Date<input name="paymentDate" type="date" required /></label></div><div className="form-grid"><label>Method<select name="paymentMethod"><option>UPI</option><option>BANK_TRANSFER</option><option>CASH</option><option>CARD</option><option>OTHER</option></select></label><label>Status<select name="status"><option>RECEIVED</option><option>PENDING</option><option>FAILED</option><option>REFUNDED</option></select></label></div><label>Reference number<input name="referenceNumber" maxLength={120} /></label><label>Notes<textarea name="notes" maxLength={1000} /></label><button className="admin-primary" disabled={operation.busy}>{operation.busy ? "Saving..." : "Record payment"}</button>{operation.message && <p role="status">{operation.message}</p>}</form>;
}

export function StudentAccountForm({ studentId, email }: { studentId: string; email: string }) {
  const operation = useOperation();
  return <form className="admin-settings-form" onSubmit={(event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); void operation.run(`/api/admin/students/${studentId}/account`, { email: data.get("email"), password: data.get("password"), isActive: true }); }}><label>Portal email<input name="email" type="email" defaultValue={email} required /></label><label>New temporary password<input name="password" type="password" minLength={12} required /><small>At least 12 characters with upper, lower, number, and symbol.</small></label><button className="admin-primary" disabled={operation.busy}>{operation.busy ? "Saving..." : "Enable / reset portal"}</button>{operation.message && <p role="status">{operation.message}</p>}</form>;
}

export function StudentInterviewAction({ studentId }: { studentId: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  return <div className="admin-settings-form"><button className="admin-primary" disabled={busy} onClick={async () => { setBusy(true); setMessage(""); try { const result = await submitJson(`/api/admin/students/${studentId}/interview-admission`, {}); router.push(`/admin/admissions/${result.admissionId}/interviews/new`); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not prepare the interview."); setBusy(false); } }}>{busy ? "Preparing interview..." : "Create Mock AI Interview"}</button><small>This opens the same reviewed question and secure email-invitation workflow used for admission candidates.</small>{message && <p className="admin-alert error" role="status">{message}</p>}</div>;
}

export function PublicLinkForm({ studentId, enrollments }: { studentId: string; enrollments: Option[] }) {
  const operation = useOperation(); const [url, setUrl] = useState("");
  return <form className="admin-settings-form" onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setUrl(""); const result = await operation.run(`/api/admin/students/${studentId}/links`, { type: data.get("type"), enrollmentId: data.get("enrollmentId") || null, expiresAt: data.get("expiresAt") || null, singleUse: data.get("singleUse") === "on" }); if (result?.url) setUrl(result.url); }}><label>Link type<select name="type"><option>ENROLLMENT_STATUS</option><option>STUDENT_FEEDBACK</option><option>COLLEGE_FEEDBACK</option></select></label><label>Enrollment<select name="enrollmentId"><option value="">Not linked</option>{enrollments.map((enrollment) => <option value={enrollment.id} key={enrollment.id}>{enrollment.label}</option>)}</select></label><label>Expires on<input name="expiresAt" type="date" /></label><label className="check-label"><input name="singleUse" type="checkbox" /> Single use</label><button className="admin-primary" disabled={operation.busy}>{operation.busy ? "Creating..." : "Create secure link"}</button>{url && <div className="admin-alert"><strong>Copy this URL now:</strong><br/><a href={url}>{url}</a></div>}{operation.message && !url && <p role="status">{operation.message}</p>}</form>;
}

export function CertificateIssueButton({ enrollmentId }: { enrollmentId: string }) {
  const operation = useOperation(); const [url, setUrl] = useState("");
  return <div className="admin-settings-form"><button className="admin-primary" disabled={operation.busy} onClick={async () => { const result = await operation.run(`/api/admin/enrollments/${enrollmentId}/certificate`, {}); if (result?.verificationUrl) setUrl(result.verificationUrl); }}>{operation.busy ? "Issuing..." : "Issue certificate"}</button>{url && <div className="admin-alert"><strong>Verification URL (copy now)</strong><br/><a href={url}>{url}</a></div>}{operation.message && !url && <p role="status">{operation.message}</p>}</div>;
}
