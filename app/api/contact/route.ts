import { NextResponse } from "next/server";
import { apiError, readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rate = checkRateLimit(`contact:${requestIp(request)}`, 10, 10 * 60 * 1000);
  if (!rate.allowed) return apiError(429, "Too many requests. Please try again later.", { "Retry-After": String(rate.retryAfter) });

  try {
    const body = await readJsonBody(request);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid request.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });

    const { website: _honeypot, ...input } = parsed.data;
    void _honeypot;
    const enquiry = await getDb().contactEnquiry.create({ data: input, select: { id: true } });
    return NextResponse.json({ success: true, message: "Your contact enquiry has been submitted successfully.", referenceId: enquiry.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") return apiError(413, "Invalid request.");
    if (error instanceof Error && error.message === "MALFORMED_JSON") return apiError(400, "Invalid request.");
    console.error("[contact] Submission failed.");
    return apiError(500, "Something went wrong. Please try again.");
  }
}
