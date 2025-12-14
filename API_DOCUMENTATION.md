# 📚 Tarsit API Documentation

## Base URL

- **Development:** `http://localhost:4000/api`
- **Production:** `https://api.tarsit.com/api`
- **Swagger Docs:** `http://localhost:4000/api/docs` (dev) | `https://api.tarsit.com/api/docs` (prod)

## Authentication

Most endpoints require authentication via JWT Bearer token.

```http
Authorization: Bearer <access_token>
```

### Getting an Access Token

1. **Sign Up:** `POST /api/auth/signup`
2. **Login:** `POST /api/auth/login`
3. **Use the returned `accessToken` in subsequent requests**

### Token Refresh

```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Auth (login, signup) | 3-5 requests | 1 minute |
| Password reset | 3 requests | 1 minute |
| Email verification | 10 requests | 1 minute |
| General endpoints | 100 requests | 1 minute |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `Retry-After`: Seconds to wait before retrying

---

## Core Endpoints

### Authentication

#### Sign Up (Customer)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+14155551234",
  "username": "johndoe"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be a common weak password

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "verified": false
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### Sign Up (Business Owner)
```http
POST /api/auth/signup-business
Content-Type: application/json

{
  "email": "owner@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Business",
  "phone": "+14155551234",
  "business": {
    "name": "QuickFix Phone Repair",
    "description": "Professional iPhone and Android repair services",
    "categoryId": "category-uuid",
    "addressLine1": "123 Market Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "phone": "+14155551234",
    "email": "contact@quickfix.com",
    "website": "https://quickfix.com",
    "priceRange": "MODERATE"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PATCH /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+14155551234",
  "username": "johndoe"
}
```

---

### Businesses

#### List Businesses
```http
GET /api/businesses?page=1&limit=20&categoryId=uuid&city=San Francisco&verified=true
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `categoryId` (string): Filter by category
- `city` (string): Filter by city
- `state` (string): Filter by state
- `priceRange` (string): BUDGET | MODERATE | EXPENSIVE
- `verified` (boolean): Filter verified businesses
- `latitude` (number): For location-based search
- `longitude` (number): For location-based search
- `radius` (number): Search radius in km (default: 10)

**Response:**
```json
{
  "businesses": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### Get Business by Slug
```http
GET /api/businesses/slug/quickfix-phone-repair
```

#### Create Business
```http
POST /api/businesses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Business Name",
  "description": "Business description...",
  "categoryId": "category-uuid",
  "addressLine1": "123 Street",
  "city": "City",
  "state": "ST",
  "zipCode": "12345",
  "phone": "+14155551234"
}
```

#### Update Business
```http
PATCH /api/businesses/:id
Authorization: Bearer <token>
```

#### Delete Business
```http
DELETE /api/businesses/:id
Authorization: Bearer <token>
```

---

### Search

#### Search Businesses
```http
GET /api/search?q=hair salon&location=San Francisco&categorySlug=beauty&minRating=4&priceRange=MODERATE&sortBy=rating
```

**Query Parameters:**
- `q` (string): Search query
- `location` (string): City or ZIP code
- `latitude` (number): User's latitude
- `longitude` (number): User's longitude
- `radius` (number): Search radius in km (default: 25)
- `categorySlug` (string): Filter by category slug
- `minRating` (number): Minimum rating (1-5)
- `priceRange` (string): BUDGET | MODERATE | EXPENSIVE
- `verified` (boolean): Only verified businesses
- `featured` (boolean): Only featured businesses
- `openNow` (boolean): Only businesses open now
- `sortBy` (string): relevance | rating | reviews | distance | newest
- `page` (number): Page number
- `limit` (number): Items per page

**Response includes:**
- Businesses with distance (if location provided)
- Relevance scores (if search query provided)
- Pagination metadata

---

### Reviews

#### List Reviews
```http
GET /api/reviews?businessId=uuid&page=1&limit=20
```

#### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessId": "business-uuid",
  "rating": 5,
  "title": "Great service!",
  "comment": "Very professional and fast.",
  "photos": ["photo-url-1", "photo-url-2"]
}
```

#### Respond to Review (Business Owner)
```http
POST /api/reviews/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "response": "Thank you for your feedback!"
}
```

#### Delete Review Response
```http
DELETE /api/reviews/:id/respond
Authorization: Bearer <token>
```

---

### Messages & Chat

#### List Chats
```http
GET /api/chats?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Chat Messages
```http
GET /api/chats/:id/messages?page=1&limit=50
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "chat-uuid",
  "content": "Hello!",
  "type": "TEXT",
  "attachments": ["image-url"]
}
```

**Message Types:** `TEXT` | `IMAGE` | `FILE` | `SYSTEM`

---

### Appointments

#### List Appointments
```http
GET /api/appointments?businessId=uuid&status=CONFIRMED&page=1
Authorization: Bearer <token>
```

#### Create Appointment
```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "businessId": "business-uuid",
  "serviceId": "service-uuid",
  "date": "2024-12-20T10:00:00Z",
  "notes": "Special requests"
}
```

#### Update Appointment
```http
PATCH /api/appointments/:id
Authorization: Bearer <token>
```

#### Cancel Appointment
```http
DELETE /api/appointments/:id
Authorization: Bearer <token>
```

---

### Uploads

#### Upload Single Image
```http
POST /api/uploads/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image file>
folder: "businesses" | "avatars" | "reviews"
```

**Response:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "folder/image-id",
  "width": 1920,
  "height": 1080
}
```

#### Upload Multiple Images
```http
POST /api/uploads/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: <image files array>
folder: "businesses"
```

#### Delete Image
```http
DELETE /api/uploads/image
Authorization: Bearer <token>
Content-Type: application/json

{
  "publicId": "folder/image-id"
}
```

---

### Admin Endpoints

**All admin endpoints require ADMIN or SUPER_ADMIN role.**

#### Real-Time Stats
```http
GET /api/admin/dashboard/real-time
Authorization: Bearer <admin_token>
```

#### User Management
```http
GET /api/admin/users?page=1&limit=20&role=CUSTOMER&search=john
PATCH /api/admin/users/:id
DELETE /api/admin/users/:id
```

#### Business Management
```http
GET /api/admin/businesses?page=1&verified=false
PATCH /api/admin/businesses/:id
DELETE /api/admin/businesses/:id
```

#### Generate Report
```http
POST /api/admin/reports/generate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "type": "user-activity",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "format": "csv"
}
```

**Report Types:**
- `user-activity`
- `business-performance`
- `appointment-analytics`
- `review-summary`

---

## WebSocket API

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:4000', {
  auth: {
    token: 'Bearer <access_token>'
  }
});
```

### Events

#### Join Chat
```javascript
socket.emit('join-chat', { chatId: 'chat-uuid' });
```

#### Send Message
```javascript
socket.emit('send-message', {
  chatId: 'chat-uuid',
  content: 'Hello!',
  type: 'TEXT',
  attachments: []
});
```

#### Typing Indicator
```javascript
socket.emit('typing-start', { chatId: 'chat-uuid' });
socket.emit('typing-stop', { chatId: 'chat-uuid' });
```

#### Mark as Read
```javascript
socket.emit('mark-read', { chatId: 'chat-uuid', messageIds: ['msg-1', 'msg-2'] });
```

### Listeners

```javascript
// New message
socket.on('new-message', (message) => {
  console.log('New message:', message);
});

// User typing
socket.on('user-typing', ({ userId, chatId }) => {
  console.log('User typing:', userId);
});

// Messages read
socket.on('messages-read', ({ chatId, messageIds }) => {
  console.log('Messages read:', messageIds);
});
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Filtering & Sorting

### Filtering
Most list endpoints support filtering via query parameters:
- `categoryId`, `categorySlug`
- `city`, `state`
- `verified`, `active`, `featured`
- `priceRange`
- `minRating`
- `status` (for appointments)

### Sorting
Supported `sortBy` values:
- `relevance` - Most relevant (default for search)
- `rating` - Highest rated
- `reviews` - Most reviewed
- `distance` - Nearest first
- `newest` - Recently created
- `oldest` - Oldest first

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Handle rate limiting** - Check `X-RateLimit-Remaining` header
3. **Use pagination** - Don't fetch all data at once
4. **Cache responses** - Use ETags and cache headers
5. **Handle errors gracefully** - Check status codes and error messages
6. **Use WebSockets** for real-time features (chat, notifications)
7. **Validate inputs** before sending requests
8. **Follow password requirements** for user registration

---

## Support

For API support:
- **Email:** api-support@tarsit.com
- **Documentation:** https://api.tarsit.com/api/docs
- **Status Page:** https://status.tarsit.com
