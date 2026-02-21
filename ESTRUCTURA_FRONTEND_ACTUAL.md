# ESTRUCTURA DEL FRONTEND - FlexiCommerce

**Generado:** 20 de febrero de 2026  
**Estado:** ⚠️ Requiere limpieza de rutas duplicadas

---

## 🚨 PROBLEMAS CRÍTICOS

### Rutas Conflictivas (DUPLICADAS)

```
❌ /app/page.tsx                     (HOME)
❌ /app/(storefront)/page.tsx       (HOME DUPLICADO - conflictúa)

❌ /app/products/page.tsx           (CATÁLOGO)
❌ /app/(storefront)/products/page.tsx (CATÁLOGO DUPLICADO - conflictúa) 

❌ /app/products/[id]/page.tsx      (DETALLE)
❌ /app/(storefront)/products/[id]/page.tsx (DETALLE DUPLICADO - conflictúa)
```

**Impacto:** Next.js está confundido sobre qué archivo servir. El usuario puede estar viendo versiones desactualizadas.

---

## ✅ RUTAS IMPLEMENTADAS (CORRECTAS)

### Storefront - Público

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/` | `/app/page.tsx` | ✅ Mejorado (slider, trust badges, why us) |
| `/products` | `/app/products/page.tsx` | ✅ NUEVO (filtros sidebar, sort, grid) |
| `/products/[id]` | `/app/products/[id]/page.tsx` | ⚠️ Necesita mejora (sin galería, specs, reviews) |
| `/cart` | `/app/cart/page.tsx` | ✅ Mejorado |
| `/checkout` | `/app/checkout/page.tsx` | ✅ Mejorado |
| `/checkout/confirmation` | `/app/checkout/confirmation/page.tsx` | ✅ Mejorado |
| `/auth` | `/app/auth/page.tsx` | ⚠️ Necesita mejora (sin dos columnas, sin social login) |

### Account - Protegido (Usuario Logueado)

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/account/profile` | `/app/(account)/profile/page.tsx` | ⚠️ Necesita mejora (sin avatar cam, sin loyalty tier) |
| `/account/wishlist` | `/app/(account)/wishlist/page.tsx` | ⚠️ Necesita mejora |
| `/account/compare` | `/app/(account)/compare/page.tsx` | ❌ No implementado |
| `/account/orders` | `/app/(account)/orders/page.tsx` | ✅ Mejorado |
| `/account/orders/[id]` | `/app/(account)/orders/[id]/page.tsx` | ✅ Mejorado |

### Admin - Protegido (Admin)

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/admin` | `/app/admin/page.tsx` | ✅ Mejorado (drag&drop, image upload) |
| `/admin/products` | `/app/admin/products/page.tsx` | ✅ Mejorado (stats, search, table) |
| `/admin/products/[id]` | `/app/admin/products/[id]/page.tsx` | ⚠️ Necesita revisar |
| `/admin/orders` | `/app/admin/orders/page.tsx` | ✅ Mejorado (metrics, filter bar) |
| `/admin/orders/[id]` | `/app/admin/orders/[id]/page.tsx` | ⚠️ Necesita revisar |
| `/admin/analytics` | `/app/admin/analytics/page.tsx` | ✅ Mejorado (charts, top products) |
| `/admin/settings` | `/app/admin/settings/page.tsx` | ⚠️ Necesita mejora |
| `/admin/cms` | `/app/admin/cms/page.tsx` | ⚠️ Necesita mejora |

---

## 📋 ACCIONES NECESARIAS (PRIORIDAD)

### FASE 1: Limpiar Duplicaciones (CRÍTICO)
- [ ] **Eliminar** `/app/(storefront)/` completamente
- [ ] Verificar que todas las rutas apunten a `/app/` directamente
- [ ] Recargar el servidor para que aplique cambios

### FASE 2: Completar Rutas Faltantes (ALTA)
- [ ] `/app/products/[id]/page.tsx` - Agregar galería de imágenes, specs, reviews
- [ ] `/app/auth/page.tsx` - Agregar layout dos columnas, social login, password toggle
- [ ] `/app/(account)/profile/page.tsx` - Agregar avatar upload, loyalty tier
- [ ] `/app/(account)/compare/page.tsx` - Crear página de comparación

### FASE 3: Mejorar Páginas Secundarias (MEDIA)
- [ ] `/app/(account)/wishlist/page.tsx` - Mejorar diseño
- [ ] `/app/admin/settings/page.tsx` - Implementar configuración de tienda
- [ ] `/app/admin/cms/page.tsx` - Mejorar dashboard CMS
- [ ] `/app/admin/products/[id]/page.tsx` - Editor de producto completo
- [ ] `/app/admin/orders/[id]/page.tsx` - Detalle de orden con acciones

---

## 📁 COMPONENTES/HOOKS DISPONIBLES

### Componentes
- ✅ `Header.tsx` - Con mega menú
- ✅ `Footer.tsx` - Pie de página
- ✅ `ProductCard.tsx` - Tarjeta de producto
- ✅ `ImageUpload.tsx` - Upload con drag&drop
- ✅ `Breadcrumbs.tsx` - Migas de pan
- ✅ `MaterialIcon.tsx` - Íconos Material Symbols

### Hooks
- ✅ `useCart` - Carrito de compras
- ✅ `useAuth` - Autenticación
- ✅ `useProducts` - Productos
- ✅ `useOrdersAdmin` - Órdenes admin
- ✅ `useAnalytics` - Analíticas
- ✅ `useAuthAPI` - API Auth
- ✅ (Otros 8+ hooks disponibles)

---

## 🎨 DISEÑOS DISPONIBLES EN `/Design`

- ✅ flexicommerce_storefront_home (USADO)
- ⏳ storefront_home_(mobile)
- ⏳ storefront_home_(tablet)
- ⏳ product_catalog_&_filters (USABLE)
- ⏳ product_detail_page
- ⏳ authentication_(login/register)
- ⏳ checkout_&_payment_flow
- ⏳ order_confirmation
- ⏳ my_orders_history
- ⏳ user_profile_settings
- ⏳ wishlist_&_compare
- ⏳ admin_store_settings
- ⏳ flexicommerce_cms_dashboard

---

## 🔧 PRÓXIMO PASO

Ejecutar el clean-up de estructura:

```bash
# 1. Eliminar carpeta (storefront)
rm -rf /home/omarhernandez/personalProjects/FlexiCommerce/frontend/app/\(storefront\)

# 2. Reiniciar servidor
pkill -9 -f "next dev"
cd /home/omarhernandez/personalProjects/FlexiCommerce/frontend
npm run dev
```

Luego de esto, concentrarse en implementar FASE 1 & FASE 2.
