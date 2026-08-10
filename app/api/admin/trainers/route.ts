import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { normalEmail, normalPhone } from "@/lib/operations";

const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.email().max(254), phone: z.string().min(10).max(20), specialization: z.string().trim().min(2).max(200), bio: z.string().trim().max(2000).optional(), experienceSummary: z.string().trim().max(1000).optional(), adminUserId: z.string().nullable().optional() }).strict();
export async function POST(request: Request) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request."); const admin = await requireAdminApi(); if (!admin) return adminError(401, "Unauthorized."); if (!can(admin.role, "trainers:manage")) return adminError(403, "Forbidden.");
  try { const parsed = schema.safeParse(await readJsonBody(request)); if (!parsed.success) return adminError(400, "Invalid trainer information."); const trainer = await getDb().trainer.create({ data: { ...parsed.data, adminUserId: parsed.data.adminUserId || null, email: normalEmail(parsed.data.email), phone: normalPhone(parsed.data.phone) } }); await writeAudit(admin.id, "TRAINER_UPDATED", "Trainer", trainer.id, { action: "created" }); return NextResponse.json({ success: true, id: trainer.id }, { status: 201 }); } catch { return adminError(409, "Trainer email or linked administrator already exists."); }
}
