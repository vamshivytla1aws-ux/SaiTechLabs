import { requireStudent } from "@/lib/student-auth";
import { getDb } from "@/lib/db";

export default async function AttendancePage() {
  const account = await requireStudent();
  const records = await getDb().attendanceRecord.findMany({ where: { studentId: account.studentId }, orderBy: { session: { sessionDate: "desc" } }, include: { session: { include: { batch: { include: { course: true } } } } } });
  const attended = records.filter((record) => record.status === "PRESENT" || record.status === "LATE").length;
  const percentage = records.length ? Math.round(attended / records.length * 100) : 0;
  return <div className="admin-page"><div className="admin-page-head"><div><p className="admin-kicker">Learning</p><h1>Attendance</h1><p>{records.length ? `${attended} of ${records.length} sessions attended (${percentage}%)` : "No attendance sessions recorded yet."}</p></div></div>{records.length > 0 && <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Date</th><th>Course / batch</th><th>Topic</th><th>Status</th><th>Notes</th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td>{record.session.sessionDate.toLocaleDateString("en-IN")}</td><td>{record.session.batch.course.name}<br/><small>{record.session.batch.code}</small></td><td>{record.session.topic}</td><td>{record.status}</td><td>{record.notes || "—"}</td></tr>)}</tbody></table></div>}</div>;
}
