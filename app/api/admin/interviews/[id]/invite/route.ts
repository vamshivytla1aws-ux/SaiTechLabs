import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { sendInterviewInvitation } from "@/lib/interviews/email";
import { createInterviewToken } from "@/lib/interviews/token";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin || !can(admin.role, "admissions:manage")) return adminError(admin ? 403 : 401, admin ? "Forbidden." : "Unauthorized.");
  try {
    const { id } = await params;
    const interview = await getDb().mockInterview.findUnique({ where: { id }, include: { admission: true, questions: true } });
    if (!interview) return adminError(404, "Interview not found.");
    if (['IN_PROGRESS', 'SUBMITTED', 'EVALUATING', 'COMPLETED', 'CANCELLED'].includes(interview.status)) return adminError(409, "This interview cannot be invited or resent.");
    if (interview.questions.length !== interview.questionCount || interview.questions.some((question) => !question.referenceAnswer || !question.rubric || !question.approvedAt)) return adminError(409, `Review and approve all ${interview.questionCount} questions before sending.`);
    if (interview.expiresAt <= new Date()) return adminError(409, "Extend the expiry before sending.");
    const token = createInterviewToken();
    await sendInterviewInvitation({ candidateName: interview.admission.studentName, email: interview.admission.email, technologies: interview.technologies, durationMinutes: interview.durationMinutes, expiresAt: interview.expiresAt, token: token.token });
    await getDb().mockInterview.update({ where: { id }, data: { tokenHash: token.tokenHash, status: "INVITED" } });
    await writeAudit(admin.id, "INTERVIEW_INVITED", "MockInterview", id, { recipient: interview.admission.email, resend: Boolean(interview.tokenHash) });
    return NextResponse.json({ success: true, message: `Invitation sent to ${interview.admission.email}.` });
  } catch (error) { return adminError(500, error instanceof Error ? error.message : "Could not send invitation."); }
}
