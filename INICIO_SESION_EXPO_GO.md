# 📱 Guía: Iniciar Sesión en FlexiCommerce con Expo Go

## ✅ Estado Actual - 20/02/2026

| Plataforma | Comando | Estado | Notas |
|-----------|---------|--------|-------|
| **Android (Expo Go)** | `npm start -- --tunnel --clear` | ✅ Funcionando | QR visible, Login OK |
| **Android (Expo Go)** | `npm run dev` | ✅ Funcionando | Localhost, requiere red LAN |
| **Web (`Press w`)** | `npm start -- --tunnel --clear` | ❌ Roto | Conflicto react-native-web |
| **iOS** | No probado | ⏳ Pendiente | Requiere dispositivo/simulator |

---

## 🚀 MÉTODO FUNCIONANDO: Android con Tunnel

### Terminal 1: Levantar Backend + Tunnel

```bash
cd /home/omarhernandez/personalProjects/FlexiCommerce
docker ps  # Verificar que PostgreSQL y Redis estén corriendo
bash ./start-mobile-dev-docker.sh
```

**Esperado:**
- Backend en `http://localhost:3001` ✅
- Tunnel Cloudflare activo (ej: `https://rec-womens-pearl-spectrum.trycloudflare.com`)
- `mobile/.env` actualizado con la URL del tunnel

---

### Terminal 2: Levantar Expo Go para Android

```bash
cd /home/omarhernandez/personalProjects/FlexiCommerce/mobile
npm start -- --tunnel --clear
```

O alternativamente:
```bash
npm run dev
```

**Esperado:**
- Metro Bundler inicia
- Aparece **QR Code** en la terminal (expira cada ~10 min)
- Línea de estado: `Metro waiting on exp://172.26.230.69:80XX`

---

### 📱 En Tu Teléfono (Android)

1. Abre la app **Cámara**
2. **Apunta al QR** que apareció en la terminal
3. Toca **"Abrir en Expo Go"**
4. Espera a que descargue y se abra (~2-3 minutos primera vez)
5. Una vez cargada, toca el botón de **Login**

---

### 🔓 Credenciales de Login - ✅ CONFIRMADAS FUNCIONANDO

#### Usuario Normal
```
Email: test@flexicommerce.com
Contraseña: Test@12345
```

#### Usuario Admin
```
Email: admin@flexicommerce.com
Contraseña: Admin@12345
```

---

## 🛠️ Comandos Útiles en Expo (Terminal)

Una vez dentro de Expo, en la terminal puedes presionar:

| Tecla | Acción | Estado |
|-------|--------|--------|
| `r` | Recargar app | ✅ Funciona |
| `a` | Abrir en Android | ✅ Funciona |
| `w` | Abrir en Web | ❌ Roto (react-native-web issue) |
| `i` | Abrir en iOS | ⏳ No probado |
| `j` | Abrir debugger | ✅ Funciona |
| `m` | Toggle menu | ✅ Funciona |
| `?` | Ver todos los comandos | ✅ Funciona |

---

## ⚡ Comandos del Package.json

```bash
npm start -- --tunnel --clear    # ✅ Tunnel mode para Android
npm run dev                       # ✅ Localhost mode para Android
npm run tunnel-clear              # Alias para npm start -- --tunnel --clear
npm run android                   # Android emulator
npm run ios                       # iOS simulator
npm run build                     # EAS build
```

---

## 🆘 Troubleshooting

### El QR no aparece
```bash
Ctrl+C  # Mata Expo
npm start -- --tunnel --clear  # Reinicia
# O espera 20 segundos, suele aparecer
```

### Error "Something went wrong" en la app
- Presiona `r` en la terminal para recargar
- Verifica que `mobile/.env` tenga URL correcta: `cat mobile/.env`
- Comprueba que el tunnel de Cloudflare está activo

### Error de conexión al API
```bash
# Verifica que el tunnel responde:
curl https://rec-womens-pearl-spectrum.trycloudflare.com/api/health
```

### Puerto 8081/8083 en uso
```bash
fuser -k 8081/tcp 8083/tcp
pkill -9 -f "expo start"
sleep 2
npm start -- --tunnel --clear
```

### Tunnel Cloudflare caído
- Ejecuta `bash ./start-mobile-dev-docker.sh` nuevamente en otra terminal
- Actualizará `mobile/.env` automáticamente
- Presiona `r` en Expo para recargar con nueva URL

### QR expirado
- El QR de Expo expira cada ~10 minutos
- Presiona `q` en la terminal o `Ctrl+C` y vuelve a ejecutar el comando

---

## 📊 Versiones Confirmadas como Funcionales

```json
{
  "react": "19.1.0",
  "react-dom": "19.1.0",
  "react-native": "0.81.5",
  "react-native-screens": "~4.16.0",
  "expo": "^54.0.0",
  "expo-router": "~6.0.23"
}
```

⚠️ **Problema conocido**: `react-native-web@0.21.2` no es compatible con React 19.1.0 - Web no funciona

---

**Estado:** ✅ Android Funcionando | ❌ Web Roto (en reparación) | ⏳ iOS Pendiente  
**Última actualización:** 20/02/2026 - Omar Hernandez  
**Próximo paso:** Arreglar react-native-web para web
---

## ⚠️ Problemas Conocidos

### ❌ Web (Press w) No Funciona

**Causa**: `react-native-web@0.21.2` no es compatible con `React 19.1.0`

**Estado**: React 19.x no tiene soporte oficial en react-native-web aún

**Workaround**: 
- Usa **Android** para desarrollo móvil (✅ Funcionando)
- Usa el **frontend en `/frontend`** para web (Next.js)

**Opciones futuras**:
1. Downgrade React a 18.2.0 (web funcionaría pero perdería nuevas features)
2. Mantener frontend separado en Next.js (actual arquitectura)
3. Esperar a que react-native-web soporte React 19 oficialmente

---

## 📋 Resumen de Plataformas

| Plataforma | Estado | Recomendación |
|-----------|--------|---------------|
| **Android Expo Go** | ✅ Funcionando | Usar `npm start -- --tunnel --clear` |
| **Web Expo** | ❌ No compatible | Usar `/frontend` (Next.js) |
| **iOS** | ⏳ No probado | Requiere setup en Mac |

---

**Estado General:** ✅ Android listo para desarrollo | ⚠️ Web usar Next.js | ⏳ iOS pendiente  
**Confirmado:** 20/02/2026
