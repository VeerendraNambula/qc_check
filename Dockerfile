# Build the React frontend.
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build the NestJS API and Prisma client.
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

# Runtime image: never mutate the database or seed accounts at startup.
FROM node:20-alpine AS production
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app/backend

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

RUN mkdir -p /app/backend/uploads && chown -R node:node /app
USER node
EXPOSE 3000

# Run migrations as a separate, reviewed deployment step:
# npm run db:migrate:deploy
CMD ["node", "dist/src/main"]
