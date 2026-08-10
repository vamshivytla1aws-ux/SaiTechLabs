-- Extend admissions without changing existing records.
ALTER TABLE "Admission" ADD COLUMN "nextFollowUpAt" TIMESTAMP(3);
ALTER TABLE "Admission" ADD COLUMN "lastContactedAt" TIMESTAMP(3);

CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');
CREATE TYPE "AdminAuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'ADMISSION_STATUS_CHANGED', 'NOTE_ADDED', 'CONTACT_STATUS_CHANGED', 'EXPORT_CREATED', 'PASSWORD_CHANGED');

CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sessionVersion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdmissionNote" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdByAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdmissionNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "AdminAuditAction" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminUser_isActive_idx" ON "AdminUser"("isActive");
CREATE INDEX "AdmissionNote_admissionId_createdAt_idx" ON "AdmissionNote"("admissionId", "createdAt");
CREATE INDEX "AdmissionNote_createdByAdminId_idx" ON "AdmissionNote"("createdByAdminId");
CREATE INDEX "AdminAuditLog_adminId_createdAt_idx" ON "AdminAuditLog"("adminId", "createdAt");
CREATE INDEX "AdminAuditLog_action_createdAt_idx" ON "AdminAuditLog"("action", "createdAt");
CREATE INDEX "AdminAuditLog_entityType_entityId_idx" ON "AdminAuditLog"("entityType", "entityId");

ALTER TABLE "AdmissionNote" ADD CONSTRAINT "AdmissionNote_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "Admission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdmissionNote" ADD CONSTRAINT "AdmissionNote_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
