import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import type { PaymentRecordStatus } from "@/generated/prisma/enums";
import { getDb } from "@/lib/db";

export type CalculatedPaymentStatus = "NOT_PAID" | "PARTIALLY_PAID" | "PAID" | "OVERPAID" | "REFUNDED";
export function money(value: string | number | Prisma.Decimal) { return new Prisma.Decimal(value); }
export function paymentSummary(finalFee: Prisma.Decimal, payments: { amount: Prisma.Decimal; status: PaymentRecordStatus }[]) {
  const received = payments.filter(p => p.status === "RECEIVED").reduce((sum, p) => sum.add(p.amount), money(0));
  const refunded = payments.filter(p => p.status === "REFUNDED").reduce((sum, p) => sum.add(p.amount), money(0));
  const paid = received.sub(refunded); const balance = finalFee.sub(paid);
  const status: CalculatedPaymentStatus = refunded.greaterThan(0) && paid.equals(0) ? "REFUNDED" : paid.equals(0) ? "NOT_PAID" : paid.lessThan(finalFee) ? "PARTIALLY_PAID" : paid.equals(finalFee) ? "PAID" : "OVERPAID";
  return { paid, balance, refunded, status };
}
export function issueToken() { const token = randomBytes(32).toString("base64url"); return { token, tokenHash: hashToken(token) }; }
export function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function maskName(name: string) { return name.split(/\s+/).map(part => part.length < 2 ? "*" : `${part[0]}${"*".repeat(Math.min(part.length - 1, 4))}`).join(" "); }
export function normalEmail(value: string) { return value.trim().toLowerCase(); }
export function normalPhone(value: string) { const digits = value.replace(/\D/g, ""); return digits.length === 10 ? `+91${digits}` : digits.length === 12 && digits.startsWith("91") ? `+${digits}` : value.trim(); }
export async function nextStudentCode() { const counter = await getDb().systemCounter.upsert({ where: { key: "student_code" }, create: { key: "student_code", value: 1 }, update: { value: { increment: 1 } } }); return `STL-${new Date().getUTCFullYear()}-${String(counter.value).padStart(4, "0")}`; }
export async function nextCertificateNumber() { const year = new Date().getUTCFullYear(); const counter = await getDb().systemCounter.upsert({ where: { key: `certificate_${year}` }, create: { key: `certificate_${year}`, value: 1 }, update: { value: { increment: 1 } } }); return `STL-CERT-${year}-${String(counter.value).padStart(5, "0")}`; }
export function formatInr(value: Prisma.Decimal | number) { const amount = typeof value === "number" ? value : value.toNumber(); return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount); }
