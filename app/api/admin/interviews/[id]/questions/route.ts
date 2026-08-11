import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { hasDuplicateQuestions, manualQuestionSchema } from "@/lib/interviews/config";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "admissions:manage")) return adminError(403, "Forbidden.");
  try {
    const parsed = manualQuestionSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, parsed.error.issues[0]?.message || "Invalid question.");
    const { id } = await params;
    const interview = await getDb().mockInterview.findUnique({ where: { id }, include: { questions: true } });
    if (!interview) return adminError(404, "Interview not found.");
    if (!['DRAFT', 'READY', 'INVITED'].includes(interview.status) || interview.startedAt) return adminError(409, "Questions are locked after the interview starts.");
    if (interview.questions.length >= interview.questionCount) return adminError(409, "The configured question count is already complete.");
    if (hasDuplicateQuestions([...interview.questions.map((question) => question.questionText), parsed.data.questionText])) return adminError(409, "This question duplicates an existing question.");
    const created = await getDb().mockInterviewQuestion.create({ data: { interviewId: id, position: interview.questions.length + 1, source: "MANUAL", ...parsed.data } });
    const nextCount = interview.questions.length + 1;
    await getDb().mockInterview.update({ where: { id }, data: { status: nextCount === interview.questionCount ? "READY" : "DRAFT" } });
    await writeAudit(admin.id, "INTERVIEW_UPDATED", "MockInterview", id, { manualQuestionAdded: true });
    return NextResponse.json({ success: true, questionId: created.id }, { status: 201 });
  } catch (error) { return adminError(500, error instanceof Error ? error.message : "Could not add question."); }
}
