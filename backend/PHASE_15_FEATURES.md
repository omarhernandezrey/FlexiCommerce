# Phase 15: Advanced API Features

## Overview

Phase 15 implements production-ready features for scalability, reliability, and advanced capabilities.

## Components

### 1. **Webhooks System** (`utils/webhooks.ts`)

Event-driven architecture for real-time notifications:

```javascript
// Register webhook endpoint
POST /api/webhooks
{
  "url": "https://example.com/webhooks",
  "events": ["order.created", "payment.completed"],
  "secret": "optional-secret"
}
```

**Supported Events:**
- `order.created` - New order placed
- `order.updated` - Order status changed
- `order.confirmed` - Order confirmed by admin
- `order.shipped` - Order shipped
- `order.delivered` - Order delivered
- `payment.completed` - Payment successful
- `payment.failed` - Payment failed
- `product.created/updated/deleted` - Product changes
- `user.registered/updated` - User events

**Webhook Payload:**
```json
{
  "event": "order.created",
  "timestamp": "2026-02-17T12:00:00Z",
  "data": {
    "orderId": "order_123",
    "total": 99.99,
    "items": [...]
  },
  "id": "webhook_event_id"
}
```

**Security:**
- HMAC-SHA256 signature in `X-Webhook-Signature` header
- Automatic retry with exponential backoff (2s, 4s, 8s)
- Max 3 retry attempts
- Auto-disable after 5 consecutive failures
- Request verification before processing

### 2. **Batch Operations API** (`utils/batch-operations.ts`)

Execute multiple operations in a single request:

```javascript
// Execute batch
POST /api/batch
{
  "operations": [
    {
      "id": "op1",
      "method": "GET",
      "path": "/api/products/prod_123"
    },
    {
      "id": "op2",
      "method": "POST",
      "path": "/api/orders",
      "body": { "items": [...], "total": 100 }
    }
  ],
  "sequential": false
}
```

**Features:**
- Up to 50 operations per batch
- Concurrent or sequential execution
- Stop-on-error option for sequential mode
- Individual operation responses with status codes
- Execution time tracking

**Response:**
```json
{
  "data": {
    "results": [
      { "id": "op1", "status": 200, "data": {...} },
      { "id": "op2", "status": 201, "data": {...} }
    ],
    "successCount": 2,
    "errorCount": 0,
    "executionTimeMs": 125
  },
  "info": {
    "totalOperations": 2,
    "succeeded": 2,
    "failed": 0,
    "averageTimePerOperation": 62
  }
}
```

### 3. **Advanced Logging** (`middlewares/advanced-logging.ts`)

Production-grade request/response logging:

**Request Logging:**
- Unique request ID for tracing
- Method, path, status, duration
- User ID and IP address
- Request/response sizes
- User agent tracking

**Performance Monitoring:**
- Slow request detection (>500ms)
- Memory usage tracking
- Endpoint statistics
- Error rate calculation

**Security Event Logging:**
- Authentication attempts (success/failure)
- Admin actions audit trail
- Failed requests tracking

**Usage Analytics:**
```javascript
// Get API usage statistics
GET /api/analytics/usage

Response:
{
  "stats": [
    {
      "endpoint": "GET /api/products",
      "requestCount": 1523,
      "averageTimeMs": 45,
      "errorCount": 2,
      "errorRate": "0.13%"
    }
  ]
}
```

### 4. **API Versioning** (`middlewares/api-versioning.ts`)

Multiple API versions for backward compatibility:

**Version Detection:**
```javascript
// Via Accept-Version header
GET /api/products
Accept-Version: v2

// Via path prefix
GET /api/v2/products

// Default: v1
GET /api/products
```

**Version Endpoints:**
```javascript
// v1 (Deprecated)
GET /api/products
GET /api/orders
Authorization: X-API-Key

// v2 (Current)
GET /api/v2/products
GET /api/v2/batch
POST /api/v2/webhooks
Authorization: Bearer TOKEN
```

**Deprecation Headers:**
```
Deprecation: true
Sunset: 2026-08-17T00:00:00Z
Link: </api/v2/docs>; rel="successor-version"
```

**Migration Guide:**
```javascript
GET /api/migration/v1-to-v2
```

## Integration Examples

### Webhook Example: Order Created

```javascript
// Frontend triggers order creation
POST /api/orders
{
  "items": [...],
  "shippingAddress": {...}
}

// Backend fires webhook
POST https://example.com/webhooks
{
  "event": "order.created",
  "timestamp": "2026-02-17T12:00:00Z",
  "data": {
    "orderId": "order_123",
    "total": 99.99
  }
}

// Webhook receiver verifies signature
signature = HMAC256(body, webhook_secret)
verify(signature == X-Webhook-Signature)
```

### Batch Operations Example

```javascript
// Get product, create order, get user - all in one request
POST /api/batch
{
  "operations": [
    { "id": "step1", "method": "GET", "path": "/api/products/prod_123" },
    { "id": "step2", "method": "POST", "path": "/api/orders", 
      "body": { "items": [...] } },
    { "id": "step3", "method": "GET", "path": "/api/users/me" }
  ]
}

// Receive all responses at once
{
  "results": [
    { "id": "step1", "status": 200, "data": {...} },
    { "id": "step2", "status": 201, "data": {...} },
    { "id": "step3", "status": 200, "data": {...} }
  ]
}
```

## Performance Benefits

1. **Webhooks** - Real-time integrations without polling
2. **Batch Ops** - Reduced API calls (50 ops → 1 request)
3. **Logging** - Observability and debugging
4. **Versioning** - Non-breaking updates to API
5. **Rate Limiting** - Fair usage and DDoS protection

## Configuration

### Webhooks
```javascript
// In orders.controller.ts
await webhookManager.triggerEvent('order.created', orderData);
```

### Logging
```javascript
// In app.ts
app.use(requestLoggingMiddleware);
app.use(performanceMonitoringMiddleware);
app.use(securityLoggingMiddleware);
```

### API Versioning
```javascript
// In routes
router.get('/products', withVersions({
  v1: handleProductsV1,
  v2: handleProductsV2
}));
```

## Monitoring & Analytics

```javascript
// Get API metrics
GET /api/metrics/usage?period=day&endpoint=/api/products

// Get webhook stats
GET /api/webhooks/stats

// Get batch operation metrics
GET /api/batch/metrics
```

## Security Considerations

1. **Webhooks** - HMAC signatures prevent tampering
2. **Batch Ops** - Each operation checked individually
3. **Rate Limiting** - Per-IP and per-user limits
4. **Logging** - Sensitive data excluded from logs
5. **Versioning** - Deprecation notices for migration

## Testing

```bash
# Test webhook delivery
curl -X POST http://localhost:3001/api/webhooks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/test",
    "events": ["order.created"]
  }'

# Test batch operations
curl -X POST http://localhost:3001/api/batch \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "operations": [
      { "id": "1", "method": "GET", "path": "/api/products" }
    ]
  }'

# Check API usage
curl http://localhost:3001/api/analytics/usage \
  -H "Authorization: Bearer TOKEN"
```

## Future Enhancements

1. **Webhook Retries Dashboard** - UI for managing failed webhooks
2. **GraphQL API** - Alternative query interface
3. **Request Signing** - Mutual TLS authentication
4. **Event Streaming** - Kafka/Redis streams for events
5. **API Analytics Dashboard** - Real-time usage visualization
