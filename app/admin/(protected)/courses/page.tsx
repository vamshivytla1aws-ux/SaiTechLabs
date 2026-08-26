import { CourseEditForm, CourseForm } from "@/components/admin/OperationsForms";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export default async function CoursesPage() {
  await requireAdminPermission("courses:manage");
  const courses = await getDb().course.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { batches: true } } } });
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Catalogue</p><h1>Courses</h1><p>Manage training programmes used by batches and enrollments.</p></div></div><div className="admin-detail-grid"><section className="admin-panel"><header><h2>Course catalogue</h2><small>{courses.length} total</small></header>{courses.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Duration</th><th>Batches</th><th>Status</th><th>Actions</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id}><td><strong>{course.name}</strong><small>{course.shortDescription}</small></td><td>{course.durationDays} days</td><td>{course._count.batches}</td><td>{course.isActive ? "Active" : "Inactive"}</td><td><CourseEditForm course={course} /></td></tr>)}</tbody></table></div> : <p className="admin-empty">No courses yet.</p>}</section><aside className="admin-panel"><h2>Create course</h2><CourseForm /></aside></div></div>;
}
