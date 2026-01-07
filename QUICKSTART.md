# Quick Start Guide

Get up and running with Product Data Explorer in minutes!

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 18 or higher
- ✅ PostgreSQL 14 or higher (or Docker)
- ✅ Redis 6 or higher (or Docker)
- ✅ Git

Check your versions:
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

## Option 1: Quick Start with Docker (Recommended)

The fastest way to get started:

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd product-data-explorer

# 2. Start all services with Docker
docker-compose up -d

# 3. Wait for services to start (about 30 seconds)

# 4. Run database migrations
docker-compose exec backend npm run prisma:migrate

# 5. (Optional) Seed the database with sample data
docker-compose exec backend npm run seed

# 6. Open your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api
```

That's it! 🎉

## Option 2: Manual Setup

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/product_explorer
# REDIS_URL=redis://localhost:6379

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run seed

# Start the backend
npm run start:dev

# Backend is now running on http://localhost:3001
```

### Step 2: Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Start the frontend
npm run dev

# Frontend is now running on http://localhost:3000
```

## First Steps

### 1. Visit the Homepage
Go to http://localhost:3000

### 2. Scrape Initial Data
Since the database is initially empty (unless you ran seed), you'll need to trigger a scrape:

#### Option A: Use the API
```bash
# Scrape navigation headings
curl -X POST http://localhost:3001/api/navigation/scrape

# Wait a moment, then scrape a category (example)
curl -X POST http://localhost:3001/api/navigation/books/scrape
```

#### Option B: Use Swagger UI
1. Go to http://localhost:3001/api
2. Find the `/navigation/scrape` endpoint
3. Click "Try it out" and "Execute"

### 3. Explore the Application
- Browse navigation headings on the homepage
- Click on a category to see products
- Click on a product to see details
- Use the search and filters on the products page

## Testing the Application

### Backend Tests
```bash
cd backend
npm test                # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm run lint           # Linting
npm run type-check     # TypeScript checking
```

## Common Issues & Solutions

### Port Already in Use
If ports 3000, 3001, 5432, or 6379 are in use:

**Docker:**
```bash
# Stop all containers
docker-compose down

# Find and kill process using a port (example for port 3000)
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
# Docker:
docker ps | grep postgres

# Manual:
pg_isready

# If not running, start PostgreSQL service
```

### Redis Connection Error
```bash
# Check if Redis is running
# Docker:
docker ps | grep redis

# Manual:
redis-cli ping
# Should return "PONG"
```

### Scraping Fails
1. Check your internet connection
2. Verify World of Books is accessible: https://www.worldofbooks.com
3. Increase `SCRAPING_DELAY_MS` in .env if getting rate limited
4. Check backend logs for detailed error messages

### Frontend Can't Connect to Backend
1. Verify backend is running: http://localhost:3001/api/health
2. Check `NEXT_PUBLIC_API_URL` in frontend/.env.local
3. Check CORS settings in backend

## Next Steps

### Development
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Check out [backend/README.md](backend/README.md) for backend details
- Check out [frontend/README.md](frontend/README.md) for frontend details

### API Documentation
- Swagger UI: http://localhost:3001/api
- Markdown docs: [API.md](API.md)

### Deployment
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

### Customization
- Modify scraping logic in `backend/src/scraping/scraping.service.ts`
- Adjust frontend theme in `frontend/tailwind.config.js`
- Configure caching in `backend/.env` (CACHE_TTL_HOURS)

## Useful Commands

### Docker
```bash
docker-compose up -d              # Start services
docker-compose down               # Stop services
docker-compose logs -f backend    # View backend logs
docker-compose logs -f frontend   # View frontend logs
docker-compose exec backend sh    # Access backend container
```

### Database
```bash
npm run prisma:studio             # Open Prisma Studio
npm run prisma:migrate            # Run migrations
npm run seed                      # Seed database
```

### Development
```bash
# Backend
npm run start:dev                 # Start in watch mode
npm run start:debug              # Start with debugger

# Frontend
npm run dev                       # Start in dev mode
npm run build                     # Production build
```

## Support

If you encounter issues:
1. Check this guide first
2. Review the error messages in terminal/logs
3. Check [CONTRIBUTING.md](CONTRIBUTING.md)
4. Open an issue on GitHub

## Success! 🎉

You should now have:
- ✅ Backend API running on http://localhost:3001
- ✅ Frontend app running on http://localhost:3000
- ✅ PostgreSQL database with Prisma
- ✅ Redis cache
- ✅ Scraping service ready

Happy coding!
