import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { AdminAuditAction } from "@/generated/prisma/enums";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || request.headers.get("host");
    return Boolean(host && originUrl.host === host && (originUrl.protocol === "https:" || process.env.NODE_ENV !== "production"));
  } catch { return false; }
}

export function adminError(status: number, message: string) { return NextResponse.json({ success: false, message }, { status, headers: { "Cache-Control": "private, no-store, max-age=0" } }); }

export async function writeAudit(adminId: string, action: AdminAuditAction, entityType?: string, entityId?: string, metadata?: Record<string, string | number | boolean | null>) {
  await getDb().adminAuditLog.create({ data: { adminId, action, entityType, entityId, metadata } });
}
