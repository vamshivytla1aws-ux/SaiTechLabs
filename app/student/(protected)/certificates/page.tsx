import { requireStudent } from "@/lib/student-auth";
import { getDb } from "@/lib/db";

export default async function CertificatesPage() {
  const account = await requireStudent();
  const certificates = await getDb().certificate.findMany({ where: { studentId: account.studentId }, orderBy: { createdAt: "desc" }, include: { enrollment: { include: { batch: { include: { course: true } } } } } });
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Achievements</p><h1>Certificates</h1></div></div>{certificates.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Certificate number</th><th>Course</th><th>Issued</th><th>Status</th></tr></thead><tbody>{certificates.map((certificate) => <tr key={certificate.id}><td>{certificate.certificateNumber}</td><td>{certificate.enrollment.batch.course.name}</td><td>{certificate.issuedAt?.toLocaleDateString("en-IN") || "Not issued"}</td><td>{certificate.status}</td></tr>)}</tbody></table></div> : <div className="admin-empty">No certificates are available yet.</div>}</div>;
}
