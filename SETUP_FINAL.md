# ✅ FlexiCommerce - Setup Final Confirmado

**Fecha:** 20 de Febrero de 2026  
**Último Update:** 20-Feb-2026  
**Estado:** 🟢 Arquitectura Separada Operativa  
**Versión:** 1.0 - Production Ready

---

## 📋 Tabla de Contenidos

1. [Arquitectura Separada](#🏗️-arquitectura-separada)
2. [Quick Start](#🚀-quick-start)
3. [Comandos por Plataforma](#📱-comandos-por-plataforma)
4. [Acceso a Servicios](#🔗-acceso-a-servicios)
5. [Credenciales](#🔑-credenciales-para-testing)
6. [Estado de Plataformas](#📊-estado-de-plataformas)
7. [Troubleshooting](#🆘-troubleshooting)

---

## 🏗️ Arquitectura Separada

### Diagrama General

```
┌──────────────────────────────────────────────────────────────────┐
│                    USUARIOS EN INTERNET                          │
└──────────────────────────────────────────────────────────────────┘
              │                    │                    │
              ▼                    ▼                    ▼
       ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐
       │  📱 ANDROID    │  │  🌐 WEB      │  │ 👨‍💼 ADMIN WEB   │
       │  (Expo Go)     │  │  (Browser)   │  │  (Dashboard)    │
       │  React Native  │  │  Next.js     │  │  Next.js Admin  │
       │  Port 8081+    │  │  Port 3000   │  │  Port 3000      │
       └────────┬───────┘  └──────┬───────┘  └────────┬────────┘
                │                 │                   │
                └─────────────────┬───────────────────┘
                                  │ HTTPS/Tunnel
                                  ▼
        ┌────────────────────────────────────────────────────┐
        │           🌐 CLOUDFLARE TUNNEL / CDN              │
        │    (Expone Backend a Internet de forma segura)    │
        └────────────────────────┬─────────────────────────┘
                                  │
                                  ▼
        ┌────────────────────────────────────────────────────┐
        │         📡 BACKEND API (Express.js)               │
        │           http://localhost:3001                   │
        │                                                    │
        │  ├─ Authentication (JWT + Redis)                  │
        │  ├─ Products API                                  │
        │  ├─ Orders & Checkout                             │
        │  ├─ User Management                               │
        │  └─ Admin Operations                              │
        └──────────┬──────────────┬──────────────┬──────────┘
                   │              │              │
        ┌──────────▼──┐  ┌────────▼────┐  ┌─────▼──────────┐
        │ PostgreSQL  │  │    Redis    │  │   File Store   │
        │   (5432)    │  │    (6379)   │  │   (S3/GCS)     │
        │             │  │             │  │                │
        │ ├─ Users    │  │ ├─ Sessions │  │ ├─ Uploads     │
        │ ├─ Products │  │ ├─ Cart     │  │ └─ Images      │
        │ ├─ Orders   │  │ ├─ Cache    │  │                │
        │ ├─ Reviews  │  │ └─ Tokens   │  └────────────────┘
        │ └─ Wishlist │  │             │
        └─────────────┘  └─────────────┘
```

### Decisión Arquitectónica: ¿Por qué Separado?

```
┌────────────────────────────────────────────────────────────┐
│  ❌ OPCIÓN RECHAZADA: Monorepo Expo (Web + Mobile)        │
│  ├─ Problema: React 19 incompatible con react-native-web  │
│  ├─ Impedimento: No hay SEO nativo en Expo Web            │
│  └─ Conclusión: Arquitectura forzada causa complejidad    │
├────────────────────────────────────────────────────────────┤
│  ✅ OPCIÓN ELEGIDA: Arquitectura Separada                 │
│  ├─ Mobile: React Native con Expo (Experiencia nativa)    │
│  ├─ Web: Next.js (SSR, SSG, SEO nativo)                   │
│  ├─ Backend: API REST compartido (DRY principle)          │
│  └─ Resultado: Mejor performance + escalabilidad          │
└────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 📋 Pre-requisitos
- Docker instalado y ejecutándose
- Node.js 18+
- Expo Go app (Android)
- Terminal con acceso a bash

### ⚙️ 1️⃣ Iniciar Backend + Infraestructura

```bash
cd /home/omarhernandez/personalProjects/FlexiCommerce

# Esto inicia:
# - PostgreSQL en puerto 5432
# - Redis en puerto 6379
# - Node.js backend en puerto 3001
# - Cloudflare tunnel automático
bash ./start-mobile-dev-docker.sh

# Verás salida como:
# ✓ PostgreSQL container running (healthy)
# ✓ Redis container running (healthy)
# ✓ Backend server listening on 3001
# ✓ Tunnel URL: https://rec-womens-pearl-spectrum.trycloudflare.com
```

### 📱 2️⃣ Iniciar Mobile (Expo)

```bash
# En OTRA terminal
cd mobile
npm start -- --tunnel --clear

# O:
npm run tunnel-clear

# Espera a ver:
# ✓ Metro Bundler iniciado
# ✓ QR generado
```

### 🌐 3️⃣ Iniciar Web (Next.js)

```bash
# En OTRA terminal
cd frontend
npm run dev

# Verás:
# ◇ Ready in 3.2s
# ◇ Local: http://localhost:3000
```

### 📱 4️⃣ Acceder desde tu Teléfono

```
1. Abre tu Cámara
2. Escanea el QR mostrado en Terminal 2
3. Toca "Abrir en Expo Go"
4. La app se descargará e instalará
5. Login:
   Email: test@flexicommerce.com
   Password: Test@12345
6. ¡Listo! Deberías ver "Conectado correctamente"
```

---

## 📱 Comandos por Plataforma

### Mobile (Expo)

```bash
cd mobile

# Desarrollo con Tunnel (se puede acceder desde el celular)
npm start -- --tunnel --clear
npm run tunnel-clear  # Alias corto

# Desarrollo sin tunnel (solo localhost)
npm start

# Limpiar caché
npm start -- --clear

# Builds para production
eas build --platform android
eas build --platform ios

# OTA Updates
eas update
```

### Web (Next.js)

```bash
cd frontend

# Desarrollo (hot reload)
npm run dev

# Build producción
npm run build

# Testear build localmente
npm run build && npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Backend (Express)

```bash
cd backend

# Desarrollo (nodemon auto-reload)
npm run dev

# Build TypeScript
npm run build

# Production
npm run start

# Linting
npm run lint

# Prisma
npx prisma migrate dev         # Create migration
npx prisma db push            # Sync schema
npx prisma studio            # GUI para DB
```

### Docker

```bash
# Ver status
docker ps

# Ver logs
docker logs flexicommerce-postgres
docker logs flexicommerce-redis
docker logs backend-container

# Entrar a PostgreSQL
docker exec -it flexicommerce-postgres psql -U postgres

# Limpiar TODO
docker-compose down -v
docker system prune
```

---

## 🔗 Acceso a Servicios

### Durante Desarrollo

```
Frontend Web       →  http://localhost:3000
Backend API        →  http://localhost:3001
PostgreSQL         →  localhost:5432
Redis              →  localhost:6379
Mobile (Expo)      →  via tunnel (dynamic URL)
```

### Verificar que todo funciona

```bash
# Backend health check
curl http://localhost:3001/api/health

# TestUser login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@flexicommerce.com","password":"Test@12345"}'

# Ver productos
curl http://localhost:3001/api/products
```

---

## 🔑 Credenciales para Testing

| Rol | Email | Password | Uso |
|-----|-------|----------|-----|
| Customer | test@flexicommerce.com | Test@12345 | Comprar productos |
| Admin | admin@flexicommerce.com | Admin@12345 | Dashboard |
| NewAccount | Crea en register | Tu password | Testing registro |

> ⚠️ **Importante**: Estas son credenciales de DEV. En producción usar identity provider (Google, GitHub, etc.)

---

## 📊 Estado de Plataformas

| Plataforma | Estado | Puerto | Comando Inicio | Documentación |
|-----------|--------|-------|-----------------|----------------|
| **Android (Expo)** | ✅ Operativo | 8081+ | `npm start -- --tunnel --clear` | [INICIO_SESION_EXPO_GO.md](INICIO_SESION_EXPO_GO.md) |
| **iOS (Expo)** | ⏳ No probado | 8081+ | `npm run ios` | Requiere Mac + Xcode |
| **Web (Next.js)** | ✅ Operativo | 3000 | `npm run dev` | [WEB_SETUP.md](WEB_SETUP.md) |
| **Web (Expo)** | ❌ No soportado | N/A | N/A | Use Next.js instead |
| **Backend API** | ✅ Operativo | 3001 | `npm run dev` | [API.md](API.md) |

### Razón del estado de plataformas

```
┌─ ANDROID (Expo) ✅
│  └─ React Native 19.1.0 + Expo Go
│     └─ Testeado ✓ en dispositivo
│
├─ iOS ⏳
│  └─ Requiere:
│     ├─ Mac + Xcode (no disponible en dev actual)
│     ├─ Apple Developer Account
│     └─ Certificados
│
├─ WEB (Next.js) ✅
│  └─ React 19 + Next.js 14
│     └─ Totalmente compatible ✓
│
└─ WEB (Expo) ❌
   └─ react-native-web@0.21.2 NO soporta React 19
      └─ Usamos Next.js en su lugar ✓
```

---

## 🔧 Última Configuración Aplicada

### Versiones Finales (Working)

**Mobile Stack**:
```json
{
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-screens": "~4.16.0",
  "react-native-web": "0.21.2",
  "expo": "^54.0.0",
  "expo-router": "~6.0.23",
  "zustand": "^4.4.0",
  "axios": "^1.6.0"
}
```

**Web Stack**:
```json
{
  "next": "^14.0.0",
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "typescript": "^5.0",
  "tailwindcss": "^3.x",
  "zustand": "^4.4.0",
  "axios": "^1.6.0"
}
```

**Backend Stack**:
```json
{
  "node": "18+ LTS",
  "express": "^4.x",
  "typescript": "^5.x",
  "prisma": "^5.x",
  "postgres": "15+",
  "redis": "7.x",
  "jsonwebtoken": "^9.x"
}
```

---

## ✅ Lo que Está Funcionando

### ✓ Mobile (Android + Expo)
- [x] Login/Register flow
- [x] Product browsing
- [x] Add to cart
- [x] Checkout flow
- [x] Order history
- [x] User profile
- [x] Wishlist/Compare
- [x] Push notifications ready

### ✓ Web (Next.js)
- [x] Landing page
- [x] Product catalog with filters
- [x] Product detail pages
- [x] Product reviews
- [x] User authentication
- [x] Shopping cart
- [x] Checkout process
- [x] Admin dashboard
- [x] Email integration ready

### ✓ Backend API
- [x] Authentication (JWT)
- [x] User management
- [x] Product CRUD
- [x] Order management
- [x] Review system
- [x] Admin endpoints
- [x] Wishlist/Compare
- [x] Search & filtering

### ✓ Infrastructure
- [x] PostgreSQL database
- [x] Redis caching
- [x] Docker containerization
- [x] Cloudflare tunnel
- [x] CORS configured
- [x] Rate limiting ready

---

## 🎯 Development Workflow

### Típico Día de Desarrollo

```
MAÑANA:
1. Terminal 1: Inicia backend
   bash start-mobile-dev-docker.sh

2. Terminal 2: Abre mobile
   cd mobile && npm start -- --tunnel --clear

3. Terminal 3: Abre web
   cd frontend && npm run dev

DESARROLLO:
├─ Editar componentes → Hot reload automático
├─ Editar backend → Nodemon reinicia server
├─ Cambios en DB → npx prisma migrate dev
└─ Commit cambios → git add . && git commit -m "..."

TESTING:
├─ Web: http://localhost:3000 en browser
├─ Mobile: Expo Go con QR
└─ API: curl http://localhost:3001/api/...

ENTREGA:
├─ git push origin feature-branch
├─ Create Pull Request
├─ Review + merge
└─ Deploy automático en Vercel (web) + EAS (mobile)
```

---

## 🆘 Troubleshooting

### Problema: "Something went wrong" en Expo

**Solución**:
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm start -- --tunnel --clear
# Si persiste, presiona 'r' en terminal
```

### Problema: Puerto 3001 (Backend) ya en uso

**Solución**:
```bash
# Encontrar proceso
lsof -i :3001

# Matar proceso
kill -9 <PID>

# O cambiar puerto en .env
PORT=3002
```

### Problema: PostgreSQL error "connection refused"

**Solución**:
```bash
# Reiniciar Docker
docker-compose down
docker-compose up -d

# O
bash start-mobile-dev-docker.sh
```

### Problema: "Tunnel URL no funciona"

**Solución**:
```bash
# El túnel se regenera cada vez
# Editar mobile/.env con Nueva URL cada reinicio

# O ejecutar script (lo hace automático):
bash start-mobile-dev-docker.sh
```

### Problema: Cache de npm causando conflictos

**Solución**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# O: npm install --legacy-peer-deps
```

---

## 📚 Documentación Completa

```
Project Root /
├─ ARCHITECTURE.md          ← Diagramas + decisiones arquitectónicas
├─ SETUP_FINAL.md          ← Este documento (Quick setup)
├─ INICIO_SESION_EXPO_GO.md ← Guía detallada de mobile
├─ WEB_SETUP.md            ← Guía de Next.js web
├─ API.md                  ← Especificación de endpoints
├─ DEPLOYMENT.md           ← Deployment a producción
└─ README.md               ← Visión general
```

**Recomendado leer en orden**:
1. Este documento (SETUP_FINAL.md)
2. ARCHITECTURE.md (entender el diseño)
3. INICIO_SESION_EXPO_GO.md (si trabajas en mobile)
4. WEB_SETUP.md (si trabajas en web)
5. API.md (referencia de endpoints)

---

## 🚀 Próximas Mejoras

```
Phase 1: MVP ✅ (Actual)
├─ Mobile login y browsing
├─ Web platform operativa
└─ Backend API funcional

Phase 2: Enhancement
├─ Push notifications
├─ Email confirmations
├─ Advanced analytics
├─ Social features
└─ Performance optimization

Phase 3: Scale
├─ Multi-region deployment
├─ GraphQL API
├─ Real-time features
├─ ML recommendations
└─ Enterprise features
```

---

## 📞 Support & Resources

**Principales URLs**:
- API Docs: http://localhost:3001/docs (si swagger activado)
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Prisma Studio: `npx prisma studio`

**Useful Commands**:
```bash
# Database
npx prisma migrate dev         # Create new migration
npx prisma db seed             # Seed with test data
npx prisma studio              # GUI for database

# Testing
npm test                        # Run test suite
npm run type-check             # TypeScript check
npm run lint                   # Code linting

# Git
git log --oneline              # See commits
git branch                     # List branches
git status                     # Current status
```

---

## ✨ Checklist Pre-Deployment

```
Backend:
☐ npm run lint                 # No errors
☐ npm run type-check           # No TS errors
☐ npm test                     # All tests pass
☐ docker build .               # Builds successfully

Mobile:
☐ npm run lint                 # No warnings
☐ Tested on physical device    # QR scan works
☐ Credentials work             # Login successful
☐ eas build --platform android # Build succeeds

Web:
☐ npm run build                # Build succeeds
☐ npm run lint                 # No warnings
☐ Tested in Chrome, Firefox    # All works
☐ npm run type-check           # No TS errors

Git:
☐ git status                   # Working tree clean
☐ All changes committed        # Ready to push
☐ Branch is up-to-date         # No conflicts
☐ PR reviews passed            # Approved
```

---

**✅ Sistema Ready para Producción**

**Última actualización**: 20 de Febrero de 2026  
**Versión**: 1.0  
**Mantenedor**: Omar Hernandez  
**Estado**: 🟢 Production Ready
