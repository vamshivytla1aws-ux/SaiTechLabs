import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { trainerCanAccessBatch } from "@/lib/trainer-scope";

const schema = z.object({ sessionDate: z.coerce.date(), topic: z.string().trim().min(2).max(300), trainerId: z.string().nullable().optional(), records: z.array(z.object({ studentId: z.string(), status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]), notes: z.string().trim().max(500).optional() })).max(2000) }).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi(); if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "attendance:manage")) return adminError(403, "Forbidden.");
  const { id } = await params;
  if (!await trainerCanAccessBatch(admin, id)) return adminError(403, "Forbidden.");
  try {
    const parsed = schema.safeParse(await readJsonBody(request)); if (!parsed.success) return adminError(400, "Invalid attendance information.");
    const session = await getDb().$transaction(async (transaction) => {
      const created = await transaction.attendanceSession.create({ data: { batchId: id, sessionDate: parsed.data.sessionDate, topic: parsed.data.topic, trainerId: parsed.data.trainerId || null } });
      if (parsed.data.records.length) await transaction.attendanceRecord.createMany({ data: parsed.data.records.map((record) => ({ ...record, sessionId: created.id })) });
      await transaction.adminAuditLog.create({ data: { adminId: admin.id, action: "ATTENDANCE_UPDATED", entityType: "AttendanceSession", entityId: created.id, metadata: { batchId: id, count: parsed.data.records.length } } });
      return created;
    });
    return NextResponse.json({ success: true, id: session.id }, { status: 201 });
  } catch { return adminError(400, "Attendance could not be saved."); }
}
