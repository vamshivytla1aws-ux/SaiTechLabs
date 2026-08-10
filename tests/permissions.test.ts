import assert from "node:assert/strict";
import test from "node:test";
import { can } from "../lib/admin-permissions";

test("super admin has governance permissions", () => { assert.equal(can("SUPER_ADMIN", "users:manage"), true); assert.equal(can("SUPER_ADMIN", "audit:view"), true); });
test("admin cannot manage super-admin governance", () => { assert.equal(can("ADMIN", "users:manage"), false); assert.equal(can("ADMIN", "audit:view"), false); });
test("accountant is restricted to finance-facing capabilities", () => { assert.equal(can("ACCOUNTANT", "payments:manage"), true); assert.equal(can("ACCOUNTANT", "reports:view"), true); assert.equal(can("ACCOUNTANT", "admissions:manage"), false); assert.equal(can("ACCOUNTANT", "attendance:manage"), false); });
test("trainer cannot access payments or student administration", () => { assert.equal(can("TRAINER", "attendance:manage"), true); assert.equal(can("TRAINER", "payments:manage"), false); assert.equal(can("TRAINER", "students:manage"), false); });
