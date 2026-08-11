import assert from "node:assert/strict";
import test from "node:test";
import { admissionSchema, normalizeAadhaar, requiredAadhaarSchema } from "../lib/validation";

const validAdmission = {
  studentName: "Test Student",
  aadhaarNumber: "",
  email: "test@example.com",
  phone: "9876543210",
  course: "Cloud",
  qualification: "B.Tech",
  currentStatus: "B.Tech Final Year",
  graduationYear: 2027,
  collegeName: "Test College",
  state: "Andhra Pradesh",
  trainingMode: "Classroom",
  message: "",
  consent: true,
  website: "",
};

test("Aadhaar is optional for an admission enquiry", () => {
  const result = admissionSchema.safeParse(validAdmission);
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.aadhaarNumber, undefined);
});

test("admission enquiry normalizes a valid Aadhaar number", () => {
  const result = admissionSchema.safeParse({ ...validAdmission, aadhaarNumber: "1234 5678 9012" });
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.aadhaarNumber, "123456789012");
});

test("invalid Aadhaar numbers are rejected", () => {
  assert.equal(admissionSchema.safeParse({ ...validAdmission, aadhaarNumber: "1234" }).success, false);
  assert.equal(requiredAadhaarSchema.safeParse("").success, false);
  assert.equal(normalizeAadhaar("1234-5678-9012"), "123456789012");
});
