# Backend - Product Explorer API

NestJS backend for the Product Data Explorer with real-time scraping capabilities.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

### Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed database
npm run seed

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### Running the Application

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## API Endpoints

### Navigation
- `GET /api/navigation` - List all navigation headings
- `GET /api/navigation/:slug` - Get navigation by slug
- `POST /api/navigation/:slug/scrape` - Trigger scrape

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category by slug
- `POST /api/categories/:slug/scrape` - Trigger scrape

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Get product details
- `POST /api/products/:id/scrape` - Refresh product data

### History
- `POST /api/history` - Record view history
- `GET /api/history/session/:sessionId` - Get session history

### Health
- `GET /api/health` - Health check

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── navigation/        # Navigation module
├── category/          # Category module
├── product/           # Product module
├── scraping/          # Scraping service
├── cache/             # Redis cache service
├── history/           # View history module
├── health/            # Health check module
└── prisma/            # Prisma service
```

## Environment Variables

See `.env.example` for all available configuration options.

## Docker

```bash
# Build image
docker build -t product-explorer-backend .

# Run container
docker run -p 3001:3001 product-explorer-backend
```
