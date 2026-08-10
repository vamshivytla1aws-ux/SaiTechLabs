import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonBody } from "@/lib/api";
import { setAdminSession } from "@/lib/admin-session";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
const loginSchema = z.object({ email: z.email().max(254).transform(value => value.trim().toLowerCase()), password: z.string().min(1).max(128) }).strict();
const DUMMY_HASH = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.5R1Z9qjR1k0r2Jr8vG3F/EmEeWGgO1a";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  try {
    const body = await readJsonBody(request);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return adminError(400, "Invalid email or password.");
    const rate = checkRateLimit(`admin-login:${requestIp(request)}:${parsed.data.email}`, 5, 15 * 60 * 1000);
    if (!rate.allowed) return adminError(429, "Too many sign-in attempts. Please try again later.");

    const admin = await getDb().adminUser.findUnique({ where: { email: parsed.data.email } });
    const passwordValid = await compare(parsed.data.password, admin?.passwordHash ?? DUMMY_HASH);
    if (!admin || !admin.isActive || !passwordValid) {
      console.warn("[admin-auth] Failed login attempt.");
      return adminError(401, "Invalid email or password.");
    }

    const updated = await getDb().adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await writeAudit(admin.id, "LOGIN");
    await setAdminSession({ adminId: updated.id, email: updated.email, name: updated.name, role: updated.role, sessionVersion: updated.sessionVersion });
    console.info("[admin-auth] Successful admin login.");
    return NextResponse.json({ success: true, message: "Signed in successfully." }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    console.error("[admin-auth] Login failed.");
    return adminError(500, "Something went wrong. Please try again.");
  }
}
