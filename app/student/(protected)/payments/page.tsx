import { requireStudent } from "@/lib/student-auth";
import { getDb } from "@/lib/db";
import { formatInr, paymentSummary } from "@/lib/operations";

export default async function PaymentsPage() {
  const account = await requireStudent();
  const enrollments = await getDb().enrollment.findMany({ where: { studentId: account.studentId }, orderBy: { enrolledAt: "desc" }, include: { batch: { include: { course: true } }, payments: { orderBy: { paymentDate: "desc" } } } });
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Finance</p><h1>Payments</h1></div></div>{enrollments.length ? enrollments.map((enrollment) => { const summary = paymentSummary(enrollment.finalFee, enrollment.payments); return <section className="admin-panel" key={enrollment.id}><h2>{enrollment.batch.course.name}</h2><div className="admin-metrics"><Metric label="Final fee" value={formatInr(enrollment.finalFee)} /><Metric label="Received" value={formatInr(summary.paid)} /><Metric label="Outstanding" value={formatInr(summary.balance)} /></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th></tr></thead><tbody>{enrollment.payments.map((payment) => <tr key={payment.id}><td>{payment.paymentDate.toLocaleDateString("en-IN")}</td><td>{formatInr(payment.amount)}</td><td>{payment.paymentMethod.replaceAll("_", " ")}</td><td>{payment.referenceNumber || "—"}</td><td>{payment.status}</td></tr>)}</tbody></table></div></section>; }) : <div className="admin-empty">No payment records are available.</div>}</div>;
}
function Metric({label,value}:{label:string;value:string}){return <div className="admin-metric"><div><small>{label}</small><strong className="student-metric-value">{value}</strong></div></div>}
