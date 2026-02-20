# 📁 FlexiCommerce - Estructura de Proyecto

## 🏗️ Estructura de Carpetas

```
FlexiCommerce/
├── frontend/                    # 🎨 Frontend (Next.js + React + TypeScript)
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Layout principal
│   │   ├── page.tsx             # Página de inicio
│   │   ├── (auth)/              # Rutas de autenticación
│   │   ├── (store)/             # Rutas de tienda
│   │   ├── (admin)/             # Rutas de administración
│   │   └── api/                 # API routes de Next.js
│   ├── components/              # Componentes React reutilizables
│   │   ├── ui/                  # Componentes base (Button, Badge, etc.)
│   │   ├── layout/              # Componentes de layout (Header, Footer)
│   │   └── shared/              # Componentes compartidos
│   ├── features/                # Características específicas del dominio
│   │   ├── products/
│   │   ├── cart/
│   │   ├── auth/
│   │   └── dashboard/
│   ├── hooks/                   # React hooks personalizados
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useToast.ts
│   ├── lib/                     # Librerías y utilidades
│   │   ├── api-client.ts        # Cliente axios configurado
│   │   ├── utils.ts             # Funciones utilitarias
│   │   └── config/              # Configuraciones
│   ├── services/                # Llamadas a API (data fetching)
│   │   ├── products.service.ts
│   │   ├── auth.service.ts
│   │   └── orders.service.ts
│   ├── store/                   # Estado global (Zustand)
│   │   ├── cart.ts
│   │   ├── user.ts
│   │   └── filters.ts
│   ├── types/                   # TypeScript types e interfaces
│   │   └── index.ts
│   ├── styles/                  # Estilos globales y CSS
│   │   └── globals.css
│   ├── public/                  # Archivos estáticos
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── .env.example
│   └── .gitignore
│
├── backend/                     # 🔧 Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── app.ts               # Configuración Express
│   │   ├── server.ts            # Punto de entrada del servidor
│   │   ├── modules/             # Módulos funcionales
│   │   │   ├── auth/            # Autenticación
│   │   │   │   ├── controller.ts
│   │   │   │   ├── service.ts
│   │   │   │   ├── routes.ts
│   │   │   │   └── types.ts
│   │   │   ├── users/           # Gestión de usuarios
│   │   │   ├── products/        # Gestión de productos
│   │   │   ├── categories/      # Gestión de categorías
│   │   │   ├── orders/          # Gestión de pedidos
│   │   │   ├── payments/        # Integración de pagos
│   │   │   ├── reviews/         # Sistema de reseñas
│   │   │   └── cms/             # CMS / Contenido
│   │   ├── middlewares/         # Middlewares Express
│   │   │   ├── auth.ts
│   │   │   ├── errorHandler.ts
│   │   │   └── validation.ts
│   │   ├── config/              # Configuraciones
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   ├── database/            # ORM Prisma
│   │   │   └── prisma.schema
│   │   └── utils/               # Utilidades
│   │       ├── jwt.ts
│   │       ├── errors.ts
│   │       └── validators.ts
│   ├── dist/                    # Output compilado (generado)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .gitignore
│   └── prisma.schema
│
├── Design/                      # 📐 Diseños de UI/UX (referencia)
│   ├── admin_store_settings/
│   ├── authentication_login/
│   ├── checkout_payment_flow/
│   ├── product_detail_page/
│   └── ...más diseños
│
├── package.json                 # 🎯 Root package.json (Monorepo)
├── tsconfig.json                # Configuración TypeScript raíz
├── README.md                    # Documentación principal
└── ...archivos de documentación
```

## 🚀 Scripts Disponibles

### Desde la raíz (Monorepo):
```bash
npm run dev          # Start dev en ambos proyectos
npm run build        # Build ambos proyectos
npm run start        # Start producción
npm run lint         # Lint all
npm run type-check   # Type check all
npm run format       # Format código
```

### Frontend solo:
```bash
cd frontend
npm run dev      # Next.js dev (puerto 3000)
npm run build    # Build optimizado
npm run start    # Producción
npm run lint     # ESLint
```

### Backend solo:
```bash
cd backend
npm run dev      # Servidor con hot reload (puerto 3001)
npm run build    # Compilar TypeScript
npm run start    # Producción
npm run lint     # ESLint
```

## 🔐 Variables de Entorno

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FlexiCommerce
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:3000
```

## 📦 Arquitectura

### Frontend
- **Next.js 14** con App Router
- **React 18** components
- **TypeScript** para type safety
- **Tailwind CSS** styling
- **Zustand** state management
- **Axios** para API calls
- **React Hook Form** para formularios

### Backend
- **Express.js** servidor
- **Prisma** ORM
- **PostgreSQL** base de datos
- **JWT** autenticación
- **TypeScript** type safety
- **Modular architecture** - cada feature es un módulo independiente

## ✅ Reglas de Arquitectura

### Frontend NO debe:
- ❌ Contener lógica de servidor
- ❌ Acceder directamente a BD
- ❌ Tener dependencias de Node.js exclusivas

### Backend NO debe:
- ❌ Contener componentes React
- ❌ Tener archivos de Next.js
- ❌ Manejar estilos CSS

## 🔗 Comunicación

El frontend se comunica con el backend únicamente a través de:
- **API REST** en `/api/v1/...`
- **Cliente HTTP**: Axios configurado en `frontend/lib/api-client.ts`
- **URL Base**: `http://localhost:3001` (desarrollo)

## 📍 Rutas Principales

### Frontend
- `/` - Página de inicio
- `/products` - Catálogo
- `/cart` - Carrito de compras
- `/order/:id` - Detalle de pedido
- `/admin` - Panel de administración
- `/auth/login` - Inicio de sesión
- `/auth/register` - Registro

### Backend API
- `POST /api/auth/login` - Autenticación
- `GET /api/products` - Listar productos
- `POST /api/orders` - Crear pedido
- `GET /api/users/:id` - Datos de usuario
- `POST /api/reviews` - Crear reseña

## 🐳 Deployment

### Frontend
- Deployable en **Vercel** (recomendado)
- Build: `npm run build`
- Preview: Automático en PRs

### Backend
- Deployable en **Railway**, **Render**, **Fly.io** o servidor propio
- Build: `npm run build`
- Start: `npm run start`

---

**¡Proyecto restructurado con arquitectura profesional! ✨**
