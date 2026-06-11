# =============================================================================
# FlexiCommerce Backend — Express + Prisma + PostgreSQL
# Build:  docker build -t flexicommerce-api ./backend
# =============================================================================

# ---- Base -------------------------------------------------------------------
FROM node:20-bookworm-slim AS base
WORKDIR /app
# OpenSSL es requerido por el query engine de Prisma en Debian
RUN apt-get update -y \
    && apt-get install -y --no-install-recommends openssl dumb-init \
    && rm -rf /var/lib/apt/lists/*

# ---- Dependencias (todas, incluye dev para compilar) ------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build (prisma generate + tsc) ------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
RUN npx prisma generate && npm run build

# ---- Dependencias de producción ---------------------------------------------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate && npm cache clean --force

# ---- Imagen final ------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3001

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node docker-entrypoint.sh ./
# Winston escribe logs en /app/logs
RUN chmod +x docker-entrypoint.sh && mkdir -p /app/logs && chown node:node /app/logs

USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
