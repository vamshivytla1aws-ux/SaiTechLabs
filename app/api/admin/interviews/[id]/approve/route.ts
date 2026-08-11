import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  const { id } = await params;
  const interview = await getDb().mockInterview.findUnique({ where: { id }, include: { questions: true } });
  if (!interview) return adminError(404, "Interview not found.");
  if (!['DRAFT', 'READY', 'INVITED'].includes(interview.status) || interview.startedAt) return adminError(409, "Questions are locked.");
  if (interview.questions.length !== interview.questionCount) return adminError(409, `Add all ${interview.questionCount} questions before approval.`);
  await getDb().$transaction([getDb().mockInterviewQuestion.updateMany({ where: { interviewId: id }, data: { approvedAt: new Date() } }), getDb().mockInterview.update({ where: { id }, data: { status: "READY" } })]);
  await writeAudit(admin.id, "INTERVIEW_UPDATED", "MockInterview", id, { questionsApproved: interview.questionCount });
  return NextResponse.json({ success: true });
}
