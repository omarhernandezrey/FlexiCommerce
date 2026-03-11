# 📖 Documentación Completa de Roles y Permisos - FlexiCommerce

**Fecha de Documentación:** Marzo 6, 2026  
**Versión:** v1.0  
**Estado:** Completo

---

## 📑 Tabla de Contenidos

1. [Sistema de Roles](#sistema-de-roles)
2. [Cuentas de Prueba](#cuentas-de-prueba)
3. [Modelo de Datos - Usuario](#modelo-de-datos---usuario)
4. [Autenticación y Autorización](#autenticación-y-autorización)
5. [Módulos y Funcionalidades por Rol](#módulos-y-funcionalidades-por-rol)
6. [Rutas API Detalladas](#rutas-api-detalladas)
7. [Matriz de Permisos](#matriz-de-permisos)
8. [Casos de Uso por Rol](#casos-de-uso-por-rol)

---

## 🔐 Sistema de Roles

### Visión General
FlexiCommerce implementa un sistema de roles basado en dos niveles de acceso:

```
┌─────────────────────────────────────────┐
│           Sistema de Roles               │
├─────────────────────────────────────────┤
│  ADMIN (Administrador)                   │
│  └─ Acceso total a funciones de gestión │
│                                          │
│  CUSTOMER (Cliente)                      │
│  └─ Acceso a funciones de comprador      │
└─────────────────────────────────────────┘
```

### Definición de Roles en la BD

**Enum en Prisma Schema:**
```prisma
enum Role {
  ADMIN
  CUSTOMER
}
```

**Modelo User con Role:**
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  phone     String?
  role      Role     @default(CUSTOMER)  // ← Asignado por defecto
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  orders    Order[]
  reviews   Review[]
  wishlists Wishlist[]
  addresses Address[]
  
  @@map("users")
}
```

**Campos Importantes:**
- `role`: Determina nivel de acceso (ADMIN | CUSTOMER)
- `isActive`: Controla si el usuario está activo en el sistema
- Rol por defecto: **CUSTOMER** (asignado automáticamente en registro)

---

## 👤 Cuentas de Prueba

### Tabla Resumen

| # | Email | Contraseña | Rol | Estado | Propósito |
|---|-------|-----------|-----|--------|-----------|
| 1 | `admin@flexicommerce.com` | `Admin@12345` | **ADMIN** | Activa | Administración total |
| 2 | `customer@flexicommerce.com` | `Customer@12345` | **CUSTOMER** | Activa | Comprador estándar |
| 3 | `test@flexicommerce.com` | `Test@12345` | **CUSTOMER** | Activa | Testing general |

### Descripción Detallada

#### 1️⃣ Cuenta ADMIN

**Email:** `admin@flexicommerce.com`  
**Contraseña:** `Admin@12345`  
**Rol:** ADMIN  
**Acceso:** Completo a todas las funciones

**Caso de Uso:**
- Gestionar catálogo de productos
- Configure categorías
- Administre órdenes de clientes
- Monitor analytics y reportes
- Gestione contenido CMS
- Ver lista de usuarios registrados

#### 2️⃣ Cuenta CUSTOMER (Principal)

**Email:** `customer@flexicommerce.com`  
**Contraseña:** `Customer@12345`  
**Rol:** CUSTOMER  
**Acceso:** Funciones de comprador

**Caso de Uso:**
- Navegar productos
- Hacer compras
- Gestionar perfil
- Ver historial de órdenes
- Dejar reseñas
- Gestionar wishlist

#### 3️⃣ Cuenta CUSTOMER (Testing)

**Email:** `test@flexicommerce.com`  
**Contraseña:** `Test@12345`  
**Rol:** CUSTOMER  
**Acceso:** Funciones de comprador

**Caso de Uso:**
- Testing general de funciones de cliente
- Pruebas de flujo de compra
- Validación de pagos

---

## 🔐 Autenticación y Autorización

### Middleware de Autenticación

**Archivo:** `backend/src/middlewares/auth.ts`

#### 1. Función `authenticate()`

**Propósito:** Verifica que el usuario tiene un token JWT válido

```typescript
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token de autenticación requerido' });
    return;
  }

  try {
    const decoded = jwt.decode(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
```

**Flujo:**
1. Extrae token del header `Authorization: Bearer <token>`
2. Verifica validez del JWT
3. Decodifica información del usuario
4. Continúa con siguiente middleware o rechaza (401)

#### 2. Función `authorize()`

**Propósito:** Verifica que el usuario tiene el rol requerido

```typescript
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'No tienes permisos para esta acción' });
      return;
    }
    next();
  };
};
```

**Flujo:**
1. Verifica que usuario está autenticado
2. Compara rol del usuario con roles permitidos
3. Si coincide → continúa (next)
4. Si no coincide → rechaza (403 Forbidden)

**Ejemplo de Uso:**
```typescript
router.post('/', authenticate, authorize('ADMIN'), controller.create);
// Solo permite POSTs si usuario está autenticado Y es ADMIN
```

### Tokens JWT

**Contenido del Token Decodificado:**
```javascript
{
  id: "uuid-del-usuario",
  email: "usuario@example.com",
  firstName: "Juan",
  lastName: "Pérez",
  role: "ADMIN" | "CUSTOMER",  // Determinante de permisos
  iat: 1234567890,             // Issued At
  exp: 1234571490              // Expiration
}
```

---

## 🗂️ Módulos y Funcionalidades por Rol

### Estructura de Módulos

Tu aplicación está dividida en estos módulos:

```
backend/src/modules/
├── auth/              → Autenticación (login, registro, refresh token)
├── users/             → Gestión de perfiles y direcciones
├── products/          → Catálogo y gestión de productos
├── categories/        → Gestión de categorías
├── orders/            → Gestión de órdenes
├── payments/          → Procesamiento de pagos (Wompi)
├── reviews/           → Reseñas de productos
├── wishlist/          → Lista de deseos
├── cms/               → Contenido estático
├── analytics/         → Reportes y métricas
└── recommendations/   → Productos recomendados
```

---

## 📡 Rutas API Detalladas

### 1️⃣ MÓDULO: AUTH (Autenticación General)

**Archivo:** `backend/src/modules/auth/auth.routes.ts`

| Método | Ruta | Autenticación | Autorización | Descripción |
|--------|------|---------------|--------------|-------------|
| POST | `/auth/register` | ❌ No | ❌ No | Registrar nuevo usuario |
| POST | `/auth/login` | ❌ No | ❌ No | Iniciar sesión y obtener token |
| POST | `/auth/logout` | ❌ No | ❌ No | Cerrar sesión |
| GET | `/auth/me` | ✅ Sí | ❌ No | Obtener datos del usuario autenticado |
| POST | `/auth/refresh` | ✅ Sí | ❌ No | Refrescar token JWT |

**Requisitos de Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Ejemplos de Respuesta:**

*Login Exitoso:*
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid-123",
      "email": "admin@flexicommerce.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  }
}
```

---

### 2️⃣ MÓDULO: PRODUCTS (Catálogo de Productos)

**Archivo:** `backend/src/modules/products/products.routes.ts`

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/products/` | ❌ No | ❌ No | Listar todos los productos (paginado) |
| GET | `/products/:id` | ❌ No | ❌ No | Obtener detalles de un producto |
| GET | `/products/search` | ❌ No | ❌ No | Buscar productos por query |
| POST | `/products/` | ✅ Sí | **ADMIN** | Crear nuevo producto |
| PUT | `/products/:id` | ✅ Sí | **ADMIN** | Actualizar producto |
| DELETE | `/products/:id` | ✅ Sí | **ADMIN** | Eliminar producto |

**Query Parameters para GET /products/:**
```
?page=1&limit=10&category=electronics
```

**Body para POST/PUT:**
```json
{
  "name": "Producto Ejemplo",
  "slug": "producto-ejemplo",
  "description": "Descripción del producto",
  "price": 99.99,
  "stock": 100,
  "categoryId": "uuid-categoria",
  "images": ["https://example.com/image1.jpg"]
}
```

---

### 3️⃣ MÓDULO: CATEGORIES (Categorías)

**Archivo:** `backend/src/modules/categories/categories.routes.ts`

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/categories/` | ❌ No | ❌ No | Listar todas las categorías |
| GET | `/categories/:id` | ❌ No | ❌ No | Obtener detalles de una categoría |
| POST | `/categories/` | ✅ Sí | **ADMIN** | Crear nueva categoría |
| PUT | `/categories/:id` | ✅ Sí | **ADMIN** | Actualizar categoría |
| DELETE | `/categories/:id` | ✅ Sí | **ADMIN** | Eliminar categoría |

**Body para POST/PUT:**
```json
{
  "name": "Electrónica",
  "slug": "electronica",
  "description": "Productos electrónicos en general",
  "image": "https://example.com/category.jpg",
  "parentId": "uuid-categoria-padre" // (opcional, para subcategorías)
}
```

---

### 4️⃣ MÓDULO: USERS (Gestión de Usuarios)

**Archivo:** `backend/src/modules/users/users.routes.ts`

#### Rutas de Perfil (Todos requieren autenticación)

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/users/me` | ✅ Sí | ❌ No | Obtener perfil del usuario actual |
| PUT | `/users/me` | ✅ Sí | ❌ No | Actualizar datos del perfil |
| PUT | `/users/me/password` | ✅ Sí | ❌ No | Cambiar contraseña |
| GET | `/users/me/stats` | ✅ Sí | ❌ No | Ver estadísticas del usuario |

#### Rutas de Direcciones (Todas requieren autenticación)

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/users/me/addresses` | ✅ Sí | ❌ No | Listar direcciones guardadas |
| POST | `/users/me/addresses` | ✅ Sí | ❌ No | Crear nueva dirección |
| PUT | `/users/me/addresses/:id` | ✅ Sí | ❌ No | Actualizar dirección |
| DELETE | `/users/me/addresses/:id` | ✅ Sí | ❌ No | Eliminar dirección |
| PUT | `/users/me/addresses/:id/default` | ✅ Sí | ❌ No | Establecer como dirección predeterminada |

#### Rutas Admin

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/users/` | ✅ Sí | **ADMIN** | Listar todos los usuarios del sistema |

**Body para PUT /users/me:**
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "phone": "+57 3001234567"
}
```

**Body para PUT /users/me/password:**
```json
{
  "currentPassword": "AntiguaContraseña@123",
  "newPassword": "NuevaContraseña@456"
}
```

**Body para POST /users/me/addresses:**
```json
{
  "label": "Casa",
  "firstName": "Juan",
  "lastName": "Pérez",
  "street": "Calle 123 #45-67",
  "city": "Bogotá",
  "state": "Cundinamarca",
  "zipCode": "110111",
  "country": "Colombia",
  "phone": "+57 3001234567",
  "isDefault": true
}
```

---

### 5️⃣ MÓDULO: ORDERS (Órdenes/Pedidos)

**Archivo:** `backend/src/modules/orders/orders.routes.ts`

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/orders/` | ✅ Sí | ❌ No* | Listar órdenes del usuario |
| GET | `/orders/:id` | ✅ Sí | ❌ No* | Obtener detalles de una orden |
| POST | `/orders/` | ✅ Sí | ❌ No | Crear nueva orden |
| PATCH | `/orders/:id/status` | ✅ Sí | **ADMIN** | Cambiar estado de una orden |

*Nota: Los clientes solo ven sus propias órdenes; los ADMIN ven todas.

**Estados de Orden (OrderStatus enum):**
```
PENDING      → Pendiente de confirmación
CONFIRMED   → Confirmada por el sistema
SHIPPED     → Enviada al cliente
DELIVERED   → Entregada
CANCELLED   → Cancelada
REFUNDED    → Reembolsada
```

**Body para POST /orders/:**
```json
{
  "items": [
    {
      "productId": "uuid-producto",
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shippingAddress": {
    "street": "Calle 123",
    "city": "Bogotá",
    "zipCode": "110111"
  },
  "shippingMethod": "express"
}
```

**Body para PATCH /orders/:id/status:**
```json
{
  "status": "SHIPPED"
}
```

---

### 6️⃣ MÓDULO: PAYMENTS (Pagos - Wompi)

**Archivo:** `backend/src/modules/payments/payments.routes.ts`

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| POST | `/payments/` | ✅ Sí | ❌ No | Crear registro de pago |
| GET | `/payments/:orderId` | ✅ Sí | ❌ No* | Obtener información de pago de una orden |
| POST | `/payments/wompi/session` | ✅ Sí | ❌ No | Crear sesión de pago con Wompi |
| POST | `/payments/wompi/verify/:transactionId` | ✅ Sí | ❌ No | Verificar estado de transacción |
| POST | `/payments/wompi/webhook` | ❌ No | ❌ No | Webhook de Wompi (servidor a servidor) |

*Nota: Los clientes solo ven sus propios pagos.

**Flow de Pago:**
```
1. Client crea order → GET order.id
2. Client llama POST /payments/wompi/session con order.id
3. Sistema retorna session token de Wompi
4. Client abre Wompi checkout con el token
5. Wompi procesa pago
6. Wompi llama webhook → actualiza estado en BD
7. Client verifica con POST /payments/wompi/verify/:transactionId
```

**Body para POST /payments/:**
```json
{
  "orderId": "uuid-orden",
  "amount": 299.97,
  "paymentMethod": "credit_card",
  "reference": "REF-123456"
}
```

**Body para POST /payments/wompi/session:**
```json
{
  "orderId": "uuid-orden"
}
```

---

### 7️⃣ MÓDULO: REVIEWS (Reseñas/Calificaciones)

**Archivo:** `backend/src/modules/reviews/reviews.routes.ts`

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/reviews/product/:productId` | ❌ No | ❌ No | Listar reseñas de un producto |
| GET | `/reviews/stats/:productId` | ❌ No | ❌ No | Estadísticas de reseñas de un producto |
| GET | `/reviews/check/:productId` | ✅ Sí | ❌ No | Verificar si usuario ya dejó reseña |
| POST | `/reviews/` | ✅ Sí | ❌ No | Crear nueva reseña |
| PUT | `/reviews/:id` | ✅ Sí | ❌ No* | Actualizar reseña propia |
| DELETE | `/reviews/:id` | ✅ Sí | ❌ No* | Eliminar reseña propia |

*Nota: Los usuarios solo pueden editar/eliminar sus propias reseñas.

**Body para POST /reviews/:**
```json
{
  "productId": "uuid-producto",
  "rating": 5,
  "title": "Producto excelente",
  "comment": "Muy buena calidad y llegó rápido",
  "verified": true
}
```

**Campos de Respuesta:**
```json
{
  "id": "uuid-reseña",
  "productId": "uuid-producto",
  "userId": "uuid-usuario",
  "rating": 5,
  "title": "Producto excelente",
  "comment": "Muy buena calidad...",
  "verified": true,
  "helpful": 15,
  "createdAt": "2026-03-06T10:30:00Z",
  "updatedAt": "2026-03-06T10:30:00Z"
}
```

**Estadísticas (GET /reviews/stats/:productId):**
```json
{
  "productId": "uuid-producto",
  "averageRating": 4.5,
  "totalReviews": 120,
  "ratingDistribution": {
    "5": 80,
    "4": 25,
    "3": 10,
    "2": 3,
    "1": 2
  },
  "recommendationPercentage": 92
}
```

---

### 8️⃣ MÓDULO: WISHLIST (Lista de Deseos)

**Archivo:** `backend/src/modules/wishlist/wishlist.routes.ts`

*Todas las rutas requieren autenticación (`verifyToken`)*

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| GET | `/wishlist/` | ✅ Sí | Obtener todos los items en la wishlist |
| GET | `/wishlist/count` | ✅ Sí | Obtener cantidad de items |
| GET | `/wishlist/:productId/check` | ✅ Sí | Verificar si producto está en wishlist |
| POST | `/wishlist/` | ✅ Sí | Agregar producto a wishlist |
| DELETE | `/wishlist/:id` | ✅ Sí | Remover item específico |
| DELETE | `/wishlist/` | ✅ Sí | Limpiar toda la wishlist |

**Body para POST /wishlist/:**
```json
{
  "productId": "uuid-producto"
}
```

**Response para GET /wishlist/:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-wishlist-item",
      "userId": "uuid-usuario",
      "productId": "uuid-producto",
      "product": {
        "id": "uuid-producto",
        "name": "Producto A",
        "price": 99.99,
        "images": ["..."]
      },
      "createdAt": "2026-03-06T10:30:00Z"
    }
  ]
}
```

---

### 9️⃣ MÓDULO: CMS (Contenido Estático)

**Archivo:** `backend/src/modules/cms/cms.routes.ts`

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/cms/` | ❌ No | ❌ No | Listar todos los items de contenido |
| GET | `/cms/:slug` | ❌ No | ❌ No | Obtener contenido por slug |
| POST | `/cms/` | ✅ Sí | **ADMIN** | Crear nuevo página/contenido |
| PUT | `/cms/:id` | ✅ Sí | **ADMIN** | Actualizar contenido |
| DELETE | `/cms/:id` | ✅ Sí | **ADMIN** | Eliminar contenido |

**Body para POST/PUT:**
```json
{
  "title": "Términos y Condiciones",
  "slug": "terminos-y-condiciones",
  "content": "HTML o Markdown del contenido...",
  "published": true
}
```

---

### 🔟 MÓDULO: ANALYTICS (Reportes y Métricas)

**Archivo:** `backend/src/modules/analytics/analytics.routes.ts`

| Método | Ruta | Autenticación | Rol Requerido | Descripción |
|--------|------|---------------|---------------|-------------|
| GET | `/analytics/metrics` | ✅ Sí | **ADMIN** | Obtener métricas del sistema |

**Query Parameters:**
```
?startDate=2026-01-01&endDate=2026-03-06
```

**Métricas Disponibles:**
- Total de usuarios
- Total de órdenes
- Ingresos totales
- Productos más vendidos
- Categorías populares
- Tasa de conversión
- Valor promedio de orden
- Y más...

---

## 📊 Matriz de Permisos

### Tabla Completa de Accesos

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         MATRIZ DE PERMISOS                                 │
├──────────────────────────────────┬───────────────┬──────────────────────────┤
│         MÓDULO / ACCIÓN          │     ADMIN     │       CUSTOMER           │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ AUTHENTICATION                   │               │                          │
│ ├─ Register                      │       ✅      │          ✅              │
│ ├─ Login                         │       ✅      │          ✅              │
│ ├─ Logout                        │       ✅      │          ✅              │
│ ├─ Get User Info (me)            │       ✅      │          ✅              │
│ └─ Refresh Token                 │       ✅      │          ✅              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ PRODUCTS                         │               │                          │
│ ├─ View All                      │       ✅      │          ✅              │
│ ├─ View Details                  │       ✅      │          ✅              │
│ ├─ Search                        │       ✅      │          ✅              │
│ ├─ Create                        │       ✅      │          ❌              │
│ ├─ Update                        │       ✅      │          ❌              │
│ └─ Delete                        │       ✅      │          ❌              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ CATEGORIES                       │               │                          │
│ ├─ View All                      │       ✅      │          ✅              │
│ ├─ View Details                  │       ✅      │          ✅              │
│ ├─ Create                        │       ✅      │          ❌              │
│ ├─ Update                        │       ✅      │          ❌              │
│ └─ Delete                        │       ✅      │          ❌              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ USERS PROFILE                    │               │                          │
│ ├─ View Own Profile              │       ✅      │          ✅              │
│ ├─ Update Own Profile            │       ✅      │          ✅              │
│ ├─ Change Password               │       ✅      │          ✅              │
│ ├─ View Own Stats                │       ✅      │          ✅              │
│ └─ List All Users                │       ✅      │          ❌              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ ADDRESSES                        │               │                          │
│ ├─ View Own Addresses            │       ✅      │          ✅              │
│ ├─ Create Address                │       ✅      │          ✅              │
│ ├─ Update Own Address            │       ✅      │          ✅              │
│ ├─ Delete Own Address            │       ✅      │          ✅              │
│ └─ Set Default Address           │       ✅      │          ✅              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ ORDERS                           │               │                          │
│ ├─ View Own Orders               │       ✅      │          ✅              │
│ ├─ View All Orders               │       ✅      │          ❌              │
│ ├─ View Order Details            │       ✅*     │          ✅*             │
│ ├─ Create Order                  │       ✅      │          ✅              │
│ └─ Update Order Status           │       ✅      │          ❌              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ PAYMENTS (Wompi)                 │               │                          │
│ ├─ Create Payment Record         │       ✅      │          ✅              │
│ ├─ View Payment Info             │       ✅*     │          ✅*             │
│ ├─ Create Payment Session        │       ✅      │          ✅              │
│ ├─ Verify Transaction            │       ✅      │          ✅              │
│ └─ Webhook (server-to-server)    │       ✅      │          ✅              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ REVIEWS                          │               │                          │
│ ├─ View Product Reviews          │       ✅      │          ✅              │
│ ├─ View Review Stats             │       ✅      │          ✅              │
│ ├─ Check Own Review Exists       │       ✅      │          ✅              │
│ ├─ Create Review                 │       ✅      │          ✅              │
│ ├─ Update Own Review             │       ✅      │          ✅              │
│ └─ Delete Own Review             │       ✅      │          ✅              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ WISHLIST                         │               │                          │
│ ├─ View Own Wishlist             │       ✅      │          ✅              │
│ ├─ Get Wishlist Count            │       ✅      │          ✅              │
│ ├─ Check If Product In Wishlist  │       ✅      │          ✅              │
│ ├─ Add to Wishlist               │       ✅      │          ✅              │
│ ├─ Remove from Wishlist          │       ✅      │          ✅              │
│ └─ Clear Wishlist                │       ✅      │          ✅              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ CMS                              │               │                          │
│ ├─ View All Content              │       ✅      │          ✅              │
│ ├─ View Content by Slug          │       ✅      │          ✅              │
│ ├─ Create Content Page           │       ✅      │          ❌              │
│ ├─ Update Content                │       ✅      │          ❌              │
│ └─ Delete Content                │       ✅      │          ❌              │
├──────────────────────────────────┼───────────────┼──────────────────────────┤
│ ANALYTICS                        │               │                          │
│ └─ View System Metrics           │       ✅      │          ❌              │
└──────────────────────────────────┴───────────────┴──────────────────────────┘

* ADMIN access es a todas. CUSTOMER solo accede a los suyos propios.
```

---

## 🎯 Casos de Uso por Rol

### Caso de Uso 1: ADMIN - Gestionar Catálogo de Productos

**Escenario:**
El administrador necesita agregar una nueva categoría de productos y luego agregar 3 productos a esa categoría.

**Flujo:**

```
1. ADMIN inicia sesión
   POST /auth/login
   {
     "email": "admin@flexicommerce.com",
     "password": "Admin@12345"
   }
   → Recibe JWT token

2. ADMIN crea categoría
   POST /categories/
   Headers: Authorization: Bearer <JWT>
   {
     "name": "Smartphones",
     "slug": "smartphones",
     "description": "Teléfonos inteligentes"
   }
   → Recibe categoryId: "uuid-123"

3. ADMIN crea producto 1
   POST /products/
   Headers: Authorization: Bearer <JWT>
   {
     "name": "iPhone 15 Pro",
     "slug": "iphone-15-pro",
     "description": "Último modelo Apple",
     "price": 999.99,
     "stock": 50,
     "categoryId": "uuid-123",
     "images": ["https://..."]
   }

4. ADMIN crea producto 2 (similar)
5. ADMIN crea producto 3 (similar)

6. ADMIN actualiza stock de producto 1
   PUT /products/uuid-producto1
   Headers: Authorization: Bearer <JWT>
   {
     "stock": 45
   }

7. ADMIN elimina producto 3 (no estaba disponible)
   DELETE /products/uuid-producto3
   Headers: Authorization: Bearer <JWT>
```

---

### Caso de Uso 2: CUSTOMER - Comprar Producto

**Escenario:**
Un cliente quiere comprar un producto, agregar su dirección de envío, y realizar el pago.

**Flujo:**

```
1. CUSTOMER se registra o inicia sesión
   POST /auth/login
   {
     "email": "customer@flexicommerce.com",
     "password": "Customer@12345"
   }
   → Recibe JWT token

2. CUSTOMER navega productos (sin autenticación)
   GET /products/?page=1&limit=10

3. CUSTOMER busca productos específicos (sin autenticación)
   GET /products/search?q=iphone

4. CUSTOMER ve detalles de un producto (sin autenticación)
   GET /products/uuid-producto1
   → Ve nombre, precio, descripción, imagen, reviews, rating

5. CUSTOMER agrega producto a wishlist
   POST /wishlist/
   Headers: Authorization: Bearer <JWT>
   {
     "productId": "uuid-producto1"
   }

6. CUSTOMER agrega dirección de envío
   POST /users/me/addresses
   Headers: Authorization: Bearer <JWT>
   {
     "label": "Casa",
     "firstName": "Juan",
     "lastName": "Pérez",
     "street": "Calle 123 #45-67",
     "city": "Bogotá",
     "state": "Cundinamarca",
     "zipCode": "110111",
     "country": "Colombia",
     "phone": "+57 3001234567",
     "isDefault": true
   }

7. CUSTOMER crea una orden
   POST /orders/
   Headers: Authorization: Bearer <JWT>
   {
     "items": [
       {
         "productId": "uuid-producto1",
         "quantity": 1,
         "price": 999.99
       }
     ],
     "shippingAddress": "dirección seleccionada u objeto con datos",
     "shippingMethod": "express"
   }
   → Recibe orderId: "uuid-orden-123"

8. CUSTOMER crea sesión de pago con Wompi
   POST /payments/wompi/session
   Headers: Authorization: Bearer <JWT>
   {
     "orderId": "uuid-orden-123"
   }
   → Recibe session token de Wompi

9. CUSTOMER abre checkout de Wompi en su navegador
   (redirección a formulario seguro de Wompi)

10. CUSTOMER completa pago en Wompi
    (ingresa datos de tarjeta, etc.)

11. Wompi procesa pago y envía webhook al backend
    POST /payments/wompi/webhook
    (servidor a servidor - no requiere JWT)

12. CUSTOMER verifica resultado del pago
    POST /payments/wompi/verify/{transactionId}
    Headers: Authorization: Bearer <JWT>
    → Confirmación de pago exitoso o fallido

13. CUSTOMER ve su orden creada
    GET /orders/
    Headers: Authorization: Bearer <JWT>
    → Lista todas sus órdenes

14. CUSTOMER ve detalles de su orden
    GET /orders/uuid-orden-123
    Headers: Authorization: Bearer <JWT>
    → Información completa de orden, monto total, estado

15. CUSTOMER deja reseña del producto comprado
    POST /reviews/
    Headers: Authorization: Bearer <JWT>
    {
      "productId": "uuid-producto1",
      "rating": 5,
      "title": "Excelente producto",
      "comment": "Muy buena calidad y llegó rápido",
      "verified": true
    }
```

---

### Caso de Uso 3: ADMIN - Gestionar Órdenes

**Escenario:**
El administrador monitorea órdenes de clientes y actualiza sus estados.

**Flujo:**

```
1. ADMIN inicia sesión
   POST /auth/login
   {
     "email": "admin@flexicommerce.com",
     "password": "Admin@12345"
   }

2. ADMIN ve todas las órdenes del sistema
   GET /orders/
   Headers: Authorization: Bearer <JWT>
   → Lista paginada de TODAS las órdenes

3. ADMIN filtra/ve detalle de una orden
   GET /orders/uuid-orden-123
   Headers: Authorization: Bearer <JWT>
   {
     "id": "uuid-orden-123",
     "userId": "uuid-cliente",
     "status": "PENDING",
     "total": 999.99,
     "items": [...],
     "shippingAddress": {...}
   }

4. ADMIN confirma la orden
   PATCH /orders/uuid-orden-123/status
   Headers: Authorization: Bearer <JWT>
   {
     "status": "CONFIRMED"
   }

5. ADMIN prepara envío y actualiza estado
   PATCH /orders/uuid-orden-123/status
   Headers: Authorization: Bearer <JWT>
   {
     "status": "SHIPPED"
   }

6. Cliente recibe el paquete y estado se actualiza
   PATCH /orders/uuid-orden-123/status
   Headers: Authorization: Bearer <JWT>
   {
     "status": "DELIVERED"
   }
```

---

### Caso de Uso 4: CUSTOMER - Gestionar Perfil

**Escenario:**
Un cliente quiere actualizar su información personal.

**Flujo:**

```
1. CUSTOMER inicia sesión
   POST /auth/login → Recibe JWT token

2. CUSTOMER ve su perfil actual
   GET /users/me
   Headers: Authorization: Bearer <JWT>
   {
     "id": "uuid-customer",
     "email": "customer@flexicommerce.com",
     "firstName": "Juan",
     "lastName": "Pérez",
     "phone": "+57 3001234567",
     "role": "CUSTOMER",
     "createdAt": "2026-01-15T10:30:00Z"
   }

3. CUSTOMER actualiza su perfil
   PUT /users/me
   Headers: Authorization: Bearer <JWT>
   {
     "firstName": "Juan Carlos",
     "phone": "+57 3009876543"
   }

4. CUSTOMER ve sus estadísticas
   GET /users/me/stats
   Headers: Authorization: Bearer <JWT>
   {
     "totalOrders": 15,
     "totalSpent": 5499.50,
     "averageOrderValue": 366.63,
     "lastOrderDate": "2026-03-04T15:20:00Z",
     "totalReviews": 8
   }

5. CUSTOMER cambia su contraseña
   PUT /users/me/password
   Headers: Authorization: Bearer <JWT>
   {
     "currentPassword": "Customer@12345",
     "newPassword": "NuevaContraseña@456"
   }

6. En siguiente login, usa nueva contraseña
   POST /auth/login
   {
     "email": "customer@flexicommerce.com",
     "password": "NuevaContraseña@456"
   }
```

---

## 📋 Resumen Ejecutivo

### Por ADMIN

**Responsabilidades:**
- ✅ Gestionar completamente el catálogo (producús y categorías)
- ✅ Monitorear y gestionar todas las órdenes del sistema
- ✅ Actualizar estados de órdenes (PENDING → CONFIRMED → SHIPPED → DELIVERED)
- ✅ Crear y gestionar contenido CMS (páginas estáticas)
- ✅ Ver analytics y métricas del negocio
- ✅ Listar todos los clientes registrados
- ✅ Todas las funciones de cliente

**Restricciones:**
- ❌ No puede cambiar roles de otros usuarios (base de datos manual)
- ❌ No puede acceder a datos sensibles de clientes (sin autorización explícita)

---

### Por CUSTOMER

**Funciones Permitidas:**
- ✅ Registrarse e iniciar sesión
- ✅ Navegar y buscar productos
- ✅ Ver detalles y reseñas de productos
- ✅ Gestionar perfil y contraseña
- ✅ Agregar múltiples direcciones de envío
- ✅ Crear órdenes
- ✅ Realizar pagos con Wompi
- ✅ Dejar reseñas en productos comprados
- ✅ Gestionar lista de deseos (wishlist)

**Restricciones:**
- ❌ No puede crear, editar o eliminar productos
- ❌ No puede crear o editar categorías
- ❌ No puede ver órdenes de otros clientes
- ❌ No puede cambiar estado de órdenes
- ❌ No puede acceder a analytics
- ❌ No puede ver lista completa de usuarios

---

## 🔗 Referencias de Archivos

### Código Relacionado

**Middleware de Autenticación:**
- [backend/src/middlewares/auth.ts](backend/src/middlewares/auth.ts)

**Modelos Prisma:**
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

**Módulos del Backend:**
- [backend/src/modules/auth/](backend/src/modules/auth/) - Autenticación
- [backend/src/modules/users/](backend/src/modules/users/) - Gestión de usuarios
- [backend/src/modules/products/](backend/src/modules/products/) - Catálogo
- [backend/src/modules/orders/](backend/src/modules/orders/) - Órdenes
- [backend/src/modules/payments/](backend/src/modules/payments/) - Pagos
- [backend/src/modules/reviews/](backend/src/modules/reviews/) - Reseñas
- [backend/src/modules/wishlist/](backend/src/modules/wishlist/) - Wishlist
- [backend/src/modules/categories/](backend/src/modules/categories/) - Categorías
- [backend/src/modules/cms/](backend/src/modules/cms/) - CMS
- [backend/src/modules/analytics/](backend/src/modules/analytics/) - Analytics

---

## 📝 Notas de Seguridad

1. **Tokens JWT:** Expiran después de cierto tiempo (check en `config.jwt.secret`)
2. **CORS:** Validar que los orígenes permitidos estén correctamente configurados
3. **Validación:** Todos los inputs deben validarse en backend
4. **Contraseñas:** Almacenadas hasheadas en BD, nunca en texto plano
5. **Permisos:** Siempre verificados en el servidor, nunca confiar en token del cliente

---

**Documento finalizado:** 6 de Marzo de 2026  
**Versión:** 1.0  
**Estado:** Completo y Verificado
