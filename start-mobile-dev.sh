#!/bin/bash
# ============================================================
# FlexiCommerce - Script de desarrollo para Expo Go
# Levanta PostgreSQL + Backend + Tunnel Cloudflare + actualiza .env
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
CLOUDFLARED="/tmp/cloudflared"

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

# ── 2. Backend ────────────────────────────────────────────
echo -e "${YELLOW}[2/4] Iniciando Backend (puerto 3001)...${NC}"
cd "$BACKEND_DIR"
npm run dev > /tmp/flexicommerce-backend.log 2>&1 &
BACKEND_PID=$!
sleep 5

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend corriendo${NC}"
else
  echo -e "${RED}❌ Backend falló. Ver: tail /tmp/flexicommerce-backend.log${NC}"
  exit 1
fi
echo ""

# ── 3. Descargar cloudflared si no existe ─────────────────
if [ ! -f "$CLOUDFLARED" ]; then
  echo -e "${YELLOW}[3/4] Descargando cloudflared...${NC}"
  wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O "$CLOUDFLARED"
  chmod +x "$CLOUDFLARED"
fi

# ── 4. Tunnel con cloudflared ─────────────────────────────
echo -e "${YELLOW}[4/4] Creando tunnel para el Backend...${NC}"
"$CLOUDFLARED" tunnel --url http://localhost:3001 --no-autoupdate > /tmp/cloudflared.log 2>&1 &
CF_PID=$!
sleep 8

TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/cloudflared.log | head -1)

if [ -z "$TUNNEL_URL" ]; then
  echo -e "${RED}❌ No se pudo obtener URL del tunnel${NC}"
  echo "Log: $(cat /tmp/cloudflared.log | grep -i 'https://' | head -3)"
  kill $BACKEND_PID 2>/dev/null || true
  exit 1
fi

echo -e "${GREEN}✅ Tunnel activo: $TUNNEL_URL${NC}"
echo ""

# ── Actualizar .env del mobile ────────────────────────────
if [ -f "$MOBILE_ENV" ]; then
  sed -i "s|EXPO_PUBLIC_API_URL=.*|EXPO_PUBLIC_API_URL=$TUNNEL_URL|" "$MOBILE_ENV"
else
  echo "EXPO_PUBLIC_API_URL=$TUNNEL_URL" > "$MOBILE_ENV"
  echo "EXPO_PUBLIC_APP_NAME=FlexiCommerce" >> "$MOBILE_ENV"
fi
echo -e "${GREEN}✅ mobile/.env actualizado${NC}"
echo ""

# ── Resumen ───────────────────────────────────────────────
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}   Todo listo!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "  Backend local:  ${GREEN}http://localhost:3001${NC}"
echo -e "  Backend tunnel: ${GREEN}$TUNNEL_URL${NC}"
echo ""
echo -e "${YELLOW}Ahora en OTRA terminal ejecuta:${NC}"
echo -e "  ${BLUE}cd mobile && npm run tunnel${NC}"
echo ""
echo -e "Credenciales de prueba:"
echo -e "  📧 ${GREEN}test@flexicommerce.com${NC} / ${GREEN}Test@12345${NC}"
echo -e "  📧 ${GREEN}admin@flexicommerce.com${NC} / ${GREEN}Admin@12345${NC}"
echo ""
echo -e "Presiona ${RED}Ctrl+C${NC} para detener todo."
echo ""

cleanup() {
  echo -e "\n${YELLOW}Deteniendo servicios...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $CF_PID 2>/dev/null || true
  echo -e "${GREEN}Listo.${NC}"
}
trap cleanup EXIT INT TERM

tail -f /tmp/flexicommerce-backend.log
