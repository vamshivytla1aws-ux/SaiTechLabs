import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

const schema = z.object({ leadStatus: z.enum(["NEW", "CONTACTED", "FOLLOW_UP", "JOINED", "NOT_INTERESTED"]), nextFollowUpAt: z.string().max(40).nullable().optional() }).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  const { id } = await params;
  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, "Invalid status information.");
    const existing = await getDb().admission.findUnique({ where: { id }, select: { leadStatus: true } });
    if (!existing) return adminError(404, "Admission not found.");
    const followUp = parsed.data.nextFollowUpAt ? new Date(parsed.data.nextFollowUpAt) : null;
    if (followUp && Number.isNaN(followUp.getTime())) return adminError(400, "Invalid follow-up date.");
    await getDb().$transaction([
      getDb().admission.update({ where: { id }, data: { leadStatus: parsed.data.leadStatus, nextFollowUpAt: followUp, ...(parsed.data.leadStatus === "CONTACTED" && existing.leadStatus !== "CONTACTED" ? { lastContactedAt: new Date() } : {}) } }),
      getDb().adminAuditLog.create({ data: { adminId: admin.id, action: "ADMISSION_STATUS_CHANGED", entityType: "Admission", entityId: id, metadata: { from: existing.leadStatus, to: parsed.data.leadStatus } } }),
    ]);
    return NextResponse.json({ success: true, message: "Lead information updated." }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return adminError(500, "Could not update lead status."); }
}
