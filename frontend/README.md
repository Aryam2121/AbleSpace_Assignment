# Frontend - Product Explorer

Next.js frontend for the Product Data Explorer.

## Setup

### Prerequisites

- Node.js 18+

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your API URL
```

### Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## Pages

- `/` - Landing page with navigation headings
- `/products` - Product listing with filters and search
- `/products/[id]` - Product detail page
- `/categories/[slug]` - Category page with products
- `/about` - About page

## Features

- ✅ Server-side rendering with Next.js App Router
- ✅ SWR for data fetching and caching
- ✅ Responsive design with Tailwind CSS
- ✅ Loading skeletons
- ✅ Error boundaries
- ✅ Accessibility (WCAG AA)
- ✅ Client-side navigation history

## Project Structure

```
src/
├── app/                # Next.js pages
│   ├── page.tsx        # Landing page
│   ├── products/       # Products pages
│   ├── categories/     # Category pages
│   └── about/          # About page
├── components/         # Reusable components
├── lib/                # Utilities and API client
└── hooks/              # Custom React hooks
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Docker

```bash
# Build image
docker build -t product-explorer-frontend .

# Run container
docker run -p 3000:3000 product-explorer-frontend
```

## Styling

This project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.js`.

## Data Fetching

We use SWR (stale-while-revalidate) for data fetching, which provides:
- Automatic revalidation
- Optimistic UI updates
- Built-in caching
- Error retry
