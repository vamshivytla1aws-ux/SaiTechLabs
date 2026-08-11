import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { evaluateAndCompleteInterview } from "@/lib/interviews/service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  try {
    const { id } = await params;
    const result = await evaluateAndCompleteInterview(id);
    await writeAudit(admin.id, "INTERVIEW_EVALUATED", "MockInterview", id, { score: result.overallScore, result: result.result, model: result.model });
    return NextResponse.json({ success: true, ...result });
  } catch (error) { return adminError(500, error instanceof Error ? error.message : "Evaluation failed."); }
}
