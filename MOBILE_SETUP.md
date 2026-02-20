# FlexiCommerce Mobile — Guía de Desarrollo

## Requisitos previos
- Node.js 18+
- Expo Go instalado en el teléfono Android (SDK 54)
- WSL2 en Windows 10/11
- PostgreSQL (para el backend)

---

## Levantar todo el proyecto

Abrir **4 terminales** y ejecutar en orden:

### Terminal 1 — Base de datos
```bash
sudo service postgresql start
```

Primera vez (crear usuario y base de datos):
```bash
sudo -u postgres psql -c "CREATE USER flexicommerce WITH PASSWORD 'dev_password';"
sudo -u postgres psql -c "CREATE DATABASE flexicommerce_dev OWNER flexicommerce;"
```

### Terminal 2 — Backend (puerto 3001)
```bash
cd backend
npx prisma generate
npx prisma db push     # solo primera vez o cuando cambia el schema
npm run dev
```
Esperar: `Server running on port 3001`

### Terminal 3 — Frontend (puerto 3000)
```bash
cd frontend
npm run dev
```
Abrir en navegador: http://localhost:3000

### Terminal 4 — Mobile con Expo Go
```bash
cd mobile
npm run tunnel
```
Escanear el QR con la app **Expo Go** en el teléfono.
La URL será tipo `exp://xxxx.ngrok.io` — ese es el correcto para WSL2.

---

## Por qué `npm run tunnel` y no `npm start`

En WSL2, la IP interna (`172.26.x.x`) no es accesible desde el teléfono por WiFi.
El tunnel de ngrok crea una URL pública que el teléfono sí puede alcanzar.

---

## Estructura del proyecto mobile

```
mobile/
├── app/
│   ├── _layout.tsx          # Layout raíz con Stack
│   ├── index.tsx            # Splash + redirección según autenticación
│   ├── (auth)/              # Grupo de rutas de autenticación
│   │   ├── _layout.tsx
│   │   ├── login.tsx        # Pantalla principal de login
│   │   ├── register.tsx
│   │   ├── reset-password.tsx
│   │   ├── terms.tsx
│   │   └── privacy.tsx
│   └── (app)/               # Grupo de rutas de la app (requiere login)
│       ├── _layout.tsx      # Layout con 5 tabs
│       ├── index.tsx        # Pantalla de inicio
│       ├── search.tsx
│       ├── cart.tsx
│       ├── wishlist.tsx
│       ├── profile.tsx
│       ├── checkout.tsx
│       ├── orders.tsx
│       ├── advanced-search.tsx
│       ├── compare.tsx
│       ├── products/[id].tsx
│       ├── orders/[id].tsx
│       └── reviews/[id].tsx
├── components/              # Componentes reutilizables
├── store/                   # Estado global con Zustand
├── hooks/                   # Custom hooks
├── lib/                     # API client, servicios, validación
├── styles/                  # Tema (colores, spacing, etc.)
└── assets/                  # Imágenes de la app
```

---

## Reglas críticas de desarrollo

### Expo Router 6
- El `_layout.tsx` raíz **nunca debe retornar `null`**
- Para animaciones usar `animation: 'none'` (NO `animationEnabled: false`)
- Navegar a grupos: `<Redirect href="/(app)" />` (NO `/(app)/index`)

### Zustand + AsyncStorage
- El store se hidrata de forma asíncrona al iniciar
- Siempre esperar la hidratación antes de redirigir:
```tsx
useEffect(() => {
  if (useAuthStore.persist.hasHydrated()) {
    setHydrated(true);
    return;
  }
  const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  return unsub;
}, []);
```

### Instalación de paquetes
```bash
# Siempre usar este flag para evitar conflictos con React 19
npm install <paquete> --legacy-peer-deps
```

### tsconfig.json
- Debe extender `expo/tsconfig.base`
- **NO** agregar `"moduleResolution": "node"` — rompe expo-router

### app.json
- `"scheme": "flexicommerce"` al nivel raíz (singular)
- Los plugins deben incluir `"expo-router"`

---

## Variables de entorno (mobile/.env)

```env
EXPO_PUBLIC_API_URL=http://<IP-DE-WINDOWS>:3001
EXPO_PUBLIC_APP_NAME=FlexiCommerce
```

La IP debe ser la de Windows en la red WiFi (no la de WSL2).
Para ver tu IP de Windows, ejecutar en PowerShell: `ipconfig`
Buscar la IP del adaptador WiFi (ej: `192.168.1.x`).

---

## Dependencias principales (mobile)

| Paquete | Versión | Uso |
|---|---|---|
| expo | ^54.0.0 | SDK base |
| expo-router | ~6.0.23 | Navegación file-based |
| react | 19.1.0 | UI |
| react-native | 0.81.5 | Framework móvil |
| zustand | ^4.4.0 | Estado global |
| axios | ^1.6.0 | Llamadas HTTP |
| @react-native-async-storage/async-storage | 2.2.0 | Persistencia local |
| expo-notifications | ~0.32.16 | Notificaciones push |
| @expo/vector-icons | ^15.0.3 | Íconos (Ionicons) |

---

## Problemas comunes y soluciones

| Error | Causa | Solución |
|---|---|---|
| "Algo salió mal" en Expo Go | WSL2 IP no accesible | Usar `npm run tunnel` |
| "SDK incompatible" | Expo Go SDK ≠ proyecto SDK | Actualizar con `npx expo install expo@^54.0.0` |
| App se queda cargando | `_layout.tsx` retorna null | Nunca retornar null en layout raíz |
| "Cannot resolve entry file" | tsconfig incorrecto | Heredar de `expo/tsconfig.base` |
| Assets no encontrados | Carpeta assets vacía | Los PNGs existen en `mobile/assets/` |
| "Failed to download remote update" | IP de WSL2 en QR | Usar `npm run tunnel` |
