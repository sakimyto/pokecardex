FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Build stage - copy everything needed at runtime
FROM base AS runner
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY src ./src
COPY drizzle ./drizzle
COPY scripts ./scripts
COPY drizzle.config.ts ./
COPY tsconfig.json ./

# Create data directory for SQLite (volume mount target)
RUN mkdir -p data

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "scripts/start.sh"]
