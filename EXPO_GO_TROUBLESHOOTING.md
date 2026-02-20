# 🔧 Troubleshooting - Expo Go Cargando Indefinidamente

## Problemas Comunes y Soluciones

### 1. 🌐 Error de Conexión de Red
**Síntomas:** "Waiting for network..." o se queda cargando

**Soluciones:**
```bash
# 1️⃣ Asegurar que están en la misma red
# Verificar IP del servidor
ifconfig | grep inet

# 2️⃣ Usar IP específica en lugar de localhost
npx expo start --tunnel  # Mejor para problemas de red

# 3️⃣ O especificar la IP manualmente
npx expo start --localhost false
```

### 2. 📦 Caché de Expo Corrupto
**Síntomas:** Errores aleatorios o módulos no encontrados

**Solución:**
```bash
cd mobile
npx expo start -c --clear
```

### 3. 🔌 Puerto 8081 No Accesible
**Síntomas:** Timeout al conectar

**Solución:**
```bash
# Verificar qué está usando el puerto
lsof -i :8081

# Si está en uso, liberar Puerto
kill -9 <PID>

# O usar diferente puerto
npx expo start --port 8082
```

### 4. 🧩 Problema con Zustand/SecureStore
**Síntomas:** "Cannot read property of undefined"

**Causa:** `SecureStore` puede no funcionar en Expo Go correctamente

**Solución:** Modificar `mobile/store/auth.ts`:

```typescript
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// En lugar de SecureStore, usar AsyncStorage en desarrollo
const storage = __DEV__ 
  ? createJSONStorage(() => AsyncStorage)
  : createJSONStorage(() => ({...})); // SecureStore para producción
```

### 5. 🎯 Problema con Expo Router
**Síntomas:** "Cannot find module 'expo-router/entry'"

**Solución:**
```bash
# Reinstalar expo-router
npm install expo-router@latest
npx expo start -c
```

### 6. 🔄 Problema de Actualización de Módulos
**Síntomas:** "Module not found" después de cambios

**Solución:**
```bash
cd mobile
rm -rf node_modules package-lock.json
npm install
npx expo start
```

---

## ⚡ Solución Rápida (Intenta esto primero)

```bash
cd mobile

# Opción 1: Limpiar caché y reiniciar
npx expo start -c --clear
# Escanea QR nuevamente

# Opción 2: Si sigue fallando, usar tunnel
npx expo start --tunnel
# Escanea código QR

# Opción 3: Si nada funciona, reconstruir completamente
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

---

## 🐛 Ver Logs Completos

Para debugging, abre el inspector de Expo:

**En Expo Go (app móvil):**
1. Menú (icono ≡)
2. "Shake to Open Developer Menu"
3. View inspector
4. Look at Console

**En Terminal:**
```bash
# Los logs deberían aparecer aquí
npx expo start  # Con logs detallados
```

---

## 📝 Verificación Previa

Asegurate de que:
- ✅ Backend está corriendo en `http://localhost:3001`
- ✅ El dispositivo/simulador está en la MISMA red que la máquina
- ✅ Firewall no está bloqueando el puerto 8081
- ✅ Node.js v18+ está instalado

---

**¿Cuál es el error exacto que ves?** Comparte el mensaje para ayudarte mejor.
