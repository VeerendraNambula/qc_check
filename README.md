# Quality Check Management System

A full-stack application for managing quality-inspection tasks, assigning work, and recording checklist-based inspection evidence.

## Overview

The application provides a workflow for teams to create and assign QC tasks, complete inspection checklists, attach evidence, and track task status.

## Features

- Create, assign, and view quality-check tasks.
- Organize inspections into ordered checklists.
- Submit inspection responses with comments and image evidence.
- Track task states: pending, in progress, completed, and rejected.
- Support administrator and user roles.
- Store task, checklist, and response data in PostgreSQL.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Data fetching | TanStack Query, Axios |
| Backend | NestJS 11, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Supporting tools | Docker, React Router, Lucide |

## Repository structure

```text
qc_check/
├── backend/          # NestJS API and Prisma schema
├── frontend/         # React + Vite application
├── Dockerfile        # Multi-stage container build
└── README.md
```

## Run locally

### 1. Start PostgreSQL

Docker Compose configuration is available in the backend directory:

```bash
cd backend
docker compose up -d
```

### 2. Configure the backend

Create `backend/.env` and set `DATABASE_URL` to your PostgreSQL connection string. Do not commit real credentials.

Install dependencies and prepare Prisma:

```bash
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

The API starts on `http://localhost:3000`.

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite serves the frontend at `http://localhost:5173` by default.

## API overview

The current project README documents these routes:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/qc/tasks` | List QC tasks |
| GET | `/qc/tasks/:id` | Retrieve a task |
| POST | `/qc/tasks/:id/submit` | Submit checklist inspection data |
| POST | `/upload` | Upload evidence image |

## Deployment note

Review the current Docker startup command before using it with production data: it runs Prisma schema synchronization with `--accept-data-loss` and executes the seed script at container startup. Use a reviewed migration and deployment process for any environment containing data that must be preserved.

## Status

This repository is a development project. Configuration, deployment hardening, and automated test coverage should be reviewed before production use.
