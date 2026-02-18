# 📚 FlexiCommerce API Documentation

Complete API documentation for FlexiCommerce e-commerce platform.

## Overview

**Base URL:** `https://api.flexicommerce.com/api` (Production)  
**Development:** `http://localhost:3001/api`  
**API Version:** 1.0.0

## Authentication

All protected endpoints require JWT token authentication.

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "Juan",
      "lastName": "Pérez"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Using the Token

Include the token in the `Authorization` header:

```bash
Authorization: Bearer <your_token_here>
```

### Register

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "firstName": "Carlos",
    "lastName": "González"
  }'
```

## API Endpoints

### Products

#### Get All Products

```bash
GET /products?page=1&limit=10&categoryId=optional-category-id

curl http://localhost:3001/api/products?page=1&limit=10
```

**Parameters:**
- `page` (integer, default: 1): Page number
- `limit` (integer, default: 10): Items per page
- `categoryId` (string, optional): Filter by category

**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Operación exitosa",
  "data": [
    {
      "id": "uuid",
      "name": "Laptop Pro 15\"",
      "slug": "laptop-pro-15",
      "description": "High-performance laptop",
      "price": 1299.99,
      "stock": 45,
      "images": ["url1", "url2"],
      "category": {
        "id": "cat-uuid",
        "name": "Electrónica"
      },
      "reviewCount": 24,
      "averageRating": 4.5,
      "isActive": true,
      "featured": false
    }
  ],
  "pagination": {
    "total": 285,
    "page": 1,
    "limit": 10,
    "totalPages": 29,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Get Product by ID

```bash
GET /products/{id}

curl http://localhost:3001/api/products/product-uuid
```

**Response:** Returns single product with full details including reviews.

#### Create Product

```bash
POST /products
Authorization: Bearer <token>

curl -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "slug": "new-product",
    "description": "Product description",
    "price": 99.99,
    "stock": 100,
    "images": ["url1", "url2"],
    "categoryId": "category-uuid"
  }'
```

**Required Fields:**
- `name`: Product name
- `slug`: URL-friendly identifier
- `description`: Product description
- `price`: Numeric price
- `stock`: Integer stock quantity
- `categoryId`: Valid category UUID

#### Update Product

```bash
PUT /products/{id}
Authorization: Bearer <token>

curl -X PUT http://localhost:3001/api/products/product-uuid \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 89.99,
    "stock": 80
  }'
```

#### Delete Product

```bash
DELETE /products/{id}
Authorization: Bearer <token>

curl -X DELETE http://localhost:3001/api/products/product-uuid \
  -H "Authorization: Bearer <token>"
```

### Orders

#### Get User Orders

```bash
GET /orders?page=1&limit=10
Authorization: Bearer <token>

curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "userId": "user-uuid",
      "items": [
        {
          "id": "item-uuid",
          "productId": "product-uuid",
          "quantity": 2,
          "price": 99.99,
          "product": { /* product data */ }
        }
      ],
      "total": 199.98,
      "status": "PENDING",
      "itemCount": 1,
      "createdAt": "2024-02-15T10:30:00Z",
      "updatedAt": "2024-02-15T10:30:00Z"
    }
  ],
  "pagination": { /* pagination data */ }
}
```

#### Get Order by ID

```bash
GET /orders/{id}
Authorization: Bearer <token>

curl http://localhost:3001/api/orders/order-uuid \
  -H "Authorization: Bearer <token>"
```

#### Create Order

```bash
POST /orders
Authorization: Bearer <token>

curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product-uuid-1",
        "quantity": 2
      },
      {
        "productId": "product-uuid-2",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Mexico City",
      "state": "CDMX",
      "postalCode": "06500",
      "country": "Mexico"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "status": 201,
  "message": "Pedido creado exitosamente",
  "data": {
    "id": "new-order-uuid",
    "userId": "user-uuid",
    "items": [ /* order items */ ],
    "total": 199.98,
    "status": "PENDING",
    "shippingAddress": { /* address */ },
    "createdAt": "2024-02-15T10:35:00Z"
  }
}
```

#### Update Order Status

```bash
PUT /orders/{id}/status
Authorization: Bearer <token>

curl -X PUT http://localhost:3001/api/orders/order-uuid/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "SHIPPED"
  }'
```

**Valid Statuses:** PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED

### Reviews

#### Get Product Reviews

```bash
GET /products/{productId}/reviews?page=1&sortBy=recent

curl http://localhost:3001/api/products/product-uuid/reviews
```

**Query Parameters:**
- `page` (integer): Page number
- `sortBy` (string): recent, helpful, or rating

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "review-uuid",
      "productId": "product-uuid",
      "userId": "user-uuid",
      "rating": 5,
      "title": "Excellent product!",
      "comment": "Great quality and fast delivery",
      "helpfulCount": 12,
      "user": {
        "id": "user-uuid",
        "firstName": "Juan",
        "lastName": "Pérez",
        "avatar": "url"
      },
      "createdAt": "2024-02-14T15:20:00Z"
    }
  ],
  "summary": {
    "averageRating": 4.7,
    "totalCount": 45,
    "ratingDistribution": {
      "1": 2,
      "2": 1,
      "3": 5,
      "4": 15,
      "5": 22
    }
  }
}
```

#### Create Review

```bash
POST /reviews
Authorization: Bearer <token>

curl -X POST http://localhost:3001/api/reviews \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-uuid",
    "rating": 5,
    "title": "Amazing product",
    "comment": "Highly recommended for everyone"
  }'
```

**Requirements:**
- `rating`: 1-5 (required)
- `title`: Max 100 characters
- `comment`: Max 500 characters
- One review per user per product

### Categories

#### Get All Categories

```bash
GET /categories

curl http://localhost:3001/api/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "category-uuid",
      "name": "Electrónica",
      "slug": "electronica",
      "description": "Electronics and gadgets",
      "image": "url"
    }
  ]
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "status": 400,
  "message": "Error message in Spanish",
  "error": "Detailed error information",
  "timestamp": "2024-02-15T10:30:00Z"
}
```

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body and parameters |
| 401 | Unauthorized | Token missing or invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Invalid input data |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Contact support |

### Validation Error Example

```json
{
  "success": false,
  "status": 422,
  "message": "Validation error",
  "error": "[{\"field\":\"email\",\"message\":\"Invalid email format\"},{\"field\":\"password\",\"message\":\"Password too short\"}]"
}
```

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Headers:** Includes X-RateLimit-* headers indicating your usage

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 2024-02-15T10:31:00Z
```

## Pagination

Paginated endpoints return:

```json
{
  "pagination": {
    "total": 289,
    "page": 1,
    "limit": 10,
    "totalPages": 29,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Response Status Codes

| Code | Description |
|------|------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## SDKs & Examples

### JavaScript/TypeScript

```typescript
const client = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

// Get products
const { data } = await client.get('/products', {
  params: { page: 1, limit: 10 }
});

// Create order
const order = await client.post('/orders', {
  items: [{ productId: '...', quantity: 2 }],
  shippingAddress: { /* ... */ }
});
```

### cURL Examples

```bash
# Get products
curl -X GET "http://localhost:3001/api/products?page=1" \
  -H "Accept: application/json"

# Create order
curl -X POST "http://localhost:3001/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @order.json

# Update product
curl -X PUT "http://localhost:3001/api/products/PRODUCT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"price": 99.99}'
```

## Webhooks (Coming Soon)

Webhooks for:
- Order status changes
- Payment confirmations
- Inventory changes
- Review submissions

## Testing

### Using Postman

1. Import `postman-collection.json` into Postman
2. Set `base_url` and `api_url` variables
3. Set `token` after login
4. Run requests from collections

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
docker-compose up -d
npm run test:integration
```

## Rate Limiting

**Current Limits:**
- 100 requests per minute per API key
- 1,000 requests per hour per API key

## Support

- **Email:** support@flexicommerce.com
- **Documentation:** https://docs.flexicommerce.com
- **Issues:** https://github.com/yourusername/FlexiCommerce/issues

## Changelog

### v1.0.0 (2024-02-15)
- Initial API release
- Products endpoints
- Orders management
- Reviews system
- User authentication
- Categories listing
