# Backend

NestJS 11 REST API with Prisma and PostgreSQL.

## Local setup

1. Create `.env` in this directory and configure `DATABASE_URL`.
2. Install dependencies and generate Prisma Client:

```bash
npm ci
npx prisma generate
```

3. Apply committed migrations to a fresh local database:

```bash
npx prisma migrate deploy
```

4. Start the development server:

```bash
npm run start:dev
```

The API uses the global `/api` prefix. See the root README for the application overview.

## Database safety

Do not use `prisma db push --accept-data-loss` on a database containing data that must be retained. Review and baseline an existing database before applying this repository's migration history.

## Scripts

- `npm run build` — compile the API
- `npm test` — run unit tests
- `npm run test:e2e` — run end-to-end tests
- `npm run db:migrate:deploy` — apply committed migrations
