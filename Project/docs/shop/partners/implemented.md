File 1: D:\react\TripC_Remade\Project\docs\shop\SHOP_PARTNER_SYSTEM.md (678 lines)
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

User signs in (Clerk) → clerkId ↓ getDbUserId(clerkId) → userId (UUID from users table) ↓ getPartnerMembership(userId) → looks up shop_partner_members ↓ Returns PartnerWithMembership (partner data + role + permissions)


### Data Flow

Frontend (Zustand store) ↓ fetch() API Route (app/api/shop/partners/...) ↓ auth() + getDbUserId() Business Logic (lib/shop/partner-queries.ts) ↓ createServiceSupabaseClient() Supabase (Postgres + Storage)


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
| `publishPartnerProduct(partnerId, productId)` | Validates (title >= 3 chars, description >= 50, >= 1 variant with price, >= 1 image) then publishes |
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

**File**: `lib/shop/index.ts` (176 lines) -- Re-exports all 26 functions, PartnerError class, and 13 type exports.

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
7. Zustand Stores
usePartnerStore (157 lines)
State	Type	Purpose
partner	PartnerWithMembership | null	Current user's partner profile + membership
dashboardStats	DashboardStats | null	Dashboard analytics data
isLoading / isApplying / isUpdating	boolean	Loading states
error	string | null	Error message
Action	Description
fetchPartner()	GET /api/shop/partners/me, handles NOT_PARTNER gracefully
fetchDashboardStats(period)	GET /api/shop/partners/analytics/dashboard, only if approved
applyAsPartner(data)	POST /api/shop/partners/apply, refetches partner on success
updateProfile(data)	PATCH /api/shop/partners/me, optimistic update with rollback
reset()	Clear all state
usePartnerProductStore (478 lines)
State	Type	Purpose
products	PartnerProduct[]	Product list
total	number	Total count for pagination
currentProduct	PartnerProduct | null	Currently viewed/edited product
filters	{ status, search, sort }	Active filters
page / limit	number	Pagination
isLoading / isLoadingProduct / isSaving	boolean	Loading states
Action	Description
fetchProducts(params)	Paginated list with filters
setFilters(filters)	Update filters, reset to page 1, refetch
setPage(page)	Change page, refetch
fetchProduct(id)	Single product for edit form
createProduct(data)	Create draft, returns product ID
updateProduct(id, data)	PATCH update
publishProduct(id)	Publish with validation error display
archiveProduct(id)	Archive product
deleteProduct(id)	Delete, remove from local list
createVariant(productId, data)	Create variant, refetch product
updateVariant(productId, variantId, data)	Update variant, refetch
deleteVariant(productId, variantId)	Delete variant, refetch
uploadImage(productId, file)	3-step: request signed URL -> PUT file -> confirm
deleteImage(productId, imageId)	Delete image, refetch
reorderImages(productId, imageIds)	Reorder images, refetch
usePartnerOrderStore (150 lines)
State	Type	Purpose
orders	PartnerOrder[]	Order list
total	number	Total for pagination
currentOrder	PartnerOrder | null	Currently viewed order
filters	{ status, from, to }	Date range + status filters
Action	Description
fetchOrders(params)	Paginated list with filters
setFilters(filters)	Update filters, reset page, refetch
fetchOrder(id)	Single order detail
updateOrderStatus(orderId, status)	PATCH status, update local state
8. Frontend Pages
Location: app/shop/partner/
Total: 11 page files, 260 lines

Route	File	Description
/shop/partner	page.tsx (100 lines)	Landing/gate page. Redirects approved partners to dashboard. Shows pending/suspended/banned status. Shows "Become a Partner" CTA for non-partners (via PartnerGuard).
/shop/partner/onboarding	onboarding/page.tsx (8 lines)	Renders OnboardingForm
/shop/partner/dashboard	dashboard/page.tsx (16 lines)	PartnerGuard + PartnerLayout + DashboardView
/shop/partner/products	products/page.tsx (16 lines)	PartnerGuard + PartnerLayout + ProductList
/shop/partner/products/new	products/new/page.tsx (16 lines)	PartnerGuard + PartnerLayout + ProductForm (create mode)
/shop/partner/products/[id]	products/[id]/page.tsx (19 lines)	PartnerGuard + PartnerLayout + ProductForm (edit mode via useParams)
/shop/partner/orders	orders/page.tsx (16 lines)	PartnerGuard + PartnerLayout + OrderList
/shop/partner/orders/[id]	orders/[id]/page.tsx (19 lines)	PartnerGuard + PartnerLayout + OrderDetail
/shop/partner/settings	settings/page.tsx (16 lines)	PartnerGuard (owner only) + PartnerLayout + SettingsView
/shop/partner/settings/team	settings/team/page.tsx (16 lines)	PartnerGuard (owner only) + PartnerLayout + TeamManagement
--	layout.tsx (18 lines)	Minimal root layout wrapper (no site header/footer)
9. Frontend Components
Location: components/shop/partner/
Total: 14 component files, ~3,750 lines

Layout
Component	File	Lines	Description
PartnerLayout	layout/PartnerLayout.tsx	23	Main shell with sidebar + content area
PartnerSidebar	layout/PartnerSidebar.tsx	250	Collapsible fixed sidebar with nav links (Dashboard, Products, Orders, Settings/Team), permission-based visibility, "Back to Shop" link
Shared / Utility
Component	File	Lines	Props
PartnerGuard	shared/PartnerGuard.tsx	192	children, requiredRole?, requireApproved? -- Auth/status/role guard
StatCard	shared/StatCard.tsx	61	title, value, change?, icon, iconColor?, prefix?, suffix? -- Animated stat card
EmptyState	shared/EmptyState.tsx	39	icon, title, description, action? -- Empty state placeholder
LoadingSkeleton	shared/LoadingSkeleton.tsx	46	rows?, columns? -- Skeleton loader
Dashboard
Component	File	Lines	Description
DashboardView	dashboard/DashboardView.tsx	553	Full dashboard: key metrics, store profile card, account details, product/order summaries, recent orders, top products, period filtering
Onboarding
Component	File	Lines	Description
OnboardingForm	onboarding/OnboardingForm.tsx	537	4-step form: (1) Business info, (2) Contact & location, (3) Certificate uploads, (4) Review & submit. Validation, file upload with preview, auto-approve messaging.
Products
Component	File	Lines	Description
ProductList	products/ProductList.tsx	294	Paginated list with search, status filter, sort. Per-row actions: edit, publish, archive, delete, view in shop
ProductForm	products/ProductForm.tsx	528	Create/edit form: title, description, type, category. Inline variant management. Image upload/gallery with primary tagging. Publish/archive/delete actions. Props: productId?
Orders
Component	File	Lines	Description
OrderList	orders/OrderList.tsx	245	Paginated list with status filter and date-range filter. Links to order detail.
OrderDetail	orders/OrderDetail.tsx	342	Order detail: status with transition actions (confirm -> process -> ship -> deliver, cancel), line items, customer info, shipping address, financial summary. Props: orderId
Settings
Component	File	Lines	Description
SettingsView	settings/SettingsView.tsx	273	Editable: display_name, description, logo_url, cover_url, phone, website. Read-only: business_name, business_type, email, registration number, tax ID
TeamManagement	settings/TeamManagement.tsx	415	Invite form (email, role, permissions), member list with badges, per-member actions (toggle permissions, remove)
10. Modifications to Existing Files
components/shop/brand/Header.tsx
Now uses brand.cover_url for the banner image (falls back to gradient if not set)
Displays brand.description below tagline with line-clamp-2
app/partner/page.tsx
Added a third "Shop Partner Portal" card with ShoppingBag icon linking to /shop/partner
Changed grid from md:grid-cols-2 to md:grid-cols-3
lib/shop/queries.ts
Updated getBrands() and getBrandBySlug() to include new brand fields (cover_url, description)
lib/shop/types.ts
Added all partner-related types (see section 4)
Added partner_id, reviewed_by, reviewed_at, review_notes fields to Product interface
lib/shop/index.ts
Added barrel re-exports for all 26 partner query functions + PartnerError class + 13 type exports
11. Key Flows
Partner Application Flow
1. User visits /shop/partner
2. PartnerGuard checks -> no partner -> shows "Become a Partner" CTA
3. User clicks "Apply Now" -> /shop/partner/onboarding
4. OnboardingForm: 4 steps (business info -> contact -> certificates -> review)
5. Submit -> POST /api/shop/partners/apply
6. applyAsPartner() creates:
   - shop_partners row (status: 'approved', verified_at: now)
   - shop_partner_members row (role: 'owner', status: 'active')
   - brands row (is_active: true)
7. Store refetches partner -> status is 'approved'
8. Redirect to /shop/partner -> useEffect sees approved -> redirect to /shop/partner/dashboard
Product Creation Flow
1. Partner visits /shop/partner/products/new
2. ProductForm renders in create mode
3. Fill title, description, category, type -> Save
4. POST /api/shop/partners/products -> creates draft product
5. Redirect to /shop/partner/products/[id] (edit mode)
6. Add variants (SKU, title, price, stock)
7. Upload images (3-step: request signed URL -> PUT to Supabase -> confirm)
8. Click "Publish" -> POST .../publish
9. Validates: title >= 3 chars, description >= 50 chars, >= 1 variant with price, >= 1 image
10. Product status -> 'active', visible to customers
Order Management Flow
1. Customer places order containing partner's products
2. order_items trigger auto-sets partner_id from product
3. Partner sees order in /shop/partner/orders
4. Status transitions: pending -> processing -> shipped -> delivered
5. Each transition: PATCH /api/shop/partners/orders/[id]/status
6. Audit log entry created for each status change
Auth & Access Control Flow
1. Every API route: auth() -> clerkId -> getDbUserId() -> userId
2. requirePartnerAccess(userId, requiredRole?) checks:
   - User has membership -> else NOT_PARTNER (403)
   - Partner status is approved -> else PARTNER_PENDING/SUSPENDED/BANNED
   - User role matches requiredRole -> else INSUFFICIENT_ROLE (403)
3. Staff permissions checked per-action (products, orders, analytics)
4. Frontend: PartnerGuard component mirrors these checks
12. File Inventory
New Files Created (50 files)
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
Modified Existing Files (5 files)
  lib/shop/types.ts                    -- Added partner types
  lib/shop/index.ts                    -- Added partner re-exports
  lib/shop/queries.ts                  -- Updated getBrands/getBrandBySlug
  components/shop/brand/Header.tsx     -- Added cover_url and description support
  app/partner/page.tsx                 -- Added Shop Partner Portal card
13. Remaining Work
Required for Deployment
 Run migration: npx supabase db push
 Create shop-products storage bucket in Supabase (set to public)
 Add storage policies for partner uploads
 Verify tables and triggers in Supabase Dashboard
Recommended
 Add admin role check to POST /api/shop/partners/admin/review (currently any authenticated user can approve)
 Add /shop/partner(.*) to Clerk middleware protected routes
 Implement actual certificate file upload to Supabase Storage (currently files are selected locally but not uploaded)
 Implement AI-based certificate verification logic
 End-to-end testing of all flows
Post-MVP Enhancements
 Bulk product import/export
 Automated payouts integration
 Advanced analytics & reporting
 Multi-currency support
 Inventory sync with external systems
 Partner mobile app
 Content moderation / flagging system

---

### File 2: D:\react\TripC_Remade\Project\docs\shop\partners\05-implementation-checklist.md (232 lines)

```markdown
# Shop Partner System - Implementation Checklist

> **Status**: Implementation Complete (MVP)  
> **Last Updated**: 2026-02-08  
> **TypeScript**: Clean (0 errors in shop/partner code)

## Phase 1: Database & Schema

### 1.1 Create Migration File
- [x] Create `supabase/migrations/20260208_shop_partners.sql`
- [x] Add `shop_partners` table
- [x] Add `shop_partner_members` table
- [x] Add `shop_partner_audit_logs` table
- [x] Alter `shop_products` (add `partner_id`, `reviewed_by`, etc.)
- [x] Alter `order_items` (add `partner_id`)
- [ ] Run migration locally: `npx supabase db push`
- [ ] Verify tables in Supabase Dashboard

### 1.2 RLS Policies
- [x] Enable RLS on new tables
- [x] Create read policies for `shop_partners`
- [x] Create manage policies for `shop_partner_members`
- [x] Update `shop_products` policies for partner access
- [ ] Test RLS with anon/authenticated roles

### 1.3 Storage Bucket
- [ ] Create `shop-products` bucket in Supabase
- [ ] Set bucket to public
- [ ] Add storage policies for partner uploads

### 1.4 Triggers
- [x] Create auto-owner trigger for `shop_partners`
- [x] Create product count trigger
- [x] Create order_items partner sync trigger

---

## Phase 2: TypeScript Types

### 2.1 Update Types
- [x] Add `ShopPartner` interface to `lib/shop/types.ts`
- [x] Add `PartnerMember` interface
- [x] Add `PartnerProduct` interface (extends Product)
- [x] Add `PartnerOrder` interface
- [x] Add `DashboardStats` interface
- [x] Add enums: `PartnerStatus`, `PartnerBusinessType`, `PartnerMemberRole`, `PartnerMemberStatus`
- [x] Add `PartnerApplicationData`, `PartnerMemberPermissions`, `PartnerWithMembership`

---

## Phase 3: API Routes

### 3.1 Partner Profile APIs
- [x] `POST /api/shop/partners/apply`
- [x] `GET /api/shop/partners/me`
- [x] `PATCH /api/shop/partners/me`
- [x] `GET /api/shop/partners/[slug]`

### 3.2 Product APIs
- [x] `GET /api/shop/partners/products`
- [x] `POST /api/shop/partners/products`
- [x] `GET /api/shop/partners/products/[id]`
- [x] `PATCH /api/shop/partners/products/[id]`
- [x] `POST /api/shop/partners/products/[id]/publish`
- [x] `POST /api/shop/partners/products/[id]/archive`
- [x] `DELETE /api/shop/partners/products/[id]`

### 3.3 Variant APIs
- [x] `POST /api/shop/partners/products/[id]/variants`
- [x] `PATCH /api/shop/partners/products/[id]/variants/[variantId]`
- [x] `DELETE /api/shop/partners/products/[id]/variants/[variantId]`

### 3.4 Image Upload APIs
- [x] `POST /api/shop/partners/upload/request` (signed URL)
- [x] `POST /api/shop/partners/upload/confirm` (DB record)
- [x] `DELETE /api/shop/partners/products/[id]/images/[imageId]`
- [x] `POST /api/shop/partners/products/[id]/images/reorder`

### 3.5 Order APIs
- [x] `GET /api/shop/partners/orders`
- [x] `GET /api/shop/partners/orders/[id]`
- [x] `PATCH /api/shop/partners/orders/[id]/status`

### 3.6 Analytics APIs
- [x] `GET /api/shop/partners/analytics/dashboard`
- [x] `GET /api/shop/partners/analytics/top-products`

### 3.7 Team APIs
- [x] `GET /api/shop/partners/team`
- [x] `POST /api/shop/partners/team/invite`
- [x] `PATCH /api/shop/partners/team/[memberId]`
- [x] `DELETE /api/shop/partners/team/[memberId]`

### 3.8 Admin APIs
- [x] `POST /api/shop/partners/admin/review` (TODO: admin role check)

---

## Phase 4: Business Logic

### 4.1 Query Functions
- [x] Create `lib/shop/partner-queries.ts` (1309 lines, 26 exported functions)
- [x] Add partner CRUD functions
- [x] Add product management functions (CRUD + variants + images)
- [x] Add order query functions
- [x] Add analytics aggregation functions
- [x] Add team management functions

### 4.2 Utilities
- [x] Add partner auth helper (`requirePartnerAccess`, `getPartnerMembership`)
- [x] Add permission checker utility (role-based via `PartnerMemberPermissions`)
- [x] Add `PartnerError` class for typed error handling
- [x] Update barrel exports in `lib/shop/index.ts`

---

## Phase 5: Frontend

### 5.1 Zustand Stores
- [x] Create `store/usePartnerStore.ts` (profile, dashboard stats, apply, update with optimistic rollback)
- [x] Create `store/usePartnerProductStore.ts` (CRUD, variants, images with 3-step signed URL upload)
- [x] Create `store/usePartnerOrderStore.ts` (list, detail, filters, status updates)

### 5.2 Layout & Guards
- [x] Create `app/shop/partner/layout.tsx`
- [x] Create `components/shop/partner/shared/PartnerGuard.tsx`
- [x] Create `components/shop/partner/layout/PartnerSidebar.tsx`
- [x] Create `components/shop/partner/layout/PartnerLayout.tsx`

### 5.3 Shared Components
- [x] Create `components/shop/partner/shared/EmptyState.tsx`
- [x] Create `components/shop/partner/shared/LoadingSkeleton.tsx`
- [x] Create `components/shop/partner/shared/StatCard.tsx`

### 5.4 Onboarding Pages
- [x] Create `app/shop/partner/page.tsx` (landing/gate)
- [x] Create `app/shop/partner/onboarding/page.tsx`
- [x] Create `components/shop/partner/onboarding/OnboardingForm.tsx`

### 5.5 Dashboard
- [x] Create `app/shop/partner/dashboard/page.tsx`
- [x] Create `components/shop/partner/dashboard/DashboardView.tsx` (stats, charts, recent orders, quick actions)

### 5.6 Products
- [x] Create `app/shop/partner/products/page.tsx`
- [x] Create `app/shop/partner/products/new/page.tsx`
- [x] Create `app/shop/partner/products/[id]/page.tsx`
- [x] Create `components/shop/partner/products/ProductList.tsx`
- [x] Create `components/shop/partner/products/ProductForm.tsx` (includes image upload & variant editor)

### 5.7 Orders
- [x] Create `app/shop/partner/orders/page.tsx`
- [x] Create `app/shop/partner/orders/[id]/page.tsx`
- [x] Create `components/shop/partner/orders/OrderList.tsx` (status filters, date range, pagination)
- [x] Create `components/shop/partner/orders/OrderDetail.tsx` (items, customer, shipping, status transitions)

### 5.8 Settings
- [x] Create `app/shop/partner/settings/page.tsx`
- [x] Create `app/shop/partner/settings/team/page.tsx`
- [x] Create `components/shop/partner/settings/SettingsView.tsx` (editable profile, read-only business info)
- [x] Create `components/shop/partner/settings/TeamManagement.tsx` (invite, roles, permissions)

---

## Phase 6: Integration

### 6.1 Brand Discovery
- [x] Update `components/shop/brand/Header.tsx` (cover_url banner, description display)
- [x] Update `lib/shop/queries.ts` (`getBrands`, `getBrandBySlug` include new brand fields)

### 6.2 Partner Selection
- [x] Update `app/partner/page.tsx` (added Shop Partner Portal card, 3-column grid)

### 6.3 Middleware & Auth
- [ ] Add `/shop/partner(.*)` to protected routes (optional)
- [ ] Test partner routes require authentication

---

## Phase 7: Verification

### 7.1 TypeScript
- [x] Run `npx tsc --noEmit` -- 0 errors in shop/partner code
- [x] Fix missing `Settings` import in DashboardView.tsx
- [x] Fix `order_id` not in select query in partner-queries.ts

### 7.2 Testing (TODO)
- [ ] Test partner application flow end-to-end
- [ ] Test product CRUD operations
- [ ] Test image upload flow
- [ ] Test order status updates
- [ ] Test RLS policies

---

## Phase 8: Documentation

### 8.1 Update Docs
- [x] Update implementation checklist (this file)
- [ ] Update `docs/shop/SHOP_ARCHITECTURE.md`
- [ ] Add partner routes to API documentation

---

## Summary

| Category | Items | Done | Remaining |
|----------|-------|------|-----------|
| Database & Schema | 14 | 10 | 4 (deploy + verify + storage) |
| Types | 8 | 8 | 0 |
| API Routes (22 files) | 22 | 22 | 0 |
| Business Logic | 7 | 7 | 0 |
| Zustand Stores | 3 | 3 | 0 |
| Frontend Components | 14 | 14 | 0 |
| Frontend Pages | 11 | 11 | 0 |
| Integration | 4 | 3 | 1 (middleware) |
| Verification | 3 | 3 | 0 |
| Testing | 5 | 0 | 5 |
| Documentation | 3 | 1 | 2 |

---

## Post-MVP Enhancements

- [ ] Bulk product import/export
- [ ] Automated payouts integration
- [ ] Advanced analytics & reporting
- [ ] Multi-currency support
- [ ] Inventory sync with external systems
- [ ] Partner mobile app
- [ ] Admin role check on review endpoint
File 3: D:\react\TripC_Remade\Project\docs\shop\partners\00-context-summary.md (368 lines)
# Shop Partner System - Context Summary

> **Analysis Date**: February 7, 2026  
> **Status**: Documentation for proposed Partner/Vendor system

## Overview

This document summarizes the existing Shop module architecture to inform the design of the Partner/Vendor system for product uploads.

---

## 1. Project Structure

Project/ ├── app/ │ ├── shop/ # Shop Frontend Pages │ │ ├── page.tsx # Shop listing (/shop) │ │ ├── layout.tsx # Shop layout │ │ ├── cart/page.tsx # Cart page │ │ ├── checkout/page.tsx # Checkout │ │ ├── product/[id]/page.tsx # Product detail │ │ ├── search/page.tsx # Search results │ │ └── brand/[slug]/page.tsx # Brand page │ │ │ ├── api/shop/ # API Route Handlers │ │ ├── products/route.ts # GET /products │ │ ├── products/[slug]/route.ts # GET /products/:slug │ │ ├── cart/route.ts # GET /cart │ │ ├── cart/items/route.ts # POST/PATCH/DELETE cart items │ │ ├── categories/route.ts # GET /categories │ │ ├── brands/route.ts # GET /brands │ │ ├── orders/route.ts # POST /orders │ │ ├── reviews/route.ts # GET/POST reviews │ │ ├── vouchers/route.ts # Voucher management │ │ └── wishlist/route.ts # Wishlist operations │ │ │ └── partner/ # Existing Partner Portals │ ├── page.tsx # Partner selection page │ ├── layout.tsx # Partner layout (hides main header) │ ├── hotel/ # Hotel partner dashboard │ └── restaurant/ # Restaurant partner dashboard │ ├── components/shop/ # Shop UI Components │ ├── ProductGrid.tsx # Product listing grid │ ├── ProductCard.tsx # Individual product card │ ├── SearchBar.tsx # Search with suggestions │ ├── VoucherStrip.tsx # Voucher carousel │ ├── ShopHero.tsx # Hero banner │ ├── MarketplaceActions.tsx # Cart summary + actions │ ├── cart/ # Cart components │ ├── product/ # Product detail components │ └── brand/ # Brand page components │ ├── components/partner/ # Partner Portal Components │ ├── hotel/ # Hotel-specific (3 files) │ └── restaurant/ # Restaurant-specific (21 files) │ ├── lib/shop/ # Shop Business Logic │ ├── queries.ts # Database query functions (1411 lines) │ ├── types.ts # TypeScript interfaces │ ├── utils.ts # Response helpers │ ├── search-engine.ts # Search functionality │ └── index.ts # Re-exports │ └── store/ # Zustand State Stores ├── useCartStore.ts # Cart state management ├── useBuyNowStore.ts # Buy now flow └── useBookingStore.ts # Booking state


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
| `users` | User accounts | clerk_id -> id mapping, partner role tracking |
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
User ID Resolution
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
Key Points:

Clerk handles authentication
clerk_id (string) maps to users.id (UUID)
Service role client used for database operations
Session-based carts for guests, user-linked for authenticated
4. API Response Contract
Success Response (Paginated)
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
Success Response (Single)
{
  "data": { ... }
}
Error Response
// lib/shop/utils.ts - errorResponse()
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Variant not found"
  }
}
HTTP Status Codes:

200: Success
201: Created
400: Bad Request
401: Unauthorized
404: Not Found
409: Conflict (e.g., out of stock)
500: Internal Error
5. Data Flow Patterns
Product Listing Flow
1. User -> GET /api/shop/products?limit=20&sort=newest
2. Route handler -> getProducts() from lib/shop/queries.ts
3. Supabase query -> shop_products + joins
4. Response formatted -> paginatedResponse()
5. Frontend via useProducts() hook or direct fetch
Cart Operations Flow
1. User clicks "Add to Cart"
2. Zustand store -> optimistic update
3. POST /api/shop/cart/items { variant_id, qty }
4. queries.ts -> addCartItem()
5. Supabase insert/update cart_items
6. Return updated cart -> store sync
Order Creation Flow
1. User submits checkout
2. POST /api/shop/orders with cart, address, shipping
3. Validate stock, apply discounts
4. Create shop_orders + order_items
5. Create linked bookings record (category='shop')
6. Mark cart as 'converted'
7. Return order confirmation
6. Frontend State Management
Zustand Cart Store
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
Patterns:

Optimistic updates for UX
Rollback on API failure
Toast notifications via sonner
7. Existing Partner System Pattern
Architecture Reference
The hotel/restaurant partner portals provide a proven pattern:

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
Key Patterns:

Separate layout (no shared header)
Client-side routing with state
Section-based navigation
Mock data, ready for API integration
Role-based feature access (future)
8. Storage Pattern (Images)
Current Approach
Product images stored in product_images table with URLs. The project appears to use external URLs (CDN or Supabase Storage).

For partner uploads, we should use:

Supabase Storage:
  bucket: shop-products
  paths: /{partner_id}/products/{product_id}/{image_id}.{ext}
Upload Flow:

Partner requests signed URL
Client uploads directly to Supabase Storage
URL stored in product_images table
RLS on storage bucket restricts to partner's folder
9. Gaps Identified
Gap	Description	Recommendation
No shop_partners table	Brands table exists but lacks partner-specific fields	Create dedicated shop_partners table
No product ownership	shop_products.brand_id exists but no partner link	Add partner_id to products
No draft/approval workflow	Products have status but no review queue	Add status workflow + reviewed_by
No partner auth roles	Clerk roles not defined for partners	Extend user metadata or create partner_members
No image upload API	No signed URL generation for product images	Add /api/shop/partners/upload endpoint
No partner dashboard	Only hotel/restaurant portals exist	Create /shop/partner/* routes
10. Technical Stack Reference
Layer	Technology
Framework	Next.js 14 (App Router)
Language	TypeScript
Database	Supabase (Postgres)
Auth	Clerk
State	Zustand
Styling	Tailwind CSS
UI Components	Radix (shadcn/ui)
Animations	Framer Motion
Icons	Lucide React
Toast	Sonner
Forms	React Hook Form + Zod
Summary
The Shop module is well-architected with clear separation of concerns:

API Layer: /api/shop/* routes using RESTful conventions
Business Logic: /lib/shop/queries.ts as single source of truth
Types: Shared TypeScript interfaces
State: Zustand stores with optimistic updates
Auth: Clerk with UUID resolution pattern
The Partner system should follow these patterns while adding:

Partner-specific tables and RLS policies
Product upload/management workflows
Partner dashboard UI mirroring hotel/restaurant pattern

---

### File 4: D:\react\TripC_Remade\Project\docs\shop\partners\01-partner-requirements.md (327 lines)

```markdown
# Shop Partner System - Requirements

> **Version**: 1.0  
> **Status**: Draft for Implementation

## Overview

This document defines requirements for the Shop Partner/Vendor system, enabling third-party sellers to onboard and upload products for end users to purchase.

---

## 1. Definitions

| Term | Definition |
|------|------------|
| **Partner** | A business entity (vendor/seller) that sells products through the TripC Shop |
| **Partner Owner** | Primary account holder who registered the partner business |
| **Partner Staff** | Additional team members with limited permissions |
| **End User** | Regular customer who browses and purchases products |
| **Admin** | TripC platform administrator who approves partners and resolves disputes |

---

## 2. User Roles & Permissions

### Role Hierarchy

Platform Admin (TripC Staff) | +-- Partner Owner (1 per partner) | | | +-- Partner Staff (N per partner) | +-- End User (shopper)


### Permission Matrix

| Action | Admin | Partner Owner | Partner Staff | End User |
|--------|:-----:|:-------------:|:-------------:|:--------:|
| **Partner Management** |
| Approve partner applications | Y | N | N | N |
| Suspend/ban partner | Y | N | N | N |
| Update partner profile | Y | Y | N | N |
| Update payout settings | N | Y | N | N |
| Invite/remove staff | N | Y | N | N |
| **Product Management** |
| Create product draft | N | Y | Y | N |
| Edit own products | N | Y | Y | N |
| Publish product | N | Y | N | N |
| Delete product | N | Y | N | N |
| Moderate any product | Y | N | N | N |
| **Order Management** |
| View partner orders | N | Y | Y | N |
| Update order status | N | Y | Y | N |
| Process returns | N | Y | N | N |
| View all orders | Y | N | N | N |
| **Analytics** |
| View partner analytics | N | Y | Read-only | N |
| View platform analytics | Y | N | N | N |

---

## 3. Partner Lifecycle

### 3.1 Onboarding Flow

+------------------+ +-------------------+ +------------------+ | User visits |--->| Fill application |--->| Submit for | | /shop/partner | | form + KYC docs | | review | +------------------+ +-------------------+ +------------------+ | +-------------------------------+---------------+ v v +------------------+ +-------------------+ | Admin reviews | | Auto-approve | | (manual queue) | | (if criteria met)| +---------+--------+ +----------+--------+ | | +---------------------+------------------------+ v +---------------------------+ | Status: APPROVED | | Email notification | | Access to dashboard | +---------------------------+


### 3.2 Partner Statuses

| Status | Description | Can Sell? |
|--------|-------------|:---------:|
| `pending` | Application submitted, awaiting review | N |
| `approved` | Verified and active | Y |
| `suspended` | Temporarily disabled (policy violation) | N |
| `banned` | Permanently disabled | N |

---

## 4. Product Workflow

### 4.1 Product Statuses

+----------+ Save +-----------+ Publish +------------+ | DRAFT |---------->| DRAFT |------------>| PUBLISHED | +----------+ +-----------+ +------------+ | | | Admin Flag | Partner Unpublish v v +-----------+ +----------------+ | FLAGGED | | ARCHIVED | +-----------+ +----------------+


| Status | Visible to Public? | Editable? |
|--------|:------------------:|:---------:|
| `draft` | N | Y |
| `published` | Y | Y (with publish) |
| `archived` | N | Y (can republish) |
| `flagged` | N | N (pending review) |

### 4.2 Required Fields for Publishing

| Field | Required | Validation |
|-------|:--------:|------------|
| Title | Y | 3-200 chars |
| Description | Y | 50-10000 chars |
| Category | Y | Valid category_id |
| Price | Y | At least 1 variant with price > 0 |
| Images | Y | At least 1 image |
| SKU | Y | Unique per variant |
| Inventory | Y | stock_on_hand >= 0 |

### 4.3 Slug Generation

```typescript
// Auto-generated from title, ensuring uniqueness
function generateSlug(title: string, partnerId: string): string {
  const base = slugify(title); // e.g., "travel-backpack-pro"
  const suffix = partnerId.slice(0, 6); // First 6 chars of partner UUID
  return `${base}-${suffix}`; // "travel-backpack-pro-a1b2c3"
}
5. Image Upload Requirements
5.1 Specifications
Constraint	Value
Max file size	5 MB
Allowed formats	JPEG, PNG, WebP
Min dimensions	500 x 500 px
Max dimensions	4000 x 4000 px
Max images per product	10
Storage path	shop-products/{partner_id}/products/{product_id}/
5.2 Upload Flow
1. Client -> POST /api/shop/partners/upload/request
   Body: { filename, contentType, productId }
   Response: { uploadUrl, key, expiresIn }

2. Client -> PUT {uploadUrl}
   Body: File binary
   Response: 200 OK

3. Client -> POST /api/shop/partners/upload/confirm
   Body: { key, productId, alt, isPrimary }
   Response: { imageId, url }
6. Anti-Abuse Measures
6.1 Rate Limits
Resource	Limit	Window
Partner applications	3	per IP per day
Product creations	50	per partner per hour
Image uploads	100	per partner per hour
API calls (general)	1000	per partner per hour
6.2 Content Moderation
Automated Checks:

Prohibited keywords in title/description
Duplicate product detection (same images/title)
Suspicious pricing (too low, too high)
Manual Review Triggers:

First 3 products from new partner
Products flagged by customers
High-value items (> 
500
)
<
/
l
i
>
<
/
u
l
>
<
h
3
>
6.3
P
r
o
h
i
b
i
t
e
d
C
a
t
e
g
o
r
i
e
s
<
/
h
3
>
<
u
l
>
<
l
i
>
W
e
a
p
o
n
s
a
n
d
a
m
m
u
n
i
t
i
o
n
<
/
l
i
>
<
l
i
>
I
l
l
e
g
a
l
s
u
b
s
t
a
n
c
e
s
<
/
l
i
>
<
l
i
>
C
o
u
n
t
e
r
f
e
i
t
g
o
o
d
s
<
/
l
i
>
<
l
i
>
A
d
u
l
t
c
o
n
t
e
n
t
<
/
l
i
>
<
l
i
>
H
a
z
a
r
d
o
u
s
m
a
t
e
r
i
a
l
s
<
/
l
i
>
<
/
u
l
>
<
h
r
/
>
<
h
2
>
7.
F
i
n
a
n
c
i
a
l
C
o
n
s
i
d
e
r
a
t
i
o
n
s
(
P
l
a
c
e
h
o
l
d
e
r
)
<
/
h
2
>
<
h
3
>
7.1
C
o
m
m
i
s
s
i
o
n
S
t
r
u
c
t
u
r
e
<
/
h
3
>
<
t
a
b
l
e
>
<
t
h
e
a
d
>
<
t
r
>
<
t
h
>
T
i
e
r
<
/
t
h
>
<
t
h
>
M
o
n
t
h
l
y
S
a
l
e
s
<
/
t
h
>
<
t
h
>
C
o
m
m
i
s
s
i
o
n
<
/
t
h
>
<
/
t
r
>
<
/
t
h
e
a
d
>
<
t
b
o
d
y
>
<
t
r
>
<
t
d
>
S
t
a
r
t
e
r
<
/
t
d
>
<
t
d
>
500)</li></ul><h3>6.3ProhibitedCategories</h3><ul><li>Weaponsandammunition</li><li>Illegalsubstances</li><li>Counterfeitgoods</li><li>Adultcontent</li><li>Hazardousmaterials</li></ul><hr/><h2>7.FinancialConsiderations(Placeholder)</h2><h3>7.1CommissionStructure</h3><table><thead><tr><th>Tier</th><th>MonthlySales</th><th>Commission</th></tr></thead><tbody><tr><td>Starter</td><td>0 - 
1
,
000
<
/
t
d
>
<
t
d
>
15
<
/
t
r
>
<
t
r
>
<
t
d
>
G
r
o
w
t
h
<
/
t
d
>
<
t
d
>
1,000</td><td>15</tr><tr><td>Growth</td><td>1,001 - 
10
,
000
<
/
t
d
>
<
t
d
>
12
<
/
t
r
>
<
t
r
>
<
t
d
>
P
r
o
<
/
t
d
>
<
t
d
>
10,000</td><td>12</tr><tr><td>Pro</td><td>10,001+ 10%
7.2 Payout Settings
Required for First Payout:

Bank account or PayPal verified
Tax ID/Business registration
Completed KYC
Payout Schedule:

Weekly payouts for orders completed 7+ days ago
Minimum payout: $50
Note: Financial features are out of scope for MVP. Only schema placeholders will be created.

8. Edge Cases
8.1 Partner Deletion
Scenario: Partner requests account deletion

Handling:

Mark partner as deleted (soft delete)
Unpublish all products (status -> archived)
Keep order history for compliance (7 years)
Anonymize PII after 30 days
Products not visible but referenced in past orders
8.2 Inventory Sync Issues
Scenario: Product sold out but order placed

Handling:

Order creation validates stock atomically
If race condition occurs:
Order marked pending_stock
Partner notified
Partner accepts or cancels within 24h
If no response -> auto-cancel + refund
8.3 Disputed Orders
Scenario: Customer claims item not received

Handling:

Customer opens dispute via support
Admin holds partner payout
Both parties provide evidence
Admin resolves within 14 days
Outcome: refund, partial refund, or release to partner
9. Non-Goals (Out of Scope for MVP)
Feature	Reason
Multi-currency pricing	Complexity; single currency (USD/VND) first
Real-time inventory sync	External integrations; manual for MVP
Automated payouts	Requires payment provider integration
Partner mobile app	Web-first approach
Product variants matrix	Simple 1-level options only
Affiliate tracking	Separate feature roadmap
Bulk import/export	Manual entry for MVP
10. Success Criteria
MVP Launch Criteria
 Partner can register and get approved
 Partner can create products with images
 Products appear in public shop listing
 Customers can purchase partner products
 Orders visible in partner dashboard
 Basic analytics (views, sales, revenue)
Quality Metrics
Metric	Target
Partner onboarding time	< 48 hours
Product publish time	< 5 minutes
Image upload success rate	> 99%
Dashboard page load	< 2 seconds
Summary
The Partner system transforms TripC Shop into a marketplace where vendors can:

Register with business details and verification
Get Approved through admin review
Create Products with variants, images, and inventory
Sell to end users through the existing shop experience
Manage Orders from a dedicated dashboard
Track Performance with basic analytics
All while following existing patterns from the Shop module and Partner portals.


---

That covers all requested information. To summarize:

- **Files 1 and 2** were found at the exact paths you specified and their full contents are above.
- **Files 3 and 4** had slightly different actual filenames: `00-context-summary.md` (not `00-context.md`) and `01-partner-requirements.md` (not `01-requirements.md`). Their full contents are included above.
- All 6 directory listings are provided with every file found in each location