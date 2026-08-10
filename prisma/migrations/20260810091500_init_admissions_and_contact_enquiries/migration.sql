-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'FOLLOW_UP', 'JOINED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TrainingMode" AS ENUM ('CLASSROOM', 'ONLINE', 'EITHER');

-- CreateTable
CREATE TABLE "Admission" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "currentStatus" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "collegeName" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "trainingMode" "TrainingMode" NOT NULL,
    "message" TEXT,
    "consent" BOOLEAN NOT NULL,
    "leadStatus" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactEnquiry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContactEnquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Admission_createdAt_idx" ON "Admission"("createdAt");
CREATE INDEX "Admission_phone_idx" ON "Admission"("phone");
CREATE INDEX "Admission_email_idx" ON "Admission"("email");
CREATE INDEX "Admission_course_idx" ON "Admission"("course");
CREATE INDEX "Admission_leadStatus_idx" ON "Admission"("leadStatus");
CREATE INDEX "ContactEnquiry_createdAt_idx" ON "ContactEnquiry"("createdAt");
CREATE INDEX "ContactEnquiry_phone_idx" ON "ContactEnquiry"("phone");
CREATE INDEX "ContactEnquiry_email_idx" ON "ContactEnquiry"("email");
CREATE INDEX "ContactEnquiry_status_idx" ON "ContactEnquiry"("status");
