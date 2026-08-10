-- CreateEnum
CREATE TYPE "BatchMode" AS ENUM ('CLASSROOM', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PLANNED', 'OPEN', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ENROLLED', 'ACTIVE', 'COMPLETED', 'DROPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentRecordStatus" AS ENUM ('RECEIVED', 'PENDING', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TrainerAssignmentRole" AS ENUM ('LEAD_TRAINER', 'TRAINER', 'MENTOR', 'GUEST');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

-- CreateEnum
CREATE TYPE "PublicLinkType" AS ENUM ('ENROLLMENT_STATUS', 'STUDENT_FEEDBACK', 'COLLEGE_FEEDBACK', 'CERTIFICATE_VERIFY');

-- CreateEnum
CREATE TYPE "FeedbackSource" AS ENUM ('PUBLIC', 'STUDENT', 'COLLEGE');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('GENERAL', 'TRAINING', 'WEBSITE', 'COUNSELING', 'OTHER');

-- CreateEnum
CREATE TYPE "FeedbackModerationStatus" AS ENUM ('NEW', 'REVIEWED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CertificateStatus" AS ENUM ('DRAFT', 'ISSUED', 'REVOKED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminRole" ADD VALUE 'COUNSELOR';
ALTER TYPE "AdminRole" ADD VALUE 'ACCOUNTANT';
ALTER TYPE "AdminRole" ADD VALUE 'TRAINER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminAuditAction" ADD VALUE 'ADMIN_CREATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'ADMIN_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'ROLE_CHANGED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'ADMISSION_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'STUDENT_CREATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'STUDENT_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'ENROLLMENT_CREATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'ENROLLMENT_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'PAYMENT_CREATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'PAYMENT_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'PAYMENT_REFUNDED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'ATTENDANCE_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'STATUS_LINK_CREATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'STATUS_LINK_REVOKED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'FEEDBACK_LINK_CREATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'FEEDBACK_MODERATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'CERTIFICATE_CREATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'CERTIFICATE_REVOKED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'COURSE_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'BATCH_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'TRAINER_UPDATED';

-- AlterTable
ALTER TABLE "Admission" ADD COLUMN     "assignedAdminId" TEXT;

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "mode" "BatchMode" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "studentCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "collegeName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "sourceAdmissionId" TEXT,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "courseFee" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "finalFee" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNumber" TEXT,
    "status" "PaymentRecordStatus" NOT NULL DEFAULT 'RECEIVED',
    "notes" TEXT,
    "createdByAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "bio" TEXT,
    "experienceSummary" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerAssignment" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "role" "TrainerAssignmentRole" NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceSession" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "sessionDate" TIMESTAMP(3) NOT NULL,
    "topic" TEXT NOT NULL,
    "trainerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicLink" (
    "id" TEXT NOT NULL,
    "type" "PublicLinkType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "studentId" TEXT,
    "enrollmentId" TEXT,
    "batchId" TEXT,
    "collegeName" TEXT,
    "showAmounts" BOOLEAN NOT NULL DEFAULT false,
    "singleUse" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "source" "FeedbackSource" NOT NULL,
    "category" "FeedbackCategory",
    "studentId" TEXT,
    "enrollmentId" TEXT,
    "batchId" TEXT,
    "publicLinkId" TEXT,
    "respondentName" TEXT,
    "respondentEmail" TEXT,
    "collegeName" TEXT,
    "coordinatorName" TEXT,
    "designation" TEXT,
    "trainerQuality" INTEGER,
    "technicalContent" INTEGER,
    "practicalSessions" INTEGER,
    "courseMaterial" INTEGER,
    "communication" INTEGER,
    "interviewPreparation" INTEGER,
    "courseRelevance" INTEGER,
    "studentParticipation" INTEGER,
    "overallRating" INTEGER NOT NULL,
    "liked" TEXT,
    "improvements" TEXT,
    "comments" TEXT,
    "wouldRecommend" BOOLEAN,
    "permissionToPublish" BOOLEAN NOT NULL DEFAULT false,
    "consent" BOOLEAN NOT NULL,
    "moderationStatus" "FeedbackModerationStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "certificateNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3),
    "status" "CertificateStatus" NOT NULL DEFAULT 'DRAFT',
    "verificationTokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAccount" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentNote" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdByAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionFollowUp" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdByAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemCounter" (
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemCounter_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_isActive_name_idx" ON "Course"("isActive", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_code_key" ON "Batch"("code");

-- CreateIndex
CREATE INDEX "Batch_courseId_status_idx" ON "Batch"("courseId", "status");

-- CreateIndex
CREATE INDEX "Batch_startDate_idx" ON "Batch"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_key" ON "Student"("studentCode");

-- CreateIndex
CREATE INDEX "Student_fullName_idx" ON "Student"("fullName");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_phone_idx" ON "Student"("phone");

-- CreateIndex
CREATE INDEX "Student_collegeName_idx" ON "Student"("collegeName");

-- CreateIndex
CREATE INDEX "Student_createdAt_idx" ON "Student"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_sourceAdmissionId_key" ON "Enrollment"("sourceAdmissionId");

-- CreateIndex
CREATE INDEX "Enrollment_batchId_status_idx" ON "Enrollment"("batchId", "status");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_status_idx" ON "Enrollment"("studentId", "status");

-- CreateIndex
CREATE INDEX "Enrollment_enrolledAt_idx" ON "Enrollment"("enrolledAt");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_batchId_key" ON "Enrollment"("studentId", "batchId");

-- CreateIndex
CREATE INDEX "Payment_enrollmentId_paymentDate_idx" ON "Payment"("enrollmentId", "paymentDate");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_adminUserId_key" ON "Trainer"("adminUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- CreateIndex
CREATE INDEX "Trainer_isActive_name_idx" ON "Trainer"("isActive", "name");

-- CreateIndex
CREATE INDEX "TrainerAssignment_batchId_idx" ON "TrainerAssignment"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerAssignment_trainerId_batchId_role_key" ON "TrainerAssignment"("trainerId", "batchId", "role");

-- CreateIndex
CREATE INDEX "AttendanceSession_batchId_sessionDate_idx" ON "AttendanceSession"("batchId", "sessionDate");

-- CreateIndex
CREATE INDEX "AttendanceSession_trainerId_idx" ON "AttendanceSession"("trainerId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_studentId_idx" ON "AttendanceRecord"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_sessionId_studentId_key" ON "AttendanceRecord"("sessionId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicLink_tokenHash_key" ON "PublicLink"("tokenHash");

-- CreateIndex
CREATE INDEX "PublicLink_studentId_type_idx" ON "PublicLink"("studentId", "type");

-- CreateIndex
CREATE INDEX "PublicLink_enrollmentId_type_idx" ON "PublicLink"("enrollmentId", "type");

-- CreateIndex
CREATE INDEX "PublicLink_batchId_type_idx" ON "PublicLink"("batchId", "type");

-- CreateIndex
CREATE INDEX "PublicLink_type_isActive_idx" ON "PublicLink"("type", "isActive");

-- CreateIndex
CREATE INDEX "PublicLink_expiresAt_idx" ON "PublicLink"("expiresAt");

-- CreateIndex
CREATE INDEX "Feedback_source_moderationStatus_idx" ON "Feedback"("source", "moderationStatus");

-- CreateIndex
CREATE INDEX "Feedback_batchId_idx" ON "Feedback"("batchId");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationTokenHash_key" ON "Certificate"("verificationTokenHash");

-- CreateIndex
CREATE INDEX "Certificate_status_issuedAt_idx" ON "Certificate"("status", "issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_studentId_enrollmentId_key" ON "Certificate"("studentId", "enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAccount_studentId_key" ON "StudentAccount"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAccount_email_key" ON "StudentAccount"("email");

-- CreateIndex
CREATE INDEX "StudentAccount_isActive_idx" ON "StudentAccount"("isActive");

-- CreateIndex
CREATE INDEX "StudentNote_studentId_createdAt_idx" ON "StudentNote"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "AdmissionFollowUp_scheduledAt_completedAt_idx" ON "AdmissionFollowUp"("scheduledAt", "completedAt");

-- CreateIndex
CREATE INDEX "AdmissionFollowUp_admissionId_idx" ON "AdmissionFollowUp"("admissionId");

-- CreateIndex
CREATE INDEX "Admission_assignedAdminId_idx" ON "Admission"("assignedAdminId");

-- CreateIndex
CREATE INDEX "Admission_nextFollowUpAt_idx" ON "Admission"("nextFollowUpAt");

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_assignedAdminId_fkey" FOREIGN KEY ("assignedAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sourceAdmissionId_fkey" FOREIGN KEY ("sourceAdmissionId") REFERENCES "Admission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAssignment" ADD CONSTRAINT "TrainerAssignment_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerAssignment" ADD CONSTRAINT "TrainerAssignment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceSession" ADD CONSTRAINT "AttendanceSession_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AttendanceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicLink" ADD CONSTRAINT "PublicLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicLink" ADD CONSTRAINT "PublicLink_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicLink" ADD CONSTRAINT "PublicLink_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_publicLinkId_fkey" FOREIGN KEY ("publicLinkId") REFERENCES "PublicLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAccount" ADD CONSTRAINT "StudentAccount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentNote" ADD CONSTRAINT "StudentNote_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionFollowUp" ADD CONSTRAINT "AdmissionFollowUp_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdmissionFollowUp" ADD CONSTRAINT "AdmissionFollowUp_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed the initial training catalogue without modifying existing operational data.
INSERT INTO "Course" ("id", "name", "slug", "shortDescription", "description", "durationDays", "isActive", "createdAt", "updatedAt") VALUES
('phase5_course_60day', '60-Day Intensive Program', '60-day-intensive-program', 'Intensive job-focused software training.', 'A structured 60-day programme covering practical software engineering, cloud, data, DevOps, and interview preparation.', 60, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('phase5_course_cloud', 'Cloud', 'cloud', 'Cloud platform and infrastructure training.', 'Practical cloud fundamentals, architecture, deployment, security, and operations.', 45, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('phase5_course_ai_ml', 'AI & Machine Learning', 'ai-machine-learning', 'Applied AI and machine-learning training.', 'Applied machine learning, data preparation, model development, evaluation, and responsible AI practices.', 60, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('phase5_course_devops', 'DevOps', 'devops', 'Modern delivery and automation practices.', 'Source control, CI/CD, containers, infrastructure automation, observability, and reliable delivery.', 45, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('phase5_course_data', 'Databricks & Data Engineering', 'databricks-data-engineering', 'Modern data engineering and Databricks.', 'Data pipelines, lakehouse foundations, Spark, Databricks workflows, quality, and production operations.', 60, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('phase5_course_interview', 'Interview Preparation', 'interview-preparation', 'Structured technical interview preparation.', 'Technical review, coding practice, project presentation, communication, and mock interviews.', 30, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
