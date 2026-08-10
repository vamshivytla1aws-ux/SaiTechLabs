import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { readAdminSession } from "@/lib/admin-session";
import { can, type AdminPermission } from "@/lib/admin-permissions";

export async function getAuthenticatedAdmin() {
  const session = await readAdminSession();
  if (!session) return null;
  const admin = await getDb().adminUser.findUnique({ where: { id: session.adminId }, select: { id: true, name: true, email: true, role: true, isActive: true, sessionVersion: true, lastLoginAt: true, createdAt: true } });
  if (!admin?.isActive || admin.sessionVersion !== session.sessionVersion) return null;
  return admin;
}

export async function requireAdmin() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function requireAdminApi() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return null;
  return admin;
}

export async function requireAdminPermission(permission: AdminPermission) {
  const admin = await requireAdmin();
  if (!can(admin.role, permission)) redirect("/admin/dashboard?forbidden=1");
  return admin;
}
