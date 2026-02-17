# 🛍️ FlexiCommerce

> Plataforma de e-commerce profesional, escalable y moderna

**Estado**: ✅ Arquitectura reorganizada | Frontend + Backend separados | Lista para desarrollo

---

## 📋 Tabla de Contenidos

- [🎯 Descripción](#-descripción)
- [🏗️ Estructura del Proyecto](#️-estructura-del-proyecto)
- [🚀 Quick Start](#-quick-start)
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

### Requisitos
- Node.js 18+
- npm o yarn
- PostgreSQL (para backend)

### 1️⃣ Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd FlexiCommerce

# Instalar dependencias (monorepo)
npm install

# O instalar cada parte por separado
cd frontend && npm install
cd ../backend && npm install
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
