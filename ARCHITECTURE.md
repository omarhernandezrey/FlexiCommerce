# 🏗️ FlexiCommerce - Arquitectura del Sistema

**Versión:** 1.0  
**Última Actualización:** 20 de Febrero de 2026  
**Estado:** ✅ Producción Ready

---

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Diagrama de Arquitectura](#diagrama-de-arquitectura)
3. [Componentes del Sistema](#componentes-del-sistema)
4. [Flujo de Datos](#flujo-de-datos)
5. [Stack Tecnológico](#stack-tecnológico)
6. [Decisiones Arquitectónicas](#decisiones-arquitectónicas)
7. [Deployment](#deployment)

---

## 🎯 Visión General

**FlexiCommerce** es una plataforma de e-commerce moderna con arquitectura separada para mobile y web, maximizando ventajas de cada plataforma:

- **Mobile**: Experiencia nativa optimizada con Expo Go (React Native)
- **Web**: Experiencia optimizada para SEO y performance con Next.js
- **Backend**: API centralizado REST con autenticación JWT
- **Database**: PostgreSQL con Redis para caché

---

## 🏛️ Diagrama de Arquitectura

### Arquitectura General

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         🌍 INTERNET / USUARIOS                              │
└──────────────────────────────────────────────────────────────────────────────┘
                    │                      │                       │
                    ▼                      ▼                       ▼
            ┌──────────────┐      ┌─────────────────┐    ┌──────────────────┐
            │  ANDROID/iOS │      │   NAVEGADOR     │    │  ADMIN PANEL     │
            │   (Expo Go)  │      │   (Next.js)     │    │  (Next.js Admin) │
            └──────────────┘      └─────────────────┘    └──────────────────┘
                    │                      │                       │
        ┌───────────┼──────────────────────┼───────────────────────┘
        │           │                      │
        ▼           ▼                      ▼
   ┌─────────────────────────────────────────────────────┐
   │              🌐 TUNNEL / CDN                        │
   │        Cloudflare + Nginx Load Balancing           │
   └─────────────────────────────────────────────────────┘
                          │
                          ▼
   ┌─────────────────────────────────────────────────────┐
   │          📡 BACKEND API (Node.js/Express)          │
   │              http://localhost:3001                  │
   │         ├─ Authentication (JWT)                     │
   │         ├─ Products Management                      │
   │         ├─ Orders & Checkout                        │
   │         ├─ User Management                          │
   │         └─ Admin Operations                         │
   └─────────────────────────────────────────────────────┘
          │                      │                │
          ▼                      ▼                ▼
   ┌─────────────────┐  ┌──────────────────┐  ┌────────────┐
   │   PostgreSQL    │  │  Redis Cache     │  │  File      │
   │   (5432)        │  │  (6379)          │  │  Storage   │
   │                 │  │                  │  │  (S3/GCS)  │
   │ ├─ Users        │  │ ├─ Sessions      │  └────────────┘
   │ ├─ Products     │  │ ├─ Carts         │
   │ ├─ Orders       │  │ ├─ Products      │
   │ ├─ Reviews      │  │ └─ Tokens        │
   │ └─ Wishlist     │  │                  │
   └─────────────────┘  └──────────────────┘
```

---

### Arquitectura Detallada - Layers (N-Tier)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       📱 PRESENTATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────┐ │
│   │  MOBILE (Expo Go)    │    │  WEB (Next.js)       │    │  ADMIN       │ │
│   ├──────────────────────┤    ├──────────────────────┤    ├──────────────┤ │
│   │ • React Native 19    │    │ • React 19 + SSR     │    │ • Next.js    │ │
│   │ • iOS + Android     │    │ • Tailwind CSS       │    │ • Dashboard  │ │
│   │ • Zustand Store     │    │ • TypeScript         │    │ • Analytics  │ │
│   │ • Expo Router       │    │ • Next Router        │    │ • Management │ │
│   │ • Push Notif.       │    │ • SEO Optimized      │    │ • Reports    │ │
│   └──────────────────────┘    └──────────────────────┘    └──────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                      │                    │
                    └──────────┬───────────┴────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    📡 API INTEGRATION LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  • Axios HTTP Client     • Error Handling    • JWT Auth      • Rate Limit  │
│  • Request/Response      • Retry Logic       • Token Refresh • Caching     │
│  • Interceptors          • CORS              • Middleware    • Compression │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      🔐 BACKEND API LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Express.js Server (Port 3001)                                              │
│  ├─ Authentication Module          ├─ Product Module                       │
│  │  ├─ Login/Register              │  ├─ Get Products                      │
│  │  ├─ JWT Validation              │  ├─ Search & Filter                   │
│  │  ├─ Password Reset              │  ├─ Get Details                       │
│  │  └─ Token Refresh               │  └─ Recommendations                   │
│  │                                 │                                        │
│  ├─ Order Module                   ├─ User Module                          │
│  │  ├─ Create Order                │  ├─ Profile Management                │
│  │  ├─ Get Orders                  │  ├─ Address Management                │
│  │  ├─ Update Status               │  ├─ Payment Methods                   │
│  │  └─ Cancel Order                │  └─ Preferences                       │
│  │                                 │                                        │
│  └─ Admin Module                   └─ Review Module                        │
│     ├─ Dashboard Stats                ├─ Create Review                      │
│     ├─ Order Management               ├─ Get Reviews                        │
│     ├─ Product Management             └─ Ratings                           │
│     └─ User Management                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    💾 DATA ACCESS LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Prisma ORM    Database Services    Query Optimization    Transactions     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    🗄️ DATABASE LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PostgreSQL (5432)              Redis Cache (6379)                          │
│  ├─ Users Table                 ├─ Session Store                           │
│  ├─ Products Table              ├─ Cart Cache                              │
│  ├─ Orders Table                ├─ Product Cache                           │
│  ├─ Reviews Table               ├─ Token Blacklist                         │
│  ├─ Wishlist Table              └─ Rate Limit Store                        │
│  └─ Transactions                                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔲 Componentes del Sistema

### 1. Frontend - Mobile (React Native + Expo)

```
┌─────────────────────────────────────────────────────────┐
│              📱 Mobile App (Expo Go)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Location: /mobile                                      │
│                                                         │
│  Structure:                                             │
│  ├─ app/                                                │
│  │  ├─ (auth)/                                          │
│  │  │  ├─ login.tsx                                     │
│  │  │  └─ register.tsx                                  │
│  │  │                                                   │
│  │  └─ (app)/ (Protected Routes)                        │
│  │     ├─ home.tsx                                      │
│  │     ├─ products/[id].tsx                             │
│  │     ├─ cart.tsx                                      │
│  │     ├─ orders.tsx                                    │
│  │     ├─ wishlist.tsx                                  │
│  │     └─ profile.tsx                                   │
│  │                                                      │
│  ├─ components/                                         │
│  │  ├─ ui/ (Button, Card, Modal)                        │
│  │  ├─ layout/ (Header, Footer)                         │
│  │  ├─ auth/                                            │
│  │  ├─ products/                                        │
│  │  └─ cart/                                            │
│  │                                                      │
│  ├─ hooks/                                              │
│  │  ├─ useAuth                                          │
│  │  ├─ useProducts                                      │
│  │  ├─ useCart                                          │
│  │  └─ useOrders                                        │
│  │                                                      │
│  ├─ store/ (Zustand)                                    │
│  │  ├─ auth.ts                                          │
│  │  ├─ cart.ts                                          │
│  │  └─ ui.ts                                            │
│  │                                                      │
│  ├─ lib/                                                │
│  │  ├─ api-client.ts                                    │
│  │  └─ async-storage.ts                                 │
│  │                                                      │
│  ├─ assets/                                             │
│  ├─ styles/                                             │
│  └─ app.json (Expo config)                              │
│                                                         │
│  Technologies:                                          │
│  ✓ React Native 19.1.0                                 │
│  ✓ Expo 54.0.0                                         │
│  ✓ Expo Router 6.x                                     │
│  ✓ Zustand 4.4.0 (State)                               │
│  ✓ Axios 1.6.0 (HTTP)                                  │
│  ✓ TypeScript                                          │
│  ✓ AsyncStorage (Local persistence)                    │
│                                                         │
│  Deployment:                                            │
│  • Dev: npm start -- --tunnel --clear                  │
│  • Prod: EAS Build → Google Play / App Store           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2. Frontend - Web (Next.js + React)

```
┌─────────────────────────────────────────────────────────┐
│           🌐 Web App (Next.js)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Location: /frontend                                    │
│                                                         │
│  Structure (App Router):                                │
│  ├─ app/                                                │
│  │  ├─ layout.tsx (Root layout)                         │
│  │  │                                                   │
│  │  ├─ (storefront)/ (Public group)                     │
│  │  │  ├─ page.tsx (Home)                               │
│  │  │  ├─ products/ (Catalog)                           │
│  │  │  └─ [slug]/page.tsx (Product detail)              │
│  │  │                                                   │
│  │  ├─ (auth)/ (Public group)                           │
│  │  │  ├─ login/page.tsx                                │
│  │  │  └─ register/page.tsx                             │
│  │  │                                                   │
│  │  ├─ (account)/ (Protected group)                     │
│  │  │  ├─ profile/page.tsx                              │
│  │  │  ├─ orders/page.tsx                               │
│  │  │  ├─ wishlist/page.tsx                             │
│  │  │  └─ settings/page.tsx                             │
│  │  │                                                   │
│  │  └─ admin/ (Protected)                               │
│  │     ├─ page.tsx (Dashboard)                          │
│  │     ├─ products/                                     │
│  │     ├─ orders/                                       │
│  │     └─ users/                                        │
│  │                                                      │
│  ├─ components/                                         │
│  │  ├─ ui/ (Reusable components)                        │
│  │  ├─ layout/ (Header, Footer, Nav)                    │
│  │  ├─ auth/                                            │
│  │  ├─ products/                                        │
│  │  ├─ cart/                                            │
│  │  └─ checkout/                                        │
│  │                                                      │
│  ├─ hooks/ (Custom hooks)                               │
│  │  ├─ useAuth                                          │
│  │  ├─ useCart                                          │
│  │  ├─ useProducts                                      │
│  │  └─ useOrders                                        │
│  │                                                      │
│  ├─ lib/                                                │
│  │  ├─ api.service.ts                                   │
│  │  ├─ auth.ts                                          │
│  │  └─ validators.ts                                    │
│  │                                                      │
│  ├─ store/ (Zustand)                                    │
│  │  ├─ auth.ts                                          │
│  │  ├─ cart.ts                                          │
│  │  └─ ui.ts                                            │
│  │                                                      │
│  ├─ styles/                                             │
│  │  └─ globals.css                                      │
│  │                                                      │
│  ├─ public/                                             │
│  ├─ next.config.js                                      │
│  ├─ tailwind.config.ts                                  │
│  └─ tsconfig.json                                       │
│                                                         │
│  Technologies:                                          │
│  ✓ Next.js 14 (React 19)                               │
│  ✓ Tailwind CSS 3.x                                    │
│  ✓ TypeScript                                           │
│  ✓ Zustand 4.4.0 (State)                               │
│  ✓ Axios 1.6.0 (HTTP)                                  │
│  ✓ Vercel Analytics                                    │
│  ✓ Vercel OG Image Generation                          │
│                                                         │
│  Deployment:                                            │
│  • Dev: npm run dev (port 3000)                         │
│  • Prod: Auto-deploy on Vercel (git push main)         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Backend API (Node.js + Express + Prisma)

```
┌──────────────────────────────────────────────────────────────┐
│           📡 Backend API (Express.js)                        │
│           Location: /backend                                │
│           Port: 3001                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Directory Structure:                                        │
│  ├─ src/                                                     │
│  │  ├─ app.ts (Express setup)                               │
│  │  ├─ server.ts (Entry point)                              │
│  │  │                                                       │
│  │  ├─ config/                                              │
│  │  │  ├─ database.ts (Prisma client)                       │
│  │  │  ├─ redis.ts (Redis setup)                            │
│  │  │  └─ env.ts (Environment vars)                         │
│  │  │                                                       │
│  │  ├─ middlewares/                                         │
│  │  │  ├─ auth.middleware.ts (JWT verify)                   │
│  │  │  ├─ errorHandler.ts                                   │
│  │  │  ├─ rateLimiter.ts                                    │
│  │  │  └─ validator.ts                                      │
│  │  │                                                       │
│  │  ├─ modules/ (Feature modules)                           │
│  │  │  ├─ auth/                                             │
│  │  │  │  ├─ auth.controller.ts                             │
│  │  │  │  ├─ auth.service.ts                                │
│  │  │  │  ├─ auth.routes.ts                                 │
│  │  │  │  └─ auth.types.ts                                  │
│  │  │  │                                                    │
│  │  │  ├─ products/                                         │
│  │  │  │  ├─ products.controller.ts                         │
│  │  │  │  ├─ products.service.ts                            │
│  │  │  │  └─ products.routes.ts                             │
│  │  │  │                                                    │
│  │  │  ├─ orders/                                           │
│  │  │  │  ├─ orders.controller.ts                           │
│  │  │  │  ├─ orders.service.ts                              │
│  │  │  │  └─ orders.routes.ts                               │
│  │  │  │                                                    │
│  │  │  ├─ users/                                            │
│  │  │  │  ├─ users.controller.ts                            │
│  │  │  │  ├─ users.service.ts                               │
│  │  │  │  └─ users.routes.ts                                │
│  │  │  │                                                    │
│  │  │  ├─ admin/                                            │
│  │  │  │  ├─ admin.controller.ts                            │
│  │  │  │  ├─ admin.service.ts                               │
│  │  │  │  └─ admin.routes.ts                                │
│  │  │  │                                                    │
│  │  │  └─ reviews/                                          │
│  │  │     ├─ reviews.controller.ts                          │
│  │  │     ├─ reviews.service.ts                             │
│  │  │     └─ reviews.routes.ts                              │
│  │  │                                                       │
│  │  ├─ types/                                               │
│  │  │  └─ index.ts (Interfaces)                             │
│  │  │                                                       │
│  │  └─ utils/                                               │
│  │     ├─ jwt.utils.ts                                      │
│  │     ├─ errors.ts                                         │
│  │     ├─ validators.ts                                     │
│  │     └─ logger.ts                                         │
│  │                                                          │
│  ├─ prisma/                                                 │
│  │  ├─ schema.prisma (DB schema)                            │
│  │  └─ migrations/                                          │
│  │                                                          │
│  ├─ .env (Configuration)                                    │
│  ├─ .env.example                                            │
│  └─ package.json                                            │
│                                                              │
│  Technologies:                                              │
│  ✓ Node.js 18+ LTS                                         │
│  ✓ Express.js 4.x                                          │
│  ✓ TypeScript 5.x                                          │
│  ✓ Prisma 5.x (ORM)                                        │
│  ✓ PostgreSQL 15+ (Database)                               │
│  ✓ Redis 7.x (Cache)                                       │
│  ✓ JWT (Authentication)                                    │
│  ✓ Cors, Helmet, Compression                               │
│                                                              │
│  Key Endpoints:                                             │
│  POST   /api/auth/login              ├─ User login        │
│  POST   /api/auth/register           ├─ New user          │
│  GET    /api/products                ├─ List products     │
│  GET    /api/products/:id            ├─ Get detail        │
│  POST   /api/orders                  ├─ Create order      │
│  GET    /api/orders                  ├─ Get my orders     │
│  GET    /api/users/profile           ├─ Get profile       │
│  PUT    /api/users/profile           ├─ Update profile    │
│  POST   /api/reviews                 ├─ Create review     │
│  GET    /api/admin/dashboard         └─ Admin dashboard   │
│                                                              │
│  Deployment:                                                │
│  • Dev: npm run dev                                         │
│  • Prod: Docker → Cloudflare Tunnel / CDN                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Datos

### 1. Flujo de Autenticación (Login)

```
┌─────────────────────┐
│  Usuario            │
│ Ingresa email/pass  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│ Frontend (Web / Mobile)                              │
│ ├─ LoginForm / LoginScreen                           │
│ ├─ Valida formato                                    │
│ └─ POST /api/auth/login {email, password}           │
└──────────┬───────────────────────────────────────────┘
           │ HTTP Request
           ▼
┌──────────────────────────────────────────────────────┐
│ Backend API - Auth Module                            │
│ ├─ AuthController.login()                            │
│ ├─ Valida payload                                    │
│ ├─ Busca usuario en BD                              │
│ ├─ Compara contraseña (bcrypt)                      │
│ └─ ✓ Válido o ✗ Inválido                             │
└──────────┬───────────────────────────────────────────┘
           │
    ┌──────┴──────────────┐
    │                     │
    ▼ Válido              ▼ Inválido
┌────────────┐        ┌──────────────┐
│ PostgreSQL │        │ HTTP 401     │
│ SELECT *   │        │ Error msg    │
│ FROM users │        └──────────────┘
└────┬───────┘
     │
     ▼
┌──────────────────────────────────────────────────────┐
│ Genera JWT Token                                     │
│ ├─ user_id, email, role                             │
│ ├─ Firma con JWT_SECRET                             │
│ ├─ Expira en 7 días                                 │
│ └─ Envía resp: {token, user, expiresIn}            │
└──────────┬───────────────────────────────────────────┘
           │ HTTP 200
           ▼
┌──────────────────────────────────────────────────────┐
│ Frontend almacena token en:                          │
│ ├─ AsyncStorage (Mobile)                            │
│ ├─ LocalStorage (Web)                               │
│ └─ SessionStorage (Temporal)                        │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│ Redis almacena sesión                               │
│ ├─ Key: session:{token_id}                          │
│ ├─ Value: {user_id, issued_at, expires_at}         │
│ └─ TTL: 7 días                                      │
└──────────────────────────────────────────────────────┘

Siguientes requests:
│
├─ Header: Authorization: Bearer {token}
│
▼
Backend valida JWT:
├─ Verifica firma
├─ Checa expiración
├─ Busca en Redis (opcional)
└─ ✓ Autoriza o ✗ 401 Unauthorized
```

### 2. Flujo de Compra (Shopping)

```
USER JOURNEY - SHOPPING FLOW
│
├─ 1️⃣ BROWSE PRODUCTS
│  └─ GET /api/products?category=electronics&sort=price&page=1
│     └─ Backend queries PostgreSQL + Redis cache
│        └─ Returns: [Product[], count, pagination]
│
├─ 2️⃣ VIEW PRODUCT DETAIL
│  └─ GET /api/products/{productId}
│     └─ Returns: {Product, reviews, recommendations}
│
├─ 3️⃣ ADD TO CART
│  ├─ Frontend stores locally in Zustand
│  └─ Optional: POST /api/cart/items (persist on server)
│
├─ 4️⃣ PROCEED TO CHECKOUT
│  ├─ GET /api/users/addresses (shipping address)
│  ├─ GET /api/users/payment-methods (saved cards)
│  └─ View order summary
│
├─ 5️⃣ CREATE ORDER
│  ├─ POST /api/orders
│  │  ├─ Body: {items, shippingAddress, paymentMethod}
│  │  ├─ Backend validates:
│  │  │  ├─ Items exist & available
│  │  │  ├─ Address is valid
│  │  │  └─ Stock sufficient
│  │  ├─ Calculates:
│  │  │  ├─ Subtotal + tax
│  │  │  ├─ Shipping cost
│  │  │  └─ Discounts/coupons
│  │  ├─ Creates order in PostgreSQL
│  │  ├─ Status: PENDING
│  │  └─ Returns: {orderId, total, paymentIntent}
│  │
│
├─ 6️⃣ PAYMENT PROCESSING
│  ├─ Frontend receives Stripe paymentIntent
│  ├─ Shows Stripe payment modal
│  ├─ User enters card details
│  ├─ Stripe processes payment
│  └─ Stripe sends webhook to backend
│
├─ 7️⃣ ORDER CONFIRMATION (Backend webhooks)
│  ├─ payment.success webhook received
│  ├─ Updates order status: PAID
│  ├─ Sends confirmation email
│  ├─ Clears shopping cart
│  └─ Updates inventory
│
├─ 8️⃣ USER SEES CONFIRMATION
│  ├─ Frontend: redirects to /order-confirmation
│  ├─ GET /api/orders/{orderId}
│  ├─ Shows:
│  │  ├─ Order ID
│  │  ├─ Items purchased
│  │  ├─ Total paid
│  │  ├─ Shipping address
│  │  └─ Estimated delivery
│  └─ Email also sent to user
│
└─ 9️⃣ TRACK ORDER
   ├─ GET /api/orders (list all)
   ├─ GET /api/orders/{orderId} (track specific)
   └─ Status: PROCESSING → SHIPPED → DELIVERED
```

---

## 🛠️ Stack Tecnológico

### Frontend Stack

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React** | 19.1.0 | UI framework |
| **React Native** | 0.81.5 | Mobile framework |
| **Next.js** | 14.x | Web framework + SSR/SSG |
| **Expo** | 54.x | Mobile dev platform |
| **TypeScript** | 5.x | Type safety |
| **Zustand** | 4.4.0 | State management (lightweight) |
| **Axios** | 1.6.0 | HTTP client |
| **Tailwind CSS** | 3.x | Web styling (utility-first) |
| **Expo Router** | 6.x | Mobile routing |
| **React Hook Form** | 7.x | Form management (web) |

### Backend Stack

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Node.js** | 18+ LTS | Runtime |
| **Express.js** | 4.x | Web server framework |
| **TypeScript** | 5.x | Type safety |
| **Prisma** | 5.x | Database ORM |
| **PostgreSQL** | 15+ | Primary database |
| **Redis** | 7.x | Cache + session store |
| **JWT** | jsonwebtoken | Authentication tokens |
| **Bcrypt** | Latest | Password hashing |
| **Cors** | Latest | Cross-origin handling |
| **Helmet** | Latest | Security headers |
| **Compression** | Latest | Response compression |

### DevOps + Infrastructure

| Tecnología | Propósito |
|-----------|----------|
| **Docker** | Container orchestration |
| **Docker Compose** | Local environment |
| **GitHub** | Version control + CI/CD |
| **Cloudflare Tunnel** | Secure tunneling for dev |
| **Vercel** | Web app hosting (Next.js) |
| **EAS** | Expo app building |
| **Nginx** | Reverse proxy (prod) |

---

## 🎯 Decisiones Arquitectónicas

### ✅ 1. Arquitectura Separada: Mobile + Web

**Decisión**: Frontend completamente separado para Mobile (Expo) y Web (Next.js)

**Razones Principales**:
- Web necesita SEO y puede usar Server Components (React 19 compatible)
- Mobile necesita push notifications y offline capabilities
- Evita dependencia de react-native-web que aún no soporta React 19
- Permite especialización por equipo

**Trade-offs**:
- Algo de code duplication (hooks, utilities)
- Dos repos mentales a mantener
- Mitigación: Shared logic en `/backend/utils`

**Alternativas rechazadas**:
- ❌ Monorepo único: Complejidad innecesaria
- ❌ React Native Web: Limitaciones con React 19
- ❌ Expo web: Incompatible con Next.js features

---

### ✅ 2. API REST Centralizado

**Decisión**: Un único backend Express.js que sirve web, mobile y admin

**Ventajas**:
- Single source of truth para datos
- Autenticación centralizada (JWT)
- Facilita testing y monitoring
- Escalable horizontalmente

**Endpoints Pattern**:
```
/api/auth/*          (Public)
/api/products/*      (Public read, admin write)
/api/orders/*        (User specific)
/api/admin/*         (Admin only)
/api/users/*         (User specific)
```

---

### ✅ 3. JWT + Redis Sessions

**Decisión**: Tokens JWT con Redis para token management

**Ventajas**:
- Stateless (escalable)
- Mobile-friendly
- Can blacklist tokens si es necesario
- Short-lived + refresh tokens

**Implementation**:
```
Access Token:  JWT, 1 hora, in Authorization header
Refresh Token: Stored in secure cookie/storage, 7 días
Session Store: Redis, tracks active sessions
```

---

### ✅ 4. PostgreSQL + Redis

**PostgreSQL**:
- Datos persistentes
- Transacciones ACID
- Complex relationships
- Full-text search

**Redis**:
- Sesiones de usuario
- Carrito temporal
- Cache de productos populares
- Rate limiting counters
- Token blacklist

---

### ✅ 5. Docker + Docker Compose

**Decisión**: Containerizar todo (PostgreSQL, Redis, Backend opcional)

**Dev Environment**:
```yaml
services:
  postgres:    PostgreSQL 15
  redis:       Redis 7
```

**Ventajas**:
- Dev = Prod
- Onboarding rápido
- Reproducible builds
- CI/CD ready

---

## 📦 Deployment

### 📱 Mobile (Expo)

```bash
# Development
cd mobile
npm start -- --tunnel --clear

# Production
eas build --platform all
eas submit --platform all
```

**Deployment Options**:
- Google Play Store (Android)
- Apple App Store (iOS)
- Over-the-air updates via Expo

---

### 🌐 Web (Next.js)

```bash
# Development
cd frontend
npm run dev    # http://localhost:3000

# Production - Vercel
git push origin main  # Auto-deploy
```

**Deployment Options**:
- Vercel (recommended)
- Netlify
- Self-hosted (Docker)

---

### 📡 Backend (Node.js)

```bash
# Development
cd backend
npm run dev    # http://localhost:3001

# Production - Docker
docker build -t flexicommerce-api .
docker run -p 3001:3001 flexicommerce-api
```

**Deployment Options**:
- Railway
- Render
- Fly.io
- Heroku
- Self-hosted Docker
- AWS ECS / Google Cloud Run

---

## 🔒 Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ HTTPS/TLS (Cloudflare)                                     │
│  └─ All traffic encrypted end-to-end                       │
│                                                             │
│ Authentication (JWT)                                       │
│  ├─ Access tokens (short-lived)                            │
│  ├─ Refresh tokens (long-lived)                            │
│  └─ Token blacklist (Redis)                                │
│                                                             │
│ Authorization (Role-based)                                 │
│  ├─ User (default)                                         │
│  ├─ Admin (dashboard access)                               │
│  └─ Super Admin (full access)                              │
│                                                             │
│ Database Security                                          │
│  ├─ Parameterized queries (Prisma)                         │
│  ├─ Row-level policies (PostgreSQL)                        │
│  ├─ Backup encryption                                      │
│  └─ Connection pooling (PgBouncer)                         │
│                                                             │
│ Application Security                                       │
│  ├─ Input validation (server-side)                         │
│  ├─ Rate limiting (3 failed login = 15min ban)             │
│  ├─ CORS (whitelist origins)                               │
│  ├─ CSRF protection (SameSite cookies)                     │
│  ├─ Password hashing (bcrypt, salt rounds=12)              │
│  └─ XSS prevention (Content-Security-Policy)               │
│                                                             │
│ Infrastructure                                             │
│  ├─ DDoS protection (Cloudflare)                           │
│  ├─ WAF rules enabled                                      │
│  ├─ Security headers (Helmet.js)                           │
│  ├─ Container scanning (Snyk)                              │
│  └─ Dependency audits (npm audit)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Monitoreo

```
Frontend Monitoring:
├─ Vercel Analytics (Web)
├─ Expo Analytics (Mobile)
├─ Sentry (Error tracking)
└─ Performance metrics

Backend Monitoring:
├─ Server logs (Winston/Morgan)
├─ Error tracking (Sentry)
├─ Database performance
│  ├─ Slow query logs
│  ├─ Connection pool stats
│  └─ Index usage
├─ Redis monitoring
│  ├─ Memory usage
│  ├─ Command latency
│  └─ Eviction stats
└─ API metrics
   ├─ Request latency
   ├─ Error rates
   └─ Endpoint usage

Infrastructure:
├─ Docker health checks
├─ Database backups (daily)
├─ Disk space alerts
├─ CPU/Memory alerts
└─ Network monitoring
```

---

## 🚀 Escalabilidad

### Phase 1: MVP (Current)
```
Single backend instance
PostgreSQL (single node)
Redis (in-memory)
Cloudflare tunnel
```

### Phase 2: Growth
```
Multiple backend instances (2-3)
Nginx load balancing
PostgreSQL read replicas
Redis sentinel
CDN for static assets
```

### Phase 3: Enterprise
```
Kubernetes (EKS/GKE)
Managed PostgreSQL (RDS/Cloud SQL)
Redis cluster
Multi-region deployment
Message queue (RabbitMQ/Kafka)
ElastiCache for distributed caching
```

---

## 📚 Documentación Relacionada

- [SETUP_FINAL.md](SETUP_FINAL.md) - Quick start guide para todas las plataformas
- [INICIO_SESION_EXPO_GO.md](INICIO_SESION_EXPO_GO.md) - Guía detallada para mobile
- [WEB_SETUP.md](WEB_SETUP.md) - Guía para web (Next.js)
- [API.md](API.md) - Documentación completa de endpoints
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía de deployment a producción
- [README.md](README.md) - Visión general del proyecto

---

## 📞 Contacto & Mantenimiento

**Mantenedor**: Omar Hernandez  
**Última Actualización**: 20 de Febrero de 2026  
**Estado**: ✅ Producción Ready  
**Versión**: 1.0  

**Próximas Mejoras**:
- [ ] GraphQL API (opcional)
- [ ] Real-time notifications (WebSockets)
- [ ] Advanced analytics dashboard
- [ ] Payment gateway expansion
- [ ] Mobile app store deployment

---

**FlexiCommerce © 2026 - Todos los derechos reservados**
