import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

const schema = z.object({ note: z.string().trim().min(2).max(2000) }).strict();
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  const { id } = await params;
  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, "Note must contain between 2 and 2,000 characters.");
    const exists = await getDb().admission.findUnique({ where: { id }, select: { id: true } });
    if (!exists) return adminError(404, "Admission not found.");
    await getDb().$transaction([
      getDb().admissionNote.create({ data: { admissionId: id, note: parsed.data.note, createdByAdminId: admin.id } }),
      getDb().adminAuditLog.create({ data: { adminId: admin.id, action: "NOTE_ADDED", entityType: "Admission", entityId: id } }),
    ]);
    return NextResponse.json({ success: true, message: "Note added." }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch { return adminError(500, "Could not add note."); }
}
