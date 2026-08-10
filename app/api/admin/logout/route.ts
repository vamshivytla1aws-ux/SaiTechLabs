import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { clearAdminSession } from "@/lib/admin-session";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (admin) { await writeAudit(admin.id, "LOGOUT"); console.info("[admin-auth] Administrator logged out."); }
  await clearAdminSession();
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
}
