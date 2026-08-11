import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { hasDuplicateQuestions, manualQuestionSchema } from "@/lib/interviews/config";

async function editable(id: string, questionId: string) {
  const interview = await getDb().mockInterview.findUnique({ where: { id }, include: { questions: true } });
  if (!interview || !interview.questions.some((question) => question.id === questionId)) return null;
  if (!['DRAFT', 'READY', 'INVITED'].includes(interview.status) || interview.startedAt) return false;
  return interview;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  try {
    const parsed = manualQuestionSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, parsed.error.issues[0]?.message || "Invalid question.");
    const { id, questionId } = await params;
    const interview = await editable(id, questionId);
    if (interview === null) return adminError(404, "Question not found.");
    if (interview === false) return adminError(409, "Questions are locked after the interview starts.");
    if (hasDuplicateQuestions([...interview.questions.filter((question) => question.id !== questionId).map((question) => question.questionText), parsed.data.questionText])) return adminError(409, "This question duplicates an existing question.");
    await getDb().mockInterviewQuestion.update({ where: { id: questionId }, data: { ...parsed.data, approvedAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) { return adminError(500, error instanceof Error ? error.message : "Could not update question."); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  const { id, questionId } = await params;
  const interview = await editable(id, questionId);
  if (interview === null) return adminError(404, "Question not found.");
  if (interview === false) return adminError(409, "Questions are locked after the interview starts.");
  await getDb().$transaction(async (tx) => {
    await tx.mockInterviewQuestion.delete({ where: { id: questionId } });
    const remaining = await tx.mockInterviewQuestion.findMany({ where: { interviewId: id }, orderBy: { position: "asc" } });
    for (let index = 0; index < remaining.length; index++) await tx.mockInterviewQuestion.update({ where: { id: remaining[index].id }, data: { position: index + 1 } });
    await tx.mockInterview.update({ where: { id }, data: { status: "DRAFT" } });
  });
  return NextResponse.json({ success: true });
}
