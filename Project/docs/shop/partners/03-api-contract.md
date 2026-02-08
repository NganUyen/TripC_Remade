# Shop Partner System - API Contract

> **Base Path**: `/api/shop/partners`  
> **Auth**: Clerk + Supabase RLS

## 📋 Overview

This document defines the API endpoints for the Partner/Vendor system. All endpoints follow existing shop patterns using `paginatedResponse()` and `errorResponse()`.

---

## 1. Authentication

### Headers

```
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

### Auth Flow

1. Clerk validates JWT
2. Extract `clerkId` from token
3. Resolve to `userId` via `getDbUserId(clerkId)`
4. Check `shop_partner_members` for partner access
5. Verify role-based permissions

---

## 2. Partner Profile Endpoints

### 2.1 Apply as Partner

```http
POST /api/shop/partners/apply
```

**Description**: Submit application to become a partner

**Request Body**:
```json
{
  "business_name": "TravelGear Co.",
  "display_name": "TravelGear",
  "business_type": "business",
  "email": "contact@travelgear.com",
  "phone": "+84901234567",
  "website": "https://travelgear.com",
  "address_line1": "123 Le Loi Street",
  "city": "Da Nang",
  "country_code": "VN",
  "description": "Premium travel accessories and gear.",
  "business_registration_number": "0123456789",
  "tax_id": "VN123456789"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "slug": "travelgear-co-a1b2c3",
    "business_name": "TravelGear Co.",
    "status": "pending",
    "created_at": "2026-02-07T10:00:00Z"
  }
}
```

**Errors**:
- `400 VALIDATION_ERROR`: Missing required fields
- `409 ALREADY_PARTNER`: User already has a partner account

---

### 2.2 Get Current Partner Profile

```http
GET /api/shop/partners/me
```

**Description**: Get logged-in user's partner profile (if exists)

**Response (200 OK)**:
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "slug": "travelgear-co-a1b2c3",
    "business_name": "TravelGear Co.",
    "display_name": "TravelGear",
    "description": "...",
    "logo_url": "https://...",
    "status": "approved",
    "product_count": 42,
    "order_count": 156,
    "total_sales_cents": 1234500,
    "rating_avg": 4.7,
    "rating_count": 89,
    "verified_at": "2026-01-15T08:00:00Z",
    "role": "owner",
    "permissions": {
      "products": true,
      "orders": true,
      "analytics": true
    }
  }
}
```

**Errors**:
- `401 UNAUTHORIZED`: Not logged in
- `404 NOT_PARTNER`: User is not a partner

---

### 2.3 Update Partner Profile

```http
PATCH /api/shop/partners/me
```

**Description**: Update partner profile (owner only)

**Request Body** (partial update):
```json
{
  "display_name": "TravelGear Pro",
  "description": "Updated description...",
  "logo_url": "https://storage.supabase.co/..."
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "display_name": "TravelGear Pro",
    "updated_at": "2026-02-07T11:00:00Z"
  }
}
```

**Errors**:
- `403 FORBIDDEN`: Not partner owner

---

### 2.4 Get Public Partner Profile

```http
GET /api/shop/partners/:slug
```

**Description**: Public endpoint for partner storefront

**Response (200 OK)**:
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "slug": "travelgear-co-a1b2c3",
    "display_name": "TravelGear",
    "description": "...",
    "logo_url": "https://...",
    "product_count": 42,
    "rating_avg": 4.7,
    "rating_count": 89,
    "follower_count": 1234
  }
}
```

---

## 3. Product Management Endpoints

### 3.1 List Partner Products

```http
GET /api/shop/partners/products
```

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Items per page (max 100) |
| `offset` | number | 0 | Pagination offset |
| `status` | string | all | `draft`, `active`, `archived`, `flagged` |
| `search` | string | - | Search title/SKU |
| `sort` | string | `newest` | `newest`, `oldest`, `title`, `sales` |

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "prod-uuid-1",
      "slug": "travel-backpack-pro-a1b2c3",
      "title": "Travel Backpack Pro",
      "status": "active",
      "image_url": "https://...",
      "price_from": { "amount": 9900, "currency": "USD" },
      "stock_total": 150,
      "sales_count": 42,
      "created_at": "2026-01-20T10:00:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 3.2 Create Product Draft

```http
POST /api/shop/partners/products
```

**Request Body**:
```json
{
  "title": "Travel Backpack Pro",
  "description": "Durable 40L backpack with...",
  "category_id": "cat-uuid",
  "product_type": "physical"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "prod-uuid-new",
    "slug": "travel-backpack-pro-a1b2c3",
    "status": "draft",
    "created_at": "2026-02-07T12:00:00Z"
  }
}
```

---

### 3.3 Get Product Detail (Partner View)

```http
GET /api/shop/partners/products/:id
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "prod-uuid-1",
    "slug": "travel-backpack-pro-a1b2c3",
    "title": "Travel Backpack Pro",
    "description": "...",
    "status": "draft",
    "category_id": "cat-uuid",
    "category": { "id": "...", "name": "Bags & Luggage", "slug": "bags" },
    "product_type": "physical",
    "variants": [
      {
        "id": "var-uuid-1",
        "sku": "TBP-BLK-L",
        "title": "Black / Large",
        "price": 9900,
        "compare_at_price": 12900,
        "stock_on_hand": 50,
        "is_active": true,
        "options": [
          { "name": "Color", "value": "Black" },
          { "name": "Size", "value": "Large" }
        ]
      }
    ],
    "images": [
      {
        "id": "img-uuid-1",
        "url": "https://...",
        "alt": "Front view",
        "sort_order": 0,
        "is_primary": true
      }
    ],
    "created_at": "2026-01-20T10:00:00Z",
    "updated_at": "2026-02-07T12:00:00Z"
  }
}
```

---

### 3.4 Update Product

```http
PATCH /api/shop/partners/products/:id
```

**Request Body** (partial update):
```json
{
  "title": "Travel Backpack Pro V2",
  "description": "Updated description...",
  "category_id": "new-cat-uuid"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "prod-uuid-1",
    "title": "Travel Backpack Pro V2",
    "updated_at": "2026-02-07T13:00:00Z"
  }
}
```

---

### 3.5 Publish Product

```http
POST /api/shop/partners/products/:id/publish
```

**Description**: Change status from `draft` to `active` (with validation)

**Response (200 OK)**:
```json
{
  "data": {
    "id": "prod-uuid-1",
    "status": "active",
    "published_at": "2026-02-07T14:00:00Z"
  }
}
```

**Errors**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Product cannot be published",
    "details": [
      { "field": "images", "message": "At least 1 image required" },
      { "field": "variants", "message": "At least 1 variant with price required" }
    ]
  }
}
```

---

### 3.6 Unpublish/Archive Product

```http
POST /api/shop/partners/products/:id/archive
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "prod-uuid-1",
    "status": "archived"
  }
}
```

---

### 3.7 Delete Product

```http
DELETE /api/shop/partners/products/:id
```

**Description**: Soft delete (set `deleted_at`)

**Response (204 No Content)**

**Errors**:
- `409 HAS_ORDERS`: Cannot delete product with existing orders

---

## 4. Variant Management

### 4.1 Create Variant

```http
POST /api/shop/partners/products/:productId/variants
```

**Request Body**:
```json
{
  "sku": "TBP-BLU-M",
  "title": "Blue / Medium",
  "price": 8900,
  "compare_at_price": 11900,
  "stock_on_hand": 30,
  "options": [
    { "name": "Color", "value": "Blue" },
    { "name": "Size", "value": "Medium" }
  ]
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "var-uuid-new",
    "sku": "TBP-BLU-M",
    "title": "Blue / Medium",
    "price": 8900
  }
}
```

---

### 4.2 Update Variant

```http
PATCH /api/shop/partners/products/:productId/variants/:variantId
```

**Request Body**:
```json
{
  "price": 7900,
  "stock_on_hand": 45
}
```

---

### 4.3 Delete Variant

```http
DELETE /api/shop/partners/products/:productId/variants/:variantId
```

**Response (204 No Content)**

---

## 5. Image Upload Endpoints

### 5.1 Request Upload URL

```http
POST /api/shop/partners/upload/request
```

**Request Body**:
```json
{
  "product_id": "prod-uuid-1",
  "filename": "backpack-front.jpg",
  "content_type": "image/jpeg",
  "file_size": 2048576
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "upload_url": "https://storage.supabase.co/.../signed-url...",
    "key": "a1b2c3/products/prod-uuid-1/img-uuid-new.jpg",
    "expires_in": 3600
  }
}
```

**Errors**:
- `400 INVALID_FILE_TYPE`: Not allowed content type
- `400 FILE_TOO_LARGE`: Exceeds 5MB limit

---

### 5.2 Confirm Upload

```http
POST /api/shop/partners/upload/confirm
```

**Request Body**:
```json
{
  "key": "a1b2c3/products/prod-uuid-1/img-uuid-new.jpg",
  "product_id": "prod-uuid-1",
  "alt": "Backpack front view",
  "is_primary": true
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "img-uuid-new",
    "url": "https://storage.supabase.co/.../a1b2c3/products/...",
    "is_primary": true
  }
}
```

---

### 5.3 Delete Image

```http
DELETE /api/shop/partners/products/:productId/images/:imageId
```

**Response (204 No Content)**

---

### 5.4 Reorder Images

```http
POST /api/shop/partners/products/:productId/images/reorder
```

**Request Body**:
```json
{
  "image_ids": ["img-uuid-2", "img-uuid-1", "img-uuid-3"]
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "success": true
  }
}
```

---

## 6. Order Management Endpoints

### 6.1 List Partner Orders

```http
GET /api/shop/partners/orders
```

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 20 | Items per page |
| `offset` | number | 0 | Pagination offset |
| `status` | string | all | Order status filter |
| `from` | string | - | Date range start (ISO) |
| `to` | string | - | Date range end (ISO) |

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "order-uuid",
      "order_number": "ORD-20260207-1234",
      "status": "pending",
      "customer_name": "John Doe",
      "item_count": 3,
      "partner_subtotal": { "amount": 29700, "currency": "USD" },
      "created_at": "2026-02-07T10:00:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### 6.2 Get Order Detail

```http
GET /api/shop/partners/orders/:orderId
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "order-uuid",
    "order_number": "ORD-20260207-1234",
    "status": "pending",
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "shipping_address": {
      "line1": "123 Main St",
      "city": "Da Nang",
      "country": "VN"
    },
    "items": [
      {
        "id": "item-uuid",
        "product_id": "prod-uuid-1",
        "product_title": "Travel Backpack Pro",
        "variant_id": "var-uuid-1",
        "variant_title": "Black / Large",
        "qty": 2,
        "unit_price": { "amount": 9900, "currency": "USD" },
        "line_total": { "amount": 19800, "currency": "USD" }
      }
    ],
    "partner_subtotal": { "amount": 19800, "currency": "USD" },
    "created_at": "2026-02-07T10:00:00Z",
    "updated_at": "2026-02-07T10:00:00Z"
  }
}
```

---

### 6.3 Update Order Status

```http
PATCH /api/shop/partners/orders/:orderId/status
```

**Request Body**:
```json
{
  "status": "shipped",
  "tracking_number": "VN123456789",
  "tracking_url": "https://track.vn/VN123456789"
}
```

**Response (200 OK)**:
```json
{
  "data": {
    "id": "order-uuid",
    "status": "shipped",
    "updated_at": "2026-02-07T15:00:00Z"
  }
}
```

---

## 7. Analytics Endpoints

### 7.1 Get Dashboard Stats

```http
GET /api/shop/partners/analytics/dashboard
```

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `7d` | `today`, `7d`, `30d`, `12m` |

**Response (200 OK)**:
```json
{
  "data": {
    "period": "7d",
    "stats": {
      "revenue": { "amount": 450000, "currency": "USD" },
      "revenue_change": 12.5,
      "orders": 23,
      "orders_change": -5.2,
      "product_views": 1456,
      "views_change": 8.3,
      "conversion_rate": 1.58
    },
    "chart": {
      "labels": ["Feb 1", "Feb 2", "Feb 3", "Feb 4", "Feb 5", "Feb 6", "Feb 7"],
      "revenue": [50000, 75000, 60000, 80000, 55000, 70000, 60000],
      "orders": [3, 4, 3, 5, 2, 4, 2]
    }
  }
}
```

---

### 7.2 Get Top Products

```http
GET /api/shop/partners/analytics/top-products
```

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | `30d` | Time period |
| `limit` | number | 10 | Number of products |
| `metric` | string | `sales` | `sales`, `views`, `revenue` |

**Response (200 OK)**:
```json
{
  "data": [
    {
      "product_id": "prod-uuid-1",
      "title": "Travel Backpack Pro",
      "image_url": "https://...",
      "sales_count": 42,
      "revenue": { "amount": 415800, "currency": "USD" },
      "views": 1234
    }
  ]
}
```

---

## 8. Team Management Endpoints

### 8.1 List Team Members

```http
GET /api/shop/partners/team
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "member-uuid",
      "user_id": "user-uuid",
      "email": "staff@travelgear.com",
      "name": "Jane Smith",
      "role": "staff",
      "permissions": { "products": true, "orders": true, "analytics": false },
      "status": "active",
      "accepted_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

---

### 8.2 Invite Team Member

```http
POST /api/shop/partners/team/invite
```

**Request Body**:
```json
{
  "email": "newstaff@travelgear.com",
  "role": "staff",
  "permissions": { "products": true, "orders": true, "analytics": false }
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "member-uuid",
    "email": "newstaff@travelgear.com",
    "status": "pending",
    "invited_at": "2026-02-07T10:00:00Z"
  }
}
```

---

### 8.3 Update Team Member

```http
PATCH /api/shop/partners/team/:memberId
```

**Request Body**:
```json
{
  "permissions": { "products": true, "orders": false, "analytics": true }
}
```

---

### 8.4 Remove Team Member

```http
DELETE /api/shop/partners/team/:memberId
```

**Response (204 No Content)**

---

## 9. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `ALREADY_PARTNER` | 409 | User already has partner account |
| `PARTNER_PENDING` | 403 | Partner not yet approved |
| `PARTNER_SUSPENDED` | 403 | Partner account suspended |
| `HAS_ORDERS` | 409 | Cannot delete (has orders) |
| `INVALID_FILE_TYPE` | 400 | File type not allowed |
| `FILE_TOO_LARGE` | 400 | File exceeds size limit |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 10. TypeScript Types

```typescript
// lib/shop/types.ts additions

export interface ShopPartner {
  id: string;
  slug: string;
  business_name: string;
  display_name: string | null;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  business_type: 'individual' | 'business' | 'enterprise';
  status: 'pending' | 'approved' | 'suspended' | 'banned';
  product_count: number;
  order_count: number;
  total_sales_cents: number;
  rating_avg: number;
  rating_count: number;
  follower_count: number;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerMember {
  id: string;
  partner_id: string;
  user_id: string;
  role: 'owner' | 'staff';
  permissions: {
    products: boolean;
    orders: boolean;
    analytics: boolean;
  };
  status: 'pending' | 'active' | 'removed';
  invited_at: string | null;
  accepted_at: string | null;
}

export interface PartnerProduct extends Product {
  sales_count?: number;
  stock_total?: number;
}

export interface PartnerOrder {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  item_count: number;
  partner_subtotal: Money;
  items: PartnerOrderItem[];
  created_at: string;
}

export interface PartnerOrderItem {
  id: string;
  product_id: string;
  product_title: string;
  variant_id: string;
  variant_title: string;
  qty: number;
  unit_price: Money;
  line_total: Money;
}

export interface DashboardStats {
  period: string;
  stats: {
    revenue: Money;
    revenue_change: number;
    orders: number;
    orders_change: number;
    product_views: number;
    views_change: number;
    conversion_rate: number;
  };
  chart?: {
    labels: string[];
    revenue: number[];
    orders: number[];
  };
}
```

---

## Summary

| Endpoint Group | Count | Key Operations |
|----------------|-------|----------------|
| Partner Profile | 4 | Apply, Get, Update, Public View |
| Products | 7 | CRUD, Publish, Archive |
| Variants | 3 | Create, Update, Delete |
| Images | 4 | Request URL, Confirm, Delete, Reorder |
| Orders | 3 | List, Detail, Update Status |
| Analytics | 2 | Dashboard, Top Products |
| Team | 4 | List, Invite, Update, Remove |
| **Total** | **27** | |
