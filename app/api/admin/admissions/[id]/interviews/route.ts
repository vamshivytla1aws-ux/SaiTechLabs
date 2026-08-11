import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { createInterviewSchema } from "@/lib/interviews/config";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "admissions:manage")) return adminError(403, "Forbidden.");
  try {
    const parsed = createInterviewSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, parsed.error.issues[0]?.message || "Invalid interview configuration.");
    const { id } = await params;
    const admission = await getDb().admission.findUnique({ where: { id }, select: { id: true } });
    if (!admission) return adminError(404, "Admission not found.");
    const interview = await getDb().$transaction(async (tx) => {
      const created = await tx.mockInterview.create({ data: { admissionId: id, createdByAdminId: admin.id, ...parsed.data, expiresAt: new Date(parsed.data.expiresAt) } });
      await tx.adminAuditLog.create({ data: { adminId: admin.id, action: "INTERVIEW_CREATED", entityType: "MockInterview", entityId: created.id, metadata: { admissionId: id, type: created.type, questionCount: created.questionCount } } });
      return created;
    });
    return NextResponse.json({ success: true, interviewId: interview.id }, { status: 201 });
  } catch (error) { return adminError(500, error instanceof Error ? error.message : "Could not create interview."); }
}
