import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { issueToken } from "@/lib/operations";

const schema = z.object({ type: z.enum(["ENROLLMENT_STATUS", "STUDENT_FEEDBACK", "COLLEGE_FEEDBACK"]), enrollmentId: z.string().nullable().optional(), batchId: z.string().nullable().optional(), collegeName: z.string().trim().max(200).nullable().optional(), expiresAt: z.coerce.date().nullable().optional(), singleUse: z.boolean().default(false) }).strict();
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request."); const admin = await requireAdminApi(); if (!admin) return adminError(401, "Unauthorized."); if (!can(admin.role, "students:manage")) return adminError(403, "Forbidden."); const { id } = await params;
  try {
    const parsed = schema.safeParse(await readJsonBody(request)); if (!parsed.success) return adminError(400, "Invalid link information.");
    if (parsed.data.expiresAt && parsed.data.expiresAt <= new Date()) return adminError(400, "Expiry must be in the future.");
    if (parsed.data.enrollmentId) { const enrollment = await getDb().enrollment.findUnique({ where: { id: parsed.data.enrollmentId }, select: { studentId: true, batchId: true } }); if (!enrollment || enrollment.studentId !== id) return adminError(400, "Enrollment does not belong to this student."); if (parsed.data.batchId && parsed.data.batchId !== enrollment.batchId) return adminError(400, "Batch does not match the enrollment."); }
    if (parsed.data.type === "ENROLLMENT_STATUS" && !parsed.data.enrollmentId) return adminError(400, "Status links require an enrollment.");
    const { token, tokenHash } = issueToken();
    const link = await getDb().$transaction(async (transaction) => { const created = await transaction.publicLink.create({ data: { ...parsed.data, studentId: id, tokenHash } }); await transaction.adminAuditLog.create({ data: { adminId: admin.id, action: parsed.data.type === "ENROLLMENT_STATUS" ? "STATUS_LINK_CREATED" : "FEEDBACK_LINK_CREATED", entityType: "PublicLink", entityId: created.id } }); return created; });
    const path = parsed.data.type === "ENROLLMENT_STATUS" ? `/status/${token}` : parsed.data.type === "STUDENT_FEEDBACK" ? `/feedback/student/${token}` : `/feedback/college/${token}`;
    return NextResponse.json({ success: true, id: link.id, url: `https://www.saitechlabs.in${path}` }, { status: 201 });
  } catch { return adminError(400, "Public link could not be created."); }
}
