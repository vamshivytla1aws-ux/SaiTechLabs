import { requireStudent } from "@/lib/student-auth";
import { getDb } from "@/lib/db";

export default async function CoursePage() {
  const account = await requireStudent();
  const enrollments = await getDb().enrollment.findMany({ where: { studentId: account.studentId }, orderBy: { enrolledAt: "desc" }, include: { batch: { include: { course: true, trainerAssignments: { include: { trainer: true } } } } } });
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Learning</p><h1>My courses</h1></div></div>{enrollments.length ? enrollments.map((item) => <section className="admin-panel" key={item.id}><h2>{item.batch.course.name}</h2><dl className="admin-definition"><div><dt>Batch</dt><dd>{item.batch.name} ({item.batch.code})</dd></div><div><dt>Status</dt><dd>{item.status.replaceAll("_", " ")}</dd></div><div><dt>Mode</dt><dd>{item.batch.mode}</dd></div><div><dt>Schedule</dt><dd>{item.batch.startDate.toLocaleDateString("en-IN")} – {item.batch.endDate.toLocaleDateString("en-IN")}</dd></div><div><dt>Duration</dt><dd>{item.batch.course.durationDays} days</dd></div><div><dt>Trainers</dt><dd>{item.batch.trainerAssignments.map((assignment) => assignment.trainer.name).join(", ") || "To be assigned"}</dd></div></dl><p>{item.batch.course.description}</p></section>) : <div className="admin-empty">No course enrollment is available yet.</div>}</div>;
}
