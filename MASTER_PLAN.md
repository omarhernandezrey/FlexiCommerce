# FlexiCommerce — Plan Maestro de Desarrollo

> **Documento de control global. Cualquier desarrollador o IA debe leer este archivo antes de empezar cualquier tarea.**
> Creado: 2026-02-26 | Última actualización: 2026-02-26
> Basado en auditoría completa del codebase realizada por el equipo de desarrollo.

---

## Índice

1. [Cómo leer este documento](#1-cómo-leer-este-documento)
2. [Estado actual del sistema](#2-estado-actual-del-sistema)
3. [Fase 1 — Producción segura (CRÍTICO)](#3-fase-1--producción-segura-crítico)
4. [Fase 2 — Calidad de código (Testing)](#4-fase-2--calidad-de-código-testing)
5. [Fase 3 — Mobile completo](#5-fase-3--mobile-completo)
6. [Fase 4 — Profesionalización](#6-fase-4--profesionalización)
7. [Fase 5 — Escalabilidad](#7-fase-5--escalabilidad)
8. [Tracker de progreso global](#8-tracker-de-progreso-global)
9. [Reglas para actualizar este documento](#9-reglas-para-actualizar-este-documento)

---

## 1. Cómo leer este documento

### Nomenclatura de tareas

Cada tarea tiene un ID único con el formato:

```
[PREFIJO][FASE]-[NÚMERO]
```

| Prefijo | Sistema |
|---------|---------|
| `F` | Frontend (Next.js) |
| `B` | Backend (Express + Prisma) |
| `M` | Mobile (Expo React Native) |
| `D` | DevOps / Infraestructura |

**Ejemplo:** `F1-02` → Frontend, Fase 1, tarea número 2.

### Estados de tarea

| Estado | Significado |
|--------|-------------|
| `⬜ PENDIENTE` | No iniciada |
| `🔄 EN CURSO` | En desarrollo activo |
| `✅ COMPLETADA` | Terminada y verificada |
| `⏸ BLOQUEADA` | Depende de otra tarea |

### Prioridades

| Nivel | Descripción |
|-------|-------------|
| 🔴 CRÍTICO | Sin esto, producción falla o tiene vulnerabilidades |
| 🟠 ALTO | Necesario para calidad profesional |
| 🟡 MEDIO | Mejora significativa del producto |
| 🟢 BAJO | Nice-to-have, escalabilidad futura |

---

## 2. Estado actual del sistema

### Resumen ejecutivo

| Sistema | Completitud | Notas |
|---------|-------------|-------|
| Frontend — UI/UX | ✅ 100% | 35/35 páginas y componentes |
| Frontend — Seguridad | ❌ 0% | Sin middleware de auth, sin error pages |
| Frontend — SEO | ⚠️ 20% | Solo metadata básica en layout raíz |
| Frontend — Testing | ❌ 0% | Sin ningún test |
| Backend — API | ✅ 90% | 11 módulos, todos funcionales |
| Backend — Testing | ❌ 5% | Solo 1 archivo de test |
| Backend — Documentación UI | ❌ 0% | OpenAPI spec existe pero sin Swagger UI |
| Backend — Logging | ⚠️ 40% | Logging simple, no profesional |
| Mobile — Auth | ✅ 100% | Login funcional en Android con Expo Go |
| Mobile — Pantallas | ⚠️ 20% | 4 de 5 tabs son placeholders |
| Mobile — Testing | ❌ 0% | Sin ningún test |
| DevOps — Docker | ✅ 90% | Multi-stage builds, health checks |
| DevOps — CI/CD | ✅ 95% | GitHub Actions completo |
| DevOps — Monitoring | ❌ 0% | Sin error tracking ni métricas |

### Páginas frontend existentes (referencia)

Todas las siguientes están **completadas** (no requieren trabajo de UI):

- `/` Home, `/products`, `/products/[id]`, `/cart`, `/checkout`, `/checkout/confirmation`
- `/(account)/profile`, `/(account)/orders`, `/(account)/orders/[id]`
- `/(account)/addresses`, `/(account)/payment-methods`
- `/(account)/wishlist`, `/(account)/compare`
- `/auth` (login/register), `/category/[slug]`, `/search`
- `/admin`, `/admin/products`, `/admin/products/[id]`
- `/admin/orders`, `/admin/orders/[id]`, `/admin/analytics`
- `/admin/categories`, `/admin/coupons`, `/admin/settings`, `/admin/cms`

### Pantallas mobile existentes

| Pantalla | Archivo | Estado |
|----------|---------|--------|
| Splash / Redirect | `app/index.tsx` | ✅ Funcional |
| Login | `app/(auth)/login.tsx` | ✅ Funcional |
| Register | `app/(auth)/register.tsx` | ⚠️ Existe, sin implementar |
| Reset Password | `app/(auth)/reset-password.tsx` | ⚠️ Existe, sin implementar |
| Home (tabs) | `app/(app)/index.tsx` | ⚠️ Básico, sin datos reales |
| Search | `app/(app)/search.tsx` | ❌ Placeholder |
| Cart | `app/(app)/cart.tsx` | ❌ Placeholder |
| Wishlist | `app/(app)/wishlist.tsx` | ❌ Placeholder |
| Profile | `app/(app)/profile.tsx` | ❌ Placeholder |
| Product Detail | `app/(app)/products/[id].tsx` | ⚠️ Existe, revisar |
| Orders | `app/(app)/orders.tsx` | ⚠️ Existe, revisar |
| Order Detail | `app/(app)/orders/[id].tsx` | ⚠️ Existe, revisar |
| Checkout | `app/(app)/checkout.tsx` | ⚠️ Existe, revisar |
| Compare | `app/(app)/compare.tsx` | ⚠️ Existe, revisar |

### Endpoints backend disponibles (referencia)

Todos los siguientes endpoints están **implementados y funcionando**:

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
GET    /api/users/me        PUT /api/users/me
GET    /api/products        GET /api/products/search
GET    /api/products/:id    POST/PUT/DELETE /api/products/:id (ADMIN)
GET    /api/categories      POST/PUT/DELETE /api/categories/:id (ADMIN)
GET    /api/orders          GET /api/orders/:id
POST   /api/orders          PATCH /api/orders/:id/status (ADMIN)
GET    /api/reviews/product/:productId
POST   /api/reviews         DELETE /api/reviews/:id
GET    /api/wishlist        POST /api/wishlist
DELETE /api/wishlist/:id    DELETE /api/wishlist
POST   /api/payments/intent/create   POST /api/payments/intent/confirm
GET    /api/recommendations/trending
GET    /api/recommendations/similar/:productId
GET    /api/recommendations/carousels
GET    /api/recommendations/personalized
GET    /api/analytics/metrics        GET /api/analytics/daily-sales
GET    /api/analytics/top-products   GET /api/analytics/export-csv
GET    /api/cms             POST/PUT/DELETE /api/cms/:id (ADMIN)
GET    /api/health
```

---

## 3. Fase 1 — Producción segura (CRÍTICO)

> **Objetivo:** Hacer el sistema seguro y estable para producción. Sin esto, el proyecto NO debe salir a producción.
> **Orden:** Las tareas deben hacerse en el orden listado. No saltarse ninguna.

---

### F1-01 — `middleware.ts`: Protección de rutas autenticadas

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Frontend |
| **Archivo principal** | `frontend/middleware.ts` (crear) |

**Problema actual:**
Cualquier usuario no autenticado puede acceder a `/admin`, `/account/*`, `/cart`, `/checkout` directamente por URL. Esto es un fallo de seguridad grave.

**Implementar:**
```
Rutas protegidas (requieren login):
- /account/*         → redirect a /auth si no hay token
- /cart              → redirect a /auth si no hay token
- /checkout          → redirect a /auth si no hay token

Rutas admin (requieren role=ADMIN):
- /admin/*           → redirect a / si no es admin

Rutas de auth (redirigir si ya está logueado):
- /auth              → redirect a / si ya tiene sesión
```

**Archivos afectados:**
- `frontend/middleware.ts` (CREAR)

**Criterio de aceptación:**
- Acceder a `/admin` sin login redirige a `/auth`
- Acceder a `/account/orders` sin login redirige a `/auth`
- Acceder a `/auth` con sesión activa redirige a `/`
- Un usuario CUSTOMER que accede a `/admin` es redirigido a `/`

---

### F1-02 — `error.tsx`: Página de error global

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Frontend |
| **Archivos** | `frontend/app/error.tsx` (crear) |

**Problema actual:**
Si el backend falla, el servidor cae o hay un error de JavaScript, el usuario ve el error técnico de Next.js directamente — no una página amigable.

**Implementar:**
- Página de error con diseño del sistema (logo, colores FlexiCommerce)
- Mensaje amigable: "Algo salió mal. Por favor intenta de nuevo."
- Botón "Volver al inicio"
- Botón "Recargar página" (`reset()` de Next.js)
- Mostrar el error técnico solo en modo desarrollo

**Archivos afectados:**
- `frontend/app/error.tsx` (CREAR — Client Component, recibe `error` y `reset`)

**Criterio de aceptación:**
- Lanzar un error en cualquier página muestra la página de error bonita
- El botón "Recargar" ejecuta `reset()`
- En producción NO se muestra el stack trace

---

### F1-03 — `not-found.tsx`: Página 404

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Frontend |
| **Archivos** | `frontend/app/not-found.tsx` (crear) |

**Problema actual:**
Acceder a una URL que no existe muestra la página 404 genérica de Next.js.

**Implementar:**
- Página 404 con diseño del sistema
- Ilustración o ícono grande
- Mensaje: "Página no encontrada"
- Botón "Volver al inicio" → `/`
- Links rápidos: Productos, Mis Órdenes, Contacto

**Archivos afectados:**
- `frontend/app/not-found.tsx` (CREAR — Server Component)

**Criterio de aceptación:**
- URL inexistente muestra página 404 estilizada
- Los links de navegación funcionan correctamente

---

### F1-04 — SEO base: `robots.txt` y `sitemap.xml`

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Frontend |
| **Archivos** | `frontend/app/robots.ts` y `frontend/app/sitemap.ts` (crear) |

**Problema actual:**
Google no puede indexar el sitio correctamente. No hay instrucciones para crawlers ni mapa del sitio. Para un e-commerce esto es crítico para el negocio.

**Implementar `robots.ts`:**
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /checkout/
Disallow: /api/
Sitemap: https://flexicommerce.com/sitemap.xml
```

**Implementar `sitemap.ts`:**
- URLs estáticas: `/`, `/products`, `/auth`, `/search`
- URLs dinámicas: `/products/[id]` — fetch de todos los productos
- URLs de categorías: `/category/[slug]`
- Prioridades y frecuencias de actualización

**Archivos afectados:**
- `frontend/app/robots.ts` (CREAR)
- `frontend/app/sitemap.ts` (CREAR)

**Criterio de aceptación:**
- `GET /robots.txt` retorna el contenido correcto
- `GET /sitemap.xml` retorna XML válido con todas las URLs
- `/admin/*` está excluido del sitemap y robots

---

### B1-01 — Swagger UI integrado en el servidor backend

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Backend |
| **Archivos** | `backend/src/app.ts`, `backend/openapi.yaml` |

**Problema actual:**
La API está documentada en `/openapi.yaml` y `/API.md` pero no hay interfaz interactiva. Los desarrolladores que integran deben leer archivos estáticos. Swagger UI resuelve esto.

**Implementar:**
- Instalar `swagger-ui-express` y `yaml`
- Montar Swagger UI en `/api/docs`
- Solo habilitado en `NODE_ENV !== 'production'` (o con flag especial)
- Importar el `openapi.yaml` existente
- Autenticación Bearer en Swagger UI para probar endpoints protegidos

**Archivos afectados:**
- `backend/package.json` (agregar swagger-ui-express, yaml)
- `backend/src/app.ts` (montar la ruta /api/docs)

**Criterio de aceptación:**
- `GET http://localhost:3001/api/docs` muestra Swagger UI
- Todos los endpoints documentados aparecen en la UI
- Se puede ejecutar requests de prueba desde la UI
- En producción la ruta no está disponible (o requiere auth especial)

---

### B1-02 — Logging profesional con Winston

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Backend |
| **Archivos** | `backend/src/utils/logger.ts` (reemplazar) |

**Problema actual:**
El logging actual usa `console.log/error` básicos. En producción necesitas logs estructurados (JSON), rotación de archivos, niveles de severidad, y poder buscar en logs fácilmente.

**Implementar:**
- Instalar `winston` y `winston-daily-rotate-file`
- Logger con niveles: `error`, `warn`, `info`, `http`, `debug`
- En desarrollo: output colorido a consola
- En producción: output JSON a consola + archivos rotativos en `/logs/`
- Middleware HTTP logger (reemplazar el actual)
- Incluir: timestamp, nivel, mensaje, metadata (userId, requestId, etc.)

**Archivos afectados:**
- `backend/package.json` (agregar winston, winston-daily-rotate-file)
- `backend/src/utils/logger.ts` (reescribir)
- `backend/src/middlewares/logger.ts` (actualizar para usar Winston)
- `backend/src/server.ts` (inicializar logger)

**Criterio de aceptación:**
- Los logs en producción son JSON estructurado
- Los logs incluyen timestamp y nivel de severidad
- Los archivos de log rotan diariamente
- Los errores críticos tienen nivel `error`, no `console.error`

---

## 4. Fase 2 — Calidad de código (Testing)

> **Objetivo:** Agregar cobertura de tests para asegurar que el código no se rompe con futuros cambios.
> **Referencia:** Mínimo 60% de cobertura en paths críticos (auth, carrito, checkout, orders).

---

### F2-01 — Configurar Jest + React Testing Library en Frontend

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Frontend |
| **Archivos** | `frontend/jest.config.ts`, `frontend/jest.setup.ts` (crear) |

**Implementar:**
- Instalar: `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Configurar `jest.config.ts` con soporte para TypeScript y path aliases (`@/`)
- Archivo `jest.setup.ts` con imports globales de `@testing-library/jest-dom`
- Script en `package.json`: `"test": "jest"`, `"test:watch": "jest --watch"`, `"test:coverage": "jest --coverage"`
- Mock de `next/navigation` (useRouter, useParams, etc.)
- Mock de módulos externos problemáticos

**Archivos afectados:**
- `frontend/package.json`
- `frontend/jest.config.ts` (crear)
- `frontend/jest.setup.ts` (crear)
- `frontend/tsconfig.json` (incluir archivos de test)

**Criterio de aceptación:**
- `npm test` corre sin errores en un archivo de ejemplo
- Los path aliases `@/components/...` resuelven correctamente en tests
- Cobertura de código es visible con `npm run test:coverage`

---

### F2-02 — Tests unitarios: Hooks críticos

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Frontend |
| **Bloqueado por** | F2-01 |
| **Archivos** | `frontend/__tests__/hooks/` (crear carpeta y archivos) |

**Tests a implementar:**

`useCart.test.ts`:
- Agregar item al carrito incrementa la cantidad
- Remover item lo elimina del estado
- `getTotalPrice()` calcula correctamente con múltiples items
- El carrito persiste en localStorage

`useAuth.test.ts`:
- `isAuthenticated` es `false` por defecto
- Después de `login()` exitoso, `isAuthenticated` es `true`
- Después de `logout()`, el token se limpia

`useOrders.test.ts`:
- `fetchAll()` llama a la API correctamente
- Los datos se almacenan en el estado
- Los errores de API se manejan sin crash

**Archivos afectados:**
- `frontend/__tests__/hooks/useCart.test.ts` (crear)
- `frontend/__tests__/hooks/useAuth.test.ts` (crear)
- `frontend/__tests__/hooks/useOrders.test.ts` (crear)

**Criterio de aceptación:**
- `npm test` pasa todos los tests sin errores
- Cobertura de hooks >= 70%

---

### F2-03 — Tests unitarios: Componentes críticos

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Frontend |
| **Bloqueado por** | F2-01 |
| **Archivos** | `frontend/__tests__/components/` (crear carpeta y archivos) |

**Tests a implementar:**

`ProductCard.test.tsx`:
- Renderiza nombre y precio del producto
- El botón "Add to Cart" llama al handler correcto
- El corazón de wishlist cambia estado al click

`Header.test.tsx`:
- El input de búsqueda actualiza el estado
- Presionar Enter navega a `/search?q=...`
- El badge del carrito muestra la cantidad correcta

`CartPage.test.tsx`:
- Renderiza los items del carrito
- El total se calcula correctamente
- "Remove" elimina el item del estado

**Archivos afectados:**
- `frontend/__tests__/components/ProductCard.test.tsx` (crear)
- `frontend/__tests__/components/Header.test.tsx` (crear)
- `frontend/__tests__/components/CartPage.test.tsx` (crear)

**Criterio de aceptación:**
- Todos los tests pasan
- Cobertura de componentes críticos >= 60%

---

### B2-01 — Configurar Jest en Backend

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Backend |
| **Archivos** | `backend/jest.config.ts` (crear o actualizar) |

**Problema actual:**
Hay un archivo de test (`analytics.service.test.ts`) pero Jest no está configurado correctamente. No hay scripts de test en package.json o son incompletos.

**Implementar:**
- Configurar `jest.config.ts` con `ts-jest`
- Setup de base de datos de test (PostgreSQL separada o mocks con `jest.mock`)
- Variables de entorno para tests (`.env.test`)
- Scripts: `"test": "jest"`, `"test:coverage": "jest --coverage"`
- Helper para crear/limpiar datos de test

**Archivos afectados:**
- `backend/package.json`
- `backend/jest.config.ts` (crear)
- `backend/.env.test` (crear)

**Criterio de aceptación:**
- `npm test` en `/backend` corre sin errores
- Los tests pueden importar módulos TypeScript correctamente

---

### B2-02 — Tests unitarios: Servicios críticos del Backend

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Backend |
| **Bloqueado por** | B2-01 |
| **Archivos** | `backend/src/modules/*/tests/` (crear en cada módulo) |

**Tests a implementar:**

`auth.service.test.ts`:
- `register()` hashea el password antes de guardar
- `login()` con credenciales correctas retorna token JWT válido
- `login()` con password incorrecto lanza error 401
- El token JWT contiene el userId y role correctos

`products.service.test.ts`:
- `getAll()` retorna lista paginada
- `getById()` retorna producto por ID
- `getById()` con ID inexistente lanza 404
- `create()` sin permisos ADMIN lanza 403

`orders.service.test.ts`:
- `create()` calcula el total correctamente
- `create()` reduce el stock de los productos
- `updateStatus()` cambia el estado de la orden
- `getByUser()` solo retorna órdenes del usuario autenticado

**Archivos afectados:**
- `backend/src/modules/auth/__tests__/auth.service.test.ts` (crear)
- `backend/src/modules/products/__tests__/products.service.test.ts` (crear)
- `backend/src/modules/orders/__tests__/orders.service.test.ts` (crear)

**Criterio de aceptación:**
- Todos los tests pasan
- Cobertura de servicios críticos >= 70%

---

## 5. Fase 3 — Mobile completo

> **Objetivo:** Completar todas las pantallas del mobile para que tenga paridad funcional con el frontend web (flujo de compra completo).
> **Nota:** Hay stores (Zustand), hooks, servicios API y componentes base ya implementados. Las pantallas solo necesitan conectar esas piezas.

---

### M3-01 — Register screen: Registro de usuario

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Mobile |
| **Archivo** | `mobile/app/(auth)/register.tsx` |

**Problema actual:**
El archivo existe pero no tiene implementación funcional. Un usuario nuevo no puede crear cuenta desde el mobile.

**Implementar:**
- Formulario: firstName, lastName, email, password, confirmPassword
- Validación con `lib/validation.ts` (ya existe)
- Componente `PasswordStrength` ya disponible en `components/`
- Llamar a `authService.register()` (ya implementado en `lib/services.ts`)
- Al éxito: guardar token con `auth store`, navegar a `/(app)/`
- Manejo de errores: email ya registrado, validación backend

**Criterio de aceptación:**
- Usuario puede registrarse y es redirigido al home
- Errores de validación se muestran inline
- El indicador de fuerza de contraseña funciona

---

### M3-02 — Home screen: Productos reales con recomendaciones

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Mobile |
| **Archivo** | `mobile/app/(app)/index.tsx` |

**Problema actual:**
El Home muestra cards hardcodeadas. No carga datos reales del backend.

**Implementar:**
- Sección "Featured Products": usar `recommendationService.getTrending()` (ya existe en services)
- Sección "New Arrivals": usar `useProducts` hook (ya existe)
- Sección "Categories": fetch de categorías del backend
- Componente `ProductCard` (ya existe en `components/`) para cada producto
- Pull-to-refresh para recargar
- Skeleton loading mientras carga
- Tap en ProductCard navega a `/products/[id]`

**Criterio de aceptación:**
- Home carga productos reales del backend
- Funciona el pull-to-refresh
- Tap en producto abre el detalle

---

### M3-03 — Search screen: Búsqueda de productos

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Mobile |
| **Archivo** | `mobile/app/(app)/search.tsx` |

**Problema actual:**
La pantalla muestra solo "Funcionalidad en desarrollo".

**Implementar:**
- Input de búsqueda con debounce (300ms)
- Historial de búsqueda reciente (usar `search-history store` — ya existe)
- Resultados en tiempo real usando `useProducts.searchProducts()` (ya existe)
- Filtros básicos: precio, categoría, rating
- ProductCard para cada resultado
- Estado vacío cuando no hay resultados
- Estado de carga mientras busca

**Criterio de aceptación:**
- La búsqueda retorna resultados reales del backend
- El historial de búsqueda persiste entre sesiones
- Los filtros funcionan correctamente

---

### M3-04 — Cart screen: Carrito de compras

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Mobile |
| **Archivo** | `mobile/app/(app)/cart.tsx` |

**Problema actual:**
La pantalla muestra solo "Funcionalidad en desarrollo". El `cart store` de Zustand ya está completamente implementado.

**Implementar:**
- Lista de items del carrito (desde `cart store`)
- Imagen, nombre, precio, cantidad de cada item
- Botones +/- para cambiar cantidad (usar `cart store.updateQuantity`)
- Botón eliminar item (usar `cart store.removeItem`)
- Resumen: subtotal, shipping, total
- Botón "Proceed to Checkout" → navega a `/checkout`
- Estado vacío cuando el carrito está vacío con link a productos

**Criterio de aceptación:**
- El carrito muestra los items agregados desde cualquier pantalla
- Cambiar cantidad actualiza el total en tiempo real
- Eliminar item funciona correctamente

---

### M3-05 — Wishlist screen: Lista de deseos

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Mobile |
| **Archivo** | `mobile/app/(app)/wishlist.tsx` |

**Problema actual:**
La pantalla muestra solo "Funcionalidad en desarrollo". El `wishlist store` y `useWishlist hook` ya están implementados.

**Implementar:**
- Lista de productos en el wishlist (usar `useWishlist hook`)
- ProductCard con botón "Remove from Wishlist"
- Botón "Add to Cart" en cada item
- Estado vacío cuando wishlist está vacío
- Sincronizar con backend API (`GET /api/wishlist`)

**Criterio de aceptación:**
- Los items del wishlist persisten entre sesiones
- "Add to Cart" funciona correctamente
- "Remove" elimina del estado local y del backend

---

### M3-06 — Profile screen: Perfil del usuario

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Mobile |
| **Archivo** | `mobile/app/(app)/profile.tsx` |

**Problema actual:**
La pantalla muestra solo "Funcionalidad en desarrollo".

**Implementar:**
- Datos del usuario: nombre, email, avatar
- Menú de opciones: Mis Órdenes, Direcciones, Configuración, Logout
- Botón "Edit Profile" → formulario inline o modal
- Guardar cambios con `PUT /api/users/me`
- Botón "Logout" limpia el auth store y navega a login
- Sección de stats: total de órdenes, items en wishlist

**Criterio de aceptación:**
- El perfil carga los datos reales del usuario autenticado
- El logout limpia la sesión y redirige a login
- Editar nombre/email funciona y persiste

---

### M3-07 — Product Detail screen: Detalle de producto

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Mobile |
| **Archivo** | `mobile/app/(app)/products/[id].tsx` |

**Estado actual:**
El archivo existe pero necesita verificación y posiblemente completar la implementación.

**Revisar e implementar (si falta):**
- Galería de imágenes (ScrollView horizontal)
- Nombre, precio, descripción del producto
- Selector de cantidad
- Botón "Add to Cart" → `cart store.addItem()`
- Botón "Add to Wishlist" → `wishlist store.toggleItem()`
- Tab de Reviews: lista de reviews del producto
- Productos similares: `recommendationService.getSimilar()`

**Criterio de aceptación:**
- La pantalla carga datos reales del backend con `useProductDetail(id)`
- "Add to Cart" agrega el producto al carrito
- Las reviews del producto se muestran

---

### M3-08 — Orders screens: Mis órdenes y detalle

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟠 ALTO |
| **Sistema** | Mobile |
| **Archivos** | `mobile/app/(app)/orders.tsx`, `mobile/app/(app)/orders/[id].tsx` |

**Estado actual:**
Los archivos existen pero necesitan verificación y completar implementación.

**Implementar en `orders.tsx`:**
- Lista de órdenes del usuario (`GET /api/orders`)
- Filtro por estado: pending, shipped, delivered
- Cada orden muestra: ID, fecha, total, estado
- Tap en orden navega al detalle

**Implementar en `orders/[id].tsx`:**
- Detalle completo de la orden
- Lista de items con imagen, nombre, precio, cantidad
- Timeline del estado de la orden
- Dirección de entrega
- Total con desglose (subtotal + tax + shipping)
- Botón "Download Invoice" (texto plano)

**Criterio de aceptación:**
- Las órdenes se cargan del backend real
- El timeline de estado es visual y correcto
- El detalle muestra toda la información relevante

---

### M3-09 — Checkout screen: Proceso de pago

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🔴 CRÍTICO |
| **Sistema** | Mobile |
| **Archivo** | `mobile/app/(app)/checkout.tsx` |

**Estado actual:**
El archivo existe pero necesita verificación y completar implementación.

**Implementar:**
- Paso 1 — Dirección de envío: formulario con campos (nombre, dirección, ciudad, etc.)
- Paso 2 — Método de envío: Standard (gratis) / Express ($15)
- Paso 3 — Pago: inputs de tarjeta (número, expiry, CVV)
- Resumen de orden al lado o debajo
- Botón "Place Order": llama a `POST /api/orders` con `cartService.checkout()`
- Pantalla de confirmación inline (modal o pantalla nueva)
- Limpiar el carrito (`cart store.clearCart()`) al confirmar

**Criterio de aceptación:**
- El flujo de 3 pasos funciona completamente
- La orden se crea en el backend
- El carrito se vacía al confirmar la orden

---

## 6. Fase 4 — Profesionalización

> **Objetivo:** Agregar herramientas de calidad profesional: E2E tests, error tracking, SEO avanzado y accesibilidad.

---

### F4-01 — SEO metadata dinámica por página

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟡 MEDIO |
| **Sistema** | Frontend |

**Problema actual:**
Todas las páginas comparten el mismo `title` y `description` definidos en el layout raíz. Google no puede diferenciar páginas de productos.

**Implementar en las páginas más importantes:**

`/products/[id]`:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await fetch(`/api/products/${params.id}`);
  return {
    title: `${product.name} — FlexiCommerce`,
    description: product.description.slice(0, 160),
    openGraph: { images: [product.image] },
  };
}
```

`/category/[slug]`:
- `title`: `${category.name} — FlexiCommerce`
- `description`: Descripción de la categoría

`/search`:
- `title` dinámico basado en el query

**Archivos afectados:**
- `frontend/app/(storefront)/products/[id]/page.tsx`
- `frontend/app/(storefront)/category/[slug]/page.tsx`
- `frontend/app/(storefront)/search/page.tsx`

**Criterio de aceptación:**
- Cada página de producto tiene su propio title y description
- Las Open Graph tags permiten previews en redes sociales

---

### F4-02 — E2E tests con Playwright

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟡 MEDIO |
| **Sistema** | Frontend |
| **Archivos** | `frontend/playwright.config.ts` y `frontend/e2e/` (crear) |

**Implementar configuración y 3 flujos críticos:**

`e2e/auth.spec.ts`:
1. Usuario puede registrarse
2. Usuario puede hacer login
3. Login con credenciales incorrectas muestra error

`e2e/shopping-flow.spec.ts`:
1. Usuario busca un producto
2. Lo agrega al carrito
3. El badge del carrito se actualiza

`e2e/checkout.spec.ts`:
1. Usuario logueado va al checkout
2. Completa el formulario de dirección
3. Selecciona método de envío
4. Confirma la orden
5. Ve la pantalla de confirmación

**Criterio de aceptación:**
- Los 3 flujos E2E pasan consistentemente
- Los tests corren en CI/CD (GitHub Actions)

---

### F4-03 — Sentry: Error tracking en Frontend y Backend

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟡 MEDIO |
| **Sistema** | Frontend + Backend |

**Frontend (`@sentry/nextjs`):**
- Inicializar Sentry en `_app` o `layout.tsx`
- Capturar errores no manejados automáticamente
- Agregar contexto de usuario (userId, email) cuando está autenticado
- Configurar source maps para errores legibles

**Backend (`@sentry/node`):**
- Inicializar en `server.ts`
- Integrar con Express (request handler + error handler)
- Capturar errores del error handler global
- Agregar contexto de request (userId, endpoint, método)

**Archivos afectados:**
- `frontend/sentry.client.config.ts` (crear)
- `frontend/sentry.server.config.ts` (crear)
- `backend/src/server.ts`
- `backend/src/middlewares/errorHandler.ts`

**Criterio de aceptación:**
- Un error lanzado intencionalmente aparece en el dashboard de Sentry
- El error incluye el stack trace y contexto del usuario
- Las variables de entorno `SENTRY_DSN` están en `.env.example`

---

### F4-04 — Accesibilidad WCAG 2.1

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟡 MEDIO |
| **Sistema** | Frontend |

**Implementar en componentes más usados:**

Botones sin texto visible:
```tsx
// Antes:
<button onClick={handleWishlist}><HeartIcon /></button>

// Después:
<button onClick={handleWishlist} aria-label="Agregar a favoritos">
  <HeartIcon aria-hidden="true" />
</button>
```

Imágenes:
- Agregar `alt` descriptivo en todos los `<img>` y `<Image />`

Formularios:
- Agregar `<label>` asociado a cada `<input>` con `htmlFor`
- Mensajes de error con `role="alert"`

Navegación:
- Agregar `aria-current="page"` en links activos del nav
- Skip link: "Ir al contenido principal"

**Herramienta de verificación:**
- Instalar `jest-axe` para tests de accesibilidad automáticos

**Criterio de aceptación:**
- Navegación por teclado funciona en el flujo de compra completo
- Sin errores críticos de axe en las páginas principales
- Todas las imágenes tienen `alt` descriptivo

---

### M4-01 — Tests mobile (Jest + React Native Testing Library)

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟡 MEDIO |
| **Sistema** | Mobile |

**Implementar:**
- Configurar Jest con preset `jest-expo`
- Instalar `@testing-library/react-native`
- Tests para componentes principales:
  - `ProductCard.test.tsx`
  - `Button.test.tsx`
- Tests para stores:
  - `cart.store.test.ts`
  - `auth.store.test.ts`

**Criterio de aceptación:**
- `npm test` pasa en `/mobile`
- Cobertura básica de stores y componentes

---

## 7. Fase 5 — Escalabilidad

> **Objetivo:** Preparar el sistema para manejar carga real y múltiples idiomas.
> **Nota:** Esta fase es futura. No iniciar hasta que las fases 1-4 estén completas.

---

### F5-01 — i18n: Soporte multiidioma (Español / Inglés)

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟢 BAJO |
| **Sistema** | Frontend |

**Implementar con `next-intl`:**
- Estructura de traducciones en `messages/es.json` y `messages/en.json`
- Middleware de i18n para detectar idioma del navegador
- Selector de idioma en el Header
- Traducir: navegación, CTAs, formularios, mensajes de error

**Archivos afectados:**
- `frontend/middleware.ts` (extender el existente)
- `frontend/messages/es.json` (crear)
- `frontend/messages/en.json` (crear)
- `frontend/i18n.ts` (crear)

---

### B5-01 — Rate limiting distribuido con Redis

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟢 BAJO |
| **Sistema** | Backend |

**Problema actual:**
El rate limiting actual es en memoria. Con múltiples instancias del servidor (horizontal scaling), cada instancia tiene su propio contador — un usuario puede hacer 100 requests por instancia, evadiendo el límite real.

**Implementar:**
- Instalar `rate-limiter-flexible` con adaptador Redis
- Reemplazar el rate limiter en-memoria en `enhanced.ts`
- Límites por IP y por usuario autenticado
- Endpoints de auth con límites más estrictos (5 intentos/15min)

---

### F5-02 — PWA: Progressive Web App

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟢 BAJO |
| **Sistema** | Frontend |

**Implementar con `next-pwa`:**
- Service worker para cache de assets estáticos
- Manifest de la app (nombre, iconos, colores)
- "Install App" prompt en mobile browsers
- Soporte offline básico para páginas visitadas

---

### D5-01 — Monitoring de performance (Web Vitals + Métricas)

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟢 BAJO |
| **Sistema** | DevOps |

**Implementar:**
- Reportar Core Web Vitals (LCP, FID, CLS) a un endpoint de analytics
- Dashboard de Grafana + Prometheus para métricas del backend
- Alertas cuando el tiempo de respuesta supera 500ms

---

### D5-02 — Load testing con k6

| Campo | Valor |
|-------|-------|
| **Estado** | ⬜ PENDIENTE |
| **Prioridad** | 🟢 BAJO |
| **Sistema** | DevOps |

**Implementar scripts de carga:**
- Script de carga normal: 100 usuarios concurrentes
- Script de pico de tráfico: 1000 usuarios en 30 segundos
- Identificar cuellos de botella en endpoints críticos (GET /products, POST /orders)

---

## 8. Tracker de progreso global

> Actualizar este tracker cada vez que se completa una tarea.

### FASE 1 — Producción segura

| ID | Tarea | Sistema | Prioridad | Estado |
|----|-------|---------|-----------|--------|
| F1-01 | middleware.ts — protección de rutas | Frontend | 🔴 CRÍTICO | ✅ COMPLETADA |
| F1-02 | error.tsx — página de error global | Frontend | 🔴 CRÍTICO | ✅ COMPLETADA |
| F1-03 | not-found.tsx — página 404 | Frontend | 🔴 CRÍTICO | ✅ COMPLETADA |
| F1-04 | robots.txt + sitemap.xml | Frontend | 🔴 CRÍTICO | ✅ COMPLETADA |
| B1-01 | Swagger UI en servidor | Backend | 🟠 ALTO | ✅ COMPLETADA |
| B1-02 | Logging con Winston | Backend | 🟠 ALTO | ✅ COMPLETADA |

**Progreso Fase 1: 6/6 (100%)**

---

### FASE 2 — Testing

| ID | Tarea | Sistema | Prioridad | Estado |
|----|-------|---------|-----------|--------|
| F2-01 | Configurar Jest + RTL en frontend | Frontend | 🟠 ALTO | ✅ COMPLETADA |
| F2-02 | Tests unitarios — hooks críticos | Frontend | 🟠 ALTO | ✅ COMPLETADA |
| F2-03 | Tests unitarios — componentes | Frontend | 🟠 ALTO | ✅ COMPLETADA |
| B2-01 | Configurar Jest en backend | Backend | 🟠 ALTO | ✅ COMPLETADA |
| B2-02 | Tests unitarios — servicios backend | Backend | 🟠 ALTO | ✅ COMPLETADA |

**Progreso Fase 2: 5/5 (100%)**

---

### FASE 3 — Mobile completo

| ID | Tarea | Sistema | Prioridad | Estado |
|----|-------|---------|-----------|--------|
| M3-01 | Register screen | Mobile | 🔴 CRÍTICO | ✅ COMPLETADA |
| M3-02 | Home screen — datos reales | Mobile | 🔴 CRÍTICO | ✅ COMPLETADA |
| M3-03 | Search screen | Mobile | 🔴 CRÍTICO | ✅ COMPLETADA |
| M3-04 | Cart screen | Mobile | 🔴 CRÍTICO | ✅ COMPLETADA |
| M3-05 | Wishlist screen | Mobile | 🟠 ALTO | ✅ COMPLETADA |
| M3-06 | Profile screen | Mobile | 🟠 ALTO | ✅ COMPLETADA |
| M3-07 | Product detail screen | Mobile | 🔴 CRÍTICO | ✅ COMPLETADA |
| M3-08 | Orders screens | Mobile | 🟠 ALTO | ✅ COMPLETADA |
| M3-09 | Checkout screen | Mobile | 🔴 CRÍTICO | ✅ COMPLETADA |

**Progreso Fase 3: 9/9 (100%)**

---

### FASE 4 — Profesionalización

| ID | Tarea | Sistema | Prioridad | Estado |
|----|-------|---------|-----------|--------|
| F4-01 | SEO metadata dinámica por página | Frontend | 🟡 MEDIO | ✅ COMPLETADA |
| F4-02 | E2E tests con Playwright | Frontend | 🟡 MEDIO | ✅ COMPLETADA |
| F4-03 | Sentry — error tracking | Frontend + Backend | 🟡 MEDIO | ✅ COMPLETADA |
| F4-04 | Accesibilidad WCAG 2.1 | Frontend | 🟡 MEDIO | ✅ COMPLETADA |
| M4-01 | Tests mobile | Mobile | 🟡 MEDIO | ✅ COMPLETADA |

**Progreso Fase 4: 5/5 (100%)**

---

### FASE 5 — Escalabilidad

| ID | Tarea | Sistema | Prioridad | Estado |
|----|-------|---------|-----------|--------|
| F5-01 | i18n — soporte multiidioma | Frontend | 🟢 BAJO | ✅ COMPLETADA |
| B5-01 | Rate limiting con Redis | Backend | 🟢 BAJO | ✅ COMPLETADA |
| F5-02 | PWA — Progressive Web App | Frontend | 🟢 BAJO | ✅ COMPLETADA |
| D5-01 | Monitoring Web Vitals + Grafana | DevOps | 🟢 BAJO | ✅ COMPLETADA |
| D5-02 | Load testing con k6 | DevOps | 🟢 BAJO | ✅ COMPLETADA |

**Progreso Fase 5: 5/5 (100%)**

---

### RESUMEN GLOBAL

| Fase | Total | Completadas | Progreso |
|------|-------|-------------|----------|
| Fase 1 — Producción segura | 6 | 6 | 100% |
| Fase 2 — Testing | 5 | 5 | 100% |
| Fase 3 — Mobile completo | 9 | 9 | 100% |
| Fase 4 — Profesionalización | 5 | 5 | 100% |
| Fase 5 — Escalabilidad | 5 | 5 | 100% |
| **TOTAL** | **30** | **30** | **100%** |

> **Auditado y verificado:** 2026-02-28
> Tests reales pasando: Frontend 53 tests (8 suites) ✅ | Backend 16 tests (3 suites) ✅ | Mobile 21 tests (4 suites) ✅ | **Total: 90 tests**

---

## 9. Reglas para actualizar este documento

1. **Al iniciar una tarea:** Cambiar estado a `🔄 EN CURSO`
2. **Al completar una tarea:** Cambiar estado a `✅ COMPLETADA` y actualizar el contador de progreso
3. **No saltarse fases.** Fase 1 debe estar completa antes de empezar Fase 2. Excepciones: Fase 3 (Mobile) puede hacerse en paralelo con Fase 2.
4. **Dentro de cada fase,** las tareas con `🔴 CRÍTICO` van primero.
5. **Si se descubre un nuevo gap** durante la implementación, agregarlo a la sección correspondiente antes de trabajar en él.
6. **Nunca marcar como completada** una tarea sin que sus criterios de aceptación estén verificados.
7. **Si una tarea bloquea a otra,** documentar el bloqueo en el campo "Bloqueado por".
