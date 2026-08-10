# Production PostgreSQL backup and restore runbook

## Release gate

Do not deploy the Phase 5 migration until a fresh production backup exists and its completion is visible in Railway.

### Recommended pre-migration backup

1. Open the existing Railway project and select the existing PostgreSQL service.
2. Open the service volume/backups area.
3. Create a **manual volume backup** immediately before the release.
4. Wait for Railway to show the backup as completed.
5. Record its timestamp and retain it through the Phase 5 validation period.

This is a one-time manual release backup. Do not enable paid point-in-time recovery, a paid schedule, or any additional service automatically. If the workspace plan does not expose a suitable manual backup, stop and obtain explicit approval for the alternative before migration.

Railway documentation:

- Volume backups: https://docs.railway.com/volumes/backups
- PostgreSQL: https://docs.railway.com/databases/postgresql
- Point-in-time recovery: https://docs.railway.com/volumes/point-in-time-recovery

## Pre-deployment checks

- Record the current deployment ID and Git commit.
- Confirm the web and PostgreSQL services are healthy.
- Confirm the canonical domain remains `https://www.saitechlabs.in`.
- Confirm the Phase 5 SQL contains no `DROP`, `TRUNCATE`, or reset statement.
- Run unit tests, type-check, lint, build, and Prisma validation.

## Restore decision

A failed application deployment does not automatically require a database restore. First roll the web service back to the prior known-good deployment if the migration completed and is additive. Restore the database backup only for confirmed data corruption or an unrecoverable migration failure, because restoring rewinds all database writes made after the backup.

## Railway volume restore

1. Put the web service into a controlled maintenance/rollback state to prevent new writes.
2. Select the exact pre-migration backup on the existing PostgreSQL volume.
3. Use Railway's restore action and wait for completion.
4. Redeploy the prior known-good application commit.
5. Verify database connectivity, public pages, admin authentication, admissions, and contact records.
6. Reconcile any legitimate writes created after the backup before reopening operations.

Never create a replacement production database, reset the current database, or delete existing records as part of this procedure.
