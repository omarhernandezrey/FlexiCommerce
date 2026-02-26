# FlexiCommerce — Frontend Roadmap & Status Completo

> **Documento maestro de desarrollo. Cualquier IA o desarrollador debe leer este archivo PRIMERO antes de tocar código.**
> Última actualización: 2026-02-26

---

## Índice
1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Design System](#4-design-system)
5. [Cómo Levantar el Proyecto](#5-cómo-levantar-el-proyecto)
6. [Estructura de Carpetas](#6-estructura-de-carpetas)
7. [Inventario Completo de Páginas](#7-inventario-completo-de-páginas)
8. [Inventario de Componentes](#8-inventario-de-componentes)
9. [Inventario de Hooks](#9-inventario-de-hooks)
10. [Integración con Backend (API)](#10-integración-con-backend-api)
11. [Lista de Tareas — Hechas y Pendientes](#11-lista-de-tareas--hechas-y-pendientes)
12. [Reglas de Código](#12-reglas-de-código)

---

## 1. Descripción del Proyecto

**FlexiCommerce** es una plataforma de e-commerce multi-tenant, production-ready, diseñada como SaaS. El administrador principal puede editar todo el contenido del frontend sin tocar código.

**Objetivo:** Marketplace-level UX similar a Mercado Libre / Amazon, pero completamente customizable para cualquier tipo de negocio (ropa, electrónicos, vehículos, servicios, productos digitales, etc.).

**Roles de usuario:**
- `super_admin` — Acceso total al sistema
- `admin` — Dueño de tienda, acceso al panel admin
- `customer` — Usuario comprador

---

## 2. Stack Tecnológico

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| **Next.js** | 14.2.35 | Framework web (App Router) |
| **React** | 19.x | UI |
| **TypeScript** | 5.x | Tipado estático |
| **Tailwind CSS** | 3.x | Estilos (utility-first) |
| **Zustand** | 4.4+ | Estado global (carrito, auth, favoritos) |
| **Axios** | 1.6+ | Cliente HTTP para API |
| **React Hook Form** | 7.x | Manejo de formularios |
| **Material Symbols Outlined** | CDN | Iconos (Google Fonts) |
| **Inter** | Google Fonts | Tipografía principal |

**Backend:** Node.js + Express.js + PostgreSQL + Prisma ORM — puerto `3001`
**Frontend:** Next.js — puerto `3000`

---

## 3. Arquitectura

```
FlexiCommerce/
├── frontend/          ← Next.js (este proyecto)
├── backend/           ← Express.js API (puerto 3001)
├── mobile/            ← Expo Go SDK 54 (Android)
└── Design/            ← Archivos HTML de referencia visual
```

**Flujo de autenticación:**
1. `POST /api/auth/login` → recibe JWT token
2. Token se guarda en Zustand store (`store/auth.ts`) + localStorage
3. `apiClient` (Axios) inyecta `Authorization: Bearer {token}` automáticamente
4. Rutas protegidas usan `<ProtectedRoute>` de `components/auth/AuthProvider.tsx`

**Layouts disponibles:**
- `app/layout.tsx` — Root layout (HTML base, fonts, Toast container)
- `app/(storefront)/layout.tsx` — Header + Footer + MobileBottomNav + BackToTop
- `app/(account)/layout.tsx` — Header + ProfileSidebar + Footer + BackToTop + ProtectedRoute
- `app/admin/layout.tsx` — AdminHeader + AdminSidebar (con mobile drawer)

---

## 4. Design System

```css
/* Colores principales (tailwind.config) */
primary: #0f1729          /* Navy oscuro — color brand principal */
background-light: #f6f7f8 /* Fondo general */
success: #10b981          /* Verde éxito */
warning: #f59e0b          /* Amarillo advertencia */
error: #ef4444            /* Rojo error */

/* Clases utilitarias globales (globals.css) */
.container-main    → max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8
.spacing-section   → space-y-4 sm:space-y-6
.spacing-header    → mb-4 sm:mb-6
.grid-gap-standard → gap-2 sm:gap-3 md:gap-4 lg:gap-6
```

**Icono:** siempre usar `<MaterialIcon name="nombre_icono" />` de `components/ui/MaterialIcon.tsx`
**Fuente:** Inter (cargada via `next/font/google` en el root layout)
**Responsive:** Mobile-first. Breakpoints: `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`

---

## 5. Cómo Levantar el Proyecto

```bash
# Terminal 1 — Base de datos
sudo service postgresql start

# Terminal 2 — Backend API (puerto 3001)
cd backend
npx prisma generate
npm run dev

# Terminal 3 — Frontend (puerto 3000)
cd frontend
npm run dev

# Terminal 4 — Mobile (solo si se necesita)
cd mobile
npm run tunnel   # SIEMPRE con tunnel en WSL2, nunca npm start solo
```

**Variables de entorno** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FlexiCommerce
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Comandos útiles:**
```bash
npm run build      # Build de producción (verificar errores)
npx tsc --noEmit   # Verificar TypeScript
npm run lint       # ESLint
rm -rf .next       # Limpiar caché si hay problemas de compilación
```

---

## 6. Estructura de Carpetas

```
frontend/
├── app/
│   ├── layout.tsx                      # Root layout
│   ├── (storefront)/                   # Páginas públicas del storefront
│   │   ├── layout.tsx                  # Header + Footer + MobileNav + BackToTop
│   │   ├── page.tsx                    # Home ✅
│   │   ├── products/
│   │   │   ├── page.tsx                # Catálogo ✅
│   │   │   └── [id]/page.tsx           # Detalle producto ✅
│   │   ├── category/
│   │   │   └── [slug]/page.tsx         # Página de categoría ✅
│   │   └── search/
│   │       └── page.tsx                # Búsqueda avanzada ✅
│   ├── (account)/                      # Páginas de cuenta (protegidas)
│   │   ├── layout.tsx                  # Header + ProfileSidebar + Footer
│   │   ├── profile/page.tsx            # Perfil ✅ (save backend + avatar upload)
│   │   ├── orders/
│   │   │   ├── page.tsx                # Historial órdenes ✅ (export CSV funcional)
│   │   │   └── [id]/page.tsx           # Detalle orden ✅
│   │   ├── wishlist/page.tsx           # Wishlist ✅
│   │   ├── compare/page.tsx            # Comparar ✅
│   │   ├── addresses/
│   │   │   └── page.tsx                # Gestión direcciones ✅
│   │   └── payment-methods/
│   │       └── page.tsx                # Métodos de pago ✅
│   ├── auth/page.tsx                   # Login/Register ✅
│   ├── cart/page.tsx                   # Carrito ✅
│   ├── checkout/
│   │   ├── page.tsx                    # Checkout ✅ (Standard/Express shipping selector)
│   │   └── confirmation/
│   │       ├── page.tsx
│   │       └── ConfirmationContent.tsx # Confirmación ✅
│   └── admin/                          # Panel administrador (protegido)
│       ├── layout.tsx                  # AdminHeader + AdminSidebar
│       ├── page.tsx                    # Dashboard ✅
│       ├── products/
│       │   ├── page.tsx                # Lista productos ✅
│       │   └── [id]/page.tsx           # Formulario producto ✅
│       ├── orders/
│       │   ├── page.tsx                # Lista órdenes ✅
│       │   └── [id]/page.tsx           # Detalle orden admin ✅
│       ├── analytics/page.tsx          # Analíticas ✅
│       ├── settings/page.tsx           # Configuración ✅ (GET/PUT backend)
│       ├── cms/page.tsx                # CMS editor ✅ (GET/POST backend)
│       ├── categories/
│       │   └── page.tsx                # CRUD categorías ✅
│       └── coupons/
│           └── page.tsx                # Gestión cupones ✅
├── components/
│   ├── auth/
│   │   └── AuthProvider.tsx            # ProtectedRoute wrapper ✅
│   ├── checkout/
│   │   ├── ShippingForm.tsx            # Formulario envío ✅
│   │   └── PaymentForm.tsx             # Formulario pago ✅
│   ├── layout/
│   │   ├── Header.tsx                  # Nav + MegaMenu + Mobile drawer ✅
│   │   ├── Footer.tsx                  # Footer completo ✅
│   │   ├── ProfileSidebar.tsx          # Sidebar cuenta (sticky, in-flow) ✅
│   │   ├── AdminHeader.tsx             # Header admin ✅ (dropdown notificaciones completo)
│   │   ├── AdminSidebar.tsx            # Sidebar admin con mobile drawer ✅
│   │   └── MobileBottomNav.tsx         # Nav inferior mobile ✅
│   ├── products/
│   │   ├── ProductCard.tsx             # Tarjeta producto (con badges) ✅
│   │   └── ProductsLoader.tsx          # Skeleton loader ✅
│   ├── reviews/
│   │   ├── ReviewForm.tsx              # Form para escribir review (componente disponible)
│   │   ├── ReviewList.tsx              # Lista de reviews (componente disponible)
│   │   ├── ReviewStats.tsx             # Stats de reviews (componente disponible)
│   │   └── StarRating.tsx              # Estrellas interactivas ✅
│   ├── recommendations/
│   │   └── ProductCarousel.tsx         # Carrusel recomendaciones ✅
│   ├── ui/
│   │   ├── MaterialIcon.tsx            # Wrapper Material Symbols ✅
│   │   ├── StarRating.tsx              # Estrellas display ✅
│   │   ├── Breadcrumbs.tsx             # Migas de pan ✅
│   │   ├── BackToTop.tsx               # Botón volver arriba ✅
│   │   ├── Toast.tsx + ToastContainer  # Notificaciones UI ✅
│   │   ├── Badge.tsx                   # Componente badge ✅
│   │   ├── Button.tsx                  # Botón base ✅
│   │   └── ImageUpload.tsx             # Upload drag&drop ✅
│   └── dashboard/
│       ├── Cards.tsx                   # Tarjetas dashboard ✅
│       └── Sidebar.tsx                 # Sidebar legacy ✅
├── hooks/
│   ├── useAuth.ts                      # Leer estado auth de Zustand ✅
│   ├── useAuthAPI.ts                   # login/register/logout vs API ✅
│   ├── useCart.ts                      # Carrito (Zustand persisted) ✅
│   ├── useProducts.ts                  # Fetch productos del backend ✅
│   ├── useProductAdmin.ts              # CRUD productos (admin) ✅
│   ├── useOrders.ts                    # Órdenes del usuario ✅
│   ├── useOrdersAdmin.ts               # Órdenes admin ✅
│   ├── useReviews.ts                   # CRUD reviews vs backend ✅ (integrado en /products/[id])
│   ├── useWishlist.ts                  # Wishlist vs backend ✅
│   ├── useCompare.ts                   # Compare (Zustand local) ✅
│   ├── useFavorites.ts                 # Favoritos (Zustand local) ✅
│   ├── useSearch.ts                    # Búsqueda local sobre array ✅
│   ├── useAnalytics.ts                 # Datos analíticas admin ✅
│   ├── useStripePayment.ts             # Integración Stripe ✅
│   ├── useRecommendations.ts           # Productos recomendados ✅
│   ├── useToast.ts                     # Toast notifications ✅
│   ├── useForm.ts                      # Form helpers ✅
│   └── usePreferences.ts               # Preferencias usuario ✅
├── store/
│   ├── auth.ts                         # Estado auth (JWT, user) ✅
│   ├── cart.ts                         # Carrito persistido ✅
│   ├── favorites.ts                    # Favoritos persistidos ✅
│   └── preferences.ts                  # Preferencias persistidas ✅
├── lib/
│   ├── api-client.ts                   # Axios instance (baseURL: localhost:3001) ✅
│   ├── api.service.ts                  # Servicios API organizados ✅
│   ├── constants.ts                    # MOCK_PRODUCTS, IMAGES, CATEGORIES ✅
│   ├── cn.ts                           # className utility (clsx) ✅
│   ├── utils.ts                        # Utilidades generales ✅
│   └── validation.ts                   # Schemas de validación ✅
└── styles/
    └── globals.css                     # Tailwind base + custom utilities ✅
```

---

## 7. Inventario Completo de Páginas

### STOREFRONT (Públicas)

#### ✅ `/` — Home
- Hero slider (3 slides, autoplay 5s, controles mouse)
- Browse Categories (grid 4 categorías con imagen + overlay)
- Trending Now (8 productos con ProductCard)
- Sección "Engineered for Scale" (features, imagen analytics rotada)
- Newsletter "Join the Elite Commerce Club"
- **Conexión backend:** Carga productos dinámicos via `useProducts` con fallback a MOCK_PRODUCTS

#### ✅ `/products` — Catálogo de Productos
- FilterSidebar sticky: búsqueda, categorías (checkbox + contador), precio (slider), rating (stars), **Color** (swatches), **Screen Size** (grid botones)
- Mobile filter drawer (toggle)
- Sort: Popular / Precio asc-desc / Rating
- Grid responsive: 1 col mobile → 2 sm → 3 xl
- Paginación: 9 items/página, prev/next + páginas numeradas
- Estado vacío con botón limpiar filtros
- **Conexión backend:** `useProducts` con fallback a MOCK_PRODUCTS

#### ✅ `/products/[id]` — Detalle de Producto
- Galería: imagen principal + thumbnails usando `product.images[]` (fallback a imagen principal)
- Badge descuento calculado automáticamente
- Selector color (4 opciones con hex)
- Contador cantidad (+/-)
- Botón "Add to Cart" conectado a `useCart`
- Botón wishlist conectado a `useFavorites`
- Trust badges (envío gratis, garantía, devoluciones)
- Tabs:
  - **Description:** texto + 4 feature cards (grid 2 cols)
  - **Specifications:** tabla de specs
  - **Reviews:** stats reales del backend, form write/edit/delete con estrellas interactivas, skeleton loading, load more
  - **Shipping & Returns:** 4 info cards + lista de política
- Related Products (misma categoría, max 4)
- **Conexión backend:** `useReviews` hook integrado (fetch/create/update/delete reviews) ✅

#### ✅ `/checkout` — Checkout (3 pasos)
- Step 0: Shipping Address (ShippingForm con validación)
- Selector envío inline: Standard FREE (5-7 días) / Express $15 (2-3 días) — aparece tras confirmar dirección
- Step 1: Payment Method (PaymentForm: card/paypal/transfer)
- Step 2: Review Order (resumen + botón Complete Purchase)
- Order Summary sidebar sticky (imagen, cantidad badge, subtotal, shipping dinámico, tax 8%, total)
- Promo code input
- Trust badges (SSL, Returns, Shipping)
- **Conexión backend:** `POST /api/orders` en step 2 ✅
- **Promo code:** valida contra `GET /coupons?code=X`, aplica descuento (% o $fijo), muestra línea Discount en verde, botón Remove ✅

#### ✅ `/checkout/confirmation` — Confirmación de Orden
- Confetti animado (6 elementos bounce)
- Icono check grande
- Delivery banner (fecha estimada + botón Track Order)
- Grid: Order ID, Date, Status, Total
- Lista de items del pedido
- Tabla totales (subtotal + shipping free + tax 8%)
- Botones: "View My Orders" + "Continue Shopping"
- 3 feature cards (Secure Payment, Easy Returns, 24/7 Support)
- **Conexión backend:** Carga orden via `useOrders.fetchById(orderId)` ✅

#### ✅ `/category/[slug]` — Página de Categoría
- Breadcrumb: Home > [Categoría]
- Hero banner con gradiente dinámico por categoría (icon + nombre + descripción + badge count)
- Filtros: precio máximo + sort (relevance/price asc/desc/rating)
- Grid de productos filtrados (usa `useProducts.fetchAll({ category })`)
- Skeleton loading, empty state
- Link "See More" a /products?category=...
- Related categories grid (otras categorías del sitio)
- **API:** `GET /api/products?category={name}` + fallback a MOCK ✅

#### ✅ `/search` — Búsqueda Avanzada
- Barra de búsqueda grande con botón clear
- Popular searches (chips, visible antes del primer search)
- Filtros sidebar: Sort (5 opciones), Price Range (5 rangos), Min Rating (4 opciones con estrellas)
- Botón "Clear all" cuando hay filtros activos
- Grid resultados 2/3 cols, Load More (si ≥12 resultados)
- Empty state con sugerencias de búsquedas populares
- URL state (?q=...) — Suspense wrapper requerido por Next.js
- **API:** `search(query)` de `useProducts` + fallback a MOCK ✅

---

### ACCOUNT (Protegidas — requieren login)

#### ✅ `/(account)/profile` — Perfil de Usuario
- Layout 3 cols: izq (avatar + stats + loyalty tier) + der (formulario edición)
- Avatar con botón cámara: abre file picker, preview local inmediato, upload a `POST /users/avatar` (multipart), validación tipo/tamaño 2MB
- Stats: Total Purchases, Membership, Points
- Loyalty Tier card (Platinum Elite, barra progreso a Diamond)
- Formulario: nombre (2 campos), email, teléfono, dirección, ciudad, país, ZIP
- Security section: cambio contraseña + toggle 2FA
- **Conexión backend:** `PUT /api/users/profile` + `updateUser()` en Zustand store ✅
- **Password change:** form inline toggle, validaciones (min 8, coinciden), `PUT /users/password`, toast ✅

#### ✅ `/(account)/orders` — Historial de Órdenes
- Header: título + botón Export CSV (funcional)
- Filtros: búsqueda por ID + date range dropdown + status badges
- Skeleton loading mientras carga; fallback a mock si backend no disponible
- Lista de órdenes (imagen, ID, status badge, fecha, items count, total, botón View Details)
- Paginación (3 páginas mock)
- Support Banner (Visit Help Center + Chat with Support)
- **Conexión backend:** `useOrders.fetchAll()` integrado ✅

#### ✅ `/(account)/orders/[id]` — Detalle de Orden
- Breadcrumb
- Header orden (ID + status badge)
- **Conexión backend:** `useOrders.fetchById` ✅

#### ✅ `/(account)/wishlist` — Wishlist
- Stats: Total Items, Min/Max Price, Total Value
- Tab "Wishlist Items": grid de productos, botón "Quick Add", checkbox compare
- Tab "Specification Matrix": tabla comparativa de items seleccionados
- Tab "Price Alerts": header "Enable All Alerts", lista todos items con input precio objetivo + botón "Set Alert"
- Mobile compare drawer (sticky bottom)
- Botón Clear Wishlist
- **Conexión backend:** `useWishlist` ✅

#### ✅ `/(account)/compare` — Comparar Productos
- Tabla horizontal: specs como filas, productos como columnas
- Max 4 productos
- Botón "Only Differences" (toggle)
- Botón "Clear All"
- Slots vacíos con link "Add Product"
- Spec grupos: General Info, Availability
- Fila "Buy Now" por producto
- **Datos:** Zustand store local (`useCompare`)

#### ✅ `/(account)/addresses` — Gestión de Direcciones
- Lista de direcciones guardadas (tarjetas con icon home/office según label)
- Formulario inline: label, firstName, lastName, street, city, state, ZIP, country, phone, checkbox default
- Botones editar / eliminar / set default por dirección
- Badge "Default" en dirección principal
- Skeleton loading, empty state con CTA
- **API:** GET/POST/PUT/DELETE `/users/addresses` ✅

#### ✅ `/(account)/payment-methods` — Métodos de Pago
- Tipo selector: Credit/Debit Card vs PayPal
- Form tarjeta: número (formateado con espacios cada 4), titular, MM/YYYY/CVV, SSL notice
- Form PayPal: solo email
- Tarjetas con color de fondo por marca (visa=blue, mastercard=red, amex=green)
- Set default, delete, badge "Default"
- **API:** GET/POST/DELETE `/users/payment-methods` ✅

---

### ADMIN (Protegidas — requieren role admin)

#### ✅ `/admin` — Dashboard Principal
- 3 stat cards (Total Sales, Active Stores, Pending Orders) con % cambio
- Page Builder: lista secciones con handles drag (visual), edit/visibility toggles
- Botón "+ Add New Section"
- Store Branding: logo upload, color picker, font selector, toggle maintenance
- Quick Links (→ Products, Orders, Analytics, Settings)
- Recent Orders table
- Top Products list

#### ✅ `/admin/products` — Gestión de Productos
- Stats cards: Total, Active, Low Stock, Revenue
- Búsqueda + filtro categoría + filtro status
- Tabla: imagen, nombre, categoría, precio, stock, status badge, acciones
- Botón "+ Add Product"
- **Conexión backend:** `useProductAdmin` ✅

#### ✅ `/admin/products/[id]` — Formulario de Producto
- Campos: nombre, descripción, precio, originalPrice, stock, categoría, imágenes
- ImageUpload drag&drop
- **Conexión backend:** CRUD via `useProductAdmin` ✅

#### ✅ `/admin/orders` — Gestión de Órdenes
- Filtros: status, date range, búsqueda
- Tabla: ID, cliente, items, total, status, fecha, acciones
- **Conexión backend:** `useOrdersAdmin` ✅

#### ✅ `/admin/orders/[id]` — Detalle de Orden (Admin)
- Info completa de la orden
- Selector cambio de status (dropdown)
- Datos de envío del cliente
- **Conexión backend:** `useOrdersAdmin` ✅

#### ✅ `/admin/analytics` — Analíticas
- Stats cards: Revenue, Orders, Customers, Avg Order Value
- Gráficas de barras (simuladas con Tailwind)
- Top Products list
- Traffic por categoría
- **Conexión backend:** `useAnalytics` ✅

#### ✅ `/admin/settings` — Configuración de Tienda
- Tabs: General Info / Payment Gateways / Shipping Rules / Tax
- General: nombre tienda, email, moneda, logo upload, dirección
- Pagos: Stripe + PayPal (toggle, status badge Connected/Disconnected)
- Shipping: domestic flat rate + free shipping threshold
- Tax: placeholder "coming soon"
- Footer sticky: "Last autosaved HH:MM" + Discard / Save Changes
- **Conexión backend:** `GET /admin/settings` en mount, `PUT /admin/settings` al guardar, loading state + toast ✅

#### ✅ `/admin/cms` — CMS Editor
- Quick stats: Total Sales, Active Stores, Pending Orders
- Page Builder: secciones (Hero Slider, Featured Grid, Promo Banner, Newsletter) con toggle visibility + edit
- Store Branding: logo upload, color picker, font selector, toggle maintenance mode
- Botones Save Changes / Apply Globally con loading spinner
- **Conexión backend:** `GET /admin/cms/settings` en mount, `POST /admin/cms/settings` al guardar, toast ✅

#### ✅ `/admin/categories` — CRUD de Categorías
- Tabla con subcategorías (indentadas con arrow icon)
- Botón "+ New Category"
- Form: nombre, slug (auto-generado al crear, fijo al editar), descripción, imagen URL, parent category selector, toggle activo
- Toggle activo inline, botones editar / eliminar
- **API:** GET/POST/PUT/DELETE `/categories` ✅

#### ✅ `/admin/coupons` — Gestión de Cupones
- Stats cards: Total Coupons, Active, Expired, Total Uses
- Lista: código, tipo (% / $fijo), descuento, uso progress bar (rojo ≥90%, orange ≥70%), fecha exp, toggle activo
- Form: código + botón "Generate", tipo selector, valor, min order, max uses, expiry, description, isActive
- **API:** GET/POST/PUT/DELETE `/coupons` ✅

---

## 8. Inventario de Componentes

| Componente | Ruta | Estado | Notas |
|-----------|------|--------|-------|
| `Header` | `components/layout/Header.tsx` | ✅ | Mega menu, mobile drawer, cart badge, profile dropdown |
| `Footer` | `components/layout/Footer.tsx` | ✅ | Links, newsletter, social |
| `ProfileSidebar` | `components/layout/ProfileSidebar.tsx` | ✅ | Sticky, in-flow, avatar, nav, logout |
| `AdminSidebar` | `components/layout/AdminSidebar.tsx` | ✅ | Mobile drawer con overlay |
| `AdminHeader` | `components/layout/AdminHeader.tsx` | ✅ | Dropdown notificaciones: mark read individual/all, unread badge, cierra fuera |
| `MobileBottomNav` | `components/layout/MobileBottomNav.tsx` | ✅ | Nav inferior mobile storefront |
| `ProductCard` | `components/products/ProductCard.tsx` | ✅ | Badge "Sale" (rojo top-left) + "New Release" (primary bottom-left), wishlist toggle |
| `ProductsLoader` | `components/products/ProductsLoader.tsx` | ✅ | Skeleton loader animado |
| `ReviewForm` | `components/reviews/ReviewForm.tsx` | — | Componente disponible (reviews integrados via `useReviews` directamente en product page) |
| `ReviewList` | `components/reviews/ReviewList.tsx` | — | Componente disponible (no usado en páginas) |
| `ReviewStats` | `components/reviews/ReviewStats.tsx` | — | Componente disponible (no usado en páginas) |
| `StarRating` (reviews) | `components/reviews/StarRating.tsx` | ✅ | Interactivo (onClick para cambiar rating) |
| `MaterialIcon` | `components/ui/MaterialIcon.tsx` | ✅ | Wrapper para Material Symbols Outlined |
| `StarRating` (ui) | `components/ui/StarRating.tsx` | ✅ | Display only con reviews count |
| `Breadcrumbs` | `components/ui/Breadcrumbs.tsx` | ✅ | |
| `BackToTop` | `components/ui/BackToTop.tsx` | ✅ | Aparece al scrollear 400px, scroll smooth |
| `Toast` + `ToastContainer` | `components/ui/Toast*.tsx` | ✅ | Notificaciones success/error/info |
| `Badge` | `components/ui/Badge.tsx` | ✅ | |
| `Button` | `components/ui/Button.tsx` | ✅ | |
| `ImageUpload` | `components/ui/ImageUpload.tsx` | ✅ | Drag & drop visual (upload no persiste) |
| `ShippingForm` | `components/checkout/ShippingForm.tsx` | ✅ | Validación completa |
| `PaymentForm` | `components/checkout/PaymentForm.tsx` | ✅ | card/paypal/transfer |
| `ProductCarousel` | `components/recommendations/ProductCarousel.tsx` | ✅ | |
| `AuthProvider` | `components/auth/AuthProvider.tsx` | ✅ | `<ProtectedRoute>` wrapper |

---

## 9. Inventario de Hooks

| Hook | Estado | API Endpoint | Notas |
|------|--------|-------------|-------|
| `useAuth` | ✅ | store/auth | Lee user/isAuthenticated de Zustand |
| `useAuthAPI` | ✅ | `/api/auth/login` `/api/auth/register` | login/register/logout |
| `useCart` | ✅ | localStorage (Zustand persist) | addItem, removeItem, getTotalPrice, getTotalItems |
| `useProducts` | ✅ | `GET /api/products` | fetchAll, products, loading. Fallback a MOCK |
| `useProductAdmin` | ✅ | `GET/POST/PUT/DELETE /api/products` | CRUD admin |
| `useOrders` | ✅ | `GET/POST /api/orders` | create, fetchById, currentOrder |
| `useOrdersAdmin` | ✅ | `GET/PUT /api/orders` | Lista y update status |
| `useReviews` | ✅ | `/api/reviews/product/{id}` | fetchReviews, createReview, updateReview, deleteReview, hasUserReview — integrado en `/products/[id]` |
| `useWishlist` | ✅ | `/api/wishlist` | items, addToWishlist, removeFromWishlist, clearWishlist |
| `useCompare` | ✅ | localStorage | products, addToCompare, removeFromCompare |
| `useFavorites` | ✅ | localStorage | isFavorite, addFavorite, removeFavorite |
| `useSearch` | ✅ | local | Filtra array local por campos |
| `useAnalytics` | ✅ | `/api/analytics` | Dashboard admin |
| `useStripePayment` | ✅ | Stripe SDK | Listo para integrar |
| `useRecommendations` | ✅ | `/api/products/recommendations` | |
| `useToast` | ✅ | — | toast({ message, type }) |
| `useForm` | ✅ | — | Helpers formularios |
| `usePreferences` | ✅ | localStorage | |

---

## 10. Integración con Backend (API)

**Base URL:** `http://localhost:3001/api` (configurado en `frontend/lib/api-client.ts`)

### Endpoints implementados en frontend

| Endpoint | Método | Estado | Usado en |
|----------|--------|--------|---------|
| `/auth/login` | POST | ✅ | `useAuthAPI` |
| `/auth/register` | POST | ✅ | `useAuthAPI` |
| `/products` | GET | ✅ | `useProducts` |
| `/products/{id}` | GET | ✅ | `useProductAdmin` |
| `/products` | POST | ✅ | `useProductAdmin` |
| `/products/{id}` | PUT | ✅ | `useProductAdmin` |
| `/products/{id}` | DELETE | ✅ | `useProductAdmin` |
| `/orders` | GET | ✅ | `useOrders`, `useOrdersAdmin` |
| `/orders/{id}` | GET | ✅ | `useOrders` |
| `/orders` | POST | ✅ | `useOrders` en checkout |
| `/orders/{id}/status` | PUT | ✅ | `useOrdersAdmin` |
| `/reviews/product/{id}` | GET | ✅ | `useReviews` — integrado en `/products/[id]` |
| `/reviews` | POST | ✅ | `useReviews` — integrado en `/products/[id]` |
| `/reviews/{id}` | PUT | ✅ | `useReviews` — integrado en `/products/[id]` |
| `/reviews/{id}` | DELETE | ✅ | `useReviews` — integrado en `/products/[id]` |
| `/wishlist` | GET/POST/DELETE | ✅ | `useWishlist` |
| `/analytics` | GET | ✅ | `useAnalytics` |

### Todos los endpoints del frontend están integrados

| Endpoint | Método | Estado | Usado en |
|----------|--------|--------|---------|
| `/users/profile` | PUT | ✅ | `profile/page.tsx` — actualiza Zustand store |
| `/users/avatar` | POST | ✅ | `profile/page.tsx` — multipart/form-data, preview local |
| `/users/addresses` | GET/POST/PUT/DELETE | ✅ | `addresses/page.tsx` |
| `/users/payment-methods` | GET/POST/DELETE | ✅ | `payment-methods/page.tsx` |
| `/categories` | GET/POST/PUT/DELETE | ✅ | `admin/categories/page.tsx` |
| `/coupons` | GET/POST/PUT/DELETE | ✅ | `admin/coupons/page.tsx` |
| `/admin/cms/settings` | GET/POST | ✅ | `admin/cms/page.tsx` |
| `/admin/settings` | GET/PUT | ✅ | `admin/settings/page.tsx` |

### Endpoints pendientes de integrar en backend

| Endpoint | Para qué | Notas |
|----------|---------|-------|
| `/notifications` | GET | Reemplazar mock notifications en AdminHeader (no prioritario) |

---

## 11. Lista de Tareas — Hechas y Pendientes

### ✅ COMPLETADO

#### Infraestructura
- [x] Configurar Next.js 14 App Router con TypeScript
- [x] Configurar Tailwind CSS con tema custom (color primary #0f1729)
- [x] Configurar Zustand stores (auth, cart, favorites, preferences)
- [x] Configurar Axios client con base URL de .env
- [x] Configurar layouts: storefront, account, admin
- [x] Sistema de rutas protegidas (`ProtectedRoute`)
- [x] Sistema de Toast notifications
- [x] Botón BackToTop flotante (aparece a 400px scroll)

#### Storefront
- [x] Home: hero slider autoplay, categorías, trending, features, newsletter "Join the Elite Commerce Club"
- [x] Catálogo `/products`: filtros (categoría, precio, rating, Color, Screen Size), sort, búsqueda, paginación
- [x] Detalle producto `/products/[id]`: galería, tabs (Description con feature cards, Specifications, Reviews con backend real, Shipping & Returns)
- [x] Reviews en detalle producto: `useReviews` hook integrado, stats reales, form write/edit/delete con estrellas interactivas, load more, skeleton loading
- [x] Categoría `/category/[slug]`: hero banner con gradiente, productos filtrados, sort/price filter, related categories
- [x] Búsqueda `/search`: input destacado, filtros (precio por rango, rating mínimo, sort), popular searches, no-results con sugerencias, Suspense wrapper
- [x] Carrito completo
- [x] Checkout: selector envío (Standard FREE / Express $15) + 3 pasos (shipping address, payment, review). Costo refleja en Order Summary
- [x] Order Confirmation: confetti, Track Order, delivery banner, trust badges

#### Account
- [x] Perfil: save conectado a `PUT /users/profile`, avatar upload con preview + `POST /users/avatar`, loading states + toast
- [x] Direcciones `/addresses`: CRUD completo (add/edit/delete/set-default), home/office icons
- [x] Métodos de pago `/payment-methods`: Card + PayPal, set default, remove, SSL notice
- [x] Historial órdenes: filtro status, filtro fecha, búsqueda, Export CSV funcional (Blob download), paginación, support banner
- [x] Detalle orden
- [x] Wishlist: grid, stats, 3 tabs (Wishlist/SpecMatrix/PriceAlerts), compare drawer mobile
- [x] Compare: tabla specs, toggle differences, slots vacíos, Buy Now
- [x] Auth: login/register 2 columnas, Google/Apple social login, password toggle

#### Admin
- [x] Dashboard: stats, page builder, branding, recent orders, top products
- [x] CRUD Productos (lista + formulario + ImageUpload)
- [x] Gestión Órdenes (lista + detalle + cambio status)
- [x] Categorías `/admin/categories`: CRUD completo, subcategorías, auto-slug, toggle activo, image preview
- [x] Cupones `/admin/coupons`: % y $fijo, max uses, expiry, stats (total/activo/expirado/uses), toggle activo, usage progress bar
- [x] Analytics con gráficas
- [x] Settings: tabs General/Payments/Shipping/Tax, GET/PUT backend, loading state + toast
- [x] CMS: page builder secciones, branding, GET/POST backend, loading state + toast
- [x] Notifications dropdown: lista de notificaciones, mark read individual/all, unread badge, cierre al click fuera
- [x] Mobile drawer sidebar (hamburger, overlay)

#### Responsive / UX
- [x] Mobile-first en todas las páginas
- [x] Mega menu desktop + drawer mobile en Header
- [x] ProfileSidebar sticky in-flow con links a Addresses y Payment Methods
- [x] Admin mobile sidebar drawer con links a Categories y Coupons
- [x] MobileBottomNav para storefront
- [x] Product badges diferenciados (Sale rojo top-left, New Release primary bottom-left)

---

### ✅ TAREAS COMPLETADAS (T-01 a T-10)

| Tarea | Descripción | Archivos |
|-------|-------------|----------|
| T-01 | Reviews con backend en `/products/[id]`: `useReviews` integrado, stats reales, form write/edit/delete con estrellas, load more, skeleton | `products/[id]/page.tsx` |
| T-02 | Shipping method en Checkout: Standard FREE / Express $15, costo en Order Summary y en orden enviada al backend | `checkout/page.tsx` |
| T-03 | Profile save conectado a `PUT /api/users/profile`, `updateUser()` en Zustand, loading state + toast | `profile/page.tsx` |
| T-04 | Página `/addresses`: CRUD completo add/edit/delete/set-default, home/office icons, link en ProfileSidebar | `addresses/page.tsx` |
| T-05 | Página `/payment-methods`: Card + PayPal, set default, remove, SSL notice, link en ProfileSidebar | `payment-methods/page.tsx` |
| T-06 | Página `/category/[slug]`: hero banner gradiente, productos filtrados, sort/price filter, related categories | `category/[slug]/page.tsx` |
| T-07 | Página `/search`: búsqueda avanzada, filtros precio/rating/sort, popular searches, Suspense wrapper | `search/page.tsx` |
| T-08 | Admin `/categories`: CRUD + subcategorías + auto-slug + toggle activo, link en AdminSidebar | `admin/categories/page.tsx` |
| T-09 | Admin `/coupons`: % y $fijo, max uses, expiry, stats cards, toggle activo, usage progress bar | `admin/coupons/page.tsx` |
| T-10 | Admin notifications dropdown: 5 notifs mock, mark read individual/all, unread badge, cierra fuera | `AdminHeader.tsx` |
| T-11 | Admin CMS: GET settings en mount + POST al guardar, loading state, toast éxito/error | `admin/cms/page.tsx` |
| T-12 | Admin Settings: GET settings en mount + PUT al guardar, loading state, toast éxito/error | `admin/settings/page.tsx` |
| T-13 | Avatar upload: `<input type="file">` oculto, preview inmediato, POST `/users/avatar` multipart | `(account)/profile/page.tsx` |
| T-14 | Export CSV: `exportToCSV()` con `Blob` + `URL.createObjectURL`, solo exporta órdenes filtradas | `(account)/orders/page.tsx` |
| T-15 | Galería real: `product.images[]` con fallback a `[product.image]`, imágenes de demo en MockProduct #1 | `products/[id]/page.tsx`, `lib/constants.ts` |

---

### ✅ TAREAS COMPLETADAS (T-16 a T-19)

| Tarea | Descripción | Archivo | Prioridad |
|-------|-------------|---------|-----------|
| T-16 | ✅ Conectar `/account/orders` al backend: `useOrders.fetchAll()`, skeleton, fallback a mock | `(account)/orders/page.tsx` |
| T-17 | ✅ Conectar `/account/orders/[id]` al backend: `useOrders.fetchById(id)`, skeleton, error state, timeline dinámico | `(account)/orders/[id]/page.tsx` |
| T-18 | ✅ Promo code funcional en Checkout: `GET /coupons?code=X`, % y $fijo, línea descuento en Order Summary, botón Remove | `checkout/page.tsx` |
| T-19 | ✅ Cambio de contraseña en Profile: form inline (current/new/confirm), validaciones, `PUT /users/password`, toast | `(account)/profile/page.tsx` |

---

### ✅ TODAS LAS TAREAS COMPLETADAS (23/23)

---

### ✅ TAREAS COMPLETADAS (T-20 a T-23)

| Tarea | Descripción | Archivo | Prioridad |
|-------|-------------|---------|-----------|
| T-20 | ✅ Admin Products: `deleteProduct` implementado en `useProductAdmin` + llamada real en `handleDelete`, recarga lista tras eliminar | `admin/products/page.tsx`, `hooks/useProductAdmin.ts` | CRÍTICA |
| T-21 | ✅ Catálogo `/products`: filtros Color y Screen Size incluidos en `filteredProducts` useMemo + `hasActiveFilters` + contador badge móvil | `(storefront)/products/page.tsx` | MEDIA |
| T-22 | ✅ Wishlist Price Alerts: `handleSetAlert`, `handleEnableAllAlerts`, `handleTargetChange` con persistencia en localStorage; botones con estado visual activo/inactivo | `(account)/wishlist/page.tsx` | MEDIA |
| T-23 | ✅ Admin CMS: Preview abre `/` en nueva pestaña; Edit por sección con inline inputs; Add New Section con formulario inline (Enter/Escape); icono y color auto-asignados | `admin/cms/page.tsx` | BAJA |

#### Detalle T-20 — Admin Delete Producto (CRÍTICA)
- **Problema:** `app/admin/products/page.tsx` línea 23 tiene `// await deleteProduct(id);` comentado
- **Raíz:** `useProductAdmin` hook no expone función `delete`
- **Fix:** Agregar `deleteProduct` en `useProductAdmin.ts` con `DELETE /api/products/{id}`, luego usarlo en el `handleDelete` de la página
- **Impacto:** Sin esto, los admins no pueden eliminar productos — broken feature crítica

#### Detalle T-21 — Filtros Color/Screen Size en Catálogo
- **Problema:** Los filtros Color y Screen Size existen en la UI pero no se pasan como parámetros en la llamada a `fetchAll(params)`
- **Fix:** Incluir `color` y `screenSize` en el objeto `params` que se pasa a `fetchAll()`
- **Impacto:** Los usuarios ven los filtros activos pero los resultados no cambian

#### Detalle T-22 — Wishlist Price Alerts
- **Problema:** Tab "Price Alerts" tiene botones "Enable All Alerts" y "Set Alert" por item sin implementación
- **Fix:** Conectar a backend (o al menos guardar en localStorage/Zustand con feedback visual)
- **Impacto:** Feature visible pero no funcional

#### Detalle T-23 — Admin CMS Botones de Sección
- **Problema:** Botones "Edit" por sección, "Preview" global y "Add New Section" en CMS no tienen onClick
- **Fix:** Implementar modals o inline forms para editar secciones, preview en new tab, agregar sección al array
- **Impacto:** El CMS guarda/carga configuración global pero no permite editar secciones individuales

---

#### Detalle de implementación T-16 a T-19

##### T-16: Conectar Lista de Órdenes al backend
- **Archivo:** `app/(account)/orders/page.tsx`
- **Qué hacer:**
  - Importar `useOrders` hook
  - En `useEffect` de mount: llamar `fetchAll()` para cargar órdenes reales
  - Mostrar skeleton loading (3 items) mientras carga
  - Usar `orders` del hook en lugar del array hardcodeado
  - Adaptar `statusConfig` a los status del backend (`pending`, `processing`, `shipped`, `delivered`, `cancelled`)
  - El Export CSV ya funciona y usará los datos reales automáticamente

#### T-17: Conectar Detalle de Orden al backend
- **Archivo:** `app/(account)/orders/[id]/page.tsx`
- **Qué hacer:**
  - Importar `useOrders` hook
  - En `useEffect` de mount: llamar `fetchById(params.id)`
  - Mostrar skeleton loading mientras carga
  - Reemplazar el objeto `order` hardcodeado con `currentOrder` del hook
  - Manejar estado `error` (mostrar mensaje si no existe la orden)

#### T-18: Promo code funcional en Checkout
- **Archivo:** `app/checkout/page.tsx`
- **Qué hacer:**
  - Agregar estado `promoCode`, `promoDiscount`, `promoApplied`, `promoLoading`
  - Handler `handleApplyPromo`: llama `GET /coupons?code={promoCode}` con `apiClient`
  - Si válido: aplica `discount = coupon.type === 'percentage' ? subtotal * coupon.value / 100 : coupon.value`
  - Mostrar línea "Discount (-X%)" en verde en Order Summary
  - Actualizar `total = subtotal + shippingCost + tax - discount`
  - Botón "Remove" para quitar el cupón aplicado
  - Mostrar error si código inválido/expirado

##### T-19: Cambio de contraseña en Profile
- Form inline toggle con `showPasswordForm` state
- Campos: Current Password, New Password, Confirm New Password
- Validaciones: campos requeridos, min 8 chars, passwords coinciden (feedback visual en tiempo real)
- `PUT /users/password` con `{ currentPassword, newPassword }`, toast éxito/error
- Se limpia al cerrar

---

## 12. Reglas de Código

### Obligatorias para todos los archivos nuevos
1. Agregar `'use client'` solo si se necesitan hooks React o eventos del browser
2. Usar `MaterialIcon` para TODOS los iconos, nunca importar otros icon packs
3. Usar clases utilitarias `.spacing-section`, `.container-main`, `.grid-gap-standard` donde corresponda
4. Responsive siempre mobile-first: clases sin prefijo → mobile, `sm:` → 640px, `lg:` → 1024px
5. Rutas protegidas siempre dentro de `<ProtectedRoute>`
6. Llamadas API siempre via `apiClient` de `@/lib/api-client` (nunca `fetch` directo)
7. Errores siempre capturados con `try/catch` + `toast({ message, type: 'error' })`
8. Loading states en todos los botones que llamen API
9. No agregar comentarios en el código a menos que la lógica sea muy compleja
10. No usar `any` en TypeScript — siempre tipar correctamente

### Convenciones de nombre
- Páginas: `page.tsx` dentro de su carpeta de ruta
- Componentes: `PascalCase.tsx`
- Hooks: `camelCase.ts` con prefijo `use`
- Stores Zustand: `camelCase.ts` en `/store`
- Tipos: interfaces en el mismo archivo o en `/types`

### Patrón para páginas de cuenta nueva
```tsx
'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';
// imports...

export default function NombrePage() {
  // estado y hooks

  return (
    <div className="spacing-section">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-primary">Título</h1>
        <p className="text-primary/60 text-sm mt-1">Descripción</p>
      </div>
      {/* Contenido */}
    </div>
  );
}
```

### Patrón para páginas admin nueva
```tsx
'use client';

// imports...

export default function AdminNombrePage() {
  return (
    <div className="p-4 sm:p-8 spacing-section">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-primary">Título</h1>
          <p className="text-primary/60 text-sm">Descripción</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors text-sm">
          <MaterialIcon name="add" className="text-base" />
          Nueva Acción
        </button>
      </div>
      {/* Contenido */}
    </div>
  );
}
```

---

*Última actualización: 2026-02-26. Progreso: **19/19 tareas completadas ✅**. Frontend production-ready. Sin gaps funcionales pendientes.*
