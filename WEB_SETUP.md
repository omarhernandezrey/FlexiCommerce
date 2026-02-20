# 🌐 Guía: Desarrollo Web con Next.js

**Fecha:** 20/02/2026  
**Estado:** ✅ Disponible y Operativo

---

## 📌 ¿Por qué Web Separado?

FlexiCommerce utiliza una **arquitectura separada** para web y mobile:

| Aspecto | Mobile (Expo) | Web (Next.js) |
|--------|--------|--------|
| **Framework** | Expo Go / React Native | Next.js 14 |
| **React Version** | 19.1.0 | 19.1.0 |
| **Deployment** | EAS / OTA | Vercel / Self-hosted |
| **SEO** | No (app nativa) | ✅ Yes (importante para e-commerce) |
| **Database** | API Remote | Same Backend |
| **Features** | Mobile-first | Desktop-optimized |

**Ventaja**: Desarrollo independiente sin limitaciones de compatibilidad

---

## 🚀 Quick Start - Web Development

### Terminal 1: Backend

```bash
cd /home/omarhernandez/personalProjects/FlexiCommerce
bash ./start-mobile-dev-docker.sh
```

Este comando inicia:
- PostgreSQL (5432)
- Redis (6379)
- Backend API (3001)
- Tunnel Cloudflare (para mobile)

### Terminal 2: Frontend Web (Next.js)

```bash
cd /home/omarhernandez/personalProjects/FlexiCommerce/frontend
npm install
npm run dev
```

**Esperado:**
```
> next dev
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local
```

### 3. Abre en tu navegador

```
http://localhost:3000
```

---

## 🔐 Credenciales de Prueba

Las mismas que en mobile:

```
Email: test@flexicommerce.com
Contraseña: Test@12345

Email: admin@flexicommerce.com
Contraseña: Admin@12345
```

---

## 🛠️ Comandos útiles

### Desarrollo

```bash
# Development server con hot reload
npm run dev

# Build para producción
npm run build

# Ejecutar build producción localmente
npm run start

# Linting y type checking
npm run lint
npm run type-check
```

### Database

```bash
# Desde backend/
npm run db:push
npm run db:seed
npm run db:reset
```

---

## 📁 Estructura Frontend

```
frontend/
├── app/                    # App router (Next.js 14)
│   ├── (storefront)/      # Página principal
│   ├── (account)/         # Perfil, órdenes
│   ├── admin/             # Panel admin
│   ├── auth/              # Login, register
│   ├── products/          # Detalle producto
│   └── ...
├── components/            # Componentes reutilizables
├── hooks/                 # Custom hooks
│   ├── useAuth.ts        # Auth state
│   ├── useProducts.ts    # Productos
│   ├── useCart.ts        # Carrito
│   └── ...
├── lib/                   # Utilidades
│   ├── api.service.ts    # Llamadas API
│   └── ...
├── styles/               # CSS global + tailwind
├── types/                # TypeScript types
└── .env.local           # Variables de entorno
```

---

## 🔧 Configuración de Entorno

### `.env.local`

```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Para producción
# NEXT_PUBLIC_API_URL=https://tu-api.com

# Opcional: Analytics, etc
NEXT_PUBLIC_GA_ID=
```

---

## 🌐 Deployment

### Vercel (Recomendado)

```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. Desde la raíz del proyecto
cd frontend
vercel
```

### Self-hosted (Docker)

```bash
# 1. Build
npm run build

# 2. Run
npm run start
```

---

## 🆘 Troubleshooting

### Error: `NEXT_PUBLIC_API_URL is not set`

```bash
# Solución: Crear .env.local
cp .env.example .env.local
# Editar y setear NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend no responde

```bash
# Verifica que backend está corriendo
curl http://localhost:3001/api/health
```

### Puerto 3000 ocupado

```bash
# Usar otro puerto
npm run dev -- -p 3001
```

---

## 📊 Estado de Features Web

| Feature | Status | Notas |
|---------|--------|-------|
| **Storefront** | ✅ | Catálogo, búsqueda, filtros |
| **Cart** | ✅ | Añadir, remover, actualizar cantidades |
| **Login** | ✅ | Email + password |
| **Orders** | ✅ | Historial de órdenes |
| **Checkout** | ✅ | Stripe integration |
| **Admin Panel** | ✅ | Productos, órdenes, usuarios |
| **Wishlist** | ✅ | Favoritos |
| **Reviews** | ✅ | Reseñas de productos |
| **Notifications** | ⏳ | Email + web push |
| **2FA** | ⏳ | Two-factor authentication |

---

## 🎯 Próximos Pasos

1. **Email Verification** - Setup SendGrid/Mailgun
2. **Payment Gateway** - Stripe/PayPal configuration
3. **Analytics** - Google Analytics 4
4. **CDN** - CloudFlare para assets
5. **Search** - Elasticsearch / Algolia

---

**¿Necesitas ayuda?** Consulta la documentación en:
- [SETUP_FINAL.md](SETUP_FINAL.md) - Overview general
- [API.md](API.md) - Endpoints disponibles
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy a producción
