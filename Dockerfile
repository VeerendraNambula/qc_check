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
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use the backend package.json to start
WORKDIR /app/backend
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
