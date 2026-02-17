# 🎨 Frontend - FlexiCommerce

Frontend moderno construido con Next.js 14, React 18, TypeScript y Tailwind CSS.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev
# Acceder: http://localhost:3000

# Build producción
npm run build

# Iniciar producción
npm run start

# Linting
npm run lint

# Type checking
npm run type-check

# Format código
npm run format
```

## 📁 Estructura

```
frontend/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Layout raíz
│   ├── page.tsx        # Home page
│   ├── (auth)/         # Rutas de autenticación
│   ├── (store)/        # Rutas de tienda
│   └── (admin)/        # Rutas de admin
│
├── components/         # Componentes React
│   ├── ui/            # Componentes base
│   ├── layout/        # Componentes de layout
│   └── shared/        # Componentes compartidos
│
├── features/          # Características por dominio
│   ├── products/
│   ├── cart/
│   ├── auth/
│   └── dashboard/
│
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useToast.ts
│
├── lib/               # Librerías y utilidades
│   ├── api-client.ts  # Cliente HTTP Axios
│   ├── utils.ts       # Funciones utilitarias
│   └── config/        # Configuraciones
│
├── services/          # Llamadas a API
│   ├── products.ts
│   ├── auth.ts
│   └── orders.ts
│
├── store/            # Estado global (Zustand)
│   ├── cart.ts
│   ├── user.ts
│   └── filters.ts
│
├── types/            # TypeScript types
│   └── index.ts
│
├── styles/           # CSS global
│   └── globals.css
│
├── public/           # Archivos estáticos
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
│
└── .env.local        # Variables de entorno
```

## ⚙️ Configuración

### .env.local

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FlexiCommerce
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📦 Dependencias Principales

- **Next.js** 14.0+ - React framework
- **React** 18.2+ - UI library
- **TypeScript** 5.3+ - Type safety
- **Tailwind CSS** 3.4+ - Styling
- **Zustand** 4.4+ - State management
- **Axios** 1.6+ - HTTP client
- **React Hook Form** 7.48+ - Form handling
- **Zod** 3.22+ - Schema validation

## 🎯 Características

- ✅ Server-side rendering (SSR) y Static generation (SSG)
- ✅ Rutas dinámicas
- ✅ API routes
- ✅ Image optimization
- ✅ TypeScript strict mode
- ✅ ESLint y Prettier configurados
- ✅ Tailwind CSS con componentes UI
- ✅ Zustand para estado global
- ✅ Form validation con React Hook Form

## 🔗 API Integration

Las llamadas a API se hacen a través del cliente configurado en `lib/api-client.ts`:

```typescript
import apiClient from '@/lib/api-client';

// GET request
const products = await apiClient.get('/products');

// POST request
const login = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
});
```

## 🧩 Crear un Componente

```typescript
// components/ui/MyComponent.tsx
'use client';

export const MyComponent = ({ prop }: Props) => {
  return (
    <div>
      {prop}
    </div>
  );
};
```

## 🎨 Tailwind CSS

Todos los estilos usan Tailwind CSS:

```typescript
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click me
</button>
```

## 📝 Desarrollo

### Crear ruta nueva

```bash
# Ruta pública
app/my-route/page.tsx

# Ruta con layout group
app/(store)/my-page/page.tsx

# API route
app/api/my-endpoint/route.ts
```

### Crear componente

```bash
components/MyComponent.tsx
```

### Crear hook personalizado

```bash
hooks/useMyHook.ts
```

## 🚢 Deployment

### Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Production
vercel deploy --prod
```

#### Configurar en Vercel:

1. Environment variables: `NEXT_PUBLIC_API_URL`
2. Comando build: Automático
3. Output directory: Automático

### Otros Hosting

```bash
npm run build
npm run start
```

---

Para más info: [Next.js Docs](https://nextjs.org/docs)
