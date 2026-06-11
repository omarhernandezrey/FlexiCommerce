# AUDITORÍA PROFESIONAL — ADMIN CUPONES (/admin/coupons)

**Proyecto:** FlexiCommerce
**Fecha:** 2026-03-13
**Auditor:** Equipo de Auditoría IA
**Alcance:** Página admin de cupones, backend de cupones, integración con checkout y órdenes
**Archivos auditados:** 15+ archivos entre frontend y backend

---

## RESUMEN EJECUTIVO

La página de administración de cupones (`/admin/coupons`) tenía una UI frontend completa con CRUD, estadísticas y búsqueda. Sin embargo, **el backend NO tenía módulo de cupones** — no había modelo Prisma, no había rutas, no había servicio. Toda la página era inoperativa (404 en todas las llamadas API). Además, el checkout del storefront también dependía de este endpoint inexistente.

**Todas las correcciones han sido implementadas y verificadas.**

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| CRÍTICO | 4 | ✅ Completados |
| ALTO | 5 | ✅ Completados |
| MEDIO | 5 | ✅ Completados |
| BAJO | 4 | ✅ Completados |

**Total: 18 hallazgos — 18/18 corregidos**

---

## SECCIÓN 1: HALLAZGOS CRÍTICOS

### C-01: NO existe modelo Coupon en Prisma — el backend no tiene tabla de cupones ✅
- **Archivo:** `backend/prisma/schema.prisma`
- **Problema:** No había modelo `Coupon`. La tabla no existía en la base de datos.
- **Corrección aplicada:**
  - [x] Modelo `Coupon` creado con campos: id, code (unique), type, value, minOrderAmount, maxUses, usedCount, expiresAt, isActive, description, createdAt, updatedAt
  - [x] Migración ejecutada con `prisma db push`

### C-02: NO existe módulo de cupones en el backend ✅
- **Archivo:** `backend/src/modules/coupons/`
- **Problema:** No había archivos de servicio, controlador ni rutas.
- **Corrección aplicada:**
  - [x] `coupons.service.ts` creado con: getAll (paginado + búsqueda), getByCode, getById, create, update, delete, incrementUsage, validateForCheckout, calculateDiscount
  - [x] `coupons.controller.ts` creado con validaciones robustas (CODE_REGEX, tipo percentage/fixed, max 100%, minOrderAmount, maxUses)
  - [x] `coupons.routes.ts` creado con GET/POST (público), POST /validate (auth), POST/GET/:id/PUT/:id/DELETE/:id (ADMIN)
  - [x] Registrado en `app.ts`

### C-03: Frontend usa rutas sin prefijo `/api/` ✅
- **Archivo:** `frontend/app/admin/coupons/page.tsx`
- **Problema:** Las llamadas usaban `/coupons` en vez de `/api/coupons`.
- **Corrección aplicada:**
  - [x] Todas las llamadas cambiadas a `/api/coupons`, `/api/coupons/${id}`

### C-04: Checkout usa `/coupons?code=X` sin prefijo ✅
- **Archivo:** `frontend/app/checkout/page.tsx`
- **Problema:** `apiClient.get('/coupons?code=...')` — mismo error de prefijo.
- **Corrección aplicada:**
  - [x] Cambiado a `/api/coupons?code=...`
  - [x] Parseo de respuesta normalizado al patrón estándar

---

## SECCIÓN 2: HALLAZGOS DE SEVERIDAD ALTA

### A-01: Backend no valida cupones al crear orden ✅
- **Archivo:** `backend/src/modules/orders/orders.service.ts`
- **Problema:** El backend aceptaba `options.discount` directamente del frontend sin verificar cupón.
- **Corrección aplicada:**
  - [x] Si se envía `couponCode`, el backend: busca cupón, valida (activo, no expirado, min amount, max uses), calcula descuento real, incrementa `usedCount`
  - [x] No confía en descuento del frontend — calcula server-side
  - [x] Frontend (checkout) envía `couponCode` en el payload de orden
  - [x] Tipo actualizado en `api.service.ts` y `useOrders.ts` para incluir `couponCode?: string`

### A-02: No hay validación de porcentaje máximo ✅
- **Problema:** Sin validación de que percentage value no exceda 100.
- **Corrección aplicada:**
  - [x] Backend valida en `coupons.controller.ts`: si `type='percentage'`, `value` debe ser 0-100
  - [x] Frontend valida en `handleSave` antes de enviar

### A-03: Código de cupón auto-generado es muy débil ✅
- **Archivo:** `frontend/app/admin/coupons/page.tsx`
- **Problema:** `Math.random().toString(36)` genera códigos predecibles.
- **Corrección aplicada:**
  - [x] Generador usa `crypto.getRandomValues()` con 10 caracteres del set `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (sin O/0/I/1 ambiguos)

### A-04: Toggle active envía PUT completo sin necesidad ✅
- **Archivo:** `frontend/app/admin/coupons/page.tsx`
- **Problema:** `handleToggleActive` enviaba todo el objeto cupón con spread.
- **Corrección aplicada:**
  - [x] Solo envía `{ isActive: !coupon.isActive }` al PUT

### A-05: `handleDelete` usa `window.confirm` ✅
- **Problema:** `confirm()` nativo rompe la estética.
- **Corrección aplicada:**
  - [x] Modal de confirmación personalizado integrado con diseño consistente, botones Cancelar/Eliminar, muestra código del cupón

---

## SECCIÓN 3: HALLAZGOS DE SEVERIDAD MEDIA

### M-01: Paginación en backend ✅
- **Problema:** `GET /coupons` cargaba todos sin paginar.
- **Corrección aplicada:**
  - [x] Backend soporta `?page=N&limit=N&search=...` con paginación real
  - [x] Respuesta incluye `data`, `total`, `page`, `totalPages`

### M-02: Filtro por estado (activo/inactivo/vencido) ✅
- **Problema:** Solo había búsqueda por texto.
- **Corrección aplicada:**
  - [x] Tabs de filtro: Todos, Activos, Inactivos, Vencidos con contadores

### M-03: Parseo de respuesta API inconsistente ✅
- **Problema:** `res.data.coupons || res.data || []` — múltiples formas.
- **Corrección aplicada:**
  - [x] Normalizado a `(res.data as any)?.data ?? res.data ?? []` (patrón estándar del app)

### M-04: Errores de API se tragan silenciosamente ✅
- **Problema:** `catch { setCoupons([]); }` — lista vacía sin error.
- **Corrección aplicada:**
  - [x] Toast de error al fallar la carga
  - [x] Estado `fetchError` con UI de error y botón "Reintentar"
  - [x] Errores en save/delete/toggle muestran mensaje del backend

### M-05: Monto mínimo sin formato COP ✅
- **Problema:** `mín ${coupon.minOrderAmount}` mostraba número crudo.
- **Corrección aplicada:**
  - [x] Usa `formatCOP(coupon.minOrderAmount)` importado de `@/lib/format`

---

## SECCIÓN 4: HALLAZGOS DE SEVERIDAD BAJA

### B-01: Switch toggle usa clase Tailwind inexistente ✅
- **Problema:** `translate-x-4.5` no es clase estándar de Tailwind.
- **Corrección aplicada:**
  - [x] Cambiado a `translate-x-[18px]` (valor arbitrario válido)

### B-02: Skeletons de carga genéricos ✅
- **Problema:** Rectángulos sin estructura interna.
- **Corrección aplicada:**
  - [x] Skeletons con estructura que imita: badge de código (w-28 h-10), líneas de texto (h-4 w-48, h-3 w-32), botones de acción

### B-03: Descuento fixed sin formato COP ✅
- **Problema:** `$${coupon.value} de descuento` mostraba estilo USD.
- **Corrección aplicada:**
  - [x] Usa `formatCOP(coupon.value)` para tipo fixed, `${value}%` para percentage

### B-04: `createdAt` no se muestra ✅
- **Problema:** Sin información de cuándo se creó el cupón.
- **Corrección aplicada:**
  - [x] Campo `createdAt` agregado a la interfaz `Coupon`
  - [x] Mostrado en la lista como "Creado: dd/mm/yyyy" con formato `es-CO`

---

## ARCHIVOS MODIFICADOS

### Backend (creados/modificados)
| Archivo | Cambio |
|---------|--------|
| `backend/prisma/schema.prisma` | Modelo Coupon agregado |
| `backend/src/modules/coupons/coupons.service.ts` | Nuevo — CRUD + validación + paginación |
| `backend/src/modules/coupons/coupons.controller.ts` | Nuevo — handlers con validaciones |
| `backend/src/modules/coupons/coupons.routes.ts` | Nuevo — rutas público/auth/admin |
| `backend/src/app.ts` | Import + registro de rutas coupons |
| `backend/src/modules/orders/orders.service.ts` | Validación server-side de cupones en create |
| `backend/src/modules/orders/orders.controller.ts` | Pasa couponCode a service |

### Frontend (modificados)
| Archivo | Cambio |
|---------|--------|
| `frontend/app/admin/coupons/page.tsx` | Reescrito completo: prefijo /api/, formatCOP, modal delete, tabs filtro, skeletons, crypto code gen, toggle fix, createdAt |
| `frontend/app/checkout/page.tsx` | Prefijo /api/, envía couponCode al backend, parseo normalizado |
| `frontend/hooks/useOrders.ts` | Tipo create incluye couponCode |
| `frontend/lib/api.service.ts` | Tipo create incluye couponCode |

## VERIFICACIÓN

- [x] Backend compila sin errores (`tsc --noEmit`)
- [x] Frontend compila sin errores (solo pre-existentes en test de auth store)
- [x] Tests frontend: 46 passed, 7 failed (pre-existentes en CartPage — no relacionados)
- [x] Todas las rutas usan prefijo `/api/`
- [x] Cupones se validan server-side al crear orden

---

*Documento generado y verificado por el Equipo de Auditoría — FlexiCommerce 2026-03-13*
