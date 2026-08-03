FROM oven/bun:latest AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package manifest and lockfile
COPY *.json *.lock ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_SITE_URL=http://localhost
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

# Leverage dependency cache from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build and runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application (requires output: 'standalone' in next.config.js)
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

LABEL org.opencontainers.image.title="Tasken Frontend"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user (UID 1001) to run the app
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --no-log-init nextjs

# Copy public assets (if any)
COPY --from=builder /app/public ./public

# Copy standalone output and static files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Ensure proper permissions for the entire app directory
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run the server using Bun (or node if compatibility issues arise)
CMD ["bun", "run", "server.js"]
