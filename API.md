# API Documentation

## Base URL

- Development: `http://localhost:3001/api`
- Production: `<your-deployed-backend-url>/api`

## Authentication

Currently, the API does not require authentication. This can be added in future versions.

## Rate Limiting

- TTL: 60 seconds
- Max requests: 100 per TTL window

## Response Format

All responses follow this structure:

```json
{
  "data": {},
  "error": null
}
```

## Endpoints

### Navigation

#### List All Navigation Headings

```http
GET /navigation
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Books",
    "slug": "books",
    "categoryCount": 10,
    "lastScrapedAt": "2024-01-15T10:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
]
```

#### Get Navigation by Slug

```http
GET /navigation/:slug?includeCategories=true
```

**Parameters:**
- `includeCategories` (optional): Include related categories

**Response:**
```json
{
  "id": "uuid",
  "title": "Books",
  "slug": "books",
  "categories": [...]
}
```

#### Trigger Navigation Scrape

```http
POST /navigation/:slug/scrape
```

**Response:**
```json
{
  "message": "Scraping job queued successfully",
  "navigationId": "uuid"
}
```

### Categories

#### List All Categories

```http
GET /categories?navigationId=uuid
```

**Parameters:**
- `navigationId` (optional): Filter by navigation

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Fiction",
    "slug": "fiction",
    "productCount": 100
  }
]
```

#### Get Category by Slug

```http
GET /categories/:slug?includeProducts=true&page=1&limit=20
```

**Parameters:**
- `includeProducts` (optional): Include products
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

### Products

#### List All Products

```http
GET /products?page=1&limit=20&category=fiction&minPrice=0&maxPrice=50&search=harry
```

**Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page (max: 100)
- `category` (optional): Filter by category slug
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `search` (optional): Search in title and author
- `author` (optional): Filter by author

**Response:**
```json
{
  "products": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

#### Get Product by ID

```http
GET /products/:id?includeDetail=true
```

**Parameters:**
- `includeDetail` (optional): Include full details (default: true)

**Response:**
```json
{
  "id": "uuid",
  "title": "Sample Book",
  "author": "John Doe",
  "price": 12.99,
  "currency": "GBP",
  "imageUrl": "https://...",
  "detail": {
    "description": "...",
    "ratingsAvg": 4.5,
    "reviewsCount": 10,
    "recommendations": [...]
  },
  "reviews": [...],
  "recommendedProducts": [...]
}
```

#### Trigger Product Scrape

```http
POST /products/:id/scrape
```

**Response:**
```json
{
  "message": "Scraping job queued successfully",
  "productId": "uuid"
}
```

### History

#### Record View History

```http
POST /history
```

**Request Body:**
```json
{
  "sessionId": "session_123",
  "userId": "user_123",
  "pathJson": {
    "path": "/products/123",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

#### Get Session History

```http
GET /history/session/:sessionId?limit=50
```

**Parameters:**
- `limit` (optional): Number of records (default: 50)

### Health

#### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z",
  "uptime": 12345,
  "database": "connected"
}
```

## Error Responses

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

## Swagger Documentation

For interactive API documentation, visit:
`http://localhost:3001/api` when the backend is running.
