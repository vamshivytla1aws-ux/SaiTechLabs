import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const currentEmail = process.env.RESET_ADMIN_CURRENT_EMAIL?.trim().toLowerCase();
const email = process.env.RESET_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.RESET_ADMIN_PASSWORD;

if (!connectionString || !currentEmail || !email || !password) throw new Error("DATABASE_URL and all RESET_ADMIN_* variables are required.");
if (!/^\S+@\S+\.\S+$/.test(currentEmail) || !/^\S+@\S+\.\S+$/.test(email)) throw new Error("Administrator email is invalid.");
if (password.length < 12 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) throw new Error("Administrator password must contain 12 to 128 characters with upper/lowercase, a number and symbol.");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
try {
  const admin = await db.adminUser.findUnique({ where: { email: currentEmail }, select: { id: true } });
  if (!admin) throw new Error("The current administrator account was not found. No changes were made.");
  const collision = await db.adminUser.findUnique({ where: { email }, select: { id: true } });
  if (collision && collision.id !== admin.id) throw new Error("The requested email is already assigned to another administrator.");
  const passwordHash = await hash(password, 12);
  await db.$transaction([
    db.adminUser.update({ where: { id: admin.id }, data: { email, passwordHash, role: "SUPER_ADMIN", isActive: true, sessionVersion: { increment: 1 } } }),
    db.adminAuditLog.create({ data: { adminId: admin.id, action: "PASSWORD_CHANGED", entityType: "AdminUser", entityId: admin.id, metadata: { accountRecovery: true, emailChanged: currentEmail !== email } } }),
  ]);
  console.log("Administrator credentials and role updated successfully. Existing sessions were invalidated.");
} finally {
  await db.$disconnect();
}
