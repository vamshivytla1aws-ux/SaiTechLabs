import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { generateInterviewQuestions } from "@/lib/interviews/openai";
import { hasDuplicateQuestions } from "@/lib/interviews/config";
import { z } from "zod";

const requestSchema = z.object({ questionId: z.string().cuid().optional() }).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "admissions:manage")) return adminError(403, "Forbidden.");
  try {
    const parsed = requestSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, "Invalid generation request.");
    const { id } = await params;
    const interview = await getDb().mockInterview.findUnique({ where: { id }, include: { questions: { orderBy: { position: "asc" } } } });
    if (!interview) return adminError(404, "Interview not found.");
    if (!['DRAFT', 'READY', 'INVITED'].includes(interview.status) || interview.startedAt) return adminError(409, "Questions are locked after the interview starts.");
    const target = parsed.data.questionId ? interview.questions.find((question) => question.id === parsed.data.questionId && question.source === "AI") : null;
    if (parsed.data.questionId && !target) return adminError(404, "AI question not found.");
    const preserved = interview.questions.filter((question) => question.id !== target?.id && (target || question.source !== "AI"));
    const count = target ? 1 : interview.aiQuestionCount;
    if (!count) return adminError(400, "This interview does not require AI questions.");
    const generated = await generateInterviewQuestions({ technologies: interview.technologies, experienceRange: interview.experienceRange, difficulty: interview.difficulty, count, existingQuestions: preserved.map((question) => question.questionText) });
    const allText = [...preserved.map((question) => question.questionText), ...generated.questions.map((question) => question.question)];
    if (hasDuplicateQuestions(allText)) return adminError(422, "Generated questions contain a duplicate. Please generate again.");
    await getDb().$transaction(async (tx) => {
      if (target) {
        const question = generated.questions[0];
        await tx.mockInterviewQuestion.update({ where: { id: target.id }, data: { technology: question.technology, difficulty: question.difficulty, questionText: question.question, referenceAnswer: question.referenceAnswer, rubric: question.rubric, maxScore: question.maxScore, approvedAt: null } });
      } else {
        await tx.mockInterviewQuestion.deleteMany({ where: { interviewId: id, source: "AI" } });
        const manual = await tx.mockInterviewQuestion.findMany({ where: { interviewId: id, source: "MANUAL" }, orderBy: { position: "asc" } });
        for (let index = 0; index < manual.length; index++) await tx.mockInterviewQuestion.update({ where: { id: manual[index].id }, data: { position: index + 1 } });
        await tx.mockInterviewQuestion.createMany({ data: generated.questions.map((question, index) => ({ interviewId: id, position: manual.length + index + 1, source: "AI", technology: question.technology, difficulty: question.difficulty, questionText: question.question, referenceAnswer: question.referenceAnswer, rubric: question.rubric, maxScore: question.maxScore })) });
      }
      const countNow = await tx.mockInterviewQuestion.count({ where: { interviewId: id } });
      await tx.mockInterview.update({ where: { id }, data: { status: countNow === interview.questionCount ? "READY" : "DRAFT", evaluationModel: generated.model } });
    });
    await writeAudit(admin.id, "INTERVIEW_UPDATED", "MockInterview", id, { generated: count, model: generated.model });
    return NextResponse.json({ success: true, message: target ? "Question regenerated." : `${count} AI questions generated.` });
  } catch (error) { return adminError(500, error instanceof Error ? error.message : "Question generation failed."); }
}
