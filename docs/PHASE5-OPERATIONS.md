# Phase 5 operations platform

Phase 5 extends the existing Next.js application and PostgreSQL database in place. It does not introduce another app, hostname, or database.

## Canonical routes

- Public website: `https://www.saitechlabs.in/`
- Operations portal: `https://www.saitechlabs.in/admin`
- Student portal: `https://www.saitechlabs.in/student`
- Enrollment status: `/status/[token]`
- Student and college feedback: `/feedback/student/[token]`, `/feedback/college/[token]`
- Certificate verification: `/certificate/[token]`

All protected and token routes send `no-store` and `noindex` controls. Public tokens are generated from 32 random bytes and only their SHA-256 hashes are stored.

## Data flow

1. Public admissions remain the original lead source and preserve their existing records.
2. An authorized counselor/admin converts a lead into a deduplicated student and batch enrollment. The source admission remains linked.
3. Payments are append-only records. Corrections and refunds change audited status; payment totals are calculated from received less refunded records.
4. Trainers are assigned to batches. A trainer login must be linked to a trainer profile and can access only assigned batches.
5. Attendance is recorded by dated batch session and student.
6. Student and college feedback is consented and moderated. Testimonial approval is blocked without publication permission.
7. Certificates can be issued only for completed enrollments. Verification tokens are hash-only and certificates may be revoked.

## Roles

- `SUPER_ADMIN`: full access, user/role administration, audit log.
- `ADMIN`: all operational areas except user/role administration and audit log.
- `COUNSELOR`: dashboard, admissions, students, feedback.
- `ACCOUNTANT`: dashboard, students, payments, reports.
- `TRAINER`: dashboard, assigned batches, assigned-batch attendance, feedback.

Every mutating API checks authentication, same-origin requests, and the required server-side permission. Sensitive changes are written to `AdminAuditLog`.

## Deployment

Railway deploys `main` from GitHub. The application start command continues to run `prisma migrate deploy` before `next start`. The Phase 5 migration is forward-only: it adds enum values, columns, tables, indexes, foreign keys, and idempotent starter-course rows. It contains no `DROP`, `TRUNCATE`, reset, or deletion statement.

The production migration must not run until the backup gate in `docs/PRODUCTION-BACKUP-RUNBOOK.md` is complete.
