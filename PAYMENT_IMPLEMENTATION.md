# FlexiCommerce — Plan de Implementación de Pagos Reales (Colombia)

**Versión:** 3.0
**Fecha:** 2026-03-02
**Procesador principal:** Wompi (by Bancolombia) — 100% disponible en Colombia
**Estado global:** ✅ Integración sandbox completa — Lista para pruebas reales

---

## Por qué Wompi

| Característica | Wompi |
|---|---|
| País | Colombia ✅ |
| Respaldo | Bancolombia (banco #1 de Colombia) |
| Tarjetas | Visa, Mastercard, Amex |
| PSE | ✅ Transferencia bancaria directa |
| Nequi | ✅ Billetera digital |
| Daviplata | ✅ Billetera digital |
| Bancolombia QR | ✅ Código QR |
| Efectivo | ✅ Bancolombia Corresponsal |
| Sandbox gratis | ✅ Disponible 24/7 |
| Registro | comercios.wompi.co |

---

## Métodos de Pago Disponibles con Wompi

| Código API | Descripción | Disponible |
|---|---|---|
| `CARD` | Tarjeta crédito/débito (Visa, MC, Amex) | ✅ |
| `PSE` | Débito bancario directo (todos los bancos) | ✅ |
| `NEQUI` | Billetera digital Nequi | ✅ |
| `DAVIPLATA` | Billetera digital Davivienda | ✅ |
| `BANCOLOMBIA_TRANSFER` | Transferencia Bancolombia | ✅ |
| `BANCOLOMBIA_QR` | Pago con QR Bancolombia | ✅ |
| `BANCOLOMBIA_COLLECT` | Efectivo en corresponsal | ✅ |
| `BANCOLOMBIA_BNPL` | Cuotas sin interés (mín. $100.000 COP) | ✅ |

---

## Entornos y URLs de la API

| Entorno | URL base |
|---|---|
| **Sandbox (pruebas)** | `https://sandbox.wompi.co/v1` |
| **Producción (real)** | `https://production.wompi.co/v1` |

### Formato de las llaves

| Tipo | Sandbox | Producción |
|---|---|---|
| Pública | `pub_test_XXXX` | `pub_prod_XXXX` |
| Privada | `prv_test_XXXX` | `prv_prod_XXXX` |
| Webhook | `test_events_XXXX` | `prod_events_XXXX` |
| Integridad | `test_integrity_XXXX` | `prod_integrity_XXXX` |

---

## Estado Actual del Sistema

### ✅ Completado — Backend

#### Estructura base (pre-existente)
- [x] Modelo `Order` en Prisma (id, userId, status, total, items[], payment)
- [x] Modelo `Payment` en Prisma (id, orderId, amount, method, status, transactionId)
- [x] Enumeraciones `OrderStatus`: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- [x] Enumeraciones `PaymentStatus`: PENDING, COMPLETED, FAILED, REFUNDED
- [x] `POST /api/orders` — crear orden autenticada
- [x] `GET /api/orders` — listar órdenes del usuario
- [x] `GET /api/orders/:id` — detalle con items y pago
- [x] `PATCH /api/orders/:id/status` — actualizar estado (admin)
- [x] Middleware de autenticación en rutas de pagos/órdenes
- [x] Tests unitarios de órdenes

#### Integración Wompi (implementado 2026-03-01)
- [x] Variables de entorno Wompi en `backend/.env`:
  - `WOMPI_ENV=sandbox`
  - `WOMPI_PUBLIC_KEY=pub_test_RHsCks1qXYxHztHRpMokSaZS4R6VvaUZ`
  - `WOMPI_PRIVATE_KEY=prv_test_P1fLQxtESizKSKBjESv6pHG00qsfYEa2`
  - `WOMPI_EVENTS_SECRET=test_events_opMKjoHieX5eT4zgqDMrmwmyaneYdJIT`
  - `WOMPI_INTEGRITY_SECRET=test_integrity_ItUOYA1YZmT04WsVsqBRaFAnr657pijM`
- [x] `WompiService` creado en `backend/src/services/wompi.service.ts`:
  - `getAcceptanceToken()` — `GET /v1/merchants/{pub_key}` (token requerido por transacción)
  - `generateIntegrityHash(reference, amountInCents, currency)` — SHA-256
  - `getTransaction(transactionId)` — consulta transacción con llave privada
  - `verifyWebhookSignature(rawBody, signature)` — verifica firma del webhook
  - `buildReference(orderId)` — genera referencia única `{orderId}-{timestamp36}`
  - `extractOrderId(reference)` — extrae orderId de la referencia
- [x] `payments.controller.ts` completamente reescrito:
  - `createWompiSession` — valida propiedad de la orden, obtiene acceptance_token, calcula hash, retorna datos de sesión
  - `verifyTransaction` — consulta transacción en Wompi; si APPROVED, crea Payment e idempotentemente actualiza orden a PROCESSING
  - `wompiWebhook` — verifica firma, maneja `transaction.updated` (APPROVED/DECLINED/VOIDED)
- [x] `payments.routes.ts` reescrito con nuevas rutas:
  - `POST /api/payments/wompi/webhook` — SIN autenticación (viene de servidores Wompi)
  - `POST /api/payments/wompi/session` — requiere autenticación
  - `POST /api/payments/wompi/verify/:transactionId` — requiere autenticación
- [x] `payments.service.ts` actualizado:
  - `updateByTransactionId(transactionId, status)` — actualizar por ID de transacción Wompi
  - `updateByOrderId(orderId, data)` — actualizar por ID de orden
  - `create()` acepta `transactionId` opcional
- [x] Esquema Prisma actualizado y sincronizado con `prisma db push`:
  - Campo `shippingAddress Json?` en modelo `Order`
  - Campo `shippingMethod String?` en modelo `Order`
  - Campo `shippingCost Decimal?` en modelo `Order`
  - Campo `currency String @default("COP")` en modelo `Order`
  - Valores `WOMPI`, `PSE`, `NEQUI`, `DAVIPLATA`, `BANCOLOMBIA_TRANSFER` en enum `PaymentMethod`
- [x] `orders.service.ts` actualizado — total calculado server-side (itemsTotal + shippingCost), acepta `shippingAddress`, `shippingMethod`, `shippingCost`, `currency`
- [x] `orders.controller.ts` actualizado — pasa campos de envío al servicio

### ✅ Completado — Frontend

#### Estructura base (pre-existente)
- [x] Checkout en 3 pasos: Envío → Pago → Revisión
- [x] `ShippingForm` con validación completa
- [x] Selección de método de envío (Estándar gratis / Express $15)
- [x] Resumen del pedido en sidebar con items y precios
- [x] Sistema de códigos promocionales conectado al backend
- [x] Cálculo de totales: subtotal + envío + impuesto (8%) - descuento
- [x] Página de confirmación que carga la orden desde el backend
- [x] `ProtectedRoute` — checkout requiere sesión
- [x] Redirección si no hay items en carrito
- [x] Carrito persistente en localStorage (Zustand)

#### Integración Wompi (implementado 2026-03-01)
- [x] Variables de entorno en `frontend/.env.local`:
  - `NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_RHsCks1qXYxHztHRpMokSaZS4R6VvaUZ`
  - `NEXT_PUBLIC_WOMPI_ENV=sandbox`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3002`
- [x] Hook `useWompiCheckout` en `frontend/hooks/useWompiCheckout.ts`:
  - Carga dinámicamente `https://checkout.wompi.co/widget.js`
  - `openCheckout({ orderId, customerEmail, customerName })` — llama `/api/payments/wompi/session`, abre `WidgetCheckout`, redirige a `/checkout/verificar`
- [x] Componente `WompiPaymentStep` en `frontend/components/checkout/WompiPaymentStep.tsx`:
  - Reemplaza el antiguo `PaymentForm` manual
  - Muestra todos los métodos de pago aceptados por Wompi
  - Badge de seguridad e información de PCI DSS
- [x] Página de verificación `frontend/app/checkout/verificar/page.tsx`:
  - Lee `?id=TRANSACTION_ID` de la URL
  - Envuelta en `<Suspense>` (requerido por `useSearchParams()` en Next.js)
  - Polling cada 3 segundos, máximo 20 intentos (60s para PSE)
  - Estados: loading (spinner), approved (redirige a confirmación), declined (UI de error), error (estado desconocido con transactionId)
- [x] `checkout/page.tsx` actualizado:
  - Importa `WompiPaymentStep` y `useWompiCheckout`
  - `handlePagarConWompi()` — crea la orden primero, luego abre el widget de Wompi
  - El botón de compra dice "Pagar con Wompi" y muestra los métodos aceptados
  - La orden se crea en estado PENDING antes del pago y se actualiza a PROCESSING tras aprobación
- [x] `lib/api.service.ts` actualizado — `Order` incluye `shippingMethod?`, `shippingCost?`, `currency?`, estados `processing` y `cancelled`
- [x] Carrito se limpia SOLO después de confirmación de pago exitoso (`clearCart()` en página de verificación)

---

## ❌ Pendiente — Lo que falta para producción real

### Configuración externa (acciones manuales — no código)

- [ ] **Registrar el webhook en el dashboard de Wompi**:
  - Ir a [comercios.wompi.co](https://comercios.wompi.co) → Desarrolladores → Webhooks
  - URL de sandbox: `https://TU-NGROK.ngrok.io/api/payments/wompi/webhook`
  - URL de producción: `https://tudominio.com/api/payments/wompi/webhook`
  - Evento a registrar: `transaction.updated`
- [ ] Crear cuenta verificada en **comercios.wompi.co** con RUT de empresa (para producción)
- [ ] Configurar cuenta bancaria en Wompi para recibir desembolsos (producción)

### Tests

- [ ] Tests unitarios del módulo de pagos con Wompi (`backend/src/modules/payments/__tests__/`)
  - Test de `createWompiSession` — mock de WompiService
  - Test de `verifyTransaction` — estados APPROVED, DECLINED, PENDING
  - Test de `wompiWebhook` — firma válida e inválida
- [ ] Tests E2E del flujo completo de pago (Playwright)
  - Flujo exitoso con tarjeta sandbox
  - Flujo rechazado
  - Estado PENDING con polling

### Administración

- [ ] Panel admin — vista de todas las transacciones con filtros (estado, método, fecha)
- [ ] Panel admin — columna con `transactionId` de Wompi para soporte al cliente
- [ ] Página de historial de órdenes del usuario con estado real del pago y `transactionId`
- [ ] Alertas cuando una transacción falla repetidamente

### Producción (cuando se esté listo para pagos reales)

- [ ] Dominio con HTTPS configurado (obligatorio para webhooks de Wompi)
- [ ] Cambiar llaves de `test_` a `prod_` en el servidor
- [ ] Cambiar `WOMPI_ENV=production` en el servidor
- [ ] Registrar webhook de producción en el dashboard con la URL real
- [ ] Probar un pago real de $1.000 COP antes del lanzamiento oficial
- [ ] Revisar configuración de IVA (19%) si aplica para los productos

---

## Arquitectura del Flujo de Pagos Implementado

```
CLIENTE (Browser)
│
├─ 1. Llena ShippingForm (nombre, dirección, ciudad, método de envío)
├─ 2. Selecciona método de envío (estándar $0 / express $15)
├─ 3. Revisa paso de pago → WompiPaymentStep (info de métodos disponibles)
├─ 4. Revisa el pedido final
├─ 5. Click "Pagar con Wompi"
│
│   checkout/page.tsx llama: POST /api/orders
│   Backend crea orden con estado PENDING + shippingAddress/shippingCost
│   │
│   checkout/page.tsx llama: POST /api/payments/wompi/session { orderId }
│   Backend obtiene: GET sandbox.wompi.co/v1/merchants/{pub_key} → acceptance_token
│   Backend calcula: SHA256(reference + amount + COP + integrity_secret) → hash
│   Backend retorna: { acceptance_token, public_key, reference, amount_in_cents }
│
├─ 6. Frontend abre Widget de Wompi:
│      new WidgetCheckout({
│        currency: 'COP',
│        amountInCents: totalEnCentavos,
│        reference: '{orderId}-{timestamp36}',
│        publicKey: 'pub_test_...',
│        redirectUrl: 'http://localhost:3002/checkout/verificar',
│        customerData: { email, fullName }
│      })
│
├─ 7. Cliente elige su método de pago dentro del Widget
│      (Wompi maneja la UI de forma segura — PCI DSS compliant)
│
├─ 8. Wompi procesa el pago
│
├─ 9. Widget llama el callback → window.location.href = /checkout/verificar?id={transactionId}
│
├─ 10. /checkout/verificar/page.tsx:
│       Polling → POST /api/payments/wompi/verify/{transactionId} (hasta 20 veces × 3s)
│       Backend consulta: GET sandbox.wompi.co/v1/transactions/{id}
│       │
│       Si APPROVED:
│         - Crea registro Payment en BD (idempotente — verifica si ya existe)
│         - Actualiza Order.status = PROCESSING
│         - Retorna { status: 'APPROVED', orderId }
│         - Frontend: clearCart() → redirect /checkout/confirmation?orderId=XXX
│       │
│       Si DECLINED/ERROR:
│         - Muestra UI de error con opciones de reintentar o volver al carrito
│       │
│       Si PENDING (PSE):
│         - Sigue el polling hasta 60 segundos
│         - Si agota intentos → UI de estado desconocido con transactionId para soporte
│
└─ WEBHOOK (paralelo — Wompi notifica al servidor de forma asíncrona)
   POST /api/payments/wompi/webhook (sin autenticación JWT)
   Verifica: SHA256(rawBody + events_secret) === x-wompi-signature
   Evento: transaction.updated
   ├─ status: APPROVED  → Order.status = PROCESSING, Payment.status = COMPLETED
   ├─ status: DECLINED  → Order.status = CANCELLED, Payment.status = FAILED
   └─ status: VOIDED    → Payment.status = REFUNDED
```

---

## Archivos Creados/Modificados

### Backend
| Archivo | Estado | Descripción |
|---|---|---|
| `backend/src/services/wompi.service.ts` | 🆕 Creado | Servicio completo de Wompi |
| `backend/src/modules/payments/payments.controller.ts` | ✏️ Reescrito | 3 endpoints: session, verify, webhook |
| `backend/src/modules/payments/payments.routes.ts` | ✏️ Reescrito | Rutas Wompi (webhook sin JWT) |
| `backend/src/modules/payments/payments.service.ts` | ✏️ Actualizado | Métodos updateByTransactionId/updateByOrderId |
| `backend/src/modules/orders/orders.service.ts` | ✏️ Actualizado | Acepta shipping data, calcula total server-side |
| `backend/src/modules/orders/orders.controller.ts` | ✏️ Actualizado | Pasa shippingAddress/Method/Cost al servicio |
| `backend/prisma/schema.prisma` | ✏️ Actualizado | Nuevos campos en Order, enum PaymentMethod |
| `backend/.env` | ✏️ Actualizado | 5 variables de Wompi sandbox |

### Frontend
| Archivo | Estado | Descripción |
|---|---|---|
| `frontend/hooks/useWompiCheckout.ts` | 🆕 Creado | Hook para abrir el widget de Wompi |
| `frontend/app/checkout/verificar/page.tsx` | 🆕 Creado | Verificación de pago con polling |
| `frontend/components/checkout/WompiPaymentStep.tsx` | 🆕 Creado | UI informativa del paso de pago |
| `frontend/app/checkout/page.tsx` | ✏️ Actualizado | Integra Wompi, flujo orden → pago |
| `frontend/lib/api.service.ts` | ✏️ Actualizado | Tipos Order con shipping y currency |
| `frontend/.env.local` | ✏️ Actualizado | 3 variables Wompi/app URL |

---

## Variables de Entorno — Configuración Actual

### Backend (`backend/.env`)

```env
# ═══════════════════════════════════════
# WOMPI — Procesador de pagos Colombia
# ═══════════════════════════════════════
WOMPI_ENV=sandbox
WOMPI_PUBLIC_KEY=pub_test_RHsCks1qXYxHztHRpMokSaZS4R6VvaUZ
WOMPI_PRIVATE_KEY=prv_test_P1fLQxtESizKSKBjESv6pHG00qsfYEa2
WOMPI_EVENTS_SECRET=test_events_opMKjoHieX5eT4zgqDMrmwmyaneYdJIT
WOMPI_INTEGRITY_SECRET=test_integrity_ItUOYA1YZmT04WsVsqBRaFAnr657pijM

# URL del frontend (para redirects)
FRONTEND_URL=http://localhost:3002
```

### Frontend (`frontend/.env.local`)

```env
# ═══════════════════════════════════════
# WOMPI — Solo la llave pública va aquí
# ═══════════════════════════════════════
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_RHsCks1qXYxHztHRpMokSaZS4R6VvaUZ
NEXT_PUBLIC_WOMPI_ENV=sandbox
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## Datos de Prueba — Sandbox

### Tarjetas de prueba

| Número | Resultado |
|---|---|
| `4242 4242 4242 4242` | ✅ APROBADA |
| `4111 1111 1111 1111` | ❌ RECHAZADA |
| Vencimiento | Cualquier fecha futura (ej: 12/28) |
| CVC | Cualquier 3 dígitos (ej: 123) |

### PSE (sandbox)
- Seleccionar cualquier banco de la lista
- Ingresar cualquier número de documento válido
- La transacción queda en PENDING y luego pasa a APPROVED automáticamente (el polling de `/checkout/verificar` lo detecta)

### Nequi (sandbox)
- Usar número: `3991111111` → resultado APPROVED
- Usar número: `3991111112` → resultado DECLINED

---

## Cómo Probar el Flujo Completo

### Requisitos previos
```bash
# Terminal 1 — Base de datos
sudo service postgresql start

# Terminal 2 — Backend
cd backend && npx prisma generate && npm run dev

# Terminal 3 — Frontend
cd frontend && npm run dev
```

### Pasos para probar
1. Ir a `http://localhost:3002` e iniciar sesión (o registrarse)
2. Agregar productos al carrito
3. Ir a `/checkout`
4. Llenar datos de envío y continuar
5. En el paso de Pago, click "Continuar a Revisión"
6. En la revisión, click **"Pagar con Wompi"**
7. El widget de Wompi se abre — usar tarjeta `4242 4242 4242 4242`
8. Wompi redirige a `/checkout/verificar?id=XXX`
9. La página hace polling y detecta APPROVED
10. Redirige a `/checkout/confirmation?orderId=XXX` con el resumen

### Para probar el webhook localmente
```bash
# Instalar ngrok si no está instalado
npm install -g ngrok

# Exponer el backend
ngrok http 3001

# Registrar en comercios.wompi.co → Desarrolladores → Webhooks:
# URL: https://TU-SUBDOMAIN.ngrok.io/api/payments/wompi/webhook
# Evento: transaction.updated
```

---

## Checklist antes de ir a Producción

- [ ] Crear cuenta verificada en comercios.wompi.co (con RUT de empresa)
- [ ] Cambiar todas las llaves de `test_` a `prod_`
- [ ] Cambiar `WOMPI_ENV=production` en el servidor
- [ ] Dominio con HTTPS configurado (obligatorio para webhooks)
- [ ] Registrar webhook de producción en el dashboard de Wompi con la URL real
- [ ] Probar un pago real de $1.000 COP antes del lanzamiento oficial
- [ ] Configurar cuenta bancaria en Wompi para recibir los desembolsos
- [ ] Revisar la configuración de IVA (19%) si aplica para tu producto
- [ ] Asegurar que `WOMPI_PRIVATE_KEY` no esté expuesta en el frontend ni en logs

---

## Referencias Oficiales Wompi

| Recurso | URL |
|---|---|
| Registro de cuenta | [comercios.wompi.co](https://comercios.wompi.co) |
| Documentación principal | [docs.wompi.co/en/docs/colombia](https://docs.wompi.co/en/docs/colombia/) |
| Inicio rápido | [docs.wompi.co — Inicio Rápido](https://docs.wompi.co/en/docs/colombia/inicio-rapido/) |
| Transacciones API | [docs.wompi.co — Transacciones](https://docs.wompi.co/en/docs/colombia/transacciones/) |
| Widget / Checkout Web | [docs.wompi.co — Widget](https://docs.wompi.co/en/docs/colombia/widget-checkout-web/) |
| Métodos de pago | [docs.wompi.co — Métodos](https://docs.wompi.co/en/docs/colombia/metodos-de-pago/) |
| Datos de prueba sandbox | [docs.wompi.co — Sandbox](https://docs.wompi.co/en/docs/colombia/datos-de-prueba-en-sandbox/) |
| Fuentes de pago (tokenización) | [docs.wompi.co — Tokenización](https://docs.wompi.co/en/docs/colombia/fuentes-de-pago/) |
| Ambientes y llaves | [docs.wompi.co — Ambientes](https://docs.wompi.co/en/docs/colombia/ambientes-y-llaves/) |

---

*Documento actualizado: 2026-03-02. Integración sandbox completada. Wompi Colombia.*
