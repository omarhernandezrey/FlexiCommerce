# 🛍️ FlexiCommerce

[![CI/CD Pipeline](https://github.com/omarhernandezrey/FlexiCommerce/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/omarhernandezrey/FlexiCommerce/actions/workflows/ci-cd.yml)
[![CodeQL](https://github.com/omarhernandezrey/FlexiCommerce/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/omarhernandezrey/FlexiCommerce/actions/workflows/codeql.yml)

> Plataforma de e-commerce profesional, escalable y moderna

**Estado**: ✅ Arquitectura reorganizada | Frontend + Backend separados | Lista para desarrollo

---

## 📋 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [🏗️ Estructura del Proyecto](#️-estructura-del-proyecto)
- [🚀 Quick Start](#-quick-start)
- [🐳 Levantar todo con Docker (recomendado)](#-levantar-todo-con-docker-recomendado)
- [🤖 CI con Jenkins](#-ci-con-jenkins)
- [📦 Tecnologías](#-tecnologías)
- [📖 Documentación](#-documentación)

---

## 🎯 Descripción

FlexiCommerce es una plataforma de e-commerce completa, profesional y lista para producción con:

✨ **Frontend moderno** - Next.js + React + TypeScript + Tailwind  
⚡ **Backend robusto** - Express + Prisma + PostgreSQL  
🔐 **Seguridad** - JWT, validación, CORS  
📱 **Responsive** - Diseño mobile-first  
🎨 **Diseños incluidos** - Prototipos UI/UX en `/Design`  
🌍 **Scalable** - Arquitectura modular y profesional  

---

## 🏗️ Estructura del Proyecto

```
FlexiCommerce/
├── frontend/          # 🎨 Next.js App (Puerto 3000)
├── backend/           # 🔧 Express Server (Puerto 3001)
├── Design/            # 📐 Prototipos de UI/UX
└── ARCHITECTURE.md    # 📚 Documentación detallada
```

### Frontend
```
frontend/
├── app/               # Next.js App Router
├── components/        # Componentes React
├── hooks/            # Custom hooks
├── lib/              # Utilidades
├── services/         # API calls
├── store/            # Estado global (Zustand)
├── types/            # TypeScript types
└── styles/           # CSS global
```

### Backend
```
backend/
├── src/
│   ├── modules/      # Módulos funcionales
│   ├── middlewares/  # Middlewares Express
│   ├── config/       # Configuraciones
│   ├── database/     # Prisma ORM
│   ├── utils/        # Utilidades
│   ├── app.ts        # Configuración Express
│   └── server.ts     # Punto de entrada
└── prisma/           # Schema ORM
```

---

## 🚀 Quick Start

> 💡 **La forma más rápida y confiable es con Docker** — ver [🐳 Levantar todo con Docker](#-levantar-todo-con-docker-recomendado). Esta sección describe el modo manual (sin Docker).

### Requisitos
- Node.js 22+
- npm
- PostgreSQL (para backend) — o usa el de Docker
- Docker + Docker Compose (para la opción recomendada)

### 1️⃣ Instalación

```bash
# Clonar repositorio
git clone git@github.com:omarhernandezrey/FlexiCommerce.git
cd FlexiCommerce

# Instalar dependencias (monorepo)
npm install
```

### 2️⃣ Configurar Variables de Entorno

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FlexiCommerce
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend** (`backend/.env`):
```bash
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/flexicommerce
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

### 3️⃣ Ejecutar en Desarrollo

Desde la **raíz**:
```bash
# Ambos proyectos
npm run dev
```

O **por separado**:
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev
# http://localhost:3000

# Terminal 2 - Backend
cd backend
npm run dev
# http://localhost:3001
```

### 4️⃣ Verificar

- 🌐 Frontend: http://localhost:3000
- 📡 Backend: http://localhost:3001
- 🏥 Health Check: http://localhost:3001/api/health

---

## 🐳 Levantar todo con Docker (recomendado)

Todo el stack (frontend, backend, PostgreSQL y Redis) corre en Docker bajo un solo proyecto `flexicommerce`, con migraciones de Prisma automáticas al arrancar.

### 1️⃣ Configurar `.env` (solo la primera vez)

```bash
cp .env.example .env

# OBLIGATORIO: generar y pegar el JWT_SECRET en .env
openssl rand -hex 32
```

El resto de valores del `.env` ya funcionan por defecto. Los puertos son configurables (`FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT`, etc.) por si alguno está ocupado.

### 2️⃣ Levantar el stack

```bash
docker compose up -d --build
```

La primera vez tarda unos minutos (construye las imágenes). Las siguientes veces basta `docker compose up -d` y arranca en segundos.

### 3️⃣ Verificar

```bash
docker compose ps          # los 4 servicios deben decir "healthy"
```

| Servicio | URL |
|----------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 📡 Backend API | http://localhost:3001/api/health |
| 🐘 PostgreSQL | localhost:5434 (user: `flexicommerce`) |
| 🔴 Redis | localhost:6379 |

### Servicios opcionales (perfiles)

```bash
docker compose --profile ci up -d          # + Jenkins CI    → http://localhost:8080
docker compose --profile dev-tools up -d   # + PgAdmin       → http://localhost:5050
```

### Desarrollo con hot-reload dentro de Docker

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

Monta el código fuente en los contenedores y usa `tsx watch` + `next dev` — los cambios se recargan solos.

### Comandos útiles

```bash
docker compose logs -f backend   # logs en vivo de un servicio
docker compose down              # apagar todo (los datos se conservan)
docker compose build frontend    # reconstruir tras cambiar NEXT_PUBLIC_* en .env
docker compose exec postgres psql -U flexicommerce -d flexicommerce_dev   # consola SQL
```

> ⚠️ Las variables `NEXT_PUBLIC_*` se compilan dentro del bundle del frontend en tiempo de build. Si cambias `BACKEND_PORT` o las URLs públicas en `.env`, reconstruye: `docker compose build frontend`.

---

## 🤖 CI con Jenkins

Jenkins corre como servicio opcional del compose (perfil `ci`) con **configuración como código** (`ci/jenkins/`): arranca ya configurado, sin asistente de instalación, y el job de CI se crea solo.

```bash
docker compose --profile ci up -d --build
```

- **URL**: http://localhost:8080 — usuario `admin`, contraseña `flexicommerce` (cambiables en `.env` con `JENKINS_ADMIN_USER` / `JENKINS_ADMIN_PASSWORD`)
- **Job `flexicommerce-ci`** (definido en `Jenkinsfile`), etapas:
  1. **Dependencias** — `npm ci` + `prisma generate`
  2. **Calidad** — type-check + tests de backend y frontend en paralelo (80 tests)
  3. **Imágenes Docker** — construye las imágenes de backend y frontend
  4. **Desplegar contenedores** — `docker compose up -d` con las imágenes recién construidas (conserva datos y red)
  5. **Pruebas funcionales (smoke tests)** — verifica la app desplegada: health check del backend, API consultando la base de datos y frontend respondiendo 200
- **Disparo automático**: el job revisa el repo cada ~5 min (`pollSCM`) y se ejecuta solo con cada commit nuevo en `main`. También puedes lanzarlo manualmente con **"Build Now"**
- El pipeline corre sobre el **último commit de `main`** del repo local — haz commit para que tus cambios entren al siguiente build

### Integración continua en la nube

Además del Jenkins local, cada push a `main`/`develop` dispara CI en la nube:

- **GitHub Actions** (`.github/workflows/ci-cd.yml`): lint, type-check, los 80 tests, escaneo de vulnerabilidades con **Trivy**, publicación de imágenes en `ghcr.io` y **verificación de despliegue** (levanta el stack completo con Docker Compose y ejecuta smoke tests contra la app corriendo)
- **CodeQL** (`.github/workflows/codeql.yml`): análisis estático de seguridad del código (SAST) nativo de GitHub, también programado semanalmente
- **Dependabot** (`.github/dependabot.yml`): PRs automáticos semanales con actualizaciones de dependencias npm, imágenes Docker y actions
- **CircleCI** (`.circleci/config.yml`): servicio de CI externo alternativo — para activarlo entra a [circleci.com](https://circleci.com) con GitHub y habilita el repo
- *Nota*: Travis CI y Codeship quedaron descartados — Codeship fue descontinuado por CloudBees y Travis dejó de ser gratuito/relevante; las herramientas de arriba son el estándar actual

---

## 📦 Tecnologías

### Frontend 🎨
| Tech | Versión | Uso |
|------|---------|-----|
| Next.js | 14.0+ | Framework React |
| React | 18.2+ | UI Library |
| TypeScript | 5.3+ | Type Safety |
| Tailwind CSS | 3.4+ | Styling |
| Zustand | 4.4+ | State Management |
| Axios | 1.6+ | HTTP Client |
| React Hook Form | 7.48+ | Form Management |

### Backend 🔧
| Tech | Versión | Uso |
|------|---------|-----|
| Express | 4.18+ | Web Framework |
| Prisma | 5.7+ | ORM |
| PostgreSQL | 15+ | Database |
| TypeScript | 5.3+ | Type Safety |
| JWT | - | Authentication |
| Bcrypt | 5.1+ | Password Hashing |
| Cors | 2.8+ | CORS Handling |

---

## 📖 Documentación

Para más detalles, ver:

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Estructura completa del proyecto
- **[Design/](./Design/)** - Prototipos UI/UX
- **Frontend README**: `cd frontend && cat README.md`
- **Backend README**: `cd backend && cat README.md`

---

## 🔧 Scripts Disponibles

### Monorepo (Raíz)
```bash
npm run dev          # Dev mode en ambos proyectos
npm run build        # Build de ambos
npm run start        # Producción
npm run lint         # Linting
npm run type-check   # Type checking
npm run format       # Format código
```

### Frontend
```bash
cd frontend
npm run dev          # Dev server (puerto 3000)
npm run build        # Build optimizado
npm run start        # Servidor producción
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run format       # Prettier format
```

### Backend
```bash
cd backend
npm run dev          # Dev con hot reload (puerto 3001)
npm run build        # Compilar TypeScript
npm run start        # Servidor producción
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run db:migrate   # Run Prisma migrations
npm run db:generate  # Generate Prisma client
```

---

## 🔐 Autenticación

El sistema usa **JWT** (JSON Web Tokens):

1. Cliente hace login → Backend genera JWT
2. JWT se almacena en localStorage/cookies
3. Frontend envía JWT en headers de cada request
4. Backend valida JWT antes de procesar

---

## 🗄️ Base de Datos

### Setup PostgreSQL

```bash
# Crear base de datos
createdb flexicommerce

# En backend/
# Ejecutar migraciones
npm run db:migrate

# Generar Prisma Client
npm run db:generate
```

---

## 📝 Desarrollo

### Agregar Nueva Feature

1. **Backend**: Crea en `backend/src/modules/feature-name/`
2. **Frontend**: Crea en `frontend/features/feature-name/`
3. **Conecta**: API en backend → Service en frontend → Components

### Estructura de un Módulo Backend

```
backend/src/modules/feature/
├── controller.ts    # Lógica HTTP
├── service.ts       # Lógica de negocio
├── routes.ts        # Rutas Express
├── types.ts         # TypeScript interfaces
└── index.ts         # Exportar módulo
```

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
# Vercel CLI auto-detecta Next.js
vercel deploy
```

### Backend → Railway / Render / Fly.io
```bash
cd backend
# Seguir instrucciones del hosting elegido
# Build: npm run build
# Start: npm run start
```

---

## 🤝 Contribuir

1. Fork el repo
2. Crea rama: `git checkout -b feature/nombre`
3. Commit cambios: `git commit -am 'Agrega feature'`
4. Push: `git push origin feature/nombre`
5. PR

---

## 📄 Licencia

MIT - Ver LICENSE

---

## 👨‍💻 Autor

FlexiCommerce - Plataforma de e-commerce profesional

---

**🎉 ¡Proyecto listo para usar! Comienza a desarrollar.** 

¿Dudas? Ver [ARCHITECTURE.md](./ARCHITECTURE.md) o crear un issue.
# FlexiCommerce
