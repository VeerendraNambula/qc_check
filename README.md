# Quality Check (QC) Web Application

A full-stack application for managing quality inspections.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Query
- **Backend**: NestJS, Prisma, PostgreSQL
- **Database**: PostgreSQL

## Integration Steps

1. **Database Setup**
   - Ensure Docker is running.
   - Start the database:
     ```bash
     cd backend
     docker-compose up -d
     ```
   - Initialize Prisma Schema:
     ```bash
     npx prisma generate
     npx prisma db push
     ```

2. **Backend Setup**
   - Install dependencies:
     ```bash
     cd backend
     npm install
     ```
   - Start the server:
     ```bash
     npm run start:dev
     ```
   - Server runs on `http://localhost:3000`

3. **Frontend Setup**
   - Install dependencies:
     ```bash
     cd frontend
     npm install
     ```
   - Start the dev server:
     ```bash
     npm run dev
     ```
   - App runs on `http://localhost:5173`

## Features
- **Task Management**: Create, Assign, and List QC Tasks.
- **Inspection**: Checklist-based inspection with mandatory Image and Comment evidence.
- **Reporting**: Status tracking and historical data.

## API Documentation
- `GET /qc/tasks` - List tasks
- `GET /qc/tasks/:id` - Get task details
- `POST /qc/tasks/:id/submit` - Submit checklist item
- `POST /upload` - Upload evidence image