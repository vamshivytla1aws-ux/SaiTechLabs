import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const STUDENT_COOKIE = "saitech_student_session";
const ISSUER = "https://www.saitechlabs.in"; const AUDIENCE = "saitechlabs-student"; const SESSION_SECONDS = 8 * 60 * 60;
export type StudentSession = { accountId: string; studentId: string; sessionVersion: number };
function key() { const secret = process.env.AUTH_SECRET; if (!secret || secret.length < 32) throw new Error("Student session configuration is unavailable."); return new TextEncoder().encode(secret); }
export async function signStudentSession(session: StudentSession) { return new SignJWT({ studentId: session.studentId, sv: session.sessionVersion }).setProtectedHeader({ alg: "HS256" }).setSubject(session.accountId).setIssuer(ISSUER).setAudience(AUDIENCE).setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(key()); }
export async function verifyStudentSession(token?: string | null): Promise<StudentSession | null> { if (!token) return null; try { const { payload } = await jwtVerify(token, key(), { issuer: ISSUER, audience: AUDIENCE, algorithms: ["HS256"] }); if (!payload.sub || typeof payload.studentId !== "string" || typeof payload.sv !== "number") return null; return { accountId: payload.sub, studentId: payload.studentId, sessionVersion: payload.sv }; } catch { return null; } }
export async function readStudentSession() { return verifyStudentSession((await cookies()).get(STUDENT_COOKIE)?.value); }
export async function setStudentSession(session: StudentSession) { (await cookies()).set(STUDENT_COOKIE, await signStudentSession(session), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: SESSION_SECONDS }); }
export async function clearStudentSession() { (await cookies()).set(STUDENT_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 }); }
