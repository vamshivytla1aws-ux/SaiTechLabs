ALTER TABLE "Student"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "Student_isActive_createdAt_idx" ON "Student"("isActive", "createdAt");
