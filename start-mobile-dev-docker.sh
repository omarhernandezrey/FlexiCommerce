#!/bin/bash
# ============================================================
# FlexiCommerce - Script de desarrollo para Expo Go (Docker)
# Levanta Backend + Tunnel Cloudflare (PostgreSQL ya en Docker)
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

# ── 1. Verificar Docker ────────────────────────────────────
echo -e "${YELLOW}[1/3] Verificando Docker (PostgreSQL)...${NC}"
if ! docker ps | grep -q "flexicommerce-db"; then
  echo -e "${RED}❌ PostgreSQL no está corriendo. Ejecuta:${NC}"
  echo "  docker compose up -d"
  exit 1
fi
echo -e "${GREEN}✅ PostgreSQL en Docker corriendo${NC}"
echo ""

# ── 2. Backend ────────────────────────────────────────────
echo -e "${YELLOW}[2/3] Iniciando Backend (puerto 3001)...${NC}"
cd "$BACKEND_DIR"
npm run dev &
BACKEND_PID=$!
sleep 5

if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend corriendo en http://localhost:3001${NC}"
else
  echo -e "${YELLOW}⚠️  Backend podría estar iniciando... esperando...${NC}"
  sleep 5
fi
echo ""

# ── 3. Descargar cloudflared si no existe ─────────────────
echo -e "${YELLOW}[3/3] Configurando Tunnel Cloudflare...${NC}"

if [ ! -f "$CLOUDFLARED" ]; then
  echo "Descargando cloudflared..."
  curl -L --output "$CLOUDFLARED" https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  chmod +x "$CLOUDFLARED"
fi
echo -e "${GREEN}✅ cloudflared listo${NC}"
echo ""

# ── 4. Crear tunnel y obtener URL ─────────────────────────
echo -e "${YELLOW}Creando tunnel Cloudflare -> http://localhost:3001${NC}"
TUNNEL_URL=$("$CLOUDFLARED" tunnel --url http://localhost:3001 2>&1 | grep -oP 'https://[^ ]+' | head -1)

if [ -z "$TUNNEL_URL" ]; then
  echo -e "${RED}❌ Error creando tunnel${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Tunnel creado: $TUNNEL_URL${NC}"
echo ""

# ── 5. Actualizar .env en mobile ──────────────────────────
echo -e "${YELLOW}Actualizando mobile/.env con URL del tunnel...${NC}"
cat > "$MOBILE_ENV" << EOF
# Auto-generado por start-mobile-dev-docker.sh
EXPO_PUBLIC_API_URL=$TUNNEL_URL
EOF

echo -e "${GREEN}✅ .env actualizado${NC}"
echo ""

# ── 6. Instrucciones finales ──────────────────────────────
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   ¡LISTO! Sistema en marcha${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "URL de la API (desde mobile):"
echo -e "  ${CYAN}$TUNNEL_URL${NC}"
echo ""
echo "Próximos pasos:"
echo "  1. Abre otra terminal"
echo "  2. cd mobile"
echo "  3. npm start -- --tunnel --clear"
echo "  4. Escanea el QR con Expo Go"
echo "  5. Login con: test@flexicommerce.com / Test@12345"
echo ""
echo "Para detener: presiona Ctrl+C"
echo ""

# Mantener el proceso vivo
wait
