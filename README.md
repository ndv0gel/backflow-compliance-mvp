# Backflow Compliance MVP

Production-oriented MVP monorepo for a municipal Backflow & Plumbing Compliance Management System aligned to California Title 17 workflows.

## What is included

- Next.js 16 App Router frontend in `apps/web`
- NestJS backend in `apps/api`
- Prisma schema for PostgreSQL in `apps/api/prisma/schema.prisma`
- JWT authentication with RBAC (Admin and Tester)
- Device registry, tester management, jobs, test submission
- S3-compatible upload pipeline (MinIO local, AWS S3-compatible production)
- PDF generation using `pdf-lib`
- Basic annual compliance engine (`COMPLIANT`, `DUE_SOON`, `OVERDUE`)
- Admin dashboard stats endpoint and UI
- Append-only audit log model and admin read endpoint

## Monorepo structure

- `apps/web`: mobile-first technician and admin interfaces
- `apps/api`: secure NestJS API with Prisma and RBAC
- `packages/shared-types`: shared frontend/domain types
- `infra/docker`: Docker Compose for PostgreSQL + MinIO

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create env files:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

3. Start infrastructure (Postgres + MinIO):

```bash
npm run infra:up
```

4. Generate Prisma client, run migration, and seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Start both API and web:

```bash
npm run dev
```

- API: `http://localhost:4000`
- Web: `http://localhost:3000`

Seeded logins:
- Admin: `admin@city.gov` / `Admin123!`
- Tester: `tester@city.gov` / `Tester123!`

## Key API endpoints

Auth:
- `POST /auth/login`
- `POST /auth/logout`

Devices:
- `POST /devices` (Admin)
- `GET /devices` (Admin/Tester)
- `GET /devices/:id` (Admin/Tester)

Testers:
- `POST /testers` (Admin)
- `GET /testers` (Admin)
- `GET /testers/me` (Tester)

Jobs:
- `POST /jobs` (Admin)
- `GET /jobs` (Admin/Tester filtered)
- `GET /jobs/:id` (Admin/Tester scoped)

Tests:
- `POST /tests` (Admin/Tester)
- `GET /tests/:id` (Admin/Tester scoped)

Dashboard:
- `GET /dashboard/stats` (Admin)

Audit:
- `GET /audit-logs` (Admin, append-only storage model)

Uploads:
- `POST /uploads` (Admin/Tester)

Health:
- `GET /`

## Frontend routes

Public:
- `/`
- `/login`

Admin:
- `/admin/dashboard`
- `/admin/devices`
- `/admin/jobs`
- `/admin/reports`

Technician:
- `/technician/jobs`
- `/technician/jobs/[id]`

## Validation and quality checks

```bash
npm run lint
npm run typecheck
npm run build
npm run test -w @backflow/api
npm run test:e2e -w @backflow/api
```

## Notes on local infrastructure

- This repo expects PostgreSQL and S3-compatible object storage.
- Docker Compose is configured for local Postgres + MinIO in `infra/docker/docker-compose.yml`.
- In this coding environment, Docker CLI is not installed, so infra startup cannot be executed here. Use your local Docker Desktop environment to run those commands.

## MVP scope boundaries

In scope:
- Internal workflow for devices, jobs, field tests, compliance tracking, and reporting
- Data integrity and secure role-based access

Out of scope (intentionally not built):
- External portal integrations
- Payment processing
- Notifications system
