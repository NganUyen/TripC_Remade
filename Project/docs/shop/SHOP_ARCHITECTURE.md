# Shop Module - Architecture Guide

> **Last Updated**: January 26, 2026  
> **Status**: Mock implementation complete, ready for Supabase migration

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Project Structure](#project-structure)
4. [Data Flow](#data-flow)
5. [API Reference](#api-reference)
6. [Frontend Hooks](#frontend-hooks)
7. [Components](#components)
8. [Mock Data](#mock-data)
9. [Switching to Supabase](#switching-to-supabase)
10. [Testing](#testing)

---

## Overview

Shop module của TripC cho phép users:
- Browse và search products
- View product details
- Add to cart và checkout
- Redeem vouchers với TripCent

### Design Goals

1. **Zero-refactor migration**: Switch từ mock → Supabase chỉ cần toggle 1 biến
2. **Type-safe**: Shared types giữa FE, API, và database
3. **Testable**: Mock data cho phép test offline

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│                                                                         │
│  ┌───────────────────┐         ┌──────────────────────────────────┐    │
│  │   React Pages     │         │     lib/hooks/useShopAPI.ts      │    │
│  │                   │────────▶│                                  │    │
│  │  • /shop          │         │  • useProducts(params)           │    │
│  │  • /shop/cart     │         │  • useProduct(slug)              │    │
│  │  • /shop/[id]     │         │  • useCart()                     │    │
│  │  • /shop/checkout │         │  • useVouchers()                 │    │
│  └───────────────────┘         └──────────────────────────────────┘    │
│                                              │                          │
│                                              │ HTTP (fetch)             │
│                                              ▼                          │
├─────────────────────────────────────────────────────────────────────────┤
│                             API LAYER                                   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    app/api/shop/**/route.ts                      │  │
│  │                                                                  │  │
│  │  Endpoints:                                                      │  │
│  │  • GET  /api/shop/products          - List products              │  │
│  │  • GET  /api/shop/products/:slug    - Product detail             │  │
│  │  • GET  /api/shop/categories        - Category tree              │  │
│  │  • GET  /api/shop/cart              - Get cart                   │  │
│  │  • POST /api/shop/cart/items        - Add to cart                │  │
│  │  • GET  /api/shop/vouchers/available- Available vouchers         │  │
│  │                                                                  │  │
│  │  All routes import from: @/lib/shop                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                              │                          │
│                                              ▼                          │
├─────────────────────────────────────────────────────────────────────────┤
│                          INTERFACE LAYER                                │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     lib/shop/queries.ts                          │  │
│  │                                                                  │  │
│  │  ┌─────────────────────────────────────────────────────────┐    │  │
│  │  │  const USE_MOCK = true;   ◀── TOGGLE THIS TO SWITCH!   │    │  │
│  │  └─────────────────────────────────────────────────────────┘    │  │
│  │                                                                  │  │
│  │  Functions:                                                      │  │
│  │  • getProducts(params)        • addCartItem(key, variantId, qty)│  │
│  │  • getProductBySlug(slug)     • updateCartItem(key, itemId, qty)│  │
│  │  • getCategories()            • removeCartItem(key, itemId)     │  │
│  │  • getAvailableVouchers()     • createOrder(userId, ...)        │  │
│  │  • ... 30+ functions total                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                              │                          │
│                         ┌────────────────────┴────────────────────┐    │
│                         ▼                                         ▼    │
│  ┌──────────────────────────────────┐    ┌──────────────────────────┐ │
│  │       MOCK (Current)             │    │    SUPABASE (Future)     │ │
│  │                                  │    │                          │ │
│  │  lib/mock/shop.ts                │    │  Supabase client         │ │
│  │  lib/mock/shop-data.json         │    │  shop_schema.sql         │ │
│  │                                  │    │                          │ │
│  │  • 12 products                   │    │  • Real database         │ │
│  │  • In-memory carts/orders        │    │  • RLS policies          │ │
│  │  • Instant responses             │    │  • Triggers              │ │
│  └──────────────────────────────────┘    └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Project/
├── app/
│   ├── api/shop/                    # API Route Handlers
│   │   ├── products/
│   │   │   ├── route.ts             # GET /products
│   │   │   └── [slug]/route.ts      # GET /products/:slug
│   │   ├── cart/
│   │   │   ├── route.ts             # GET /cart
│   │   │   └── items/route.ts       # POST /cart/items
│   │   ├── categories/route.ts      # GET /categories
│   │   ├── vouchers/available/route.ts
│   │   └── ...
│   │
│   └── shop/                        # Frontend Pages
│       ├── page.tsx                 # Shop listing
│       ├── cart/page.tsx            # Cart page
│       └── product/[id]/page.tsx    # Product detail
│
├── components/shop/                 # UI Components
│   ├── ProductGrid.tsx              # Product listing grid
│   ├── ProductCard.tsx              # Individual product card
│   ├── VoucherStrip.tsx             # Voucher carousel
│   ├── MarketplaceActions.tsx       # Voucher banner + cart summary
│   └── product/
│       ├── ProductInfo.tsx          # Product info + Add to Cart
│       ├── ProductGallery.tsx       # Image gallery
│       └── ...
│
├── lib/
│   ├── shop/                        # Shop Business Logic
│   │   ├── queries.ts               # ⭐ Interface layer (USE_MOCK toggle)
│   │   ├── types.ts                 # TypeScript types
│   │   ├── utils.ts                 # Response helpers
│   │   └── index.ts                 # Re-exports
│   │
│   ├── mock/                        # Mock Implementation
│   │   ├── shop.ts                  # mockQueries implementation
│   │   └── shop-data.json           # 12 products, variants, etc.
│   │
│   └── hooks/
│       └── useShopAPI.ts            # React hooks for FE
│
└── docs/shop/                       # Documentation
    ├── SHOP_ARCHITECTURE.md         # This file
    ├── SHOP_SCHEMA_GUIDE.md         # Database schema guide
    └── shop_schema_enterprise.sql   # SQL schema
```

---

## Data Flow

### Example: User views product list

```
1. User navigates to /shop
   ↓
2. ProductGrid component renders
   ↓
3. useProducts() hook called
   ↓
4. Hook fetches GET /api/shop/products
   ↓
5. API route calls getProducts() from lib/shop
   ↓
6. queries.ts checks USE_MOCK flag
   ↓
7. [USE_MOCK=true] → mockQueries.products.findAll()
   ↓
8. Returns products from shop-data.json
   ↓
9. API formats response with paginatedResponse()
   ↓
10. Hook returns { products, loading, error }
    ↓
11. ProductGrid renders ProductCard components
```

### Example: User adds item to cart

```
1. User clicks "Add to Cart" on ProductInfo
   ↓
2. handleAddToCart() called with variantId, qty
   ↓
3. shopApi.addToCart(variantId, qty)
   ↓
4. POST /api/shop/cart/items { variant_id, qty }
   ↓
5. API route calls addCartItem() from lib/shop
   ↓
6. queries.ts → mockQueries.cart.add()
   ↓
7. In-memory cart updated, totals recalculated
   ↓
8. Returns updated cart
   ↓
9. Success toast shown to user
```

---

## API Reference

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shop/products` | List products (paginated) |
| GET | `/api/shop/products/:slug` | Get product detail |
| GET | `/api/shop/products/search?q=` | Search products |

**Query Parameters for `/products`:**
- `limit` (number, default 20)
- `offset` (number, default 0)
- `category` (string, category slug)
- `brand` (string, brand slug)
- `featured` (boolean)
- `sort` (newest | price_asc | price_desc | rating)

### Cart

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shop/cart` | Get current cart |
| POST | `/api/shop/cart/items` | Add item to cart |
| PATCH | `/api/shop/cart/items/:id` | Update item quantity |
| DELETE | `/api/shop/cart/items/:id` | Remove item |

### Categories & Vouchers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shop/categories` | Get category tree |
| GET | `/api/shop/vouchers/available` | Get redeemable vouchers |

---

## Frontend Hooks

### `useProducts(params?)`

```typescript
const { products, total, loading, error } = useProducts({
  limit: 8,
  sort: 'newest',
  category: 'luggage'
});
```

### `useProduct(slug)`

```typescript
const { product, loading, error } = useProduct('samsonite-omni-pc-spinner-28');
```

### `useCart()`

```typescript
const { cart, loading, addItem, updateItem, removeItem } = useCart();

// Add item
await addItem('variant-uuid', 2);

// Update quantity
await updateItem('item-uuid', 5);

// Remove item
await removeItem('item-uuid');
```

### `useVouchers()`

```typescript
const { vouchers, loading, error } = useVouchers();
```

### `formatPrice(money)`

```typescript
import { formatPrice } from '@/lib/hooks/useShopAPI';

formatPrice({ amount: 29900, currency: 'USD' }); // "$299.00"
```

---

## Components

### ProductGrid

- Fetches products via `useProducts()`
- Pagination with "Load More" button
- Sort by Recommended/Newest

### ProductCard

Props:
```typescript
interface ProductCardProps {
  id: string
  slug?: string  // For SEO-friendly URLs
  title: string
  price: number
  rating: number
  reviews: number
  image: string
  badge?: string
}
```

### VoucherStrip

- Horizontal scrollable voucher cards
- Fetches from `useVouchers()`
- Links to `/shop/vouchers`

### MarketplaceActions

- Voucher banner (links to `/shop/vouchers`)
- Cart summary (dynamic data from `useCart()`)
- Checkout button (links to `/shop/cart`)

---

## Mock Data

### Products (12 total)

| ID | Title | Price |
|----|-------|-------|
| prod-001 | Samsonite Omni PC Spinner 28" | $299 |
| prod-002 | Premium Memory Foam Travel Pillow | $39 |
| prod-003 | TripC eSIM - Asia 7 Days | $15 |
| prod-004 | Away Carry-On Pro | $345 |
| prod-005 | TripC Packing Cubes Set | $34.99 |
| prod-006 | Noise Cancelling Earbuds | $149 |
| prod-007 | Universal Travel Adapter | $29.99 |
| prod-008 | Flight Compression Socks | $24.99 |
| prod-009 | Collapsible Water Bottle | $18.99 |
| prod-010 | RFID Passport Holder | $39.99 |
| prod-011 | Digital Luggage Scale | $15.99 |
| prod-012 | TripC eSIM - Europe 14 Days | $29.99 |

### In-Memory Stores

- `carts`: Map<sessionKey, Cart>
- `orders`: Order[]
- `wishlists`: Map<userId, productId[]>
- `userVouchers`: Map<userId, UserVoucher[]>

---

## Switching to Supabase

### Prerequisites

1. Supabase project created
2. Schema deployed (see `shop_schema_enterprise.sql`)
3. Environment variables configured:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 1: Toggle the Flag

```typescript
// lib/shop/queries.ts (line 27)

const USE_MOCK = false;  // Change from true to false
```

### Step 2: Uncomment Supabase Client

```typescript
// lib/shop/queries.ts (lines 30-33)

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Step 3: Implement Supabase Queries

Each function has a `USE_MOCK` branch. Replace the `throw new Error('Supabase not configured')` with actual Supabase queries.

Example:
```typescript
export async function getProducts(params) {
  if (USE_MOCK) {
    return mockQueries.products.findAll(params);
  }
  
  // Supabase implementation
  const query = supabase
    .from('products')
    .select('*, variants(price)', { count: 'exact' })
    .eq('status', 'active');
  
  // Apply filters...
  
  return { data: result.data, total: result.count };
}
```

### What DOESN'T Change

| Layer | File | Changes? |
|-------|------|----------|
| Hooks | `lib/hooks/useShopAPI.ts` | ❌ No changes |
| API Routes | `app/api/shop/**/route.ts` | ❌ No changes |
| FE Components | `components/shop/**` | ❌ No changes |
| Types | `lib/shop/types.ts` | ❌ No changes |
| Utils | `lib/shop/utils.ts` | ❌ No changes |

### What CAN be Deleted

| File | Status |
|------|--------|
| `lib/mock/shop.ts` | Can delete after migration |
| `lib/mock/shop-data.json` | Can delete after migration |

---

## Testing

### Local Development

```bash
npm run dev
```

### Test URLs

| Page | URL |
|------|-----|
| Shop listing | http://localhost:3000/shop |
| Product detail | http://localhost:3000/shop/product/samsonite-omni-pc-spinner-28 |
| Cart | http://localhost:3000/shop/cart |
| API Monitor | http://localhost:3000/shop/api |

### Test Checklist

- [ ] Shop page loads with 8 products
- [ ] "Load More" shows remaining products (8 → 12)
- [ ] Sort toggle works (Recommended/Newest)
- [ ] Product detail page loads
- [ ] Add to Cart works
- [ ] Cart page shows items
- [ ] Update/remove cart items
- [ ] Voucher strip displays
- [ ] Navigation links work

---

## Troubleshooting

### "An unsupported type was passed to use()"

**Cause**: Using `use(params)` in client component
**Fix**: Use `useParams()` hook instead

```typescript
// ❌ Wrong
const resolvedParams = use(params);

// ✅ Correct
const params = useParams<{ id: string }>();
```

### Products not loading

1. Check dev server running: `npm run dev`
2. Check API endpoint: http://localhost:3000/api/shop/products
3. Check console for errors

### Cart not persisting

Mock carts are stored in-memory and reset on server restart. This is expected behavior for development.

---

## Contact

For questions about this architecture, contact the development team.
