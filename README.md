# SaiTech Labs Website

Official website and private staff admin portal for `https://www.saitechlabs.in`. The application is a single Next.js deployment backed by Railway PostgreSQL.

## Architecture

- Next.js 16 App Router, TypeScript and Tailwind CSS
- Prisma ORM with PostgreSQL driver adapter
- Public submission APIs: `POST /api/admissions` and `POST /api/contact`
- Private portal under `/admin`, protected by a signed, HttpOnly, SameSite session cookie
- Passwords hashed with bcrypt (cost 12); no browser storage or client-side database access
- Railway `Web` and `Postgres` services; migrations run as the Web pre-deploy command
- GitHub `main` is connected to Railway automatic deployments
- Admissions Mock AI Interviews use the OpenAI Responses API with schema-validated structured outputs

The admin portal includes live dashboard metrics, searchable/filterable/paginated leads, lead statuses and follow-ups, append-only internal notes, contact enquiry management, safe filtered CSV export, audit events, password change and logout. It is excluded from robots and is not linked from the public navigation.

## Environment

Copy `.env.example` to `.env.local` and replace placeholders. Never commit real credentials.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_SECRET="a-cryptographically-random-secret-of-at-least-32-characters"
INITIAL_ADMIN_NAME="SaiTech Labs Administrator"
INITIAL_ADMIN_EMAIL="admin@example.com"
INITIAL_ADMIN_PASSWORD="a-strong-temporary-password"
OPENAI_API_KEY="your_key_here"
OPENAI_INTERVIEW_MODEL="gpt-5.5"
APP_URL="https://www.saitechlabs.in"
RESEND_API_KEY="re_your_key_here"
RESEND_FROM="SaiTech Labs <admissions@saitechlabs.in>"
```

`AUTH_SECRET` is required for admin sessions. Railway should supply `DATABASE_URL` through a Postgres service reference and store `AUTH_SECRET` as a private Web service variable. The three `INITIAL_ADMIN_*` values are only needed while running the one-time bootstrap command and do not need to remain configured.

`OPENAI_API_KEY` and `OPENAI_INTERVIEW_MODEL` are read only by server-side interview services. SMTP variables are required to send secure invitations; a failed email attempt does not move the interview to `INVITED`. `APP_URL` must remain the canonical `https://www.saitechlabs.in` URL. Do not prefix secret variables with `NEXT_PUBLIC_`.

## Phase 1 Mock AI Interviews

From an Admission detail page, an authorized admin can create AI, manual, or mixed text interviews; generate and review hidden reference answers and rubrics; reorder and approve questions; and send or rotate a secure invitation. The candidate route is `/interview/[token]` and has no public or admin navigation. Links use high-entropy tokens whose SHA-256 hashes—not raw tokens—are stored in PostgreSQL.

Candidate answers autosave, the deadline is calculated from the server start time, paste/copy and window-leave events are recorded, and submission locks all answers. Evaluation uses one structured Responses API call for answered questions; blank answers receive zero locally. Final percentages and result thresholds are calculated in backend code. Automated tests never call the live OpenAI API.

## Local development

```bash
npm install
npm run prisma:generate
npm run dev
```

Open `http://localhost:3000`. Public pages remain at their existing routes; the admin sign-in is `/admin/login`.

## Database and initial administrator

Create migrations against a development database, commit them, and apply them without resetting production data:

```bash
npx prisma migrate dev --name descriptive_name
npm run prisma:migrate:deploy
npm run prisma:migrate:status
```

After the admin migration is applied, create the first administrator once:

```bash
npm run admin:create
```

The command requires `DATABASE_URL` and the three `INITIAL_ADMIN_*` variables. It refuses to create another account if an administrator already exists, hashes the password, and never prints it. Change the temporary password immediately from `/admin/settings`.

For an authorised account-recovery operation, temporarily provide `RESET_ADMIN_CURRENT_EMAIL`, `RESET_ADMIN_EMAIL`, and `RESET_ADMIN_PASSWORD`, then run `npm run admin:reset`. This updates only the matching administrator, enforces the `SUPER_ADMIN` role, reactivates the account, rotates the password, invalidates all sessions, and records an audit event. Remove the temporary variables immediately afterward.

Never run `prisma migrate reset`, `db push --force-reset`, or destructive SQL against Railway production.

## Validation

```bash
npm run prisma:validate
npm run typecheck
npm run lint
npm run build
```

Verify unauthenticated `/admin` and `/api/admin/*` protection; valid and invalid sign-in; status, follow-up and note workflows; contact status; filtered CSV; password change and session invalidation; logout; and both public forms. CSV deliberately excludes internal notes and neutralises spreadsheet formulas.

## Deployment

Push a reviewed commit to GitHub `main`. Railway automatically builds the linked Web service, runs `npm run prisma:migrate:deploy`, and then starts Next.js. Check the Railway deployment health and the temporary Railway URL before making any separately approved DNS or custom-domain changes.

Do not put GitHub, Railway, database, or session credentials in source control. Rotate any token that was shared in chat or another non-secret channel.
