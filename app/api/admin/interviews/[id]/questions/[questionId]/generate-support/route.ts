import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { generateQuestionSupport } from "@/lib/interviews/openai";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; questionId: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  try {
    const { id, questionId } = await params;
    const interview = await getDb().mockInterview.findUnique({ where: { id }, include: { questions: true } });
    const question = interview?.questions.find((value) => value.id === questionId && value.source === "MANUAL");
    if (!interview || !question) return adminError(404, "Manual question not found.");
    if (!['DRAFT', 'READY', 'INVITED'].includes(interview.status) || interview.startedAt) return adminError(409, "Questions are locked after the interview starts.");
    const generated = await generateQuestionSupport({ technology: question.technology, difficulty: question.difficulty, experienceRange: interview.experienceRange, questionText: question.questionText });
    await getDb().mockInterviewQuestion.update({ where: { id: questionId }, data: { referenceAnswer: generated.referenceAnswer, rubric: generated.rubric, maxScore: generated.maxScore, approvedAt: null } });
    await writeAudit(admin.id, "INTERVIEW_UPDATED", "MockInterview", id, { manualSupportGenerated: true, model: generated.model });
    return NextResponse.json({ success: true, message: "Reference answer and rubric generated. Review before approval." });
  } catch (error) { return adminError(500, error instanceof Error ? error.message : "Could not generate reference answer."); }
}
