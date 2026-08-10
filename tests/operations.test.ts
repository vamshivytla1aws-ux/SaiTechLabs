import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "../generated/prisma/client";
import { hashToken, issueToken, maskName, paymentSummary } from "../lib/operations";

const decimal = (value: number) => new Prisma.Decimal(value);
test("payment summary accounts for received and refunded records", () => {
  const summary = paymentSummary(decimal(10000), [{ amount: decimal(7000), status: "RECEIVED" }, { amount: decimal(1000), status: "REFUNDED" }, { amount: decimal(2000), status: "PENDING" }]);
  assert.equal(summary.paid.toString(), "6000"); assert.equal(summary.balance.toString(), "4000"); assert.equal(summary.status, "PARTIALLY_PAID");
});
test("payment status distinguishes paid, overpaid, and refunded", () => {
  assert.equal(paymentSummary(decimal(100), [{ amount: decimal(100), status: "RECEIVED" }]).status, "PAID");
  assert.equal(paymentSummary(decimal(100), [{ amount: decimal(120), status: "RECEIVED" }]).status, "OVERPAID");
  assert.equal(paymentSummary(decimal(100), [{ amount: decimal(50), status: "RECEIVED" }, { amount: decimal(50), status: "REFUNDED" }]).status, "REFUNDED");
});
test("public tokens are high entropy and only hashes need persistence", () => {
  const first = issueToken(); const second = issueToken(); assert.notEqual(first.token, second.token); assert.equal(first.tokenHash, hashToken(first.token)); assert.equal(first.tokenHash.length, 64); assert.ok(first.token.length >= 40);
});
test("public name masking does not expose full names", () => { assert.equal(maskName("Vamshi Vytla"), "V**** V****"); });
