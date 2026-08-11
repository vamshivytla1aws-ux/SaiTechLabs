import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  const { id } = await params;
  const interview = await getDb().mockInterview.findUnique({ where: { id }, select: { status: true } });
  if (!interview) return adminError(404, "Interview not found.");
  if (['SUBMITTED', 'EVALUATING', 'COMPLETED'].includes(interview.status)) return adminError(409, "A submitted interview cannot be cancelled.");
  await getDb().mockInterview.update({ where: { id }, data: { status: "CANCELLED", cancelledAt: new Date(), tokenHash: null } });
  await writeAudit(admin.id, "INTERVIEW_CANCELLED", "MockInterview", id);
  return NextResponse.json({ success: true });
}
