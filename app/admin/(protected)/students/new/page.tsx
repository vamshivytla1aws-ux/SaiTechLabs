import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ManualStudentForm } from "@/components/admin/ManualStudentForm";
import { requireAdminPermission } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export default async function NewStudentPage() {
  await requireAdminPermission("students:manage");
  const batches = await getDb().batch.findMany({
    where: { status: { not: "CANCELLED" } },
    orderBy: [{ startDate: "desc" }, { code: "asc" }],
    select: { id: true, code: true, name: true, status: true, course: { select: { name: true } } },
  });
  return <div className="admin-page">
    <Link className="admin-back" href="/admin/students"><ArrowLeft />Back to students</Link>
    <div className="admin-page-head"><div><p className="admin-kicker">Manual enrollment</p><h1>Add student</h1><p>Create a student and enroll them in a batch without requiring a public admission enquiry.</p></div></div>
    <section className="admin-panel"><h2>Student and enrollment details</h2><ManualStudentForm batches={batches.map(batch => ({ id: batch.id, label: `${batch.course.name} · ${batch.code} · ${batch.name} (${batch.status})` }))} /></section>
  </div>;
}
