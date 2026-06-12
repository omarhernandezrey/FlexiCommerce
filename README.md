# 🛍️ FlexiCommerce

[![CI/CD Pipeline](https://github.com/omarhernandezrey/FlexiCommerce/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/omarhernandezrey/FlexiCommerce/actions/workflows/ci-cd.yml)
[![CodeQL](https://github.com/omarhernandezrey/FlexiCommerce/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/omarhernandezrey/FlexiCommerce/actions/workflows/codeql.yml)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/omarhernandezrey/FlexiCommerce/tree/main.svg?style=shield)](https://app.circleci.com/pipelines/github/omarhernandezrey/FlexiCommerce)

**Plataforma de e-commerce full-stack** (web + móvil) con pagos reales, panel de administración, dockerizada de punta a punta y con un ecosistema completo de CI/CD: cada commit se prueba, se construye, se despliega y se verifica automáticamente.

| | |
|---|---|
| 🌐 **Web** | Next.js 14 + TypeScript + Tailwind (PWA, i18n) |
| 📱 **Móvil** | Expo SDK 54 + React Native + expo-router |
| ⚙️ **API** | Express + Prisma + PostgreSQL + Redis |
| 💳 **Pagos** | Wompi Colombia (tarjetas, PSE, Nequi, corresponsal) |
| 🐳 **Infra** | Docker Compose (multi-stage, no-root, healthchecks) |
| 🔁 **CI/CD** | Jenkins + GitHub Actions + CircleCI + CodeQL + Trivy + Dependabot |
| ✅ **Tests** | 101 tests (27 backend · 53 frontend · 21 mobile) |

---

## 📋 Tabla de Contenidos

- [Levantar todo con Docker (recomendado)](#-levantar-todo-con-docker-recomendado)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Funcionalidades](#-funcionalidades)
- [Stack tecnológico](#-stack-tecnológico)
- [Desarrollo local sin Docker](#-desarrollo-local-sin-docker)
- [Tests](#-tests)
- [CI/CD — el ciclo completo](#-cicd--el-ciclo-completo)
- [Documentación](#-documentación)

---

## 🐳 Levantar todo con Docker (recomendado)

Lo único que necesitas instalado es **Docker** (con Compose). Todo lo demás — Node, PostgreSQL, Redis, migraciones — vive en los contenedores.

### 1️⃣ Clonar y configurar (solo la primera vez)

```bash
git clone git@github.com:omarhernandezrey/FlexiCommerce.git
cd FlexiCommerce

cp .env.example .env
# OBLIGATORIO: genera un secreto y pégalo en JWT_SECRET= dentro de .env
openssl rand -hex 32
```

El resto de valores del `.env` funcionan por defecto. Si algún puerto está ocupado en tu máquina, cámbialo ahí (`FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT`, …).

### 2️⃣ Levantar el stack

```bash
docker compose up -d --build
```

La primera vez tarda unos minutos (construye las imágenes y aplica las migraciones de Prisma automáticamente). Las siguientes veces basta `docker compose up -d`.

### 3️⃣ Verificar

```bash
docker compose ps    # los 4 servicios deben decir "healthy"
```

| Servicio | URL | Contenedor |
|----------|-----|------------|
| 🌐 Frontend | http://localhost:3000 | `flexicommerce-web` |
| 📡 Backend API | http://localhost:3001/api/health | `flexicommerce-api` |
| 🐘 PostgreSQL | `localhost:5434` (user `flexicommerce`) | `flexicommerce-db` |
| 🔴 Redis | `localhost:6379` | `flexicommerce-cache` |

### Servicios opcionales (perfiles de compose)

```bash
docker compose --profile ci up -d          # + Jenkins CI  → http://localhost:8080
docker compose --profile dev-tools up -d   # + PgAdmin     → http://localhost:5050
docker compose -f monitoring/docker-compose.monitoring.yml up -d   # Prometheus (9090) + Grafana (3002)
```

### Desarrollo con hot-reload dentro de Docker

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Monta tu código fuente en los contenedores (`tsx watch` + `next dev`): editas y se recarga solo.

### Comandos del día a día

```bash
docker compose logs -f backend      # logs en vivo
docker compose down                 # apagar todo (los datos se conservan)
docker compose build frontend       # reconstruir tras cambiar NEXT_PUBLIC_* en .env
docker compose exec postgres psql -U flexicommerce -d flexicommerce_dev   # consola SQL
```

> ⚠️ Las variables `NEXT_PUBLIC_*` se compilan **dentro del bundle** del frontend en tiempo de build. Si cambias `BACKEND_PORT` o las URLs públicas en `.env`, reconstruye: `docker compose build frontend`.

---

## 🏗️ Estructura del proyecto

Monorepo con npm workspaces (`frontend` + `backend`; `mobile` es independiente):

```
FlexiCommerce/
├── frontend/            # 🎨 Next.js 14 — storefront + panel admin (puerto 3000)
│   ├── app/             #    App Router: (storefront), admin/, auth/, checkout/, cart/...
│   ├── components/      #    Componentes React reutilizables
│   ├── hooks/           #    useProducts, useCart, useAuth, useReviews, useWishlist...
│   ├── store/           #    Estado global con Zustand
│   ├── e2e/             #    Tests E2E con Playwright
│   └── Dockerfile       #    Multi-stage con output standalone
│
├── backend/             # ⚙️ Express + Prisma (puerto 3001)
│   ├── src/modules/     #    auth, products, orders, payments, coupons, reviews,
│   │                    #    wishlist, categories, cms, analytics, admin, users,
│   │                    #    newsletter, recommendations
│   ├── prisma/          #    Schema + migraciones (se aplican solas al arrancar)
│   ├── Dockerfile       #    Multi-stage, usuario no-root, migrate deploy automático
│   └── docker-entrypoint.sh
│
├── mobile/              # 📱 Expo SDK 54 + expo-router (Android/iOS con Expo Go)
│
├── ci/jenkins/          # 🤖 Jenkins como código: Dockerfile, plugins, casc.yaml
├── .github/             #    workflows (ci-cd, codeql) + dependabot.yml
├── .circleci/           #    config de CircleCI
├── Jenkinsfile          #    Pipeline local: tests → build → deploy → smoke tests
│
├── monitoring/          # 📊 Prometheus + Grafana + alertas
├── k6/                  # 🔥 Pruebas de carga (normal, spike, auth)
├── Design/              # 📐 Prototipos UI/UX
│
├── docker-compose.yml       # Stack de producción (+ perfiles ci y dev-tools)
└── docker-compose.dev.yml   # Override de desarrollo con hot-reload
```

---

## ✨ Funcionalidades

### Tienda (storefront)
- Catálogo con búsqueda, filtros por categoría, precio y stock
- Detalle de producto con galería, reseñas y calificaciones
- Carrito persistente, wishlist y favoritos
- **Checkout con Wompi Colombia**: tarjetas, PSE, Nequi y corresponsal bancario, con verificación de firma en webhook, cupones de descuento e IVA (19 %) calculado en el backend
- Autenticación JWT (registro, login, perfil, historial de órdenes)
- PWA instalable, i18n (next-intl), diseño responsive mobile-first

### Panel de administración (`/admin`)
- Dashboard con métricas y analytics
- CRUD de productos (duplicar, activar/desactivar, borrado masivo, estadísticas de inventario)
- Gestión de órdenes con transiciones de estado validadas (PENDING → PROCESSING → SHIPPED → DELIVERED)
- Cupones, categorías, usuarios, reseñas y CMS de la página principal

### Plataforma
- API REST documentada (Swagger UI en `/api/docs` en desarrollo, `openapi.yaml`)
- Rate limiting con Redis, logging con Winston, métricas Prometheus, Sentry opcional
- WebSockets (Socket.IO) para actualizaciones en tiempo real

---

## 📦 Stack tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Next.js 14 · React 18 · TypeScript 5 · Tailwind CSS · Zustand · next-intl · next-pwa · Sentry |
| **Backend** | Node.js 22 · Express 4 · Prisma 5 · PostgreSQL 16 · Redis 7 · JWT · Socket.IO · Winston · Swagger |
| **Móvil** | Expo SDK 54 · React Native · expo-router 6 · Zustand · Axios |
| **Pagos** | Wompi Colombia (sandbox y producción) |
| **Testing** | Jest (unitarios) · Playwright (E2E) · k6 (carga) |
| **DevOps** | Docker · Docker Compose · Jenkins · GitHub Actions · CircleCI · CodeQL · Trivy · Dependabot · Prometheus · Grafana |

---

## 💻 Desarrollo local sin Docker

<details>
<summary>Ver instrucciones (Node 22+, PostgreSQL y Redis locales)</summary>

### Requisitos
- Node.js **22.18+** (Jest 30 lee `jest.config.ts` con type stripping nativo)
- PostgreSQL 16 y Redis corriendo localmente

### Pasos

```bash
# 1. Instalar dependencias (monorepo con workspaces)
npm install

# 2. Variables de entorno
#    backend/.env       → DATABASE_URL, JWT_SECRET, CORS_ORIGIN, Wompi...
#    frontend/.env.local → NEXT_PUBLIC_API_URL=http://localhost:3001
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Base de datos
cd backend && npx prisma generate && npx prisma migrate deploy && cd ..

# 4. Levantar (cada uno en su terminal)
cd backend && npm run dev     # http://localhost:3001
cd frontend && npm run dev    # http://localhost:3000

# Móvil (opcional, requiere Expo Go en el teléfono)
cd mobile && npm run tunnel
```

</details>

---

## 🧪 Tests

**101 tests** en total, todos en verde y ejecutados automáticamente en cada commit por los 3 sistemas de CI:

```bash
cd backend && npm test     # 27 tests — servicios (products, orders, auth) con Prisma mockeado
cd frontend && npm test    # 53 tests — componentes y páginas con Testing Library
cd mobile && npm test      # 21 tests — stores y componentes con jest-expo

cd frontend && npm run test:e2e   # Playwright E2E (requiere el stack corriendo)
k6 run k6/load-test-normal.js     # Pruebas de carga (requiere k6)
```

---

## 🔁 CI/CD — el ciclo completo

Cada commit a `main` activa **4 sistemas en paralelo** que prueban, construyen, despliegan y verifican la aplicación:

```
                          git push / commit a main
                                    │
        ┌──────────────┬────────────┼──────────────┬──────────────┐
        ▼              ▼            ▼              ▼              ▼
   🤖 Jenkins     ⚡ GitHub      🔒 CodeQL     🟢 CircleCI    🤝 Dependabot
    (local)        Actions       (SAST)       (CI externo)   (dependencias)
        │              │                            │
  tests + build   lint + tests              tests + build
  DEPLOY real     Trivy + ghcr.io           de imágenes
  smoke tests     deploy-verification
                  (stack completo + smoke)
```

| Sistema | Configuración | Qué hace en cada commit |
|---------|--------------|--------------------------|
| **Jenkins** (local, perfil `ci`) | `Jenkinsfile` + `ci/jenkins/` | 5 etapas: dependencias → type-check + 80 tests en paralelo → build de imágenes → **despliegue real** (`docker compose up -d`) → **smoke tests** contra la app viva (health, API + DB, frontend). Se dispara solo cada ~5 min (`pollSCM`) |
| **GitHub Actions** | `.github/workflows/ci-cd.yml` | Lint, type-check, 80 tests, escaneo de vulnerabilidades con **Trivy**, publicación de imágenes versionadas en **ghcr.io** y `deploy-verification`: levanta el stack completo en el runner y ejecuta los smoke tests |
| **CodeQL** | `.github/workflows/codeql.yml` | Análisis estático de seguridad (SAST) en cada push + escaneo semanal programado |
| **CircleCI** | `.circleci/config.yml` | Pipeline externo redundante: calidad (type-check + tests) → build de imágenes Docker |
| **Dependabot** | `.github/dependabot.yml` | PRs automáticos semanales: dependencias npm (3 workspaces), imágenes base de Docker y versiones de actions — cada PR pasa por todo el CI antes de poder mezclarse |

### Jenkins en 30 segundos

```bash
docker compose --profile ci up -d --build
# → http://localhost:8080  (admin / flexicommerce, cambiables en .env)
```

Arranca **ya configurado** (configuración como código, sin asistente de instalación) con el job `flexicommerce-ci` creado automáticamente. Importante: el pipeline corre sobre el **último commit de `main`** — commitea para que tus cambios entren al siguiente build.

> 📝 ¿Por qué no Travis CI o Codeship? Codeship fue descontinuado por CloudBees y Travis dejó de ofrecer un plan gratuito útil. Las herramientas integradas son el estándar actual de la industria.

---

## 📖 Documentación

| Documento | Contenido |
|-----------|-----------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guía completa de despliegue, Docker y CI/CD |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura detallada del proyecto |
| [API.md](./API.md) / [openapi.yaml](./openapi.yaml) | Referencia de la API REST |
| Swagger UI | http://localhost:3001/api/docs (con el backend en modo desarrollo) |
| [MOBILE_SETUP.md](./MOBILE_SETUP.md) | Configuración de la app móvil con Expo |
| [postman-collection.json](./postman-collection.json) | Colección de Postman lista para importar |

---

## 🤝 Contribuir

1. Crea una rama: `git checkout -b feature/nombre`
2. Haz tus cambios y verifica: `npm test` en `backend/` y `frontend/`
3. Commit y push — el CI validará todo automáticamente
4. Abre un Pull Request (los checks de Actions deben pasar)

---

## 📄 Licencia

MIT

---

**Hecho con Next.js, Express, Prisma y mucho ☕ — listo para clonar, levantar con un comando y explorar.**
