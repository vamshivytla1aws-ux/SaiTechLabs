import { compare, hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { clearAdminSession } from "@/lib/admin-session";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

const strongPassword = z.string().min(12).max(128).refine(value => /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value), "Password must include upper, lower, number and symbol.");
const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: strongPassword, confirmPassword: z.string().min(1).max(128) }).refine(data => data.newPassword === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, parsed.error.issues[0]?.message ?? "Invalid password information.");
    const stored = await getDb().adminUser.findUnique({ where: { id: admin.id }, select: { passwordHash: true } });
    if (!stored || !await compare(parsed.data.currentPassword, stored.passwordHash)) return adminError(400, "Current password is incorrect.");
    const passwordHash = await hash(parsed.data.newPassword, 12);
    await getDb().$transaction([
      getDb().adminUser.update({ where: { id: admin.id }, data: { passwordHash, sessionVersion: { increment: 1 } } }),
      getDb().adminAuditLog.create({ data: { adminId: admin.id, action: "PASSWORD_CHANGED", entityType: "AdminUser", entityId: admin.id } }),
    ]);
    await clearAdminSession();
    console.info("[admin-auth] Administrator changed password.");
    return NextResponse.json({ success: true, message: "Password changed. Please sign in again." }, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return adminError(500, "Could not change password."); }
}
