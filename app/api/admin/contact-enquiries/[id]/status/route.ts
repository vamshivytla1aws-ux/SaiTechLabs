import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

const schema = z.object({ status: z.enum(["NEW", "CONTACTED", "CLOSED"]) }).strict();
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "admissions:manage")) return adminError(403, "Forbidden.");
  const { id } = await params;
  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, "Invalid status.");
    const existing = await getDb().contactEnquiry.findUnique({ where: { id }, select: { status: true } });
    if (!existing) return adminError(404, "Contact enquiry not found.");
    await getDb().$transaction([
      getDb().contactEnquiry.update({ where: { id }, data: { status: parsed.data.status } }),
      getDb().adminAuditLog.create({ data: { adminId: admin.id, action: "CONTACT_STATUS_CHANGED", entityType: "ContactEnquiry", entityId: id, metadata: { from: existing.status, to: parsed.data.status } } }),
    ]);
    return NextResponse.json({ success: true, message: "Enquiry status updated." }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return adminError(500, "Could not update enquiry status."); }
}
