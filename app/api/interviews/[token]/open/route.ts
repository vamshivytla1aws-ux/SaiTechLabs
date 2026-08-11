import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin-security";
import { findCandidateInterview } from "@/lib/interviews/candidate";
import { getDb } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ success: false, message: "Invalid request." }, { status: 403 });
  const interview = await findCandidateInterview((await params).token);
  if (!interview) return NextResponse.json({ success: false, message: "Interview link is invalid." }, { status: 404 });
  if (interview.status === "INVITED") await getDb().mockInterview.update({ where: { id: interview.id }, data: { status: "OPENED", openedAt: new Date() } });
  return NextResponse.json({ success: true });
}
