import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin-security";
import { findCandidateInterview, safeCandidateInterview } from "@/lib/interviews/candidate";
import { getDb } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 403 });
  const interview = await findCandidateInterview((await params).token);
  if (!interview) return NextResponse.json({ success: false, message: "Interview link is invalid." }, { status: 404 });
  if (interview.expiresAt <= new Date()) {
    if (!["COMPLETED", "CANCELLED", "EXPIRED"].includes(interview.status)) await getDb().mockInterview.update({ where: { id: interview.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ success: false, message: "This interview invitation has expired." }, { status: 410 });
  }
  if (interview.status === "CANCELLED") return NextResponse.json({ success: false, message: "This interview is no longer available." }, { status: 410 });
  if (!["INVITED", "OPENED", "IN_PROGRESS"].includes(interview.status)) return NextResponse.json({ success: false, message: "This interview cannot be started." }, { status: 409 });
  if (!interview.startedAt) {
    await getDb().$transaction(async (tx) => {
      await tx.mockInterview.update({ where: { id: interview.id }, data: { status: "IN_PROGRESS", startedAt: new Date() } });
      await tx.mockInterviewAnswer.createMany({ data: interview.questions.map((question) => ({ interviewId: interview.id, questionId: question.id, answerText: "" })), skipDuplicates: true });
    });
  }
  const updated = await findCandidateInterview((await params).token);
  return NextResponse.json({ success: true, interview: safeCandidateInterview(updated!) }, { headers: { "Cache-Control": "private, no-store" } });
}
