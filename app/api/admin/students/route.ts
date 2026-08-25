import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-auth";
import { can } from "@/lib/admin-permissions";
import { adminError, sameOrigin } from "@/lib/admin-security";
import { readJsonBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { money, nextStudentCode, normalEmail, normalPhone } from "@/lib/operations";
import { currentStatuses, qualifications, requiredAadhaarSchema } from "@/lib/validation";

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  aadhaarNumber: requiredAadhaarSchema,
  email: z.email().max(254).transform(value => normalEmail(value)),
  phone: z.string().trim().min(10).max(20).transform(value => normalPhone(value)).refine(value => /^\+91[6-9]\d{9}$/.test(value), "Enter a valid Indian mobile number."),
  qualification: z.enum(qualifications),
  graduationYear: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 8),
  collegeName: z.string().trim().min(2).max(160),
  state: z.string().trim().min(2).max(80),
  currentStatus: z.enum(currentStatuses),
  batchId: z.string().min(1),
  courseFee: z.coerce.string(),
  discount: z.coerce.string().default("0"),
  enrollmentStatus: z.enum(["PENDING", "CONFIRMED", "ENROLLED", "ACTIVE"]).default("ENROLLED"),
  notes: z.string().trim().max(1000).optional(),
}).strict();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const admin = await requireAdminApi();
  if (!admin) return adminError(401, "Unauthorized.");
  if (!can(admin.role, "students:manage")) return adminError(403, "Forbidden.");
  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, parsed.error.issues[0]?.message || "Check the student details.");
    const courseFee = money(parsed.data.courseFee);
    const discount = money(parsed.data.discount);
    const finalFee = courseFee.sub(discount);
    if (courseFee.lessThan(0) || discount.lessThan(0) || finalFee.lessThan(0)) return adminError(400, "Fee values are invalid.");

    const db = getDb();
    const [batch, duplicate] = await Promise.all([
      db.batch.findUnique({ where: { id: parsed.data.batchId } }),
      db.student.findFirst({ where: { OR: [{ email: parsed.data.email }, { phone: parsed.data.phone }, { aadhaarNumber: parsed.data.aadhaarNumber }] }, select: { id: true } }),
    ]);
    if (!batch || batch.status === "CANCELLED") return adminError(400, "Selected batch is unavailable.");
    if (duplicate) return adminError(409, "A student with this email, mobile number, or Aadhaar number already exists.");
    const studentCode = await nextStudentCode();
    const result = await db.$transaction(async tx => {
      const student = await tx.student.create({ data: {
        studentCode, aadhaarNumber: parsed.data.aadhaarNumber, fullName: parsed.data.fullName,
        email: parsed.data.email, phone: parsed.data.phone, qualification: parsed.data.qualification,
        graduationYear: parsed.data.graduationYear, collegeName: parsed.data.collegeName,
        state: parsed.data.state, currentStatus: parsed.data.currentStatus,
      } });
      const enrollment = await tx.enrollment.create({ data: {
        studentId: student.id, batchId: batch.id, status: parsed.data.enrollmentStatus,
        courseFee, discount, finalFee, notes: parsed.data.notes || null,
      } });
      await tx.adminAuditLog.create({ data: { adminId: admin.id, action: "STUDENT_CREATED", entityType: "Student", entityId: student.id, metadata: { enrollmentId: enrollment.id, source: "manual" } } });
      return { studentId: student.id, enrollmentId: enrollment.id };
    });
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch {
    return adminError(409, "The student could not be created. Check for duplicate student or enrollment details.");
  }
}
