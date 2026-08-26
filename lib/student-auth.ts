import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { readStudentSession } from "@/lib/student-session";

export async function getAuthenticatedStudent() { const session = await readStudentSession(); if (!session) return null; const account = await getDb().studentAccount.findUnique({ where: { id: session.accountId }, include: { student: true } }); if (!account?.isActive || !account.student.isActive || account.studentId !== session.studentId || account.sessionVersion !== session.sessionVersion) return null; return account; }
export async function requireStudent() { const account = await getAuthenticatedStudent(); if (!account) redirect("/student/login"); return account; }
export async function requireStudentApi() { return getAuthenticatedStudent(); }
