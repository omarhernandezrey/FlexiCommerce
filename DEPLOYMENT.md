# 📦 Deployment & DevOps Guide

Complete guide for deploying FlexiCommerce to production and managing infrastructure.

## Table of Contents

- [Local Development](#local-development)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Deployment](#production-deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Local Development

### Quick Setup

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

The setup script will:
1. Check Docker installation
2. Create environment files
3. Start Docker services
4. Run database migrations
5. Install dependencies
6. Seed database

### Manual Setup

```bash
# Copy environment template
cp .env.example .env.local

# Start Docker services
docker-compose up -d

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run database migrations
docker-compose exec backend npx prisma migrate dev

# Seed database
docker-compose exec backend npx prisma db seed
```

### Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432 (user: flexicommerce)
- **Redis**: localhost:6379
- **PgAdmin**: http://localhost:5050 (profile: dev-tools)

## Docker Setup

### Build Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build with no cache
docker-compose build --no-cache
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Connect to container
docker-compose exec backend bash

# Run one-off command
docker-compose run --rm backend npm test
```

### Database Services

```bash
# PostgreSQL
docker-compose exec postgres psql -U flexicommerce -d flexicommerce_dev

# Redis CLI
docker-compose exec redis redis-cli

# PgAdmin
docker-compose --profile dev-tools up -d pgadmin
# Visit http://localhost:5050
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# Server
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your@email.com
EMAIL_PASSWORD=app_password

# Storage (AWS S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your-bucket
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Migrations

### Create Migration

```bash
# Create new migration
docker-compose exec backend npx prisma migrate dev --name migration_name
```

### Apply Migrations (Production)

```bash
# Run pending migrations
docker-compose exec backend npx prisma migrate deploy
```

### Reset Database (Development Only)

```bash
# ⚠️ WARNING: This deletes all data
docker-compose exec backend npx prisma migrate reset
```

### Seed Database

```bash
docker-compose exec backend npx prisma db seed
```

## CI/CD Pipeline

### GitHub Actions

Pipeline triggers on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

### Pipeline Stages

1. **Lint & Type Check**
   - Backend linting and TypeScript validation
   - Frontend linting and TypeScript validation

2. **Build**
   - Build backend Docker image
   - Build frontend Docker image
   - Push to container registry

3. **Security**
   - Trivy vulnerability scanning
   - SARIF report uploaded to GitHub Security

4. **Integration Tests**
   - Run backend tests
   - Run frontend tests

5. **Deploy** (main branch only)
   - Deploy to staging (develop)
   - Deploy to production (main)

### Required Secrets

Add these to GitHub repository settings:

```
STAGING_DEPLOY_KEY          # SSH private key for staging
STAGING_HOST                # Staging server hostname
STAGING_USER                # Staging SSH user

PRODUCTION_DEPLOY_KEY       # SSH private key for production
PRODUCTION_HOST             # Production server hostname
PRODUCTION_USER             # Production SSH user

SLACK_WEBHOOK_URL           # For pipeline notifications
```

## Production Deployment

### Server Setup

```bash
# On your production server
sudo apt update
sudo apt install -y docker.io docker-compose git

# Create app directory
sudo mkdir -p /var/www/flexicommerce
sudo chown $USER:$USER /var/www/flexicommerce

# Clone repository
cd /var/www/flexicommerce
git clone --depth 1 https://github.com/yourusername/FlexiCommerce.git .
```

### Configure Production

```bash
# Copy and edit environment file
cp .env.example .env.local
nano .env.local

# Set proper permissions
chmod 600 .env.local

# Create docker-compose.prod.yml (if needed)
cp docker-compose.yml docker-compose.prod.yml
```

### Deploy with Docker Compose

```bash
# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f
```

### Deploy with Kubernetes (Optional)

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: flexicommerce-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: flexicommerce-api
  template:
    metadata:
      labels:
        app: flexicommerce-api
    spec:
      containers:
      - name: api
        image: ghcr.io/yourusername/FlexiCommerce/backend:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: flexicommerce-secrets
              key: database-url
```

### SSL/TLS Certificate

Using Let's Encrypt with Nginx:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

## Monitoring & Logging

### View Application Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Inside container
docker-compose exec backend tail -f logs/app.log
```

### Health Checks

```bash
# Backend health
curl http://localhost:3001/api/health

# Frontend
curl http://localhost:3000
```

### Database Backups

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U flexicommerce -d flexicommerce_dev > backup.sql

# Restore
docker-compose exec -T postgres psql -U flexicommerce -d flexicommerce_dev < backup.sql
```

## Troubleshooting

### Services not starting

```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Full cleanup and restart
docker-compose down -v
docker-compose up -d
```

### Database connection issues

```bash
# Check if database is healthy
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose exec backend npx prisma migrate reset
```

### File permissions

```bash
# Fix permissions in volumes
docker-compose exec backend chown -R node:node /app

# Fix database directory
sudo chown -R 999:999 postgres_data/
```

### Out of disk space

```bash
# Clean up Docker
docker system prune -v

# Remove unused volumes
docker volume prune
```

### Port already in use

```bash
# Find what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill the process
kill -9 <PID>

# Or change port in docker-compose.yml
```

## Security Best Practices

- ✅ Use strong JWT secret (32+ characters)
- ✅ Enable HTTPS in production
- ✅ Set restrictive CORS origins
- ✅ Use environment variables for secrets
- ✅ Keep Docker images updated
- ✅ Enable database backups
- ✅ Monitor logs for suspicious activity
- ✅ Use non-root user in Docker containers
- ✅ Set up rate limiting
- ✅ Enable security headers

## Further Reading

- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)
