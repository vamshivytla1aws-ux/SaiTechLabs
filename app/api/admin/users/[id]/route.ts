import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";

const password = z.string().min(12).max(128).refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value));
const schema = z.object({ role: z.enum(["SUPER_ADMIN", "ADMIN", "COUNSELOR", "ACCOUNTANT", "TRAINER"]).optional(), isActive: z.boolean().optional(), newPassword: password.optional() }).strict();
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request."); const admin = await requireAdminApi(); if (!admin) return adminError(401, "Unauthorized."); if (!can(admin.role, "users:manage")) return adminError(403, "Forbidden."); const { id } = await params; if (id === admin.id) return adminError(400, "Use Settings to change your own account.");
  try {
    const parsed = schema.safeParse(await readJsonBody(request)); if (!parsed.success) return adminError(400, "Invalid account update."); const current = await getDb().adminUser.findUnique({ where: { id } }); if (!current) return adminError(404, "Administrator not found.");
    if (current.role === "SUPER_ADMIN" && current.isActive && (parsed.data.role && parsed.data.role !== "SUPER_ADMIN" || parsed.data.isActive === false)) { const activeSuperAdmins = await getDb().adminUser.count({ where: { role: "SUPER_ADMIN", isActive: true } }); if (activeSuperAdmins <= 1) return adminError(400, "The final active super administrator cannot be demoted or deactivated."); }
    const passwordHash = parsed.data.newPassword ? await hash(parsed.data.newPassword, 12) : undefined;
    await getDb().$transaction([getDb().adminUser.update({ where: { id }, data: { role: parsed.data.role, isActive: parsed.data.isActive, passwordHash, sessionVersion: { increment: 1 } } }), getDb().adminAuditLog.create({ data: { adminId: admin.id, action: parsed.data.role && parsed.data.role !== current.role ? "ROLE_CHANGED" : "ADMIN_UPDATED", entityType: "AdminUser", entityId: id, metadata: { role: parsed.data.role ?? current.role, isActive: parsed.data.isActive ?? current.isActive, passwordReset: Boolean(passwordHash) } } })]);
    return NextResponse.json({ success: true });
  } catch { return adminError(404, "Administrator not found."); }
}
