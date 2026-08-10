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

The admin portal includes live dashboard metrics, searchable/filterable/paginated leads, lead statuses and follow-ups, append-only internal notes, contact enquiry management, safe filtered CSV export, audit events, password change and logout. It is excluded from robots and is not linked from the public navigation.

## Environment

Copy `.env.example` to `.env.local` and replace placeholders. Never commit real credentials.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_SECRET="a-cryptographically-random-secret-of-at-least-32-characters"
INITIAL_ADMIN_NAME="SaiTech Labs Administrator"
INITIAL_ADMIN_EMAIL="admin@example.com"
INITIAL_ADMIN_PASSWORD="a-strong-temporary-password"
```

`AUTH_SECRET` is required for admin sessions. Railway should supply `DATABASE_URL` through a Postgres service reference and store `AUTH_SECRET` as a private Web service variable. The three `INITIAL_ADMIN_*` values are only needed while running the one-time bootstrap command and do not need to remain configured.

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
