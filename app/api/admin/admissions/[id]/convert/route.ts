import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { money, nextStudentCode, normalEmail, normalPhone } from "@/lib/operations";
import { requiredAadhaarSchema } from "@/lib/validation";

const schema = z.object({
  batchId: z.string().min(1),
  aadhaarNumber: requiredAadhaarSchema,
  courseFee: z.coerce.string(),
  discount: z.coerce.string().default("0"),
  enrollmentStatus: z.enum(["PENDING", "CONFIRMED", "ENROLLED", "ACTIVE"]).default("ENROLLED"),
}).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "students:manage")) return adminError(403, "Forbidden.");
  const { id } = await params;

  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, "A valid 12-digit Aadhaar card number and enrollment information are required.");
    const courseFee = money(parsed.data.courseFee);
    const discount = money(parsed.data.discount);
    const finalFee = courseFee.sub(discount);
    if (courseFee.lessThan(0) || discount.lessThan(0) || finalFee.lessThan(0)) return adminError(400, "Fee values are invalid.");

    const db = getDb();
    const admission = await db.admission.findUnique({ where: { id }, include: { enrollment: true } });
    if (!admission) return adminError(404, "Admission not found.");
    if (admission.enrollment) return adminError(409, "Admission is already converted.");
    const batch = await db.batch.findUnique({ where: { id: parsed.data.batchId } });
    if (!batch || batch.status === "CANCELLED") return adminError(400, "Selected batch is unavailable.");

    const email = normalEmail(admission.email);
    const phone = normalPhone(admission.phone);
    const existingStudent = await db.student.findFirst({ where: { OR: [{ email }, { phone }] } });
    const studentCode = existingStudent ? null : await nextStudentCode();

    const result = await db.$transaction(async (tx) => {
      const student = existingStudent
        ? await tx.student.update({ where: { id: existingStudent.id }, data: { aadhaarNumber: parsed.data.aadhaarNumber } })
        : await tx.student.create({ data: { studentCode: studentCode!, aadhaarNumber: parsed.data.aadhaarNumber, fullName: admission.studentName, email, phone, qualification: admission.qualification, graduationYear: admission.graduationYear, collegeName: admission.collegeName, state: admission.state, currentStatus: admission.currentStatus } });
      const enrollment = await tx.enrollment.create({ data: { studentId: student.id, batchId: batch.id, sourceAdmissionId: admission.id, status: parsed.data.enrollmentStatus, courseFee, discount, finalFee } });
      await tx.admission.update({ where: { id: admission.id }, data: { aadhaarNumber: parsed.data.aadhaarNumber, leadStatus: "JOINED" } });
      await tx.adminAuditLog.create({ data: { adminId: admin.id, action: "ENROLLMENT_CREATED", entityType: "Enrollment", entityId: enrollment.id, metadata: { studentId: student.id, admissionId: admission.id } } });
      return { studentId: student.id, enrollmentId: enrollment.id };
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch {
    return adminError(409, "Aadhaar number is already linked to another student, the student is already enrolled in this batch, or conversion failed.");
  }
}
