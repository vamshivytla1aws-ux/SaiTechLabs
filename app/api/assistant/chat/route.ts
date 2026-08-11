import { NextResponse } from "next/server";
import { assistantRequestSchema } from "@/lib/assistant/config";
import { answerWebsiteQuestion } from "@/lib/assistant/service";
import { classifyAssistantMessage, scopeMessage } from "@/lib/assistant/scope";
import { sameOrigin } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const headers = { "Cache-Control": "private, no-store, max-age=0" };

function reply(body: object, status = 200, extraHeaders?: HeadersInit) {
  return NextResponse.json(body, { status, headers: { ...headers, ...extraHeaders } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ success: false, message: "Invalid request." }, 403);
  try {
    const parsed = assistantRequestSchema.safeParse(await readJsonBody(request));
    if (!parsed.success) return reply({ success: false, message: parsed.error.issues[0]?.message || "Invalid request." }, 400);

    const ip = requestIp(request);
    const minute = checkRateLimit(`assistant:minute:${ip}`, 12, 60_000);
    const hour = checkRateLimit(`assistant:hour:${ip}`, 60, 3_600_000);
    const session = checkRateLimit(`assistant:session:${parsed.data.sessionId}`, 30, 3_600_000);
    const limited = [minute, hour, session].find((result) => !result.allowed);
    if (limited) return reply({ success: false, message: "Too many messages. Please wait a moment and try again." }, 429, { "Retry-After": String(limited.retryAfter) });

    const scope = classifyAssistantMessage(parsed.data.message);
    if (scope !== "allowed") return reply({ success: true, answer: scopeMessage, suggestedLinks: [{ label: "Explore courses", href: "/courses" }, { label: "Contact us", href: "/contact" }], scope: "restricted", sessionId: parsed.data.sessionId });

    const result = await answerWebsiteQuestion(parsed.data);
    return reply({ success: true, answer: result.answer, suggestedLinks: result.suggestedLinks, scope: "website", sessionId: parsed.data.sessionId });
  } catch (error) {
    const knownInputError = error instanceof Error && ["BODY_TOO_LARGE", "MALFORMED_JSON"].includes(error.message);
    if (knownInputError) return reply({ success: false, message: "Invalid request body." }, 400);
    console.error("Assistant request failed", error instanceof Error ? error.message : "Unknown error");
    return reply({ success: false, message: "SaiTech AI is temporarily unavailable. Please contact our team on +91 94939 69696." }, 503);
  }
}
