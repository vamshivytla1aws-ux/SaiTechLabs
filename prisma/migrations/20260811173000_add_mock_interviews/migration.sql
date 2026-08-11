-- Phase 1: additive text-based AI mock interview workflow.
ALTER TYPE "AdminAuditAction" ADD VALUE 'INTERVIEW_CREATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'INTERVIEW_UPDATED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'INTERVIEW_INVITED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'INTERVIEW_CANCELLED';
ALTER TYPE "AdminAuditAction" ADD VALUE 'INTERVIEW_EVALUATED';

CREATE TYPE "InterviewType" AS ENUM ('AI', 'MANUAL', 'MIXED');
CREATE TYPE "InterviewDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MIXED');
CREATE TYPE "InterviewStatus" AS ENUM ('DRAFT', 'READY', 'INVITED', 'OPENED', 'IN_PROGRESS', 'SUBMITTED', 'EVALUATING', 'COMPLETED', 'EXPIRED', 'CANCELLED');
CREATE TYPE "InterviewResult" AS ENUM ('NOT_EVALUATED', 'STRONG_PASS', 'PASS', 'REVIEW', 'FAIL');
CREATE TYPE "InterviewQuestionSource" AS ENUM ('AI', 'MANUAL');
CREATE TYPE "InterviewVerdict" AS ENUM ('EXCELLENT', 'GOOD', 'PARTIAL', 'WEAK', 'INCORRECT', 'BLANK');
CREATE TYPE "InterviewIntegrityEventType" AS ENUM ('PASTE_ATTEMPT', 'COPY_ATTEMPT', 'TAB_HIDDEN', 'WINDOW_BLUR');

CREATE TABLE "MockInterview" (
  "id" TEXT NOT NULL,
  "admissionId" TEXT NOT NULL,
  "createdByAdminId" TEXT NOT NULL,
  "type" "InterviewType" NOT NULL,
  "technologies" TEXT[] NOT NULL,
  "experienceRange" TEXT NOT NULL,
  "difficulty" "InterviewDifficulty" NOT NULL,
  "questionCount" INTEGER NOT NULL DEFAULT 10,
  "aiQuestionCount" INTEGER NOT NULL DEFAULT 0,
  "manualQuestionCount" INTEGER NOT NULL DEFAULT 0,
  "durationMinutes" INTEGER NOT NULL DEFAULT 45,
  "passScore" INTEGER NOT NULL DEFAULT 70,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" "InterviewStatus" NOT NULL DEFAULT 'DRAFT',
  "result" "InterviewResult" NOT NULL DEFAULT 'NOT_EVALUATED',
  "tokenHash" TEXT,
  "openedAt" TIMESTAMP(3),
  "startedAt" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "evaluatedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "overallScore" DOUBLE PRECISION,
  "totalScore" DOUBLE PRECISION,
  "totalMaxScore" DOUBLE PRECISION,
  "evaluationModel" TEXT,
  "evaluationError" TEXT,
  "internalNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MockInterview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MockInterviewQuestion" (
  "id" TEXT NOT NULL,
  "interviewId" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "source" "InterviewQuestionSource" NOT NULL,
  "technology" TEXT NOT NULL,
  "difficulty" "InterviewDifficulty" NOT NULL,
  "questionText" TEXT NOT NULL,
  "referenceAnswer" TEXT NOT NULL,
  "rubric" JSONB NOT NULL,
  "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MockInterviewQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MockInterviewAnswer" (
  "id" TEXT NOT NULL,
  "interviewId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "answerText" TEXT NOT NULL DEFAULT '',
  "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "submittedAt" TIMESTAMP(3),
  CONSTRAINT "MockInterviewAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MockInterviewEvaluation" (
  "id" TEXT NOT NULL,
  "answerId" TEXT NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "maxScore" DOUBLE PRECISION NOT NULL,
  "technicalAccuracy" DOUBLE PRECISION NOT NULL,
  "completeness" DOUBLE PRECISION NOT NULL,
  "practicalKnowledge" DOUBLE PRECISION NOT NULL,
  "clarity" DOUBLE PRECISION NOT NULL,
  "verdict" "InterviewVerdict" NOT NULL,
  "strengths" TEXT[] NOT NULL,
  "missingPoints" TEXT[] NOT NULL,
  "feedback" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MockInterviewEvaluation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MockInterviewIntegrityEvent" (
  "id" TEXT NOT NULL,
  "interviewId" TEXT NOT NULL,
  "type" "InterviewIntegrityEventType" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB,
  CONSTRAINT "MockInterviewIntegrityEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MockInterview_tokenHash_key" ON "MockInterview"("tokenHash");
CREATE INDEX "MockInterview_admissionId_createdAt_idx" ON "MockInterview"("admissionId", "createdAt");
CREATE INDEX "MockInterview_status_expiresAt_idx" ON "MockInterview"("status", "expiresAt");
CREATE INDEX "MockInterview_createdByAdminId_idx" ON "MockInterview"("createdByAdminId");
CREATE UNIQUE INDEX "MockInterviewQuestion_interviewId_position_key" ON "MockInterviewQuestion"("interviewId", "position");
CREATE INDEX "MockInterviewQuestion_interviewId_source_idx" ON "MockInterviewQuestion"("interviewId", "source");
CREATE UNIQUE INDEX "MockInterviewAnswer_questionId_key" ON "MockInterviewAnswer"("questionId");
CREATE INDEX "MockInterviewAnswer_interviewId_savedAt_idx" ON "MockInterviewAnswer"("interviewId", "savedAt");
CREATE UNIQUE INDEX "MockInterviewEvaluation_answerId_key" ON "MockInterviewEvaluation"("answerId");
CREATE INDEX "MockInterviewIntegrityEvent_interviewId_occurredAt_idx" ON "MockInterviewIntegrityEvent"("interviewId", "occurredAt");

ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterview" ADD CONSTRAINT "MockInterview_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MockInterviewQuestion" ADD CONSTRAINT "MockInterviewQuestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterviewAnswer" ADD CONSTRAINT "MockInterviewAnswer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterviewAnswer" ADD CONSTRAINT "MockInterviewAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MockInterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterviewEvaluation" ADD CONSTRAINT "MockInterviewEvaluation_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "MockInterviewAnswer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MockInterviewIntegrityEvent" ADD CONSTRAINT "MockInterviewIntegrityEvent_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "MockInterview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
