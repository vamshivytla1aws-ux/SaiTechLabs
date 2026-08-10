# Phase 4 custom-domain handoff

Phase 3 is prepared for the canonical origin `https://www.saitechlabs.in`. This document is a handoff only. No Railway custom domain or Hostinger DNS record has been created or changed.

## Approved final routing

- Canonical public website: `https://www.saitechlabs.in/`
- Admin portal: `https://www.saitechlabs.in/admin`
- Root domain: `https://saitechlabs.in` redirects to `https://www.saitechlabs.in`
- Do not create `admin.saitechlabs.in` or `app.saitechlabs.in`

## Existing Railway targets

- Railway project: `SaiTechLabs`
- Environment: `production`
- Web service: `Web`
- PostgreSQL service: `Postgres`
- Temporary test origin: `https://web-production-d8c82.up.railway.app`
- GitHub deployment branch: `main`

## Phase 4 execution order

1. In the Railway `Web` service, add `www.saitechlabs.in` as a custom domain.
2. Copy Railway's exact generated DNS target and any ownership-verification TXT record. Do not infer or reuse generic Railway values.
3. Decide whether Railway will also terminate `saitechlabs.in` or whether Hostinger will only redirect the apex. If Railway will handle it, add the apex as a second custom domain and copy its exact ALIAS/ANAME/CNAME-flattening and TXT requirements.
4. Before editing Hostinger, export or screenshot the existing DNS zone and identify records that conflict specifically with `www` or the apex. Preserve mail records, including MX, SPF, DKIM, and DMARC.
5. Add only the exact Railway-provided records in Hostinger. Remove a conflicting `www` or apex web record only when its replacement has been verified.
6. Wait for Railway to show both domain verification and an issued TLS certificate.
7. Configure a permanent `308` redirect from `https://saitechlabs.in/*` to `https://www.saitechlabs.in/*`, preserving path and query string. Keep `/admin` in the same application; do not create an admin subdomain.
8. Verify the checks below before retiring the temporary Railway URL from operational use.

The exact CNAME/ALIAS/TXT values cannot be supplied in Phase 3 because Railway generates them only after the custom domain is added in Phase 4.

## Cutover verification

- `https://www.saitechlabs.in/` returns `200` with a valid certificate.
- `https://saitechlabs.in/<path>?<query>` returns one permanent redirect to the identical path and query on `www`.
- Canonical metadata, Open Graph URL, sitemap URLs, and the robots sitemap use `https://www.saitechlabs.in`.
- `/admin` redirects unauthenticated users to `/admin/login` on the same `www` host.
- Admin login sets a host-only `Secure`, `HttpOnly`, `SameSite=Strict` cookie and reaches `/admin/dashboard`.
- Logout clears the cookie; protected pages and APIs reject the old session.
- `POST /api/admissions` and `POST /api/contact` work from the `www` origin and persist to PostgreSQL.
- Authenticated admin lists show the new test submissions; remove only records clearly labelled as test data.
- `/api/admin/*` remains inaccessible without authentication; `/admin/*` remains `noindex` and `no-store`.
- No browser console mixed-content or cross-origin errors occur.

## Rollback boundary

If DNS, TLS, authentication, forms, or PostgreSQL verification fails, restore only the previously recorded `www`/apex web records. Do not change mail-related DNS records. The Railway temporary origin remains available for diagnosis.
