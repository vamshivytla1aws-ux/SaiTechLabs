# Phase 4 domain handoff

Phase 5 makes no DNS, custom-domain, redirect, certificate, or proxy changes.

The application is compatible with the required canonical layout:

- `https://www.saitechlabs.in/`
- `https://www.saitechlabs.in/admin`
- `https://www.saitechlabs.in/student`

When Phase 4 is explicitly authorized, obtain the exact custom-domain verification records from the existing Railway web service before editing Hostinger/Cloudflare DNS. Configure `www.saitechlabs.in` as canonical, redirect the apex to `www`, verify Railway HTTPS, and re-test public pages, admin/student authentication, APIs, and PostgreSQL connectivity. Do not create `admin.saitechlabs.in` or `app.saitechlabs.in`.
