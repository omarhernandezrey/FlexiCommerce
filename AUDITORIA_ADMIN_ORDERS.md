# AUDITORIA PROFESIONAL: Admin Ordenes
### FlexiCommerce - Vista `/admin/orders` y `/admin/orders/[id]`
**Fecha:** 2026-03-12
**Alcance:** Frontend (page.tsx, [id]/page.tsx, useOrdersAdmin.ts) + Backend (service, controller, routes) + Schema Prisma

---

## RESUMEN EJECUTIVO

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| CRITICO (rompe funcionalidad) | 5 | Pendiente |
| ALTO (funcionalidad incorrecta) | 5 | Pendiente |
| MEDIO (calidad/mantenibilidad) | 4 | Pendiente |
| BAJO (mejora UX/UI) | 3 | Pendiente |
| **TOTAL** | **17** | |

**Veredicto:** La vista tiene **5 bugs criticos** centrados en un mismatch fundamental de estados (frontend lowercase vs backend UPPERCASE enum) y un estado `confirmed` que no existe en el backend (deberia ser `PROCESSING`). Esto rompe filtros, labels, colores, timeline y actualizacion de estado.

---

## BUGS CRITICOS (P0) - Rompen la funcionalidad

### BUG-01: Mismatch de case en estados — Frontend lowercase vs Backend UPPERCASE
**Archivos:** `frontend/app/admin/orders/page.tsx` linea 11-17, `frontend/hooks/useOrdersAdmin.ts` linea 18, `backend/prisma/schema.prisma` linea 115-121
**Descripcion:** El backend almacena estados en UPPERCASE segun el enum Prisma:
```
enum OrderStatus { PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED }
```
Pero el frontend usa lowercase en TODOS los lugares:
```typescript
// statusConfig keys: pending, confirmed, shipped, delivered, cancelled
// filtro: order.status === 'pending'
// timeline: statusFlow = ['pending', 'confirmed', 'shipped', 'delivered']
// hook interface: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
```

**Impacto:**
- `statusConfig[orderStatus]` SIEMPRE falla → fallback a `statusConfig.pending` → todas las ordenes se muestran como "Pendiente"
- Filtro por estado nunca encuentra match (compara `'PENDING' === 'pending'` → false)
- Stats de pendingCount y deliveredCount siempre son 0
- Timeline siempre esta en el primer paso
- Los botones de cambio de estado envian lowercase al backend, que lo castea con `as any` (funciona por accidente en Prisma pero es incorrecto)

**Solucion:** Normalizar comparando en lowercase: `order.status.toLowerCase()` en el frontend, o mapear con una funcion de normalizacion.

---

### BUG-02: Estado `confirmed` no existe en el backend — Deberia ser `PROCESSING`
**Archivos:** `frontend/app/admin/orders/page.tsx` linea 13, `[id]/page.tsx` linea 66, `backend/prisma/schema.prisma` linea 115-121
**Descripcion:** El enum del backend es:
```
PENDING → PROCESSING → SHIPPED → DELIVERED → CANCELLED
```
Pero el frontend usa `confirmed` en lugar de `PROCESSING`:
- `statusConfig`: tiene `confirmed` (linea 13)
- Filter options: `<option value="confirmed">` (linea 126)
- Timeline statusFlow: `['pending', 'confirmed', 'shipped', 'delivered']` (linea 66)
- Botones de cambio: incluyen `confirmed` (linea 163)

**Impacto:** Filtrar por "Confirmada" no muestra nada. El boton "Confirmada" envia `confirmed` al backend que no es un valor valido del enum (Prisma podria rechazarlo o guardarlo incorrectamente). Las ordenes en PROCESSING nunca se muestran correctamente.
**Solucion:** Reemplazar `confirmed` por `processing` en todo el frontend y agregar la config visual correspondiente.

---

### BUG-03: `updateStatus` envia email al ADMIN en vez del cliente
**Archivo:** `backend/src/modules/orders/orders.controller.ts` lineas 92-99
**Descripcion:**
```typescript
await emailService.sendOrderShipped(order.id, req.user.email, ...);
await emailService.sendOrderDelivered(order.id, req.user.email);
```
`req.user` es el ADMIN que esta cambiando el estado, no el cliente que hizo la orden.

**Impacto:** Los emails de "Tu orden fue enviada" y "Tu orden fue entregada" llegan al admin, no al comprador.
**Solucion:** Hacer `include: { user: true }` en el update y usar `order.user.email`.

---

### BUG-04: `updateStatus` retorna orden sin items (pierde datos en el frontend)
**Archivo:** `backend/src/modules/orders/orders.service.ts` lineas 84-88
**Descripcion:**
```typescript
async updateStatus(id: string, status: string) {
  return prisma.order.update({
    where: { id },
    data: { status: status as any },
    // NO tiene include → retorna solo los campos escalares
  });
}
```
El hook `useOrdersAdmin` luego hace:
```typescript
currentOrder: prev.currentOrder?.id === id ? { ...prev.currentOrder, status } : prev.currentOrder
```
Esto solo actualiza el campo `status`, asi que los items se conservan. PERO si hay un refetch, el update query no retorna items, asi que el controlador responde sin ellos.

**Impacto:** Menor que esperado porque el hook solo actualiza el campo status localmente, pero la respuesta del API esta incompleta. Si alguien consume la API directamente, recibe una orden sin items.
**Solucion:** Agregar `include: { items: { include: { product: true } }, payment: true, user: { select: { email: true, firstName: true } } }`.

---

### BUG-05: Sin validacion de estados validos en `updateStatus`
**Archivo:** `backend/src/modules/orders/orders.service.ts` lineas 84-88
**Descripcion:** El metodo acepta CUALQUIER string y lo castea con `status as any`:
```typescript
data: { status: status as any }
```
No valida:
- Que el status sea un valor valido del enum (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
- Que la transicion sea logica (no deberia poder pasar de DELIVERED a PENDING)
- Que una orden CANCELLED no pueda cambiar de estado

**Impacto:** Se puede poner cualquier string como estado. Prisma podria rechazar el valor invalido del enum con un error crptico.
**Solucion:** Validar status contra valores del enum y definir transiciones permitidas.

---

## BUGS ALTOS (P1) - Funcionalidad incorrecta

### BUG-06: Boton "Ver Detalles" invisible en mobile
**Archivo:** `frontend/app/admin/orders/page.tsx` linea 203
**Descripcion:**
```tsx
className="... opacity-0 group-hover:opacity-100 ..."
```
En dispositivos tactiles no hay hover, asi que el boton NUNCA se hace visible.

**Impacto:** Los usuarios de tablet/mobile no pueden acceder al detalle de ninguna orden.
**Solucion:** Hacer el boton siempre visible, o agregar `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`.

---

### BUG-07: `discount` no se pasa del controller al service
**Archivo:** `backend/src/modules/orders/orders.controller.ts` lineas 49-54
**Descripcion:**
```typescript
const order = await this.service.create(req.user.id, req.body.items, {
  shippingAddress: req.body.shippingAddress,
  shippingMethod: req.body.shippingMethod,
  shippingCost: req.body.shippingCost,
  currency: 'COP',
  // FALTA: discount: req.body.discount
});
```
El servicio acepta `discount` en `CreateOrderOptions` pero el controller nunca lo pasa.

**Impacto:** Los codigos promocionales/cupones nunca se aplican al total. El cliente ve el descuento en el frontend pero paga el precio completo.
**Solucion:** Agregar `discount: req.body.discount` al objeto de opciones.

---

### BUG-08: `create` no reduce stock de productos
**Archivo:** `backend/src/modules/orders/orders.service.ts` lineas 39-81
**Descripcion:** La funcion `create()` del servicio basico no decrementa el stock de los productos despues de crear la orden. Solo el servicio enhanced (no usado por el controller) lo hace.

**Impacto:** Se pueden crear ordenes infinitas sin que el stock se agote. Overselling garantizado.
**Solucion:** Agregar `prisma.product.update({ where: { id }, data: { stock: { decrement: quantity } } })` en el create, con validacion de stock previo.

---

### BUG-09: Envio muestra inconsistente — `shippingCost` undefined
**Archivo:** `frontend/app/admin/orders/[id]/page.tsx` lineas 217-228
**Descripcion:**
```typescript
{Number((currentOrder as any).shippingCost) > 0 && (...)}   // muestra costo
{Number((currentOrder as any).shippingCost) === 0 && (...)}  // muestra "Gratis"
```
Si `shippingCost` es `null` o `undefined`: `Number(null) === 0` es true → muestra "Gratis". Pero `Number(undefined)` es `NaN` → `NaN > 0` y `NaN === 0` son ambos false → no muestra nada.

**Impacto:** Si el campo no vino del backend, la seccion de envio desaparece completamente.
**Solucion:** Usar una sola condicion: `const shipping = Number(currentOrder.shippingCost) || 0;`

---

### BUG-10: Timeline visual rota — conectores verticales en layout horizontal
**Archivo:** `frontend/app/admin/orders/[id]/page.tsx` lineas 148-154
**Descripcion:**
```tsx
// Layout: flex justify-between (HORIZONTAL)
// Conector entre pasos:
<div className="w-0.5 h-12 mt-2 ..." />  // VERTICAL (0.5px ancho, 12 altura)
```
El timeline usa un layout horizontal (`flex justify-between`) pero los conectores son barras verticales debajo de cada icono, creando un visual roto.

**Impacto:** El timeline se ve desordenado — los conectores bajan debajo de cada icono en vez de conectar horizontalmente entre ellos.
**Solucion:** Redisenar el timeline con conectores horizontales entre los pasos.

---

## BUGS MEDIOS (P2) - Calidad y mantenibilidad

### BUG-11: Exceso de `as any` en los componentes
**Archivos:** `[id]/page.tsx` lineas 187, 214, 217, 223, 244, 249, 259, 264
**Descripcion:** La interfaz `Order` en el hook no incluye campos como `shippingAddress`, `shippingMethod`, `shippingCost`, ni `product` en los items. El componente usa `(currentOrder as any)` repetidamente para acceder a estos campos.

**Impacto:** Sin type-safety. Errores de typo o campos renombrados no se detectan en compilacion.
**Solucion:** Extender la interfaz Order con todos los campos del backend.

---

### BUG-12: OrderItem interface incompleta en el hook
**Archivo:** `frontend/hooks/useOrdersAdmin.ts` lineas 7-11
**Descripcion:**
```typescript
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  // FALTA: id, product (con name, image, etc.)
}
```
El backend retorna `include: { product: true }` pero la interfaz no lo refleja.

**Impacto:** Acceder a `item.product?.name` funciona en runtime pero no tiene type-safety.
**Solucion:** Agregar `id`, `product` (con interfaz Product) al OrderItem.

---

### BUG-13: No hay paginacion en la lista de ordenes admin
**Archivos:** Backend `orders.service.ts` linea 17-22, Frontend `page.tsx`
**Descripcion:** `getAll()` retorna TODAS las ordenes sin limite ni paginacion.

**Impacto:** Con muchas ordenes (1000+), la carga inicial sera lenta, la tabla pesada, y el consumo de memoria alto.
**Solucion:** Agregar paginacion en backend y frontend (skip/take + pagina actual).

---

### BUG-14: Busqueda solo por ID, no por nombre de cliente
**Archivo:** `frontend/app/admin/orders/page.tsx` lineas 31-33
**Descripcion:**
```typescript
order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
order.userId.toLowerCase().includes(searchTerm.toLowerCase())
```
Solo busca por UUID de orden y UUID de usuario. Un admin tipicamente busca por nombre o email del cliente, no por UUID.

**Impacto:** La busqueda es practicamente inutil para un admin. Nadie conoce UUIDs de memoria.
**Solucion:** El backend deberia hacer `include: { user: { select: { firstName, lastName, email } } }` y el frontend buscar por esos campos.

---

## MEJORAS UX/UI (P3)

### UX-01: Sin boton de "Cancelar orden" para el admin
**Archivo:** `frontend/app/admin/orders/[id]/page.tsx` lineas 163-176
**Descripcion:** Los botones de cambio de estado solo incluyen el flujo positivo: `pending → confirmed → shipped → delivered`. No hay boton para cancelar una orden.

**Solucion:** Agregar boton "Cancelar" separado con confirmacion y estilo rojo.

---

### UX-02: Sin informacion de pago en la lista
**Archivo:** `frontend/app/admin/orders/page.tsx` lineas 155-215
**Descripcion:** La tabla no muestra si la orden ya fue pagada o no. Un admin necesita saber de un vistazo cuales ordenes tienen pago confirmado.

**Solucion:** Agregar columna o badge de estado de pago (Pagada/Pendiente de pago).

---

### UX-03: Sin exportacion de datos
**Descripcion:** No hay forma de exportar la lista de ordenes a CSV/Excel para reportes.

---

## TABLA DE ARCHIVOS AFECTADOS

| Archivo | Bugs |
|---------|------|
| `frontend/app/admin/orders/page.tsx` | BUG-01, 02, 06, 14, UX-02 |
| `frontend/app/admin/orders/[id]/page.tsx` | BUG-01, 02, 09, 10, 11, UX-01 |
| `frontend/hooks/useOrdersAdmin.ts` | BUG-01, 02, 12 |
| `backend/src/modules/orders/orders.service.ts` | BUG-04, 05, 08, 13 |
| `backend/src/modules/orders/orders.controller.ts` | BUG-03, 07 |

---

## PLAN DE CORRECCION RECOMENDADO (por prioridad)

### Fase 1 - Criticos (la vista esta fundamentalmente rota)
1. **BUG-01**: Normalizar estados lowercase/UPPERCASE en todo el frontend
2. **BUG-02**: Reemplazar `confirmed` por `processing` en frontend
3. **BUG-05**: Validar estados en backend updateStatus
4. **BUG-04**: Agregar include completo en updateStatus del service
5. **BUG-03**: Corregir email al cliente en vez del admin

### Fase 2 - Altos (funcionalidad incorrecta)
6. **BUG-06**: Boton "Ver Detalles" visible en mobile
7. **BUG-07**: Pasar discount del controller al service
8. **BUG-08**: Reducir stock al crear orden
9. **BUG-09**: Fix shippingCost undefined
10. **BUG-10**: Redisenar timeline horizontal

### Fase 3 - Medios (calidad)
11. **BUG-11**: Expandir interfaces para eliminar `as any`
12. **BUG-12**: Completar OrderItem interface
13. **BUG-14**: Busqueda por nombre/email de cliente
14. **BUG-13**: Paginacion (aceptable por ahora si hay pocas ordenes)

### Fase 4 - UX
15. **UX-01**: Boton cancelar orden
16. **UX-02**: Estado de pago en lista
17. **UX-03**: Exportacion CSV

---

## DATOS TECNICOS DE REFERENCIA

**Enum OrderStatus (Prisma):**
```
PENDING → PROCESSING → SHIPPED → DELIVERED
                                  ↘ CANCELLED
```

**Respuesta GET /api/orders/admin/all:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "status": "PENDING",
      "total": "119000.00",
      "shippingAddress": { "firstName": "...", ... },
      "shippingMethod": "standard",
      "shippingCost": "0.00",
      "currency": "COP",
      "createdAt": "2026-...",
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "quantity": 2,
          "price": "50000.00",
          "product": { "id": "...", "name": "...", "image": "..." }
        }
      ]
    }
  ]
}
```
