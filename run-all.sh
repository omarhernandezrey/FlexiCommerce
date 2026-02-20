#!/bin/bash

# FlexiCommerce - Start All Services
# Este script inicia todos los servicios necesarios

set -e

echo "🚀 Iniciando FlexiCommerce..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar que los directorios existen
if [ ! -d "backend" ] || [ ! -d "frontend" ] || [ ! -d "mobile" ]; then
  echo -e "${RED}Error: No se encuentran los directorios de backend, frontend o mobile${NC}"
  echo "Asegúrate de ejecutar este script desde la raíz del proyecto FlexiCommerce"
  exit 1
fi

echo -e "${YELLOW}1️⃣  Instalando dependencias...${NC}"
cd backend && npm install > /dev/null 2>&1 && cd ..
cd frontend && npm install > /dev/null 2>&1 && cd ..
cd mobile && npm install > /dev/null 2>&1 && cd ..
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

echo ""
echo -e "${YELLOW}2️⃣  Iniciando servicios...${NC}"
echo ""

# Backend
echo -e "${GREEN}🔧 Backend en puerto 3001${NC}"
cd backend && npm run dev &
BACKEND_PID=$!
sleep 2

# Frontend
echo -e "${GREEN}💻 Frontend en puerto 3000${NC}"
cd ../frontend && npm run dev &
FRONTEND_PID=$!
sleep 2

# Mobile
echo -e "${GREEN}📱 Mobile en puerto 8081${NC}"
cd ../mobile && npm start &
MOBILE_PID=$!

echo ""
echo -e "${GREEN}✅ Todos los servicios iniciados!${NC}"
echo ""
echo "URLs:"
echo "  - Backend:  http://localhost:3001"
echo "  - Frontend: http://localhost:3000"
echo "  - Mobile:   http://localhost:8081"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"
echo ""

# Mantener el script corriendo
wait
