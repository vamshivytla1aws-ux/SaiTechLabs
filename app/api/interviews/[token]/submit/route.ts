import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin-security";
import { findCandidateInterview } from "@/lib/interviews/candidate";
import { getDb } from "@/lib/db";
import { evaluateAndCompleteInterview } from "@/lib/interviews/service";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 403 });
  const interview = await findCandidateInterview((await params).token);
  if (!interview) return NextResponse.json({ success: false, message: "Interview link is invalid." }, { status: 404 });
  if (['SUBMITTED', 'EVALUATING', 'COMPLETED'].includes(interview.status)) return NextResponse.json({ success: true, submitted: true, status: interview.status });
  if (interview.status !== "IN_PROGRESS") return NextResponse.json({ success: false, message: "This interview cannot be submitted." }, { status: 409 });
  const now = new Date();
  await getDb().$transaction(async (tx) => {
    await tx.mockInterviewAnswer.updateMany({ where: { interviewId: interview.id }, data: { submittedAt: now } });
    await tx.mockInterview.update({ where: { id: interview.id }, data: { status: "SUBMITTED", submittedAt: now } });
  });
  try {
    const result = await evaluateAndCompleteInterview(interview.id);
    return NextResponse.json({ success: true, submitted: true, status: "COMPLETED", result: result.result });
  } catch {
    return NextResponse.json({ success: true, submitted: true, status: "SUBMITTED", message: "Your answers are secure. Evaluation is pending review." });
  }
}
