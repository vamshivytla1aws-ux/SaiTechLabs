import type { AdminRole } from "@/generated/prisma/enums";
import { getDb } from "@/lib/db";

export async function trainerCanAccessBatch(admin: { id: string; role: AdminRole }, batchId: string) {
  if (admin.role !== "TRAINER") return true;
  const assignment = await getDb().trainerAssignment.findFirst({ where: { batchId, trainer: { adminUserId: admin.id, isActive: true } }, select: { id: true } });
  return Boolean(assignment);
}

export function batchScope(admin: { id: string; role: AdminRole }) {
  return admin.role === "TRAINER" ? { trainerAssignments: { some: { trainer: { adminUserId: admin.id, isActive: true } } } } : {};
}
