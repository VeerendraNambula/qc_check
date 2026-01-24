# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm install
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app

# Copy Backend assets
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=backend-builder /app/backend/node_modules /app/backend/node_modules
COPY --from=backend-builder /app/backend/package*.json /app/backend/
COPY --from=backend-builder /app/backend/prisma /app/backend/prisma
RUN mkdir -p /app/backend/uploads

# Copy Frontend assets
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Set working directory to backend for the start command
WORKDIR /app/backend
EXPOSE 3000

# Start the application
# Start the application with migrations and seeding
# Start the application with db push (force sync) and seeding
CMD ["/bin/sh", "-c", "npx prisma db push --accept-data-loss && npx prisma db seed && npm run start:prod"]