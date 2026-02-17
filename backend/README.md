# 🔧 Backend - FlexiCommerce

Backend robusto construido con Express.js, TypeScript, Prisma y PostgreSQL.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus valores

# Base de datos
npm run db:migrate   # Ejecutar migraciones
npm run db:generate  # Generar Prisma Client

# Desarrollo (con hot reload)
npm run dev
# El servidor estará en http://localhost:3001

# Build
npm run build

# Producción
npm run start

# Linting
npm run lint

# Type checking
npm run type-check

# Format
npm run format
```

## 📁 Estructura

```
backend/
├── src/
│   ├── app.ts                  # Configuración Express
│   ├── server.ts               # Punto de entrada
│   │
│   ├── modules/                # Módulos funcionales por feature
│   │   ├── auth/              # Autenticación
│   │   │   ├── controller.ts  # Handlers HTTP
│   │   │   ├── service.ts     # Lógica de negocio
│   │   │   ├── routes.ts      # Rutas Express
│   │   │   ├── types.ts       # Tipos TypeScript
│   │   │   └── index.ts
│   │   ├── users/             # Gestión de usuarios
│   │   ├── products/          # Gestión de productos
│   │   ├── categories/        # Categorías
│   │   ├── orders/            # Pedidos
│   │   ├── payments/          # Pagos
│   │   ├── reviews/           # Reseñas
│   │   └── cms/               # Contenido
│   │
│   ├── middlewares/           # Middlewares Express
│   │   ├── auth.ts           # Verificación JWT
│   │   ├── errorHandler.ts   # Manejo de errores
│   │   └── validation.ts     # Validación de datos
│   │
│   ├── config/               # Configuraciones
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   │
│   ├── database/             # ORM Prisma
│   │   └── schema.prisma
│   │
│   └── utils/                # Utilidades
│       ├── jwt.ts
│       ├── errors.ts
│       └── validators.ts
│
├── dist/                      # Build compilado (generado)
│
├── package.json
├── tsconfig.json
├── prisma.schema
├── .env.example
└── .gitignore
```

## ⚙️ Configuración

### .env

```bash
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/flexicommerce
JWT_SECRET=your_super_secret_key_12345
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
```

## 📦 Dependencias Principales

- **Express** 4.18+ - Web framework
- **Prisma** 5.7+ - ORM
- **TypeScript** 5.3+ - Type safety
- **PostgreSQL** 15+ - Database
- **JWT** - Autenticación
- **Bcrypt** 5.1+ - Password hashing
- **CORS** 2.8+ - CORS handling
- **Helmet** 7.1+ - Security headers

## 🗄️ Base de Datos

### Conexión PostgreSQL

```bash
# Crear base de datos
createdb flexicommerce

# O con PostgreSQL en Docker
docker run --name flexicommerce-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=flexicommerce \
  -p 5432:5432 \
  postgres:15
```

### Migraciones

```bash
# Crear nueva migración
npm run db:migrate

# Generar Prisma Client (después de cambios en schema)
npm run db:generate

# Ver estado de BD
npm run db:push
```

## 🏗️ Arquitectura Modular

Cada módulo sigue esta estructura:

```
modules/feature/
├── controller.ts    # Handles HTTP requests/responses
├── service.ts       # Business logic
├── routes.ts        # Express routes definition
├── types.ts         # TypeScript interfaces
└── index.ts         # Module exports
```

### Ejemplo: Authentication Module

**types.ts**
```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
}
```

**service.ts**
```typescript
export class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Lógica de login
  }
}
```

**controller.ts**
```typescript
export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  }
}
```

**routes.ts**
```typescript
export const authRoutes = Router();
authRoutes.post('/login', authController.login);
authRoutes.post('/register', authController.register);
```

## 🔐 Autenticación

Sistema basado en **JWT**:

1. Cliente hace POST `/api/auth/login` con credenciales
2. Backend valida y retorna JWT
3. Cliente incluye JWT en header `Authorization: Bearer <token>`
4. Backend verifica JWT en middleware

```typescript
// Middleware de autenticación
app.use('/api/protected', verifyToken, protectedRoutes);
```

## 🧪 Crear un Nuevo Módulo

```bash
# 1. Crear carpeta
mkdir -p src/modules/my-feature

# 2. Crear archivos base
touch src/modules/my-feature/{types,service,controller,routes,index}.ts

# 3. Registrar en app.ts
import { myFeatureRoutes } from './modules/my-feature/routes';
app.use('/api/my-feature', myFeatureRoutes);
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Autenticación
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
```

### Usuarios
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Productos
```
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Órdenes
```
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id
PUT    /api/orders/:id
```

## 🚢 Deployment

### Railway
```bash
railway login
railway init
railway deploy
```

### Render
```bash
# Conectar repo en Render
# Build command: npm run build
# Start command: npm run start
```

### Fly.io
```bash
flyctl auth login
flyctl launch
flyctl deploy
```

### Servidor Propio (VPS)
```bash
npm run build
npm run start
# O con PM2:
pm2 start dist/src/server.js
```

## 🐛 Debugging

```bash
# Con logging
DEBUG=* npm run dev

# Con inspector de Node
node --inspect dist/src/server.js
# Luego abrir chrome://inspect
```

## 📚 Documentación

- [Express Docs](https://expressjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/)

---

¡Backend listo para escalar! 🚀
