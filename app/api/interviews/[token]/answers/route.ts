import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { findCandidateInterview } from "@/lib/interviews/candidate";
import { answerSaveSchema } from "@/lib/interviews/config";
import { getDb } from "@/lib/db";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";

export async function PUT(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 403 });
  const interview = await findCandidateInterview((await params).token);
  if (!interview) return NextResponse.json({ success: false, message: "Interview link is invalid." }, { status: 404 });
  const limit = checkRateLimit(`interview-save:${interview.id}:${requestIp(request)}`, 180, 60_000);
  if (!limit.allowed) return NextResponse.json({ success: false, message: "Saving too quickly. Please wait." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  if (interview.status !== "IN_PROGRESS" || !interview.startedAt) return NextResponse.json({ success: false, message: "Answers are locked." }, { status: 409 });
  const deadline = interview.startedAt.getTime() + interview.durationMinutes * 60_000;
  if (Date.now() >= deadline) return NextResponse.json({ success: false, message: "Time has expired. Submit the interview." }, { status: 409 });
  try {
    const parsed = answerSaveSchema.safeParse(await readJsonBody(request));
    if (!parsed.success || !interview.questions.some((question) => question.id === parsed.data?.questionId)) return NextResponse.json({ success: false, message: "Invalid answer." }, { status: 400 });
    await getDb().mockInterviewAnswer.upsert({ where: { questionId: parsed.data.questionId }, create: { interviewId: interview.id, questionId: parsed.data.questionId, answerText: parsed.data.answerText }, update: { answerText: parsed.data.answerText, savedAt: new Date() } });
    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch { return NextResponse.json({ success: false, message: "Could not save answer." }, { status: 500 }); }
}
