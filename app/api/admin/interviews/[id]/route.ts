import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

const schema = z.object({ expiresAt: z.string().datetime() }).strict();
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success || new Date(parsed.data.expiresAt) <= new Date()) return adminError(400, "Choose a future expiry.");
    const { id } = await params;
    const interview = await getDb().mockInterview.findUnique({ where: { id }, select: { status: true } });
    if (!interview) return adminError(404, "Interview not found.");
    if (["SUBMITTED", "EVALUATING", "COMPLETED", "CANCELLED"].includes(interview.status)) return adminError(409, "Expiry cannot be changed now.");
    await getDb().mockInterview.update({ where: { id }, data: { expiresAt: new Date(parsed.data.expiresAt), status: interview.status === "EXPIRED" ? "READY" : undefined } });
    await writeAudit(admin.id, "INTERVIEW_UPDATED", "MockInterview", id, { expiryExtended: true });
    return NextResponse.json({ success: true });
  } catch (error) { return adminError(500, error instanceof Error ? error.message : "Could not extend expiry."); }
}
