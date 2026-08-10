import { NextResponse } from "next/server"; import { clearStudentSession } from "@/lib/student-session"; import { sameOrigin,adminError } from "@/lib/admin-security";
export async function POST(request:Request){if(!sameOrigin(request))return adminError(403,"Invalid request.");await clearStudentSession();return NextResponse.json({success:true});}
