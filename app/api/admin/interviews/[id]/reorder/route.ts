import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonBody } from "@/lib/api";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

const schema = z.object({ questionId: z.string().cuid(), direction: z.enum(["up", "down"]) }).strict();
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  const parsed = schema.safeParse(await readJsonBody(request));
  if (!parsed.success) return adminError(400, "Invalid reorder request.");
  const { id } = await params;
  const interview = await getDb().mockInterview.findUnique({ where: { id }, include: { questions: { orderBy: { position: "asc" } } } });
  if (!interview) return adminError(404, "Interview not found.");
  if (!['DRAFT', 'READY', 'INVITED'].includes(interview.status) || interview.startedAt) return adminError(409, "Questions are locked.");
  const index = interview.questions.findIndex((question) => question.id === parsed.data.questionId);
  const swapIndex = parsed.data.direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapIndex < 0 || swapIndex >= interview.questions.length) return adminError(400, "Question cannot move further.");
  const current = interview.questions[index], other = interview.questions[swapIndex];
  await getDb().$transaction(async (tx) => {
    await tx.mockInterviewQuestion.update({ where: { id: current.id }, data: { position: 0 } });
    await tx.mockInterviewQuestion.update({ where: { id: other.id }, data: { position: current.position } });
    await tx.mockInterviewQuestion.update({ where: { id: current.id }, data: { position: other.position } });
  });
  return NextResponse.json({ success: true });
}
