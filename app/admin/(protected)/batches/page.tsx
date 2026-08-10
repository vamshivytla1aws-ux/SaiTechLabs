import Link from "next/link";
import { BatchForm } from "@/components/admin/OperationsForms";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export default async function BatchesPage() {
  await requireAdminPermission("batches:manage");
  const [batches, courses] = await Promise.all([getDb().batch.findMany({ orderBy: { startDate: "desc" }, include: { course: true, _count: { select: { enrollments: true, attendanceSessions: true } } } }), getDb().course.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })]);
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Delivery</p><h1>Batches</h1><p>Plan cohorts, capacity, trainers, and attendance.</p></div></div><div className="admin-detail-grid"><section className="admin-panel"><header><h2>All batches</h2><small>{batches.length} total</small></header>{batches.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Batch</th><th>Course</th><th>Dates</th><th>Students</th><th>Status</th></tr></thead><tbody>{batches.map((batch) => <tr key={batch.id}><td><Link className="admin-row-link" href={`/admin/batches/${batch.id}`}>{batch.name}</Link><small>{batch.code} · {batch.mode}</small></td><td>{batch.course.name}</td><td>{batch.startDate.toLocaleDateString("en-IN")}<small>to {batch.endDate.toLocaleDateString("en-IN")}</small></td><td>{batch._count.enrollments} / {batch.capacity}</td><td>{batch.status}</td></tr>)}</tbody></table></div> : <p className="admin-empty">No batches yet.</p>}</section><aside className="admin-panel"><h2>Create batch</h2><BatchForm courses={courses.map((course) => ({ id: course.id, label: course.name }))} /></aside></div></div>;
}
