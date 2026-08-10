# SaiTech Labs Website

Official SaiTech Labs website for `https://www.saitechlabs.in`. Phase 2 adds a Railway-hosted Next.js server and PostgreSQL persistence for admission and contact enquiries. The custom domain remains unchanged until a later approved phase.

## Architecture

- Next.js 16 App Router with TypeScript and Tailwind CSS
- Server route handlers: `POST /api/admissions` and `POST /api/contact`
- Prisma ORM with the PostgreSQL driver adapter
- Railway project with `Web` and `Postgres` services
- Browser forms call same-origin APIs; browsers never receive database credentials
- Future admin-compatible models exist, but no `/admin` routes or authentication are implemented

## Environment

Copy `.env.example` to `.env.local` and replace the placeholder locally:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Never commit real credentials. Railway supplies `DATABASE_URL` to the Web service through a service reference variable.

## Local development

```bash
npm install
npm run prisma:generate
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run prisma:validate
npm run typecheck
npm run lint
npm run build
```

## Database migrations

Create migrations only in a development database:

```bash
npx prisma migrate dev --name descriptive_name
```

Apply committed migrations safely in Railway or another production environment:

```bash
npm run prisma:migrate:deploy
npm run prisma:migrate:status
```

`railway.toml` runs `prisma migrate deploy` as a pre-deploy command. Never use database reset commands against Railway production data.

## Railway setup and deployment

The Railway project contains:

- `Web`: standard Next.js Node server
- `Postgres`: Railway PostgreSQL

The Web service requires a `DATABASE_URL` reference to the Postgres service. Deploy from the linked directory with:

```bash
railway up --service Web
```

Generate a Railway temporary domain for Phase 2 testing only. Do not connect the Hostinger-managed custom domain in this phase.

## APIs

### `POST /api/admissions`

Validates and normalizes admission details, normalizes Indian phone numbers, prevents rapid phone-and-course duplicates, and stores an `Admission` record.

### `POST /api/contact`

Validates and normalizes contact details and stores a `ContactEnquiry` record.

Both endpoints enforce request-size limits, server validation, honeypot bot detection, lightweight rate limiting, and safe error responses.

## Testing

1. Run the application with a configured database.
2. Submit valid forms through `/admissions` and `/contact`.
3. Confirm success messages and reference IDs.
4. Test invalid email, phone, required fields, oversized messages, malformed JSON, duplicate submissions, and rate limits.
5. Confirm invalid requests do not create database records.
6. Remove only records clearly labeled as test data.
