ALTER TABLE "Admission" ADD COLUMN "aadhaarNumber" TEXT;
ALTER TABLE "Student" ADD COLUMN "aadhaarNumber" TEXT;

ALTER TABLE "Admission" ADD CONSTRAINT "Admission_aadhaarNumber_format_check"
CHECK ("aadhaarNumber" IS NULL OR "aadhaarNumber" ~ '^[0-9]{12}$');

ALTER TABLE "Student" ADD CONSTRAINT "Student_aadhaarNumber_format_check"
CHECK ("aadhaarNumber" IS NULL OR "aadhaarNumber" ~ '^[0-9]{12}$');

CREATE UNIQUE INDEX "Student_aadhaarNumber_key" ON "Student"("aadhaarNumber");
