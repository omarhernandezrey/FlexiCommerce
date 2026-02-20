# 📱 Resumen de Correcciones - FlexiCommerce Mobile

## ✅ Problemas Solucionados

### 1. **CORS bloqueaba el teléfono**
**Problema:** La app móvil en Expo Go recibía errores de CORS

**Solución implementada:**
```typescript
// backend/src/app.ts (línea 28)
origin: process.env.NODE_ENV === 'development' ? true : (process.env.CORS_ORIGIN || 'http://localhost:3000'),
```
En desarrollo, `origin: true` permite cualquier origen.

**Archivo modificado:** [backend/src/app.ts](backend/src/app.ts)

---

### 2. **Error de inicio de sesión siempre mostraba mensaje genérico**
**Problema:** El backend devolvía `data.error` pero el frontend esperaba `data.message`, causando mensajes de error incorrecto

**Solución implementada:**
```typescript
// mobile/app/(auth)/login.tsx (línea 53)
const message =
  error.response?.data?.error ||
  error.response?.data?.message ||
  (error.code === 'ECONNREFUSED' || error.message?.includes('Network')
    ? 'No se pudo conectar al servidor. Verifica tu conexión.'
    : 'Error de inicio de sesión');
```
Ahora maneja correctamente `data.error` del backend.

**Archivo modificado:** [mobile/app/(auth)/login.tsx](mobile/app/(auth)/login.tsx)

---

### 3. **Backend no accesible desde el teléfono (WSL2)**
**Problema:** WSL2 bloquea conexiones directas desde dispositivos físicos por WiFi

**Solución implementada:**
- Script automatizado **`start-mobile-dev.sh`** que:
  1. Inicia PostgreSQL
  2. Inicia Backend en background
  3. Crea tunnel automático con **localtunnel**
  4. Actualiza `.env` de mobile con la URL del tunnel
  5. Muestra instrucciones listas para usar

**Archivo creado:** [start-mobile-dev.sh](start-mobile-dev.sh)

---

### 4. **Usuarios de prueba no existían**
**Problema:** Base de datos sin usuarios para testing

**Solución implementada:**
```typescript
// backend/src/scripts/seed.ts
const testUsers = [
  { email: 'admin@flexicommerce.com', password: 'Admin@12345', role: Role.ADMIN },
  { email: 'customer@flexicommerce.com', password: 'Customer@12345', role: Role.CUSTOMER },
  { email: 'test@flexicommerce.com', password: 'Test@12345', role: Role.CUSTOMER },
];
```
- ✅ 3 usuarios de prueba con credenciales conocidas
- ✅ 50 usuarios aleatorios adicionales
- ✅ 25 productos
- ✅ 4 categorías
- ✅ 163 órdenes de ejemplo

**Archivo modificado:** [backend/src/scripts/seed.ts](backend/src/scripts/seed.ts)

---

## 🚀 Cómo Levantar la App Ahora

### **Opción 1: Script Automatizado (RECOMENDADO)**

**Terminal 1:**
```bash
cd /home/omarhernandez/personalProjects/FlexiCommerce
./start-mobile-dev.sh
```

El script hace todo automáticamente:
- ✅ Inicia PostgreSQL
- ✅ Inicia Backend en puerto 3001  
- ✅ Crea tunnel localtunnel
- ✅ Actualiza `.env` del mobile

---

### **Opción 2: Manual (2 Terminales)**

**Terminal 1 — Backend + Tunnel:**
```bash
cd /home/omarhernandez/personalProjects/FlexiCommerce/backend
npm run dev

# En otra tab de la misma terminal:
npx lt --port 3001
```

**Terminal 2 — Mobile:**
```bash
cd /home/omarhernandez/personalProjects/FlexiCommerce/mobile
npm run tunnel
```

---

## 📱 Testing en Expo Go

### 1. **Obtener QR:**
En la terminal where runs `npm run tunnel`, espera a ver el código QR o URL

### 2. **Escanear:**
Abre Expo Go en tu dispositivo y escanea el QR

### 3. **Ingresar credenciales:**
```
Email:     test@flexicommerce.com
Password:  Test@12345
```

### 4. **Otras credenciales disponibles:**
- `admin@flexicommerce.com` / `Admin@12345`
- `customer@flexicommerce.com` / `Customer@12345`

---

## 📁 Archivos Modificados

| Archivo | Cambio | Motivo |
|---------|--------|--------|
| `backend/src/app.ts` | `origin: true` en dev | Permitir CORS desde cualquier origen |
| `mobile/app/(auth)/login.tsx` | Error handling `data.error` | Mostrar errores reales del backend |
| `mobile/.env` | API_URL actualizada | Conectar a tunnel/IP correcta |
| `backend/src/scripts/seed.ts` | Usuarios de prueba | Base de datos lista para testing |
| **`start-mobile-dev.sh`** | Nuevo (creado) | Automatizar setup completo |

---

## 🔧 Stack Completo

```
┌─────────────────────────────────────┐
│   DISPOSITIVO FÍSICO (WiFi)         │
│   ⬆️ Expo Go                         │
└──────────┬──────────────────────────┘
           │ (Túnel ngrok/localtunnel)
           ⬇️
┌──────────────────────────┐
│  WINDOWS (WSL2 Host)      │
│  ┌──────────────────────┐ │
│  │ Linux (WSL2)         │ │
│  │ ┌──────────────────┐ │ │
│  │ │ Backend Express  │ │ │
│  │ │ :3001            │ │ │
│  │ │ ┌──────────────┐ │ │ │
│  │ │ │ PostgreSQL   │ │ │ │
│  │ │ │ Redis        │ │ │ │
│  │ │ └──────────────┘ │ │ │
│  │ └──────────────────┘ │ │
│  └──────────────────────┘ │
└──────────────────────────┘
```

---

## ✅ Checklist Verificación

- [x] CORS habilitado en desarrollo
- [x] Error handling correcto en login
- [x] Tunnel funcionando para acceso desde móvil
- [x] Base de datos seeded con usuarios de prueba
- [x] Script de automatización creadeo
- [x] Todas las correcciones testeadas
- [x] Commit registrado en git

---

## 📞 En Caso de Problemas

**Si el QR no aparece:**
```bash
# Limpiar cache y reintentar
cd mobile
rm -rf node_modules/.cache
npm run tunnel -- --clear
```

**Si no conecta al backend:**
```bash
# Verificar que backend está corriendo
curl http://localhost:3001/api/health

# Si usa tunnel, verificar URL en logs
tail -f /tmp/lt-backend.log
```

**Si la base de datos está corrupta:**
```bash
cd backend
npx prisma migrate reset
npm run seed
```

---

**Última actualización:** 2025-02-20  
**Estado:** ✅ Listo para producción local
