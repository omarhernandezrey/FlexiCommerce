# Analytics Module - Phase 14: Backend Optimization

## Overview

Phase 14 implements real database queries and optimization strategies for the analytics module.

## Components

### 1. **analytics.service.ts**
Core service with Prisma queries:
- `getMetrics()` - Calculates sales, orders, customers, and conversion rates
- `getDailySales()` - Groups orders by date with sales and count
- `getTopProducts()` - Aggregates product sales and revenue
- `getOrdersWithPagination()` - Paginated order listings with optional status filter
- `getProductsWithPagination()` - Paginated product search with category filtering
- `getRevenueByCategory()` - Revenue breakdown by category
- `getCustomerStats()` - Customer statistics and lifecycle metrics

### 2. **analytics.cache.ts**
In-memory caching layer:
- TTL-based expiration (default 5 minutes)
- Pattern-based cache invalidation
- Memory usage tracking
- Production-ready for Redis migration

### 3. **analytics.middleware.ts**
Rate limiting middleware:
- Default: 100 requests per 15 minutes per IP
- Strict: 20 requests per hour for expensive operations
- RateLimit headers in responses
- Auto-cleanup of expired entries

### 4. **analytics.routes.ts**
Updated routes with real queries:
- `/metrics` - Real database aggregation
- `/daily-sales` - Time-series aggregation
- `/top-products` - Product performance ranking
- `/revenue-by-category` - Category breakdown
- `/customer-stats` - Customer lifecycle data
- `/orders` - Paginated order listing
- `/products` - Paginated product search
- `/export-csv` - CSV generation with real data
- `/export-pdf` - PDF generation with real metrics

## Features

### Database Optimization
- Uses Prisma aggregation for efficient calculations
- Supports date range filtering on all queries
- Pagination to prevent memory overload
- Distinct queries for unique counts

### Pagination
```javascript
// Query parameters
?page=1&limit=10

// Response includes
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 342,
    pages: 35
  }
}
```

### Date Range Filtering
```javascript
// All analytics endpoints support:
?startDate=2026-02-01&endDate=2026-02-17

// Defaults to last 30 days if not specified
```

### Rate Limiting
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708...
```

## Performance Enhancements

1. **Aggregation Queries** - Uses Prisma `aggregate()` for efficient computation
2. **Pagination** - Skip/take pattern prevents loading all records
3. **Caching** - 5-minute TTL on expensive queries (ready for Redis)
4. **Rate Limiting** - Prevents abuse and ensures fair usage
5. **Lazy Loading** - Details loaded on demand, not pre-fetched

## Testing

### Get Metrics
```bash
curl http://localhost:3001/api/analytics/metrics \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

### Get Top Products with Limit
```bash
curl http://localhost:3001/api/analytics/top-products?limit=5 \
  -H "Authorization: Bearer TOKEN"
```

### Export CSV for Date Range
```bash
curl http://localhost:3001/api/analytics/export-csv \
  ?startDate=2026-02-01&endDate=2026-02-17 \
  -H "Authorization: Bearer TOKEN" \
  -o report.csv
```

## Future Enhancements

1. **Redis Caching** - Replace in-memory cache with Redis
2. **Database Indexes** - Add indexes on frequently queried columns
3. **Materialized Views** - Pre-calculated aggregations for daily/monthly summaries
4. **Advanced Analytics** - Cohort analysis, retention metrics, funnel tracking
5. **Real-time Dashboards** - WebSocket updates for live metrics
6. **Custom Reports** - User-defined report builder

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Descriptive error message",
  "status": 500
}
```

Rate limit errors return:
```json
{
  "error": "Too many requests",
  "retryAfter": 45,
  "status": 429
}
```
