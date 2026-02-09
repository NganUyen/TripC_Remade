# Shop Partner System - Context Summary

> **Analysis Date**: February 7, 2026  
> **Status**: Documentation for proposed Partner/Vendor system

## 📋 Overview

This document summarizes the existing Shop module architecture to inform the design of the Partner/Vendor system for product uploads.

---

## 1. Project Structure

```
Project/
├── app/
│   ├── shop/                          # Shop Frontend Pages
│   │   ├── page.tsx                   # Shop listing (/shop)
│   │   ├── layout.tsx                 # Shop layout
│   │   ├── cart/page.tsx              # Cart page
│   │   ├── checkout/page.tsx          # Checkout
│   │   ├── product/[id]/page.tsx      # Product detail
│   │   ├── search/page.tsx            # Search results
│   │   └── brand/[slug]/page.tsx      # Brand page
│   │
│   ├── api/shop/                      # API Route Handlers
│   │   ├── products/route.ts          # GET /products
│   │   ├── products/[slug]/route.ts   # GET /products/:slug
│   │   ├── cart/route.ts              # GET /cart
│   │   ├── cart/items/route.ts        # POST/PATCH/DELETE cart items
│   │   ├── categories/route.ts        # GET /categories
│   │   ├── brands/route.ts            # GET /brands
│   │   ├── orders/route.ts            # POST /orders
│   │   ├── reviews/route.ts           # GET/POST reviews
│   │   ├── vouchers/route.ts          # Voucher management
│   │   └── wishlist/route.ts          # Wishlist operations
│   │
│   └── partner/                       # Existing Partner Portals
│       ├── page.tsx                   # Partner selection page
│       ├── layout.tsx                 # Partner layout (hides main header)
│       ├── hotel/                     # Hotel partner dashboard
│       └── restaurant/                # Restaurant partner dashboard
│
├── components/shop/                   # Shop UI Components
│   ├── ProductGrid.tsx                # Product listing grid
│   ├── ProductCard.tsx                # Individual product card
│   ├── SearchBar.tsx                  # Search with suggestions
│   ├── VoucherStrip.tsx               # Voucher carousel
│   ├── ShopHero.tsx                   # Hero banner
│   ├── MarketplaceActions.tsx         # Cart summary + actions
│   ├── cart/                          # Cart components
│   ├── product/                       # Product detail components
│   └── brand/                         # Brand page components
│
├── components/partner/                # Partner Portal Components
│   ├── hotel/                         # Hotel-specific (3 files)
│   └── restaurant/                    # Restaurant-specific (21 files)
│
├── lib/shop/                          # Shop Business Logic
│   ├── queries.ts                     # Database query functions (1411 lines)
│   ├── types.ts                       # TypeScript interfaces
│   ├── utils.ts                       # Response helpers
│   ├── search-engine.ts               # Search functionality
│   └── index.ts                       # Re-exports
│
└── store/                             # Zustand State Stores
    ├── useCartStore.ts                # Cart state management
    ├── useBuyNowStore.ts              # Buy now flow
    └── useBookingStore.ts             # Booking state
```

---

## 2. Database Schema (Relevant Tables)

### Core Shop Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `shop_products` | Product catalog | id, slug, title, description, status, category_id, brand_id, rating_avg, review_count |
| `product_variants` | SKU/pricing/inventory | id, product_id, sku, title, price, compare_at_price, stock_on_hand, is_active |
| `product_images` | Product gallery | id, product_id, url, alt, sort_order, is_primary |
| `variant_options` | Size/Color options | id, variant_id, option_name, option_value |
| `categories` | Product categories | id, slug, name, parent_id, image_url, sort_order |
| `brands` | Brand/vendor profiles | id, slug, name, logo_url, tagline, follower_count, rating_avg |
| `carts` | Shopping carts | id, user_id, session_id, status, currency |
| `cart_items` | Cart line items | id, cart_id, variant_id, qty, unit_price, title_snapshot |
| `shop_orders` | Completed orders | id, order_number, user_id, subtotal, status, shipping_address_snapshot |
| `order_items` | Order line items | id, order_id, product_id, variant_id, qty, unit_price, line_total |
| `shop_reviews` | Product reviews | id, product_id, user_id, rating, title, body, status |
| `shop_wishlist` | User wishlists | id, user_id, product_id |
| `shipping_methods` | Shipping options | id, code, title, base_fee, estimated_days |
| `coupons` | Discount codes | id, code, discount_type, discount_value, status |
| `vouchers` | Redeemable vouchers | id, code, voucher_type, discount_value |

### Related Tables

| Table | Purpose | Relevance to Partners |
|-------|---------|----------------------|
| `users` | User accounts | clerk_id → id mapping, partner role tracking |
| `bookings` | Universal booking | Category 'shop' links to shop_orders |
| `hotel_partners` | Existing partner pattern | Reference for shop_partners design |

---

## 3. Authentication Pattern

### Clerk Integration

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Shop is public for browsing
const isPublicRoute = createRouteMatcher([
  "/shop(.*)",
  // ... other public routes
]);

// Protected routes require auth
const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/rewards(.*)",
  "/wishlist(.*)",
]);
```

### User ID Resolution

```typescript
// lib/shop/queries.ts
export async function getDbUserId(clerkId: string): Promise<string | null> {
    const supabase = getSupabase();
    const { data } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();
    return data?.id || null;
}
```

**Key Points:**
- Clerk handles authentication
- `clerk_id` (string) maps to `users.id` (UUID)
- Service role client used for database operations
- Session-based carts for guests, user-linked for authenticated

---

## 4. API Response Contract

### Success Response (Paginated)

```typescript
// lib/shop/utils.ts - paginatedResponse()
{
  "data": [...],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

### Success Response (Single)

```typescript
{
  "data": { ... }
}
```

### Error Response

```typescript
// lib/shop/utils.ts - errorResponse()
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Variant not found"
  }
}
```

**HTTP Status Codes:**
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict (e.g., out of stock)
- 500: Internal Error

---

## 5. Data Flow Patterns

### Product Listing Flow

```
1. User → GET /api/shop/products?limit=20&sort=newest
2. Route handler → getProducts() from lib/shop/queries.ts
3. Supabase query → shop_products + joins
4. Response formatted → paginatedResponse()
5. Frontend via useProducts() hook or direct fetch
```

### Cart Operations Flow

```
1. User clicks "Add to Cart"
2. Zustand store → optimistic update
3. POST /api/shop/cart/items { variant_id, qty }
4. queries.ts → addCartItem()
5. Supabase insert/update cart_items
6. Return updated cart → store sync
```

### Order Creation Flow

```
1. User submits checkout
2. POST /api/shop/orders with cart, address, shipping
3. Validate stock, apply discounts
4. Create shop_orders + order_items
5. Create linked bookings record (category='shop')
6. Mark cart as 'converted'
7. Return order confirmation
```

---

## 6. Frontend State Management

### Zustand Cart Store

```typescript
// store/useCartStore.ts
interface CartState {
    cart: Cart | null;
    isLoading: boolean;
    pendingItemIds: string[];
    error: string | null;
    
    initCart: () => Promise<void>;
    addItem: (variantId: string, qty: number, itemDetails?: any) => Promise<void>;
    updateItem: (itemId: string, qty: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    applyVoucher: (code: string) => Promise<void>;
}
```

**Patterns:**
- Optimistic updates for UX
- Rollback on API failure
- Toast notifications via `sonner`

---

## 7. Existing Partner System Pattern

### Architecture Reference

The hotel/restaurant partner portals provide a proven pattern:

```
app/partner/
├── page.tsx              # Selection: Hotel vs Restaurant
├── layout.tsx            # Hides main header/nav
├── hotel/page.tsx        # Hotel portal entry
└── restaurant/page.tsx   # Restaurant portal entry

components/partner/
├── hotel/
│   ├── HotelPortal.tsx
│   ├── HotelPortalLayout.tsx
│   └── HotelDashboard.tsx
└── restaurant/
    ├── RestaurantPortal.tsx
    ├── RestaurantPortalLayout.tsx
    ├── RestaurantDashboard.tsx
    ├── operations/
    ├── orders/
    ├── marketing/
    ├── inventory/
    └── admin/
```

**Key Patterns:**
- Separate layout (no shared header)
- Client-side routing with state
- Section-based navigation
- Mock data, ready for API integration
- Role-based feature access (future)

---

## 8. Storage Pattern (Images)

### Current Approach

Product images stored in `product_images` table with URLs. The project appears to use external URLs (CDN or Supabase Storage).

For partner uploads, we should use:

```
Supabase Storage:
  bucket: shop-products
  paths: /{partner_id}/products/{product_id}/{image_id}.{ext}
```

**Upload Flow:**
1. Partner requests signed URL
2. Client uploads directly to Supabase Storage
3. URL stored in product_images table
4. RLS on storage bucket restricts to partner's folder

---

## 9. Gaps Identified

| Gap | Description | Recommendation |
|-----|-------------|----------------|
| No `shop_partners` table | Brands table exists but lacks partner-specific fields | Create dedicated `shop_partners` table |
| No product ownership | `shop_products.brand_id` exists but no partner link | Add `partner_id` to products |
| No draft/approval workflow | Products have status but no review queue | Add `status` workflow + `reviewed_by` |
| No partner auth roles | Clerk roles not defined for partners | Extend user metadata or create `partner_members` |
| No image upload API | No signed URL generation for product images | Add `/api/shop/partners/upload` endpoint |
| No partner dashboard | Only hotel/restaurant portals exist | Create `/shop/partner/*` routes |

---

## 10. Technical Stack Reference

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (Postgres) |
| Auth | Clerk |
| State | Zustand |
| Styling | Tailwind CSS |
| UI Components | Radix (shadcn/ui) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toast | Sonner |
| Forms | React Hook Form + Zod |

---

## Summary

The Shop module is well-architected with clear separation of concerns:

1. **API Layer**: `/api/shop/*` routes using RESTful conventions
2. **Business Logic**: `/lib/shop/queries.ts` as single source of truth
3. **Types**: Shared TypeScript interfaces
4. **State**: Zustand stores with optimistic updates
5. **Auth**: Clerk with UUID resolution pattern

The Partner system should follow these patterns while adding:
- Partner-specific tables and RLS policies
- Product upload/management workflows
- Partner dashboard UI mirroring hotel/restaurant pattern
