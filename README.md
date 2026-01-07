# Product Data Explorer

A production-minded product exploration platform that enables users to navigate from high-level headings → categories → products → product detail pages, powered by live, on-demand scraping from World of Books.

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SWR for data fetching
- Axios for API calls

**Backend:**
- NestJS
- TypeScript
- PostgreSQL with Prisma ORM
- Bull Queue for job processing
- Redis for caching
- Crawlee + Playwright for scraping

### System Design

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│             │      │              │      │             │
│   Next.js   │─────▶│   NestJS     │─────▶│ PostgreSQL  │
│  Frontend   │      │   Backend    │      │  Database   │
│             │      │              │      │             │
└─────────────┘      └──────┬───────┘      └─────────────┘
                            │
                            │
                     ┌──────▼───────┐
                     │              │
                     │  Bull Queue  │
                     │   + Redis    │
                     │              │
                     └──────┬───────┘
                            │
                            │
                     ┌──────▼───────┐
                     │              │
                     │   Crawlee    │
                     │  + Playwright│
                     │              │
                     └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL 14+ (if running without Docker)
- Redis (if running without Docker)

### Running with Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd product-data-explorer

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run prisma:migrate

# Seed initial data (optional)
docker-compose exec backend npm run seed

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Docs: http://localhost:3001/api
```

### Running Locally

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run prisma:migrate

# Start the development server
npm run start:dev

# Backend runs on http://localhost:3001
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start the development server
npm run dev

# Frontend runs on http://localhost:3000
```

## 📁 Project Structure

```
product-data-explorer/
├── backend/
│   ├── src/
│   │   ├── navigation/          # Navigation headings module
│   │   ├── category/            # Categories module
│   │   ├── product/             # Products module
│   │   ├── scraping/            # Scraping service with Crawlee
│   │   ├── queue/               # Bull queue configuration
│   │   ├── cache/               # Redis caching service
│   │   ├── history/             # View history tracking
│   │   └── common/              # Shared utilities, DTOs, guards
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Migration files
│   ├── test/                    # E2E tests
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router pages
│   │   │   ├── page.tsx         # Landing page
│   │   │   ├── categories/      # Category pages
│   │   │   ├── products/        # Product pages
│   │   │   └── about/           # About/Contact
│   │   ├── components/          # Reusable components
│   │   ├── lib/                 # Utilities and API client
│   │   └── hooks/               # Custom React hooks
│   ├── public/                  # Static assets
│   └── package.json
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml               # CI/CD pipeline
└── README.md
```

## 🗄️ Database Schema

### Core Entities

**navigation** - Top-level navigation headings
- id, title, slug, last_scraped_at, created_at, updated_at

**category** - Product categories and subcategories
- id, navigation_id, parent_id, title, slug, product_count, last_scraped_at, created_at, updated_at

**product** - Product listings
- id, source_id, category_id, title, price, currency, image_url, source_url, last_scraped_at, created_at, updated_at

**product_detail** - Extended product information
- id, product_id, description, specs, ratings_avg, reviews_count, created_at, updated_at

**review** - Product reviews
- id, product_id, author, rating, text, created_at

**scrape_job** - Scraping job tracking
- id, target_url, target_type, status, started_at, finished_at, error_log, attempts

**view_history** - User navigation history
- id, user_id, session_id, path_json, created_at

## 🔌 API Documentation

### Base URL
- Development: `http://localhost:3001/api`
- Production: `<your-deployed-backend-url>/api`

### Endpoints

#### Navigation
- `GET /navigation` - List all navigation headings
- `GET /navigation/:slug` - Get specific navigation with categories
- `POST /navigation/:slug/scrape` - Trigger on-demand scrape

#### Categories
- `GET /categories` - List all categories
- `GET /categories/:slug` - Get specific category with products
- `POST /categories/:slug/scrape` - Trigger category scrape

#### Products
- `GET /products` - List products with pagination and filters
  - Query params: `page`, `limit`, `category`, `minPrice`, `maxPrice`, `search`
- `GET /products/:id` - Get product details
- `POST /products/:id/scrape` - Refresh product data

#### History
- `POST /history` - Record view history
- `GET /history/:sessionId` - Get user's browsing history

#### Health
- `GET /health` - API health check

### Swagger Documentation
Visit `http://localhost:3001/api` when the backend is running.

## 🕷️ Scraping Strategy

### Ethical Scraping Practices

1. **Rate Limiting**: Delays between requests (1-3 seconds)
2. **Caching**: DB-backed TTL (default: 24 hours)
3. **Backoff**: Exponential backoff on errors
4. **User Agent**: Proper user agent identification
5. **Respect robots.txt**: Compliant with World of Books policies

### Scraping Flow

```
User Request
    ↓
Check Cache (DB last_scraped_at)
    ↓
Cache Hit? → Return Cached Data
    ↓
Cache Miss
    ↓
Queue Scraping Job (Bull)
    ↓
Worker Process Job (Crawlee + Playwright)
    ↓
Parse & Validate Data
    ↓
Store in PostgreSQL
    ↓
Return Fresh Data
```

### Deduplication

- Products identified by `source_id` (unique constraint)
- Categories by `slug` within navigation context
- Reviews by combination of product + author + text hash

## 🎨 Frontend Features

### Pages

1. **Landing (/)** - Navigation headings with hero section
2. **Category (/categories/[slug])** - Subcategories and product grid
3. **Products (/products)** - Searchable product listing with filters
4. **Product Detail (/products/[id])** - Full product info, reviews, recommendations
5. **About (/about)** - Project information and contact

### UX Features

- ✅ Responsive design (mobile-first)
- ✅ Loading skeletons
- ✅ Error boundaries
- ✅ Optimistic UI updates
- ✅ Client-side navigation history
- ✅ Accessibility (WCAG AA)
- ✅ Dark mode support (bonus)

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e
```

## 🚢 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Railway/Render)

```bash
cd backend

# Build
npm run build

# Start production
npm run start:prod
```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/product_explorer
REDIS_URL=redis://localhost:6379
PORT=3001
SCRAPING_DELAY_MS=2000
CACHE_TTL_HOURS=24
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🔐 Security

- ✅ Input validation with class-validator
- ✅ SQL injection prevention (Prisma ORM)
- ✅ CORS configuration
- ✅ Rate limiting on API endpoints
- ✅ Environment variable security
- ✅ No secrets in repository

## 📈 Performance & Observability

### Caching Strategy

- **Database-level**: `last_scraped_at` timestamps
- **Redis**: Hot data caching with TTL
- **SWR**: Client-side caching and revalidation

### Monitoring

- Winston logger with file rotation
- Request/response logging
- Error tracking and alerting
- Scraping job metrics

## 🎯 Design Decisions

### Why PostgreSQL?
- Relational data (products, categories, reviews)
- ACID compliance for scraping job reliability
- Excellent JSON support for flexible metadata
- Prisma ORM integration

### Why Bull Queue?
- Reliable job processing with Redis
- Automatic retries and backoff
- Job prioritization
- Progress tracking

### Why Crawlee + Playwright?
- Handles JavaScript-heavy sites
- Built-in rate limiting and retries
- Automatic browser management
- TypeScript support

### Why SWR?
- Automatic revalidation
- Optimistic UI updates
- Built-in caching
- Better UX with stale-while-revalidate pattern

## 🐛 Troubleshooting

### Common Issues

**Scraping fails with timeout:**
- Increase `SCRAPING_TIMEOUT_MS` in .env
- Check network connectivity
- Verify World of Books is accessible

**Database connection errors:**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Run migrations: `npm run prisma:migrate`

**Redis connection errors:**
- Ensure Redis is running
- Check REDIS_URL configuration

**Build errors:**
- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all environment variables

## 📝 License

MIT

## 👥 Contributors

[Your Name]

## 🔗 Links

- **Live Frontend**: [Your Vercel URL]
- **Live Backend**: [Your Railway/Render URL]
- **GitHub Repository**: [Your GitHub URL]
- **API Documentation**: [Your Backend URL]/api
