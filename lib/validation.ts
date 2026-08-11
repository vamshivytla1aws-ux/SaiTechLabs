import { z } from "zod";

export const courses = ["60-Day Intensive Program", "Cloud", "AI & Machine Learning", "DevOps", "Databricks & Data Engineering", "Interview Preparation"] as const;
export const qualifications = ["B.Tech", "M.Tech", "B.Sc / BCA", "M.Sc / MCA", "Other"] as const;
export const currentStatuses = ["B.Tech 3rd Year", "B.Tech Final Year", "Recent Graduate", "Working Professional", "Other"] as const;

export function normalizeIndianPhone(value: string): string | null {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

const phoneSchema = z.string().trim().min(1).max(20).transform((value, ctx) => {
  const normalized = normalizeIndianPhone(value);
  if (!normalized) { ctx.addIssue({ code: "custom", message: "Enter a valid Indian mobile number." }); return z.NEVER; }
  return normalized;
});

const emailSchema = z.email("Enter a valid email address.").max(254).transform(value => value.trim().toLowerCase());
const honeypotSchema = z.string().max(0).optional().default("");

export function normalizeAadhaar(value: string): string | null {
  const digits = value.replace(/[\s-]/g, "");
  return /^\d{12}$/.test(digits) ? digits : null;
}

export const requiredAadhaarSchema = z.string().transform((value, ctx) => {
  const normalized = normalizeAadhaar(value);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: "Enter a valid 12-digit Aadhaar card number." });
    return z.NEVER;
  }
  return normalized;
});

const optionalAadhaarSchema = z.string().optional().transform((value, ctx) => {
  if (!value?.trim()) return undefined;
  const normalized = normalizeAadhaar(value);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: "Enter a valid 12-digit Aadhaar card number." });
    return z.NEVER;
  }
  return normalized;
});

export const admissionSchema = z.object({
  studentName: z.string().trim().min(2).max(100),
  aadhaarNumber: optionalAadhaarSchema,
  email: emailSchema,
  phone: phoneSchema,
  course: z.enum(courses),
  qualification: z.enum(qualifications),
  currentStatus: z.enum(currentStatuses),
  graduationYear: z.coerce.number().int().min(2000).max(new Date().getFullYear() + 8),
  collegeName: z.string().trim().min(2).max(160),
  state: z.string().trim().min(2).max(80),
  trainingMode: z.preprocess(value => typeof value === "string" ? value.toUpperCase() : value, z.enum(["CLASSROOM", "ONLINE", "EITHER"])),
  message: z.string().trim().max(1500).optional().transform(value => value || undefined),
  consent: z.literal(true),
  website: honeypotSchema,
}).strict();

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  email: emailSchema,
  message: z.string().trim().min(5).max(1500),
  website: honeypotSchema,
}).strict();
