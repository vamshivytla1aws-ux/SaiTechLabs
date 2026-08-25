import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { rubricSchema } from "@/lib/interviews/config";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  try {
    const { id } = await params;
    const db = getDb();
    const interview = await db.mockInterview.findUnique({ where: { id }, include: { questions: true } });
    if (!interview) return adminError(404, "Interview not found.");
    if (!["DRAFT", "READY", "INVITED"].includes(interview.status) || interview.startedAt) return adminError(409, "Questions are locked.");
    if (interview.questions.length !== interview.questionCount) return adminError(409, `Add all ${interview.questionCount} questions before approval.`);
    const invalid = interview.questions.find(question => !question.questionText.trim() || !question.referenceAnswer.trim() || !rubricSchema.safeParse(question.rubric).success);
    if (invalid) return adminError(409, `Question ${invalid.position} needs a valid question, reference answer, and rubric before approval.`);
    const approvedAt = new Date();
    const approvedCount = await db.$transaction(async tx => {
      const updated = await tx.mockInterviewQuestion.updateMany({ where: { interviewId: id }, data: { approvedAt } });
      if (updated.count !== interview.questionCount) throw new Error("QUESTION_COUNT_CHANGED");
      await tx.mockInterview.update({ where: { id }, data: { status: "READY" } });
      return updated.count;
    });
    await writeAudit(admin.id, "INTERVIEW_UPDATED", "MockInterview", id, { questionsApproved: approvedCount });
    return NextResponse.json({ success: true, message: `All ${approvedCount} questions approved. You can now send the invitation.` });
  } catch (error) {
    return adminError(500, error instanceof Error && error.message !== "QUESTION_COUNT_CHANGED" ? error.message : "Questions changed during approval. Refresh and try again.");
  }
}
