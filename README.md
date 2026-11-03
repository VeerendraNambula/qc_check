# Quality Check Management System

A full-stack quality-inspection workflow application for creating QC tasks, assigning work, completing ordered checklists, and recording inspection evidence.

## Highlights

- Create and manage quality-control tasks.
- Assign inspection work and track task progress.
- Complete ordered checklists and record inspection evidence.
- Upload supporting files through the API.
- Run the frontend and backend together in a containerized deployment.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query |
| Backend | NestJS 11, TypeScript, REST API |
| Data | PostgreSQL, Prisma |
| Delivery | Docker multi-stage build, GitHub Actions |

## Architecture

```mermaid
flowchart LR
    U[User] --> FE[React + Vite frontend]
    FE --> API[NestJS REST API]
    API --> DB[(PostgreSQL)]
    API --> ORM[Prisma]
    API --> FS[Inspection evidence uploads]
    ORM --> DB
```

The frontend communicates with the NestJS API. Prisma provides database access to PostgreSQL, while the upload module handles inspection evidence.

## Repository layout

```text
qc_check/
├── backend/       # NestJS API, Prisma schema and migrations
├── frontend/      # React + Vite application
├── .github/       # CI workflow
├── Dockerfile
├── SECURITY.md
└── README.md
```

## Local development

Requirements: Node.js (LTS), npm, and Docker with Docker Compose.

Create `backend/.env` from `backend/.env.example`. Set a strong local `JWT_SECRET` (for example, generate one with `openssl rand -base64 48`) and replace the database password with a local value:

```dotenv
POSTGRES_PASSWORD=choose-a-local-password
DATABASE_URL=postgresql://qc_user:choose-a-local-password@localhost:5432/qc_db?schema=public
CORS_ORIGINS=http://localhost:5173
JWT_SECRET=replace-with-at-least-32-random-characters
```

Start PostgreSQL and the API:

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

For an existing database created with `db push`, back up the database and review/baseline the initial migration before running `prisma migrate deploy`. Do not assume an existing production database is ready for the migration history in this repository.

## API areas

- `/api/health` — health check
- `/api/auth` — login and password-recovery endpoints
- `/api/users` — user management
- `/api/qc/tasks` — QC task and checklist workflows
- `/api/upload` — inspection evidence upload

## Security status

This is a portfolio/development project, **not production-ready**. Signed JWT authentication, API guards, and role-based route controls are implemented, but rate limiting, session revocation, comprehensive authorization tests, and a production deployment review remain. Review [SECURITY.md](SECURITY.md) for details.

Do not use real customer records, credentials, or private inspection images in this public repository.
