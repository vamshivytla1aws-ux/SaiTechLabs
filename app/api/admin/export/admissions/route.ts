import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { admissionOrder, admissionWhere } from "@/lib/admin-query";
import { getDb } from "@/lib/db";
import { adminError, writeAudit } from "@/lib/admin-security";

function csvCell(value: unknown) {
  let text = value == null ? "" : value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const admin = await requireAdminApi(); if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "reports:view") && !can(admin.role, "admissions:manage")) return adminError(403, "Forbidden.");
  try {
    const url = new URL(request.url); const params = Object.fromEntries(url.searchParams.entries());
    const rows = await getDb().admission.findMany({ where: admissionWhere(params), orderBy: admissionOrder(params.sort), take: 10000 });
    const headers = ["Reference ID", "Student", "Email", "Phone", "Course", "Qualification", "Current status", "Graduation year", "College", "State", "Training mode", "Lead status", "Submitted", "Next follow-up", "Last contacted", "Message"];
    const data = rows.map(row => [row.id, row.studentName, row.email, row.phone, row.course, row.qualification, row.currentStatus, row.graduationYear, row.collegeName, row.state, row.trainingMode, row.leadStatus, row.createdAt, row.nextFollowUpAt, row.lastContactedAt, row.message].map(csvCell).join(","));
    await writeAudit(admin.id, "EXPORT_CREATED", "Admission", undefined, { count: rows.length });
    return new Response(`\uFEFF${headers.map(csvCell).join(",")}\r\n${data.join("\r\n")}`, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="saitech-admissions-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "private, no-store" } });
  } catch { return adminError(500, "Could not export admissions."); }
}
