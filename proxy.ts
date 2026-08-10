import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { STUDENT_COOKIE, verifyStudentSession } from "@/lib/student-session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path.startsWith("/student") || path.startsWith("/api/student")) {
    const isStudentLogin = path === "/student/login" || path === "/api/student/login";
    const student = await verifyStudentSession(request.cookies.get(STUDENT_COOKIE)?.value);
    if (isStudentLogin) { if (student && path === "/student/login") return NextResponse.redirect(new URL("/student/dashboard", request.url)); return NextResponse.next(); }
    if (!student) { if (path.startsWith("/api/student/")) return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "private, no-store" } }); return NextResponse.redirect(new URL("/student/login", request.url)); }
    const response = NextResponse.next(); response.headers.set("Cache-Control", "private, no-store, max-age=0"); response.headers.set("X-Robots-Tag", "noindex, nofollow"); return response;
  }
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

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*", "/student/:path*", "/api/student/:path*"] };
