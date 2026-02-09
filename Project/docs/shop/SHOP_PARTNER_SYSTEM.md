# Shop Partner System — Complete Technical Documentation

> **Status**: MVP Code-Complete  
> **Last Updated**: 2026-02-08  
> **TypeScript**: 0 errors in shop/partner code  
> **Total Lines of Code**: ~8,500+

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Database Schema](#3-database-schema)
4. [TypeScript Types](#4-typescript-types)
5. [Business Logic (partner-queries.ts)](#5-business-logic)
6. [API Routes](#6-api-routes)
7. [Zustand Stores](#7-zustand-stores)
8. [Frontend Pages](#8-frontend-pages)
9. [Frontend Components](#9-frontend-components)
10. [Modifications to Existing Files](#10-modifications-to-existing-files)
11. [Key Flows](#11-key-flows)
12. [File Inventory](#12-file-inventory)
13. [Remaining Work](#13-remaining-work)

---

## 1. Overview

The Shop Partner System allows users to apply as sellers/vendors on the TripC Marketplace. Partners can manage their own products, variants, images, orders, and team members through a dedicated portal at `/shop/partner/`.

### Key Design Decisions

- **Two entities**: `shop_partners` (business account) and `brands` (public storefront). Linked via `shop_partners.brand_id` FK. When a partner is created, a corresponding brand is auto-created and activated.
- **Same login**: Partners use the same Clerk authentication as regular users. A user who is also a partner can both shop and sell.
- **Auto-approval**: Partner applications are currently auto-approved on submission (placeholder for future AI-based certificate verification).
- **Certificate uploads**: The onboarding form includes a certificate upload step. Files are selected locally but actual cloud storage upload is a placeholder for future AI verification logic.
- **Separate portal**: The partner portal lives at `app/shop/partner/` (under the shop namespace). Existing hotel/restaurant partner portals at `app/partner/` are completely separate systems.

---

## 2. Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router, TypeScript |
| Database | Supabase (Postgres), service-role client |
| Auth | Clerk (`auth()`, `useUser()`, `getDbUserId()`) |
| State | Zustand stores |
| UI | Tailwind CSS, shadcn/ui (new-york), Framer Motion, Lucide React icons |
| Notifications | Sonner toasts |
| Theme | `primary` = `#FF5E1F` (brand orange) |

### Auth Flow

```
User signs in (Clerk) → clerkId
    ↓
getDbUserId(clerkId) → userId (UUID from users table)
    ↓
getPartnerMembership(userId) → looks up shop_partner_members
    ↓
Returns PartnerWithMembership (partner data + role + permissions)
```

### Data Flow

```
Frontend (Zustand store)
    ↓ fetch()
API Route (app/api/shop/partners/...)
    ↓ auth() + getDbUserId()
Business Logic (lib/shop/partner-queries.ts)
    ↓ createServiceSupabaseClient()
Supabase (Postgres + Storage)
```

---

## 3. Database Schema

**Migration file**: `supabase/migrations/20260208_shop_partners.sql` (292 lines)

### New Tables

#### `shop_partners` — Partner business profiles

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK, auto-generated |
| `slug` | varchar | UNIQUE, auto-generated from business_name + id |
| `business_name` | varchar | NOT NULL |
| `display_name` | varchar | Shown to customers |
| `description` | text | |
| `logo_url` | varchar | |
| `cover_url` | varchar | |
| `email` | varchar | NOT NULL |
| `phone` | varchar | |
| `website` | varchar | |
| `business_type` | varchar | `individual` / `business` / `enterprise` |
| `business_registration_number` | varchar | |
| `tax_id` | varchar | |
| `address_line1..country_code` | varchar | 5 address fields, country defaults `'VN'` |
| `status` | varchar | `pending` / `approved` / `suspended` / `banned` |
| `verified_at` | timestamptz | Set on approval |
| `verified_by` | uuid | FK → `users(id)` |
| `rejection_reason` | text | |
| `brand_id` | uuid | FK → `brands(id)`, UNIQUE |
| `product_count` | integer | Denormalized, trigger-maintained |
| `order_count` | integer | Denormalized |
| `total_sales_cents` | bigint | |
| `rating_avg` | numeric | 0–5 |
| `rating_count` | integer | |
| `follower_count` | integer | |
| `commission_rate` | numeric | Default 0.15 (15%), range 0–1 |
| `payout_method` | varchar | Placeholder |
| `payout_details` | jsonb | Placeholder |
| `metadata` | jsonb | |
| `created_at` / `updated_at` | timestamptz | |
| `deleted_at` | timestamptz | Soft delete |

#### `shop_partner_members` — User-to-partner membership

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `partner_id` | uuid | FK → `shop_partners(id)` CASCADE |
| `user_id` | uuid | FK → `users(id)` CASCADE |
| `role` | varchar | `owner` / `staff` |
| `permissions` | jsonb | `{ products, orders, analytics }` booleans |
| `status` | varchar | `pending` / `active` / `removed` |
| `invited_by` | uuid | FK → `users(id)` |
| `invited_at` / `accepted_at` | timestamptz | |
| UNIQUE | | `(partner_id, user_id)` |

#### `shop_partner_audit_logs` — Activity audit trail

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `partner_id` | uuid | FK → `shop_partners(id)` CASCADE |
| `actor_id` | uuid | FK → `users(id)` |
| `action` | varchar | e.g. `partner_approve`, `product_create` |
| `entity_type` | varchar | e.g. `partner`, `product`, `order` |
| `entity_id` | uuid | |
| `old_values` / `new_values` | jsonb | |
| `ip_address` | inet | |
| `user_agent` | text | |
| `created_at` | timestamptz | |

### Table Modifications

- **`shop_products`**: Added `partner_id` (uuid FK → `shop_partners`), `reviewed_by` (uuid FK → `users`), `reviewed_at`, `review_notes`. Status CHECK updated to include `'flagged'`.
- **`order_items`**: Added `partner_id` (uuid FK → `shop_partners`) with index.

### Triggers

| Trigger | Table | Event | Purpose |
|---------|-------|-------|---------|
| `trg_update_partner_product_count` | `shop_products` | INSERT/UPDATE/DELETE | Maintains `shop_partners.product_count` when products transition to/from `active` |
| `trg_order_items_set_partner` | `order_items` | BEFORE INSERT | Auto-populates `partner_id` from the product's `partner_id` |
| `trg_shop_partners_updated_at` | `shop_partners` | BEFORE UPDATE | Auto-sets `updated_at = now()` |

### RLS Policies

| Table | Policy | Rule |
|-------|--------|------|
| `shop_partners` | `shop_partners_public_read` | SELECT where `status = 'approved' AND deleted_at IS NULL` |
| `shop_partners` | `shop_partners_auth_insert` | INSERT: any authenticated user can apply |
| `shop_partner_members` | `shop_partner_members_self_read` | SELECT: all reads (service role bypasses) |
| `shop_partner_audit_logs` | `shop_partner_audit_logs_read` | SELECT: all reads |

> Note: The service-role Supabase client used in `partner-queries.ts` bypasses RLS entirely. These policies are baseline protection for direct client access.

---

## 4. TypeScript Types

**File**: `lib/shop/types.ts` (367 lines)

### Enums (Type Aliases)

| Name | Values |
|------|--------|
| `PartnerStatus` | `'pending' \| 'approved' \| 'suspended' \| 'banned'` |
| `PartnerBusinessType` | `'individual' \| 'business' \| 'enterprise'` |
| `PartnerMemberRole` | `'owner' \| 'staff'` |
| `PartnerMemberStatus` | `'pending' \| 'active' \| 'removed'` |

### Interfaces

| Interface | Extends | Key Fields |
|-----------|---------|------------|
| `ShopPartner` | — | 35 fields: id, slug, business_name, display_name, status, brand_id, product_count, commission_rate, etc. |
| `PartnerMemberPermissions` | — | `{ products: boolean; orders: boolean; analytics: boolean }` |
| `PartnerMember` | — | id, partner_id, user_id, role, permissions, status, invited_by |
| `PartnerWithMembership` | `ShopPartner` | Adds `role` and `permissions` from the member's record |
| `PartnerProduct` | `Product` | Adds optional `sales_count` and `stock_total` |
| `PartnerOrderItem` | — | product_id, product_title, variant_id, qty, unit_price, line_total |
| `PartnerOrder` | — | id, order_number, status, customer_name, items[], partner_subtotal |
| `DashboardStats` | — | period, stats (revenue, orders, views, changes), chart (labels, data) |
| `PartnerApplicationData` | — | business_name, email, business_type, phone, website, address, description, certificate_urls |

---

## 5. Business Logic

**File**: `lib/shop/partner-queries.ts` (1,310 lines, 26 exported functions + 1 class)

### Error Handling

| Export | Description |
|--------|-------------|
| `PartnerError` | Custom error class with `code`, `status`, `details` for structured API responses |

### Auth Helpers

| Function | Returns | Description |
|----------|---------|-------------|
| `getPartnerMembership(userId)` | `PartnerWithMembership \| null` | Looks up user's active membership, returns combined partner + role/permissions |
| `requirePartnerAccess(userId, requiredRole?)` | `PartnerWithMembership` | Guards access; throws PartnerError for non-partner, pending, suspended, banned, or wrong role |

### Partner Profile (3 functions)

| Function | Description |
|----------|-------------|
| `applyAsPartner(userId, data)` | Creates partner + owner membership + brand. Auto-approves. Generates slug. |
| `getPartnerBySlug(slug)` | Public lookup of approved partner by slug |
| `updatePartnerProfile(partnerId, data)` | Updates profile fields + syncs to linked brand |

### Product Management (7 functions)

| Function | Description |
|----------|-------------|
| `getPartnerProducts(partnerId, params)` | Paginated list with variants/images/category, status/search/sort filters |
| `getPartnerProductById(partnerId, productId)` | Single product with variants, options, images, category |
| `createPartnerProduct(partnerId, data)` | Creates draft product with auto-slug and brand_id |
| `updatePartnerProduct(partnerId, productId, data)` | Updates fields, blocks editing flagged products, re-generates slug |
| `publishPartnerProduct(partnerId, productId)` | Validates (title ≥ 3 chars, description ≥ 50, ≥ 1 variant with price, ≥ 1 image) then publishes |
| `archivePartnerProduct(partnerId, productId)` | Sets status to `archived` |
| `deletePartnerProduct(partnerId, productId)` | Hard-deletes product + images/variants. Blocks if product has orders. |

### Variant Management (3 functions)

| Function | Description |
|----------|-------------|
| `createVariant(partnerId, productId, data)` | Creates variant with optional variant options |
| `updateVariant(partnerId, productId, variantId, data)` | Updates variant fields |
| `deleteVariant(partnerId, productId, variantId)` | Deletes variant + options |

### Image Management (3 functions)

| Function | Description |
|----------|-------------|
| `addProductImage(partnerId, productId, data)` | Adds image with auto sort_order, first image becomes primary |
| `deleteProductImage(partnerId, productId, imageId)` | Deletes image |
| `reorderProductImages(partnerId, productId, imageIds)` | Reorders by array position, first becomes primary |

### Order Management (2 functions)

| Function | Description |
|----------|-------------|
| `getPartnerOrders(partnerId, params)` | Orders containing partner's items, with date/status filters, partner-specific subtotals |
| `getPartnerOrderById(partnerId, orderId)` | Single order with partner's line items and subtotal |

### Analytics (2 functions)

| Function | Description |
|----------|-------------|
| `getPartnerDashboardStats(partnerId, period)` | Revenue, orders, views, conversion rate with period-over-period comparison. Periods: today, 7d, 30d, 12m |
| `getPartnerTopProducts(partnerId, params)` | Top products by sales count, aggregated from order items |

### Team Management (4 functions)

| Function | Description |
|----------|-------------|
| `getPartnerTeam(partnerId)` | Lists all non-removed members |
| `inviteTeamMember(partnerId, invitedByUserId, data)` | Invites by email, checks for existing membership |
| `updateTeamMember(partnerId, memberId, data)` | Updates permissions |
| `removeTeamMember(partnerId, memberId)` | Soft-removes (blocks owner removal) |

### Admin Operations (2 functions)

| Function | Description |
|----------|-------------|
| `adminGetPartners(params)` | Lists all partners for admin review |
| `adminReviewPartner(partnerId, adminUserId, action, reason)` | Approve/reject/suspend/ban. Activates/deactivates brand, archives products, writes audit log |

### Barrel Exports

**File**: `lib/shop/index.ts` (176 lines) — Re-exports all 26 functions, PartnerError class, and 13 type exports.

---

## 6. API Routes

**Location**: `app/api/shop/partners/`  
**Total**: 22 route files, 32 HTTP method handlers, ~1,310 lines

| Route | Methods | Description |
|-------|---------|-------------|
| `apply` | POST | Submit partner application |
| `me` | GET, PATCH | Get/update own partner profile |
| `[slug]` | GET | Public partner profile by slug |
| `products` | GET, POST | List/create products |
| `products/[id]` | GET, PATCH, DELETE | Get/update/delete a product |
| `products/[id]/publish` | POST | Publish a product |
| `products/[id]/archive` | POST | Archive a product |
| `products/[id]/variants` | POST | Create variant |
| `products/[id]/variants/[variantId]` | PATCH, DELETE | Update/delete variant |
| `products/[id]/images/[imageId]` | DELETE | Delete image |
| `products/[id]/images/reorder` | POST | Reorder images |
| `upload/request` | POST | Get signed upload URL |
| `upload/confirm` | POST | Confirm upload, create DB record |
| `orders` | GET | List partner orders |
| `orders/[id]` | GET | Get order detail |
| `orders/[id]/status` | PATCH | Update order status |
| `analytics/dashboard` | GET | Dashboard statistics |
| `analytics/top-products` | GET | Top products by sales |
| `team` | GET | List team members |
| `team/invite` | POST | Invite team member |
| `team/[memberId]` | PATCH, DELETE | Update/remove team member |
| `admin/review` | POST | Admin approve/reject/suspend/ban |

### Response Format

All API routes use consistent response helpers from `lib/shop/utils.ts`:

```typescript
successResponse(data, message?, status?)      // { success: true, data }
paginatedResponse(data, total, page, limit)   // { success: true, data, pagination }
errorResponse(code, message, status, details?) // { success: false, error: { code, message, details } }
```

---

## 7. Zustand Stores

### `usePartnerStore` (157 lines)

| State | Type | Purpose |
|-------|------|---------|
| `partner` | `PartnerWithMembership \| null` | Current user's partner profile + membership |
| `dashboardStats` | `DashboardStats \| null` | Dashboard analytics data |
| `isLoading` / `isApplying` / `isUpdating` | `boolean` | Loading states |
| `error` | `string \| null` | Error message |

| Action | Description |
|--------|-------------|
| `fetchPartner()` | GET `/api/shop/partners/me`, handles NOT_PARTNER gracefully |
| `fetchDashboardStats(period)` | GET `/api/shop/partners/analytics/dashboard`, only if approved |
| `applyAsPartner(data)` | POST `/api/shop/partners/apply`, refetches partner on success |
| `updateProfile(data)` | PATCH `/api/shop/partners/me`, optimistic update with rollback |
| `reset()` | Clear all state |

### `usePartnerProductStore` (478 lines)

| State | Type | Purpose |
|-------|------|---------|
| `products` | `PartnerProduct[]` | Product list |
| `total` | `number` | Total count for pagination |
| `currentProduct` | `PartnerProduct \| null` | Currently viewed/edited product |
| `filters` | `{ status, search, sort }` | Active filters |
| `page` / `limit` | `number` | Pagination |
| `isLoading` / `isLoadingProduct` / `isSaving` | `boolean` | Loading states |

| Action | Description |
|--------|-------------|
| `fetchProducts(params)` | Paginated list with filters |
| `setFilters(filters)` | Update filters, reset to page 1, refetch |
| `setPage(page)` | Change page, refetch |
| `fetchProduct(id)` | Single product for edit form |
| `createProduct(data)` | Create draft, returns product ID |
| `updateProduct(id, data)` | PATCH update |
| `publishProduct(id)` | Publish with validation error display |
| `archiveProduct(id)` | Archive product |
| `deleteProduct(id)` | Delete, remove from local list |
| `createVariant(productId, data)` | Create variant, refetch product |
| `updateVariant(productId, variantId, data)` | Update variant, refetch |
| `deleteVariant(productId, variantId)` | Delete variant, refetch |
| `uploadImage(productId, file)` | 3-step: request signed URL → PUT file → confirm |
| `deleteImage(productId, imageId)` | Delete image, refetch |
| `reorderImages(productId, imageIds)` | Reorder images, refetch |

### `usePartnerOrderStore` (150 lines)

| State | Type | Purpose |
|-------|------|---------|
| `orders` | `PartnerOrder[]` | Order list |
| `total` | `number` | Total for pagination |
| `currentOrder` | `PartnerOrder \| null` | Currently viewed order |
| `filters` | `{ status, from, to }` | Date range + status filters |

| Action | Description |
|--------|-------------|
| `fetchOrders(params)` | Paginated list with filters |
| `setFilters(filters)` | Update filters, reset page, refetch |
| `fetchOrder(id)` | Single order detail |
| `updateOrderStatus(orderId, status)` | PATCH status, update local state |

---

## 8. Frontend Pages

**Location**: `app/shop/partner/`  
**Total**: 11 page files, 260 lines

| Route | File | Description |
|-------|------|-------------|
| `/shop/partner` | `page.tsx` (100 lines) | Landing/gate page. Redirects approved partners to dashboard. Shows pending/suspended/banned status. Shows "Become a Partner" CTA for non-partners (via PartnerGuard). |
| `/shop/partner/onboarding` | `onboarding/page.tsx` (8 lines) | Renders OnboardingForm |
| `/shop/partner/dashboard` | `dashboard/page.tsx` (16 lines) | PartnerGuard + PartnerLayout + DashboardView |
| `/shop/partner/products` | `products/page.tsx` (16 lines) | PartnerGuard + PartnerLayout + ProductList |
| `/shop/partner/products/new` | `products/new/page.tsx` (16 lines) | PartnerGuard + PartnerLayout + ProductForm (create mode) |
| `/shop/partner/products/[id]` | `products/[id]/page.tsx` (19 lines) | PartnerGuard + PartnerLayout + ProductForm (edit mode via `useParams`) |
| `/shop/partner/orders` | `orders/page.tsx` (16 lines) | PartnerGuard + PartnerLayout + OrderList |
| `/shop/partner/orders/[id]` | `orders/[id]/page.tsx` (19 lines) | PartnerGuard + PartnerLayout + OrderDetail |
| `/shop/partner/settings` | `settings/page.tsx` (16 lines) | PartnerGuard (owner only) + PartnerLayout + SettingsView |
| `/shop/partner/settings/team` | `settings/team/page.tsx` (16 lines) | PartnerGuard (owner only) + PartnerLayout + TeamManagement |
| — | `layout.tsx` (18 lines) | Minimal root layout wrapper (no site header/footer) |

---

## 9. Frontend Components

**Location**: `components/shop/partner/`  
**Total**: 14 component files, ~3,750 lines

### Layout

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| `PartnerLayout` | `layout/PartnerLayout.tsx` | 23 | Main shell with sidebar + content area |
| `PartnerSidebar` | `layout/PartnerSidebar.tsx` | 250 | Collapsible fixed sidebar with nav links (Dashboard, Products, Orders, Settings/Team), permission-based visibility, "Back to Shop" link |

### Shared / Utility

| Component | File | Lines | Props |
|-----------|------|-------|-------|
| `PartnerGuard` | `shared/PartnerGuard.tsx` | 192 | `children`, `requiredRole?`, `requireApproved?` — Auth/status/role guard |
| `StatCard` | `shared/StatCard.tsx` | 61 | `title`, `value`, `change?`, `icon`, `iconColor?`, `prefix?`, `suffix?` — Animated stat card |
| `EmptyState` | `shared/EmptyState.tsx` | 39 | `icon`, `title`, `description`, `action?` — Empty state placeholder |
| `LoadingSkeleton` | `shared/LoadingSkeleton.tsx` | 46 | `rows?`, `columns?` — Skeleton loader |

### Dashboard

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| `DashboardView` | `dashboard/DashboardView.tsx` | 553 | Full dashboard: key metrics, store profile card, account details, product/order summaries, recent orders, top products, period filtering |

### Onboarding

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| `OnboardingForm` | `onboarding/OnboardingForm.tsx` | 537 | 4-step form: (1) Business info, (2) Contact & location, (3) Certificate uploads, (4) Review & submit. Validation, file upload with preview, auto-approve messaging. |

### Products

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| `ProductList` | `products/ProductList.tsx` | 294 | Paginated list with search, status filter, sort. Per-row actions: edit, publish, archive, delete, view in shop |
| `ProductForm` | `products/ProductForm.tsx` | 528 | Create/edit form: title, description, type, category. Inline variant management. Image upload/gallery with primary tagging. Publish/archive/delete actions. Props: `productId?` |

### Orders

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| `OrderList` | `orders/OrderList.tsx` | 245 | Paginated list with status filter and date-range filter. Links to order detail. |
| `OrderDetail` | `orders/OrderDetail.tsx` | 342 | Order detail: status with transition actions (confirm → process → ship → deliver, cancel), line items, customer info, shipping address, financial summary. Props: `orderId` |

### Settings

| Component | File | Lines | Description |
|-----------|------|-------|-------------|
| `SettingsView` | `settings/SettingsView.tsx` | 273 | Editable: display_name, description, logo_url, cover_url, phone, website. Read-only: business_name, business_type, email, registration number, tax ID |
| `TeamManagement` | `settings/TeamManagement.tsx` | 415 | Invite form (email, role, permissions), member list with badges, per-member actions (toggle permissions, remove) |

---

## 10. Modifications to Existing Files

### `components/shop/brand/Header.tsx`
- Now uses `brand.cover_url` for the banner image (falls back to gradient if not set)
- Displays `brand.description` below tagline with `line-clamp-2`

### `app/partner/page.tsx`
- Added a third "Shop Partner Portal" card with `ShoppingBag` icon linking to `/shop/partner`
- Changed grid from `md:grid-cols-2` to `md:grid-cols-3`

### `lib/shop/queries.ts`
- Updated `getBrands()` and `getBrandBySlug()` to include new brand fields (`cover_url`, `description`)

### `lib/shop/types.ts`
- Added all partner-related types (see section 4)
- Added `partner_id`, `reviewed_by`, `reviewed_at`, `review_notes` fields to `Product` interface

### `lib/shop/index.ts`
- Added barrel re-exports for all 26 partner query functions + PartnerError class + 13 type exports

---

## 11. Key Flows

### Partner Application Flow

```
1. User visits /shop/partner
2. PartnerGuard checks → no partner → shows "Become a Partner" CTA
3. User clicks "Apply Now" → /shop/partner/onboarding
4. OnboardingForm: 4 steps (business info → contact → certificates → review)
5. Submit → POST /api/shop/partners/apply
6. applyAsPartner() creates:
   - shop_partners row (status: 'approved', verified_at: now)
   - shop_partner_members row (role: 'owner', status: 'active')
   - brands row (is_active: true)
7. Store refetches partner → status is 'approved'
8. Redirect to /shop/partner → useEffect sees approved → redirect to /shop/partner/dashboard
```

### Product Creation Flow

```
1. Partner visits /shop/partner/products/new
2. ProductForm renders in create mode
3. Fill title, description, category, type → Save
4. POST /api/shop/partners/products → creates draft product
5. Redirect to /shop/partner/products/[id] (edit mode)
6. Add variants (SKU, title, price, stock)
7. Upload images (3-step: request signed URL → PUT to Supabase → confirm)
8. Click "Publish" → POST .../publish
9. Validates: title ≥ 3 chars, description ≥ 50 chars, ≥ 1 variant with price, ≥ 1 image
10. Product status → 'active', visible to customers
```

### Order Management Flow

```
1. Customer places order containing partner's products
2. order_items trigger auto-sets partner_id from product
3. Partner sees order in /shop/partner/orders
4. Status transitions: pending → processing → shipped → delivered
5. Each transition: PATCH /api/shop/partners/orders/[id]/status
6. Audit log entry created for each status change
```

### Auth & Access Control Flow

```
1. Every API route: auth() → clerkId → getDbUserId() → userId
2. requirePartnerAccess(userId, requiredRole?) checks:
   - User has membership → else NOT_PARTNER (403)
   - Partner status is approved → else PARTNER_PENDING/SUSPENDED/BANNED
   - User role matches requiredRole → else INSUFFICIENT_ROLE (403)
3. Staff permissions checked per-action (products, orders, analytics)
4. Frontend: PartnerGuard component mirrors these checks
```

---

## 12. File Inventory

### New Files Created (50 files)

```
Documentation (6 files):
  docs/shop/partners/00-context.md
  docs/shop/partners/01-requirements.md
  docs/shop/partners/02-schema.md
  docs/shop/partners/03-api-contract.md
  docs/shop/partners/04-frontend-plan.md
  docs/shop/partners/05-implementation-checklist.md

Database (1 file):
  supabase/migrations/20260208_shop_partners.sql

Business Logic (1 file):
  lib/shop/partner-queries.ts                            (1,310 lines)

Zustand Stores (3 files):
  store/usePartnerStore.ts                               (157 lines)
  store/usePartnerProductStore.ts                        (478 lines)
  store/usePartnerOrderStore.ts                          (150 lines)

API Routes (22 files):
  app/api/shop/partners/apply/route.ts
  app/api/shop/partners/me/route.ts
  app/api/shop/partners/[slug]/route.ts
  app/api/shop/partners/products/route.ts
  app/api/shop/partners/products/[id]/route.ts
  app/api/shop/partners/products/[id]/publish/route.ts
  app/api/shop/partners/products/[id]/archive/route.ts
  app/api/shop/partners/products/[id]/variants/route.ts
  app/api/shop/partners/products/[id]/variants/[variantId]/route.ts
  app/api/shop/partners/products/[id]/images/[imageId]/route.ts
  app/api/shop/partners/products/[id]/images/reorder/route.ts
  app/api/shop/partners/upload/request/route.ts
  app/api/shop/partners/upload/confirm/route.ts
  app/api/shop/partners/orders/route.ts
  app/api/shop/partners/orders/[id]/route.ts
  app/api/shop/partners/orders/[id]/status/route.ts
  app/api/shop/partners/analytics/dashboard/route.ts
  app/api/shop/partners/analytics/top-products/route.ts
  app/api/shop/partners/team/route.ts
  app/api/shop/partners/team/invite/route.ts
  app/api/shop/partners/team/[memberId]/route.ts
  app/api/shop/partners/admin/review/route.ts

Frontend Pages (11 files):
  app/shop/partner/layout.tsx
  app/shop/partner/page.tsx
  app/shop/partner/onboarding/page.tsx
  app/shop/partner/dashboard/page.tsx
  app/shop/partner/products/page.tsx
  app/shop/partner/products/new/page.tsx
  app/shop/partner/products/[id]/page.tsx
  app/shop/partner/orders/page.tsx
  app/shop/partner/orders/[id]/page.tsx
  app/shop/partner/settings/page.tsx
  app/shop/partner/settings/team/page.tsx

Frontend Components (14 files):
  components/shop/partner/layout/PartnerLayout.tsx
  components/shop/partner/layout/PartnerSidebar.tsx
  components/shop/partner/shared/PartnerGuard.tsx
  components/shop/partner/shared/StatCard.tsx
  components/shop/partner/shared/EmptyState.tsx
  components/shop/partner/shared/LoadingSkeleton.tsx
  components/shop/partner/dashboard/DashboardView.tsx
  components/shop/partner/onboarding/OnboardingForm.tsx
  components/shop/partner/products/ProductList.tsx
  components/shop/partner/products/ProductForm.tsx
  components/shop/partner/orders/OrderList.tsx
  components/shop/partner/orders/OrderDetail.tsx
  components/shop/partner/settings/SettingsView.tsx
  components/shop/partner/settings/TeamManagement.tsx
```

### Modified Existing Files (5 files)

```
  lib/shop/types.ts                    — Added partner types
  lib/shop/index.ts                    — Added partner re-exports
  lib/shop/queries.ts                  — Updated getBrands/getBrandBySlug
  components/shop/brand/Header.tsx     — Added cover_url and description support
  app/partner/page.tsx                 — Added Shop Partner Portal card
```

---

## 13. Remaining Work

### Required for Deployment

- [ ] Run migration: `npx supabase db push`
- [ ] Create `shop-products` storage bucket in Supabase (set to public)
- [ ] Add storage policies for partner uploads
- [ ] Verify tables and triggers in Supabase Dashboard

### Recommended

- [ ] Add admin role check to `POST /api/shop/partners/admin/review` (currently any authenticated user can approve)
- [ ] Add `/shop/partner(.*)` to Clerk middleware protected routes
- [ ] Implement actual certificate file upload to Supabase Storage (currently files are selected locally but not uploaded)
- [ ] Implement AI-based certificate verification logic
- [ ] End-to-end testing of all flows

### Post-MVP Enhancements

- [ ] Bulk product import/export
- [ ] Automated payouts integration
- [ ] Advanced analytics & reporting
- [ ] Multi-currency support
- [ ] Inventory sync with external systems
- [ ] Partner mobile app
- [ ] Content moderation / flagging system
