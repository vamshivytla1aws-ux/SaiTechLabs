import type { Prisma } from "@/generated/prisma/client";

export const PAGE_SIZE = 20;
export const leadStatuses = ["NEW", "CONTACTED", "FOLLOW_UP", "JOINED", "NOT_INTERESTED"] as const;
export const enquiryStatuses = ["NEW", "CONTACTED", "CLOSED"] as const;

function clean(value: string | string[] | undefined) { return typeof value === "string" ? value.trim() : ""; }
export function pageNumber(value: string | string[] | undefined) { const page = Number(clean(value)); return Number.isInteger(page) && page > 0 ? page : 1; }
export function dateStart(value: string | string[] | undefined) { const v = clean(value); const date = v ? new Date(`${v}T00:00:00.000Z`) : null; return date && !Number.isNaN(date.getTime()) ? date : undefined; }
export function dateEnd(value: string | string[] | undefined) { const v = clean(value); const date = v ? new Date(`${v}T23:59:59.999Z`) : null; return date && !Number.isNaN(date.getTime()) ? date : undefined; }

export function admissionWhere(params: Record<string, string | string[] | undefined>): Prisma.AdmissionWhereInput {
  const q = clean(params.q).slice(0, 100);
  const status = clean(params.status);
  const course = clean(params.course).slice(0, 100);
  const qualification = clean(params.qualification).slice(0, 100);
  const currentStatus = clean(params.currentStatus).slice(0, 100);
  const trainingMode = clean(params.trainingMode);
  const graduationYear = Number(clean(params.graduationYear));
  const from = dateStart(params.from); const to = dateEnd(params.to);
  return {
    ...(q ? { OR: ["studentName", "phone", "email", "collegeName"].map(field => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}),
    ...(leadStatuses.includes(status as typeof leadStatuses[number]) ? { leadStatus: status as typeof leadStatuses[number] } : {}),
    ...(course ? { course } : {}), ...(qualification ? { qualification } : {}), ...(currentStatus ? { currentStatus } : {}),
    ...(["CLASSROOM", "ONLINE", "EITHER"].includes(trainingMode) ? { trainingMode: trainingMode as "CLASSROOM" | "ONLINE" | "EITHER" } : {}),
    ...(Number.isInteger(graduationYear) && graduationYear > 1990 && graduationYear < 2100 ? { graduationYear } : {}),
    ...(from || to ? { createdAt: { gte: from, lte: to } } : {}),
  };
}

export function admissionOrder(value: string | string[] | undefined): Prisma.AdmissionOrderByWithRelationInput {
  const map: Record<string, Prisma.AdmissionOrderByWithRelationInput> = { oldest: { createdAt: "asc" }, name: { studentName: "asc" }, followup: { nextFollowUpAt: { sort: "asc", nulls: "last" } } };
  return map[clean(value)] ?? { createdAt: "desc" };
}

export function contactWhere(params: Record<string, string | string[] | undefined>): Prisma.ContactEnquiryWhereInput {
  const q = clean(params.q).slice(0, 100); const status = clean(params.status); const from = dateStart(params.from); const to = dateEnd(params.to);
  return { ...(q ? { OR: ["name", "phone", "email", "message"].map(field => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}), ...(enquiryStatuses.includes(status as typeof enquiryStatuses[number]) ? { status: status as typeof enquiryStatuses[number] } : {}), ...(from || to ? { createdAt: { gte: from, lte: to } } : {}) };
}

export function queryLink(path: string, params: Record<string, string | string[] | undefined>, updates: Record<string, string | number>) {
  const next = new URLSearchParams(); Object.entries(params).forEach(([key, value]) => { if (typeof value === "string" && value) next.set(key, value); }); Object.entries(updates).forEach(([key, value]) => next.set(key, String(value))); return `${path}?${next}`;
}
