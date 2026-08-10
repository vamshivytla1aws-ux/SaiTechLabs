import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { trainerCanAccessBatch } from "@/lib/trainer-scope";

const schema = z.object({ records: z.array(z.object({ studentId: z.string(), status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]), notes: z.string().trim().max(500).optional() })).min(1).max(2000) }).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi(); if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "attendance:manage")) return adminError(403, "Forbidden.");
  const { id } = await params;
  const session = await getDb().attendanceSession.findUnique({ where: { id }, select: { batchId: true } });
  if (!session) return adminError(404, "Attendance session not found.");
  if (!await trainerCanAccessBatch(admin, session.batchId)) return adminError(403, "Forbidden.");
  try {
    const parsed = schema.safeParse(await readJsonBody(request)); if (!parsed.success) return adminError(400, "Invalid attendance records.");
    await getDb().$transaction(parsed.data.records.map((record) => getDb().attendanceRecord.upsert({ where: { sessionId_studentId: { sessionId: id, studentId: record.studentId } }, create: { sessionId: id, ...record }, update: { status: record.status, notes: record.notes } })));
    await writeAudit(admin.id, "ATTENDANCE_UPDATED", "AttendanceSession", id, { count: parsed.data.records.length });
    return NextResponse.json({ success: true });
  } catch { return adminError(400, "Attendance could not be updated."); }
}
