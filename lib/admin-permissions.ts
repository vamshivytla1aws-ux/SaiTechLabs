import type { AdminRole } from "@/generated/prisma/enums";

export type AdminPermission = "dashboard:view" | "admissions:manage" | "students:manage" | "courses:manage" | "batches:manage" | "trainers:manage" | "payments:manage" | "attendance:manage" | "feedback:manage" | "certificates:manage" | "reports:view" | "users:manage" | "audit:view";

const ALL: AdminPermission[] = ["dashboard:view", "admissions:manage", "students:manage", "courses:manage", "batches:manage", "trainers:manage", "payments:manage", "attendance:manage", "feedback:manage", "certificates:manage", "reports:view", "users:manage", "audit:view"];
const permissions: Record<AdminRole, readonly AdminPermission[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL.filter(permission => permission !== "users:manage" && permission !== "audit:view"),
  COUNSELOR: ["dashboard:view", "admissions:manage", "students:manage", "feedback:manage"],
  ACCOUNTANT: ["dashboard:view", "students:manage", "payments:manage", "reports:view"],
  TRAINER: ["dashboard:view", "batches:manage", "attendance:manage", "feedback:manage"],
};

export function can(role: AdminRole, permission: AdminPermission) { return permissions[role].includes(permission); }
export function visiblePermissions(role: AdminRole) { return permissions[role]; }
