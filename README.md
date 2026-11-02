# Quality Check Management System

A full-stack quality-inspection workflow application for creating QC tasks, assigning work, completing ordered checklists, and recording inspection evidence.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query
- **Backend:** NestJS 11, TypeScript, REST API
- **Data:** PostgreSQL and Prisma
- **Build/deployment:** Docker multi-stage build, Render configuration

## Repository layout

```text
qc_check/
├── backend/       # NestJS API, Prisma schema and migrations
├── frontend/      # React + Vite application
├── Dockerfile
├── SECURITY.md
└── README.md
```

## Local development

Create `backend/.env` from this example, replacing the local password:

```dotenv
POSTGRES_PASSWORD=choose-a-local-password
DATABASE_URL=postgresql://qc_user:choose-a-local-password@localhost:5432/qc_db?schema=public
CORS_ORIGINS=http://localhost:5173
```

From the repository root, start PostgreSQL and the API:

```bash
cd backend
docker compose up -d
npm ci
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

The API listens on port `3000` by default.

In a second terminal, start the frontend:

```bash
cd frontend
npm ci
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

## Database migrations

Schema changes should be committed as Prisma migrations. Do not run `prisma db push --accept-data-loss` against a database with data that must be preserved.

For an existing database that was created with `db push`, review and baseline the initial migration against a backup before running `prisma migrate deploy`. Do not assume an existing production database is ready for the migration history in this repository.

## API areas

- `/api/health` — health check
- `/api/auth` — login and password-recovery endpoints
- `/api/users` — user management
- `/api/qc/tasks` — QC task and checklist workflows
- `/api/upload` — inspection evidence upload

## Security status

This is a portfolio/development project, **not production-ready**. Authentication tokens and route authorization still need implementation and security testing. See [SECURITY.md](SECURITY.md) for the current review and remaining work. Do not use real customer records, credentials, or private inspection images in this public repository.
