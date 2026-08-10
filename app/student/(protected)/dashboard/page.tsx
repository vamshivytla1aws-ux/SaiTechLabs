import { requireStudent } from "@/lib/student-auth";
import { getDb } from "@/lib/db";
import { paymentSummary } from "@/lib/operations";

export default async function Dashboard() {
  const account = await requireStudent();
  const enrollment = await getDb().enrollment.findFirst({ where: { studentId: account.studentId, status: { not: "CANCELLED" } }, orderBy: { enrolledAt: "desc" }, include: { batch: { include: { course: true } }, payments: true } });
  const records = await getDb().attendanceRecord.findMany({ where: { studentId: account.studentId } });
  const attended = records.filter((record) => record.status === "PRESENT" || record.status === "LATE").length;
  const percentage = records.length ? Math.round(attended / records.length * 100) : 0;
  const summary = enrollment ? paymentSummary(enrollment.finalFee, enrollment.payments) : null;
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Student portal</p><h1>Welcome, {account.student.fullName}</h1><p>{account.student.studentCode}</p></div></div><div className="admin-metrics"><Metric label="Course" value={enrollment?.batch.course.name ?? "Not assigned"}/><Metric label="Enrollment" value={enrollment?.status ?? "—"}/><Metric label="Payment" value={summary?.status.replaceAll("_", " ") ?? "—"}/><Metric label="Attendance" value={`${percentage}%`}/></div>{account.mustChangePassword && <p className="admin-alert error">Change your temporary password from Profile before continuing.</p>}</div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="admin-metric"><div><small>{label}</small><strong className="student-metric-value">{value}</strong></div></div>}
