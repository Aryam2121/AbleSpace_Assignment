# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance
- Domain name (optional)

## Environment Variables

### Backend

```env
DATABASE_URL=postgresql://user:password@host:5432/db
REDIS_URL=redis://host:6379
PORT=3001
SCRAPING_DELAY_MS=2000
CACHE_TTL_HOURS=24
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend on Vercel

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Vercel Configuration:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Environment Variables: Add `NEXT_PUBLIC_API_URL`

#### Backend on Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL and Redis databases
4. Deploy from GitHub
5. Set environment variables
6. Deploy

### Option 2: Render

#### Backend on Render

1. Create new Web Service
2. Connect GitHub repository
3. Configure:
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm run start:prod`
4. Add PostgreSQL and Redis from dashboard
5. Set environment variables

#### Frontend on Render

1. Create new Static Site
2. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/.next`
3. Set environment variables

### Option 3: Docker + VPS

#### Prerequisites
- VPS with Docker and Docker Compose
- Domain name pointed to VPS

#### Steps

1. **Clone repository on VPS:**
```bash
git clone <your-repo>
cd product-explorer
```

2. **Create production docker-compose:**
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    restart: always
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
      # ... other env vars
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"

  frontend:
    build: ./frontend
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: https://api.yourdomain.com/api
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

volumes:
  postgres_data:
  redis_data:
```

3. **Set up Traefik for HTTPS:**
```yaml
# Add to docker-compose.prod.yml
  traefik:
    image: traefik:v2.9
    restart: always
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
```

4. **Deploy:**
```bash
# Create .env file
cp .env.example .env
# Edit .env with production values

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 4: AWS/Azure/GCP

#### Backend
- Deploy to Elastic Beanstalk, App Service, or Cloud Run
- Use managed PostgreSQL (RDS, Azure Database, Cloud SQL)
- Use managed Redis (ElastiCache, Azure Cache, Memorystore)

#### Frontend
- Deploy to S3 + CloudFront, Azure Static Web Apps, or Firebase Hosting
- Or use container services (ECS, Azure Container Instances, Cloud Run)

## Post-Deployment

### 1. Database Migration
```bash
# SSH into backend container/server
npx prisma migrate deploy
```

### 2. Seed Data (Optional)
```bash
npm run seed
```

### 3. Health Check
```bash
curl https://your-backend-url.com/api/health
```

### 4. Test Scraping
- Navigate to frontend
- Trigger a scrape from the UI
- Check logs for any errors

## Monitoring

### Backend Logs
```bash
# Docker
docker-compose logs -f backend

# PM2 (if using)
pm2 logs backend
```

### Database Monitoring
- Use Prisma Studio: `npx prisma studio`
- Or connect with GUI tools (pgAdmin, TablePlus, etc.)

### Redis Monitoring
```bash
redis-cli monitor
```

## Scaling

### Horizontal Scaling
- Use load balancer (Nginx, Traefik, AWS ALB)
- Deploy multiple backend instances
- Use Redis for session management

### Database
- Enable connection pooling
- Set up read replicas for read-heavy workloads
- Use database backups

### Caching
- Implement CDN for frontend assets
- Use Redis cluster for high availability

## Troubleshooting

### Backend not starting
1. Check DATABASE_URL connection
2. Check Redis connection
3. View logs for errors

### Scraping fails
1. Check SCRAPING_DELAY_MS (increase if needed)
2. Verify Playwright dependencies installed
3. Check network connectivity to World of Books

### Frontend can't connect to backend
1. Verify NEXT_PUBLIC_API_URL is correct
2. Check CORS settings on backend
3. Verify backend is accessible from frontend

## Backup

### Database Backup
```bash
# PostgreSQL
pg_dump -h localhost -U user -d product_explorer > backup.sql

# Restore
psql -h localhost -U user -d product_explorer < backup.sql
```

### Redis Backup
```bash
# Redis automatically creates dump.rdb
# Copy from volume or use Redis backup tools
```

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Database credentials rotated
- [ ] API rate limiting configured
- [ ] CORS properly configured
- [ ] Firewall rules set
- [ ] Regular backups scheduled
- [ ] Monitoring and alerting set up
