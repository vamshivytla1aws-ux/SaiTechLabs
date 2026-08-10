import { NextResponse } from "next/server";
import { z } from "zod";
import { readJsonBody } from "@/lib/api";
import { sameOrigin, adminError } from "@/lib/admin-security";
import { getDb } from "@/lib/db";
import { requireStudentApi } from "@/lib/student-auth";

const rating = z.coerce.number().int().min(1).max(5).optional();
const schema = z.object({ trainerQuality: rating, technicalContent: rating, practicalSessions: rating, courseMaterial: rating, communication: rating, interviewPreparation: rating, courseRelevance: rating, studentParticipation: rating, overallRating: z.coerce.number().int().min(1).max(5), liked: z.string().trim().max(2000).optional(), improvements: z.string().trim().max(2000).optional(), comments: z.string().trim().max(3000).optional(), coordinatorName: z.string().trim().max(100).optional(), designation: z.string().trim().max(100).optional(), wouldRecommend: z.boolean().optional(), permissionToPublish: z.boolean().default(false), consent: z.literal(true) }).strict();

export async function POST(request: Request) {
  if (!sameOrigin(request)) return adminError(403, "Invalid request.");
  const account = await requireStudentApi();
  if (!account) return adminError(401, "Unauthorized.");
  try {
    const parsed = schema.safeParse(await readJsonBody(request));
    if (!parsed.success) return adminError(400, "Please check the feedback form.");
    const enrollment = await getDb().enrollment.findFirst({ where: { studentId: account.studentId, status: { not: "CANCELLED" } }, orderBy: { enrolledAt: "desc" } });
    const feedback = await getDb().feedback.create({ data: { ...parsed.data, source: "STUDENT", studentId: account.studentId, enrollmentId: enrollment?.id, batchId: enrollment?.batchId, respondentName: account.student.fullName, respondentEmail: account.email, consent: true } });
    return NextResponse.json({ success: true, referenceId: feedback.id }, { status: 201 });
  } catch {
    return adminError(500, "Feedback could not be submitted.");
  }
}
