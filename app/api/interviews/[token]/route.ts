import { NextResponse } from "next/server";
import { findCandidateInterview, safeCandidateInterview } from "@/lib/interviews/candidate";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const interview = await findCandidateInterview(token);
  if (!interview) return NextResponse.json({ success: false, message: "Interview link is invalid." }, { status: 404 });
  return NextResponse.json({ success: true, interview: safeCandidateInterview(interview) }, { headers: { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer" } });
}
