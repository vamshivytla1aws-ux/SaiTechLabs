import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { money } from "@/lib/operations";

const schema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "ENROLLED", "ACTIVE", "COMPLETED", "DROPPED", "CANCELLED"]).optional(),
  courseFee: z.coerce.number().min(0).max(10000000).optional(),
  discount: z.coerce.number().min(0).max(10000000).optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
}).strict().refine(value => value.courseFee === undefined || value.discount === undefined || value.discount <= value.courseFee, { message: "Discount cannot exceed the course fee." });

async function authorize(request: Request) {
  if (!sameOrigin(request)) return { error: adminError(403, "Invalid request.") };
  const admin = await requireAdminApi();
  if (!admin) return { error: adminError(401, "Unauthorized.") };
  if (!can(admin.role, "students:manage")) return { error: adminError(403, "Forbidden.") };
  return { admin };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request); if (auth.error) return auth.error; const { id } = await params;
  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, parsed.error.issues[0]?.message || "Invalid enrollment information.");
    const current = await getDb().enrollment.findUnique({ where: { id }, select: { courseFee: true, discount: true } });
    if (!current) return adminError(404, "Enrollment not found.");
    const courseFee = money(parsed.data.courseFee ?? current.courseFee);
    const discount = money(parsed.data.discount ?? current.discount);
    if (discount.greaterThan(courseFee)) return adminError(400, "Discount cannot exceed the course fee.");
    await getDb().enrollment.update({ where: { id }, data: { status: parsed.data.status, courseFee, discount, finalFee: courseFee.minus(discount), notes: parsed.data.notes, completedAt: parsed.data.status === "COMPLETED" ? new Date() : parsed.data.status ? null : undefined } });
    await writeAudit(auth.admin!.id, "ENROLLMENT_UPDATED", "Enrollment", id, parsed.data.status ? { status: parsed.data.status } : undefined);
    return NextResponse.json({ success: true });
  } catch { return adminError(409, "Enrollment could not be updated."); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request); if (auth.error) return auth.error; const { id } = await params;
  try {
    await getDb().enrollment.update({ where: { id }, data: { status: "CANCELLED", completedAt: null } });
    await writeAudit(auth.admin!.id, "ENROLLMENT_UPDATED", "Enrollment", id, { action: "cancelled" });
    return NextResponse.json({ success: true, message: "Enrollment cancelled. Payment and attendance history were retained." });
  } catch { return adminError(404, "Enrollment not found."); }
}
