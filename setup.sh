#!/bin/bash

# FlexiCommerce Development Setup Script
# This script sets up the development environment for FlexiCommerce

set -e  # Exit on error

echo "🚀 FlexiCommerce Development Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are installed${NC}"
echo ""

# Create .env files if they don't exist
echo "🔧 Setting up environment files..."

if [ ! -f .env.local ]; then
    echo "Creating .env.local from template..."
    cp .env.example .env.local
    echo -e "${YELLOW}⚠️  Please edit .env.local with your configuration${NC}"
fi

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env..."
    cat > backend/.env << EOF
NODE_ENV=development
DATABASE_URL=postgresql://flexicommerce:dev_password@postgres:5432/flexicommerce_dev
REDIS_URL=redis://redis:6379
JWT_SECRET=dev_secret_key_change_in_production
CORS_ORIGIN=http://localhost:3000
PORT=3001
EOF
fi

if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
fi

echo -e "${GREEN}✅ Environment files created${NC}"
echo ""

# Setup database
echo "🗄️  Setting up database..."

# Start services in the background
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker-compose exec -T postgres pg_isready -U flexicommerce &> /dev/null; then
        echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    exit 1
fi

echo ""

# Backend setup
echo "📦 Setting up backend..."

if [ ! -d backend/node_modules ]; then
    echo "Installing backend dependencies..."
    docker-compose run --rm backend npm install
fi

echo "Running database migrations..."
docker-compose run --rm backend npx prisma migrate deploy

echo "Seeding database..."
docker-compose run --rm backend npx prisma db seed || true

echo -e "${GREEN}✅ Backend setup complete${NC}"
echo ""

# Frontend setup
echo "🎨 Setting up frontend..."

if [ ! -d frontend/node_modules ]; then
    echo "Installing frontend dependencies..."
    docker-compose run --rm frontend npm install
fi

echo -e "${GREEN}✅ Frontend setup complete${NC}"
echo ""

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

echo ""
echo "==================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "==================================="
echo ""
echo "📍 Services running on:"
echo "  • Frontend:  http://localhost:3000"
echo "  • Backend:   http://localhost:3001"
echo "  • Database:  localhost:5432"
echo "  • Redis:     localhost:6379"
echo "  • PgAdmin:   http://localhost:5050 (run with: docker-compose --profile dev-tools up -d)"
echo ""
echo "📚 Useful commands:"
echo "  • View logs:        docker-compose logs -f"
echo "  • Stop services:    docker-compose down"
echo "  • Rebuild images:   docker-compose build --no-cache"
echo "  • Run migrations:   docker-compose exec backend npx prisma migrate dev"
echo "  • Access database:  docker-compose exec postgres psql -U flexicommerce -d flexicommerce_dev"
echo ""
echo "🎉 Happy coding!"
