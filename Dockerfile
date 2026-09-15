# Production image — run with docker compose (see docker-compose.yml)
FROM node:20-bookworm-slim AS base
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate && npm run build

FROM base AS runner
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src ./src
COPY --from=build /app/package.json /app/next.config.ts /app/tsconfig.json ./
RUN mkdir -p /app/storage/uploads /app/data
ENV DATABASE_URL="file:/app/data/site.db"
ENV UPLOAD_DIR="/app/storage/uploads"
EXPOSE 3000
# creates the database on first start (idempotent), seeds if empty, then serves
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx tsx prisma/seed.ts && npm run start"]
