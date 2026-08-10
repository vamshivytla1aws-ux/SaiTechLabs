import { NextResponse } from "next/server";
import { apiError, readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";
import { admissionSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rate = checkRateLimit(`admission:${requestIp(request)}`, 8, 10 * 60 * 1000);
  if (!rate.allowed) return apiError(429, "Too many requests. Please try again later.", { "Retry-After": String(rate.retryAfter) });

  try {
    const body = await readJsonBody(request);
    const parsed = admissionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: "Invalid request.", errors: parsed.error.flatten().fieldErrors }, { status: 400 });

    const { website: _honeypot, ...input } = parsed.data;
    void _honeypot;
    const db = getDb();
    const recent = await db.admission.findFirst({
      where: { phone: input.phone, course: input.course, createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) } },
      select: { id: true },
    });
    if (recent) return apiError(409, "We already received a recent enquiry for this program. Our team will contact you shortly.");

    const admission = await db.admission.create({ data: input, select: { id: true } });
    return NextResponse.json({ success: true, message: "Your admission enquiry has been submitted successfully.", referenceId: admission.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") return apiError(413, "Invalid request.");
    if (error instanceof Error && error.message === "MALFORMED_JSON") return apiError(400, "Invalid request.");
    console.error("[admissions] Submission failed.");
    return apiError(500, "Something went wrong. Please try again.");
  }
}
