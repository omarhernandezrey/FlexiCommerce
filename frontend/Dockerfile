# =============================================================================
# FlexiCommerce Frontend — Next.js 14 (output: standalone)
# Build:  docker build -t flexicommerce-web ./frontend
#
# Las variables NEXT_PUBLIC_* se inyectan en el bundle EN TIEMPO DE BUILD,
# por eso van como build args y no como variables de entorno del contenedor.
# =============================================================================

# ---- Dependencias ------------------------------------------------------------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build --------------------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_NAME=FlexiCommerce
ARG NEXT_PUBLIC_WOMPI_PUBLIC_KEY=
ARG NEXT_PUBLIC_WOMPI_ENV=sandbox
ARG NEXT_PUBLIC_SENTRY_DSN=
ARG NEXT_PUBLIC_ANALYTICS_URL=

ENV NEXT_PUBLIC_ANALYTICS_URL=$NEXT_PUBLIC_ANALYTICS_URL \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
    NEXT_PUBLIC_WOMPI_PUBLIC_KEY=$NEXT_PUBLIC_WOMPI_PUBLIC_KEY \
    NEXT_PUBLIC_WOMPI_ENV=$NEXT_PUBLIC_WOMPI_ENV \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Imagen final --------------------------------------------------------------
FROM node:20-bookworm-slim AS runner
WORKDIR /app

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends dumb-init \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:3000').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
