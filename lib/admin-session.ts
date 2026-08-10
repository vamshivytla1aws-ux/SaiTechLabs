import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "saitech_admin_session";
const ISSUER = "https://www.saitechlabs.in";
const AUDIENCE = "saitechlabs-admin";
const SESSION_SECONDS = 8 * 60 * 60;

export type AdminSession = { adminId: string; email: string; name: string; role: "SUPER_ADMIN" | "ADMIN"; sessionVersion: number };

function sessionKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin session configuration is unavailable.");
  return new TextEncoder().encode(secret);
}

export async function signAdminSession(session: AdminSession) {
  return new SignJWT({ email: session.email, name: session.name, role: session.role, sv: session.sessionVersion })
    .setProtectedHeader({ alg: "HS256" }).setSubject(session.adminId).setIssuer(ISSUER).setAudience(AUDIENCE)
    .setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(sessionKey());
}

export async function verifyAdminSession(token?: string | null): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { issuer: ISSUER, audience: AUDIENCE, algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string" || (payload.role !== "SUPER_ADMIN" && payload.role !== "ADMIN") || typeof payload.sv !== "number") return null;
    return { adminId: payload.sub, email: payload.email, name: payload.name, role: payload.role, sessionVersion: payload.sv };
  } catch { return null; }
}

export async function readAdminSession() { return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value); }

export async function setAdminSession(session: AdminSession) {
  (await cookies()).set(ADMIN_COOKIE, await signAdminSession(session), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS });
}

export async function clearAdminSession() { (await cookies()).set(ADMIN_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 }); }
