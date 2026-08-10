import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isLogin = path === "/admin/login" || path === "/api/admin/login";
  const session = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  if (isLogin) {
    if (session && path === "/admin/login") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    return NextResponse.next();
  }
  if (!session) {
    if (path.startsWith("/api/admin/")) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
