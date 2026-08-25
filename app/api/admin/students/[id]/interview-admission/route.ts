import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin, writeAudit } from "@/lib/admin-security";
import { getDb } from "@/lib/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "students:manage") || !can(admin.role, "admissions:manage")) return adminError(403, "Forbidden.");
  const { id } = await params;
  try {
    const db = getDb();
    const student = await db.student.findUnique({
      where: { id },
      include: { enrollments: { orderBy: { enrolledAt: "desc" }, include: { batch: { include: { course: true } }, sourceAdmission: { select: { id: true } } } } },
    });
    if (!student) return adminError(404, "Student not found.");
    const linked = student.enrollments.find(enrollment => enrollment.sourceAdmission);
    if (linked?.sourceAdmission) return NextResponse.json({ success: true, admissionId: linked.sourceAdmission.id });
    const enrollment = student.enrollments[0];
    if (!enrollment) return adminError(409, "Enroll the student in a batch before creating an interview.");

    const admission = await db.$transaction(async tx => {
      const created = await tx.admission.create({ data: {
        studentName: student.fullName, aadhaarNumber: student.aadhaarNumber, email: student.email,
        phone: student.phone, course: enrollment.batch.course.name, qualification: student.qualification,
        currentStatus: student.currentStatus, graduationYear: student.graduationYear,
        collegeName: student.collegeName, state: student.state,
        trainingMode: enrollment.batch.mode === "HYBRID" ? "EITHER" : enrollment.batch.mode,
        message: "Internal admission record created for a manually entered student.",
        consent: false, leadStatus: "JOINED", assignedAdminId: admin.id,
      } });
      await tx.enrollment.update({ where: { id: enrollment.id }, data: { sourceAdmissionId: created.id } });
      return created;
    });
    await writeAudit(admin.id, "STUDENT_UPDATED", "Student", student.id, { action: "interview_admission_created", admissionId: admission.id });
    return NextResponse.json({ success: true, admissionId: admission.id }, { status: 201 });
  } catch {
    return adminError(409, "The interview workflow could not be prepared for this student.");
  }
}
