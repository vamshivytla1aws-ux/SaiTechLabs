import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { findCandidateInterview } from "@/lib/interviews/candidate";
import { integrityEventSchema } from "@/lib/interviews/config";
import { getDb } from "@/lib/db";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  const interview = await findCandidateInterview((await params).token);
  if (!interview || interview.status !== "IN_PROGRESS") return new Response(null, { status: 404 });
  const limit = checkRateLimit(`interview-integrity:${interview.id}:${requestIp(request)}`, 30, 60_000);
  if (!limit.allowed) return new Response(null, { status: 429 });
  try {
    const parsed = integrityEventSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return new Response(null, { status: 400 });
    await getDb().mockInterviewIntegrityEvent.create({ data: { interviewId: interview.id, type: parsed.data.type } });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch { return new Response(null, { status: 400 }); }
}
