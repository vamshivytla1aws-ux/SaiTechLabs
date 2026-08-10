import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, writeAudit } from "@/lib/admin-security";
import { csvResponse } from "@/lib/csv";
import { getDb } from "@/lib/db";
import { paymentSummary } from "@/lib/operations";

export async function GET(_: Request, { params }: { params: Promise<{ type: string }> }) {
  const admin = await requireAdminApi(); if (!admin) return adminError(401, "Unauthorized."); if (!can(admin.role, "reports:view")) return adminError(403, "Forbidden.");
  const { type } = await params; const date = new Date().toISOString().slice(0, 10); const db = getDb();
  try {
    let headers: string[] = []; let rows: unknown[][] = [];
    if (type === "students") { const data = await db.student.findMany({ orderBy: { createdAt: "desc" } }); headers = ["Student code", "Name", "Email", "Phone", "Qualification", "Graduation year", "College", "State", "Current status", "Created"]; rows = data.map((item) => [item.studentCode, item.fullName, item.email, item.phone, item.qualification, item.graduationYear, item.collegeName, item.state, item.currentStatus, item.createdAt]); }
    else if (type === "enrollments") { const data = await db.enrollment.findMany({ orderBy: { enrolledAt: "desc" }, include: { student: true, batch: { include: { course: true } } } }); headers = ["Student code", "Student", "Course", "Batch", "Status", "Enrolled", "Course fee", "Discount", "Final fee"]; rows = data.map((item) => [item.student.studentCode, item.student.fullName, item.batch.course.name, item.batch.code, item.status, item.enrolledAt, item.courseFee, item.discount, item.finalFee]); }
    else if (type === "payments") { const data = await db.payment.findMany({ orderBy: { paymentDate: "desc" }, include: { enrollment: { include: { student: true, batch: true } } } }); headers = ["Date", "Student code", "Student", "Batch", "Amount", "Method", "Reference", "Status", "Notes"]; rows = data.map((item) => [item.paymentDate, item.enrollment.student.studentCode, item.enrollment.student.fullName, item.enrollment.batch.code, item.amount, item.paymentMethod, item.referenceNumber, item.status, item.notes]); }
    else if (type === "outstanding") { const data = await db.enrollment.findMany({ where: { status: { notIn: ["CANCELLED", "DROPPED"] } }, include: { student: true, batch: { include: { course: true } }, payments: true } }); headers = ["Student code", "Student", "Course", "Batch", "Final fee", "Paid", "Refunded", "Balance", "Status"]; rows = data.map((item) => { const summary = paymentSummary(item.finalFee, item.payments); return [item.student.studentCode, item.student.fullName, item.batch.course.name, item.batch.code, item.finalFee, summary.paid, summary.refunded, summary.balance, summary.status]; }).filter((row) => Number(row[7]) > 0); }
    else if (type === "attendance") { const data = await db.attendanceRecord.findMany({ orderBy: { session: { sessionDate: "desc" } }, include: { student: true, session: { include: { batch: { include: { course: true } } } } } }); headers = ["Date", "Student code", "Student", "Course", "Batch", "Topic", "Status", "Notes"]; rows = data.map((item) => [item.session.sessionDate, item.student.studentCode, item.student.fullName, item.session.batch.course.name, item.session.batch.code, item.session.topic, item.status, item.notes]); }
    else if (type === "feedback") { const data = await db.feedback.findMany({ orderBy: { createdAt: "desc" }, include: { student: true, batch: true } }); headers = ["Date", "Source", "Student", "Batch", "Overall rating", "Comments", "Recommend", "Publication permission", "Moderation"]; rows = data.map((item) => [item.createdAt, item.source, item.student?.studentCode || item.respondentName, item.batch?.code, item.overallRating, item.comments, item.wouldRecommend, item.permissionToPublish, item.moderationStatus]); }
    else if (type === "batches") { const data = await db.batch.findMany({ orderBy: { startDate: "desc" }, include: { course: true, _count: { select: { enrollments: true, attendanceSessions: true } } } }); headers = ["Code", "Name", "Course", "Start", "End", "Mode", "Capacity", "Enrollments", "Sessions", "Status"]; rows = data.map((item) => [item.code, item.name, item.course.name, item.startDate, item.endDate, item.mode, item.capacity, item._count.enrollments, item._count.attendanceSessions, item.status]); }
    else return adminError(404, "Unknown export type.");
    await writeAudit(admin.id, "EXPORT_CREATED", type, undefined, { count: rows.length });
    return csvResponse(`saitech-${type}-${date}.csv`, headers, rows);
  } catch { return adminError(500, "Export could not be generated."); }
}
