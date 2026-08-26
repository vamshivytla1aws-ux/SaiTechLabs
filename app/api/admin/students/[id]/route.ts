import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { normalEmail, normalPhone } from "@/lib/operations";
import { currentStatuses, qualifications, requiredAadhaarSchema } from "@/lib/validation";

const schema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  aadhaarNumber: requiredAadhaarSchema.optional(),
  email: z.email().max(254).transform(normalEmail).optional(),
  phone: z.string().trim().min(10).max(20).transform(normalPhone).refine(value => /^\+91[6-9]\d{9}$/.test(value), "Enter a valid Indian mobile number.").optional(),
  qualification: z.enum(qualifications).optional(), graduationYear: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 8).optional(),
  collegeName: z.string().trim().min(2).max(160).optional(), state: z.string().trim().min(2).max(80).optional(), currentStatus: z.enum(currentStatuses).optional(),
  isActive: z.boolean().optional(),
}).strict();

async function authorize(request: Request) { if (!sameOrigin(request)) return { error: adminError(403, "Invalid request.") }; const admin = await requireAdminApi(); if (!admin) return { error: adminError(401, "Unauthorized.") }; if (!can(admin.role, "students:manage")) return { error: adminError(403, "Forbidden.") }; return { admin }; }

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request); if (auth.error) return auth.error; const { id } = await params;
  try { const parsed = schema.safeParse(await readJsonBody(request)); if (!parsed.success) return adminError(400, parsed.error.issues[0]?.message || "Invalid student information."); const db = getDb(); await db.$transaction(async tx => { await tx.student.update({ where: { id }, data: { ...parsed.data, archivedAt: parsed.data.isActive === true ? null : parsed.data.isActive === false ? new Date() : undefined } }); if (parsed.data.isActive === false) await tx.studentAccount.updateMany({ where: { studentId: id }, data: { isActive: false, sessionVersion: { increment: 1 } } }); }); await writeAudit(auth.admin!.id, "STUDENT_UPDATED", "Student", id, { action: parsed.data.isActive === true ? "restored" : "profile_updated" }); return NextResponse.json({ success: true }); } catch { return adminError(409, "Student details conflict with another record or the student was not found."); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorize(request); if (auth.error) return auth.error; const { id } = await params;
  try { const db = getDb(); await db.$transaction(async tx => { await tx.student.update({ where: { id }, data: { isActive: false, archivedAt: new Date() } }); await tx.studentAccount.updateMany({ where: { studentId: id }, data: { isActive: false, sessionVersion: { increment: 1 } } }); }); await writeAudit(auth.admin!.id, "STUDENT_UPDATED", "Student", id, { action: "archived" }); return NextResponse.json({ success: true, message: "Student archived. Historical records were retained." }); } catch { return adminError(404, "Student not found."); }
}
