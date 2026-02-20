#!/bin/bash
# ============================================================
# FlexiCommerce - Script de desarrollo para Expo Go
# Levanta PostgreSQL + Backend con tunnel + Mobile con tunnel
# ============================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
MOBILE_DIR="$ROOT_DIR/mobile"
MOBILE_ENV="$MOBILE_DIR/.env"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   FlexiCommerce - Inicio para Expo Go${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# ── 1. PostgreSQL ─────────────────────────────────────────
echo -e "${YELLOW}[1/4] Iniciando PostgreSQL...${NC}"
if ! pg_isready -q 2>/dev/null; then
  sudo service postgresql start
  sleep 2
fi
echo -e "${GREEN}✅ PostgreSQL corriendo${NC}"
echo ""

# ── 2. Backend en background ──────────────────────────────
echo -e "${YELLOW}[2/4] Iniciando Backend (puerto 3001)...${NC}"
cd "$BACKEND_DIR"
npm run dev > /tmp/flexicommerce-backend.log 2>&1 &
BACKEND_PID=$!
sleep 4

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend corriendo en http://localhost:3001${NC}"
else
  echo -e "${RED}❌ Backend no respondió. Ver logs: tail /tmp/flexicommerce-backend.log${NC}"
  exit 1
fi
echo ""

# ── 3. Tunnel para el Backend ─────────────────────────────
echo -e "${YELLOW}[3/4] Creando tunnel para el Backend...${NC}"
cd "$BACKEND_DIR"

# Iniciar localtunnel y capturar URL
npx lt --port 3001 --subdomain flexicommerce-api-$(whoami | tr -d ' ') > /tmp/lt-backend.log 2>&1 &
LT_PID=$!
sleep 5

BACKEND_TUNNEL_URL=$(grep -o 'https://[^ ]*' /tmp/lt-backend.log | head -1)

if [ -z "$BACKEND_TUNNEL_URL" ]; then
  # Intentar URL genérica de localtunnel
  BACKEND_TUNNEL_URL=$(cat /tmp/lt-backend.log | grep -o 'https://[a-z0-9-]*\.loca\.lt' | head -1)
fi

if [ -z "$BACKEND_TUNNEL_URL" ]; then
  echo -e "${RED}❌ No se pudo obtener URL del tunnel del backend${NC}"
  echo -e "${YELLOW}   Revisa: cat /tmp/lt-backend.log${NC}"
  echo -e "${YELLOW}   Usando IP local como fallback...${NC}"
  # Fallback: usar IP de Windows si está disponible
  WIN_IP=$(cat /etc/resolv.conf 2>/dev/null | grep nameserver | awk '{print $2}' | head -1)
  if [ -n "$WIN_IP" ]; then
    BACKEND_TUNNEL_URL="http://$WIN_IP:3001"
    echo -e "${YELLOW}   IP de Windows detectada: $BACKEND_TUNNEL_URL${NC}"
  else
    BACKEND_TUNNEL_URL="http://172.26.230.69:3001"
  fi
else
  echo -e "${GREEN}✅ Backend tunnel: $BACKEND_TUNNEL_URL${NC}"
fi
echo ""

# ── 4. Actualizar .env del mobile ─────────────────────────
echo -e "${YELLOW}[4/4] Actualizando API URL del mobile...${NC}"
if [ -f "$MOBILE_ENV" ]; then
  # Reemplazar la línea EXPO_PUBLIC_API_URL
  sed -i "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=$BACKEND_TUNNEL_URL|" "$MOBILE_ENV"
else
  echo "EXPO_PUBLIC_API_URL=$BACKEND_TUNNEL_URL" > "$MOBILE_ENV"
  echo "EXPO_PUBLIC_APP_NAME=FlexiCommerce" >> "$MOBILE_ENV"
fi
echo -e "${GREEN}✅ mobile/.env actualizado con: $BACKEND_TUNNEL_URL${NC}"
echo ""

# ── Resumen ───────────────────────────────────────────────
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}   Todo listo! Instrucciones:${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "  Backend:  ${GREEN}http://localhost:3001${NC}"
echo -e "  Tunnel:   ${GREEN}$BACKEND_TUNNEL_URL${NC}"
echo ""
echo -e "${YELLOW}Ahora en OTRA terminal ejecuta:${NC}"
echo -e "  ${BLUE}cd $MOBILE_DIR && npm run tunnel${NC}"
echo ""
echo -e "${YELLOW}Luego escanea el QR con Expo Go.${NC}"
echo ""
echo -e "Presiona ${RED}Ctrl+C${NC} para detener todo."
echo ""

# Cleanup al salir
cleanup() {
  echo ""
  echo -e "${YELLOW}Deteniendo servicios...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $LT_PID 2>/dev/null || true
  echo -e "${GREEN}Servicios detenidos.${NC}"
}
trap cleanup EXIT INT TERM

# Mantener corriendo y mostrar logs del backend
echo -e "${YELLOW}=== Logs del Backend ===${NC}"
tail -f /tmp/flexicommerce-backend.log
