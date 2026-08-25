import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BrainCircuit, Mail, MessageCircle, Phone } from "lucide-react";
import { LeadUpdateForm, NoteForm } from "@/components/admin/AdminForms";
import { AdmissionConversionForm } from "@/components/admin/AdmissionConversionForm";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

const formatDate = (value: Date) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(value);
const display = (value: string) => value.replaceAll("_", " ");
const maskAadhaar = (value: string) => `XXXX XXXX ${value.slice(-4)}`;

export default async function AdmissionDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPermission("admissions:manage");
  const { id } = await params;
  const [row, batches] = await Promise.all([
    getDb().admission.findUnique({ where: { id }, include: { enrollment: true, mockInterviews: { orderBy: { createdAt: "desc" } }, notes: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { name: true } } } } } }),
    getDb().batch.findMany({ where: { status: { in: ["PLANNED", "OPEN", "ACTIVE"] } }, orderBy: { startDate: "desc" }, include: { course: true } }),
  ]);
  if (!row) notFound();
  const followUp = row.nextFollowUpAt ? new Date(row.nextFollowUpAt.getTime() - row.nextFollowUpAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";

  return <div className="admin-page">
    <Link className="admin-back" href="/admin/admissions"><ArrowLeft />Back to admissions</Link>
    <div className="admin-page-head detail"><div><p className="admin-kicker">Admission lead · {row.id}</p><h1>{row.studentName}</h1><p>Submitted {formatDate(row.createdAt)}</p></div><span className={`admin-status status-${row.leadStatus.toLowerCase()}`}>{display(row.leadStatus)}</span></div>
    <div className="admin-detail-grid">
      <div className="admin-detail-main">
        <section className="admin-panel"><header><h2>Student information</h2></header><dl className="admin-definition"><Item term="Email" value={row.email} /><Item term="Phone" value={row.phone} /><Item term="Aadhaar" value={row.aadhaarNumber ? maskAadhaar(row.aadhaarNumber) : "Not provided"} /><Item term="Course" value={row.course} /><Item term="Training mode" value={display(row.trainingMode)} /><Item term="Qualification" value={row.qualification} /><Item term="Current status" value={row.currentStatus} /><Item term="Graduation year" value={String(row.graduationYear)} /><Item term="College" value={row.collegeName} /><Item term="State" value={row.state} /><Item term="Next follow-up" value={row.nextFollowUpAt ? formatDate(row.nextFollowUpAt) : "Not scheduled"} /></dl>{row.message && <div className="admin-message"><strong>Student message</strong><p>{row.message}</p></div>}</section>
        <section className="admin-panel"><header><h2>Internal notes</h2><small>Append-only activity history</small></header><NoteForm id={row.id} /><div className="admin-notes">{row.notes.map((note) => <article key={note.id}><p>{note.note}</p><small>{note.createdBy.name} · {formatDate(note.createdAt)}</small></article>)}{!row.notes.length && <p className="admin-empty">No notes added yet.</p>}</div></section>
      </div>
      <aside className="admin-detail-side">
        <section className="admin-panel interview-admission-panel"><header><h2>Mock AI Interviews</h2><BrainCircuit /></header><Link className="admin-primary" href={`/admin/admissions/${row.id}/interviews/new`}>Create Mock AI Interview</Link>{row.mockInterviews.map((interview) => <Link className="interview-admission-row" href={`/admin/interviews/${interview.id}`} key={interview.id}><span><strong>{interview.technologies.join(" + ")}</strong><small>{formatDate(interview.createdAt)}</small></span><span className={`admin-status status-${interview.status.toLowerCase()}`}>{interview.overallScore !== null ? `${interview.overallScore}% · ${display(interview.result)}` : display(interview.status)}</span></Link>)}{!row.mockInterviews.length && <p className="admin-empty">No Mock AI Interviews yet.</p>}</section>
        <section className="admin-panel"><header><h2>Lead action</h2></header><LeadUpdateForm id={row.id} status={row.leadStatus} followUp={followUp} /></section>
        {row.enrollment ? <section className="admin-panel"><h2>Converted</h2><Link className="admin-primary" href={`/admin/students/${row.enrollment.studentId}`}>Open student record</Link></section> : <section className="admin-panel"><h2>Convert to student</h2><AdmissionConversionForm id={row.id} aadhaarNumber={row.aadhaarNumber} batches={batches.map((batch) => ({ id: batch.id, label: `${batch.course.name} · ${batch.code}` }))} /></section>}
        <section className="admin-panel"><header><h2>Contact</h2></header><div className="admin-contact-actions"><a href={`tel:${row.phone}`}><Phone />Call</a><a href={`https://wa.me/${row.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle />WhatsApp</a><a href={`mailto:${row.email}`}><Mail />Email</a></div></section>
      </aside>
    </div>
  </div>;
}

function Item({ term, value }: { term: string; value: string }) {
  return <div><dt>{term}</dt><dd>{value}</dd></div>;
}
