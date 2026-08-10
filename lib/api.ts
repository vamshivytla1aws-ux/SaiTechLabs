import { NextResponse } from "next/server";

export const MAX_BODY_BYTES = 16_384;

export async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) throw new Error("BODY_TOO_LARGE");
  try { return JSON.parse(text); } catch { throw new Error("MALFORMED_JSON"); }
}

export function apiError(status: number, message: string, headers?: HeadersInit) {
  return NextResponse.json({ success: false, message }, { status, headers });
}
