import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { issueToken, nextCertificateNumber } from "@/lib/operations";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request."); const admin = await requireAdminApi(); if (!admin) return adminError(401, "Unauthorized."); if (!can(admin.role, "certificates:manage")) return adminError(403, "Forbidden."); const { id } = await params;
  try {
    const enrollment = await getDb().enrollment.findUnique({ where: { id } }); if (!enrollment) return adminError(404, "Enrollment not found."); if (enrollment.status !== "COMPLETED") return adminError(400, "Complete the enrollment before issuing a certificate.");
    const certificateNumber = await nextCertificateNumber(); const { token, tokenHash } = issueToken();
    const certificate = await getDb().$transaction(async (transaction) => { const created = await transaction.certificate.create({ data: { studentId: enrollment.studentId, enrollmentId: id, certificateNumber, issuedAt: new Date(), status: "ISSUED", verificationTokenHash: tokenHash } }); await transaction.adminAuditLog.create({ data: { adminId: admin.id, action: "CERTIFICATE_CREATED", entityType: "Certificate", entityId: created.id } }); return created; });
    return NextResponse.json({ success: true, id: certificate.id, verificationUrl: `https://www.saitechlabs.in/certificate/${token}` }, { status: 201 });
  } catch { return adminError(409, "Certificate already exists or could not be issued."); }
}
