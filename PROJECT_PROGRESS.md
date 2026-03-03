# TripC Remade - Shop Partner System: Project Progress Report

> **Generated**: February 8, 2026
> **Status**: MVP Code-Complete, Pending Deployment & Testing
> **Total Lines of Code**: ~8,500+
> **New Files Created**: 50
> **Existing Files Modified**: 5

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What Was Built](#2-what-was-built)
3. [Architecture Overview](#3-architecture-overview)
4. [Complete File Inventory](#4-complete-file-inventory)
5. [Database Schema](#5-database-schema)
6. [API Routes](#6-api-routes)
7. [Frontend Pages & Components](#7-frontend-pages--components)
8. [Zustand Stores](#8-zustand-stores)
9. [Key User Flows](#9-key-user-flows)
10. [Bugs Fixed](#10-bugs-fixed)
11. [Design Decisions](#11-design-decisions)
12. [What Remains](#12-what-remains)
13. [Continuation Prompt](#13-continuation-prompt)

---

## 1. Executive Summary

We built a **complete Shop Partner (vendor/seller) system** for the TripC Marketplace from scratch. This allows users to apply as sellers, manage their own products (with variants and images), track orders, view analytics, and manage team members — all through a dedicated partner portal at `/shop/partner/`.

The system is **MVP code-complete**: all TypeScript types, business logic, API routes, Zustand stores, frontend pages, and components are written and compile without errors. What remains is deployment (running the database migration, creating a storage bucket) and end-to-end testing.

### Key Stats

| Metric | Value |
|--------|-------|
| New files created | 50 |
| Existing files modified | 5 |
| Total lines of code | ~8,500+ |
| API route files | 22 (32 HTTP handlers) |
| Frontend components | 14 |
| Frontend pages | 11 |
| Zustand stores | 3 |
| Business logic functions | 26 exported functions |
| TypeScript errors | 0 |

---

## 2. What Was Built

### Database Layer
- **Migration file** (`supabase/migrations/20260208_shop_partners.sql`, 292 lines)
  - 3 new tables: `shop_partners`, `shop_partner_members`, `shop_partner_audit_logs`
  - ALTERs to `shop_products` (added `partner_id`, `reviewed_by`, `reviewed_at`, `review_notes`, status includes `'flagged'`)
  - ALTERs to `order_items` (added `partner_id`)
  - RLS policies for all new tables
  - 3 triggers (product count maintenance, order_items partner sync, updated_at auto-set)

### Business Logic
- **`lib/shop/partner-queries.ts`** (1,310 lines) — 26 exported functions + `PartnerError` class
  - Partner profile: apply, get by slug, update profile
  - Product management: CRUD, publish, archive, delete (with order check)
  - Variant management: create, update, delete
  - Image management: add, delete, reorder
  - Order management: list (with partner subtotals), detail
  - Analytics: dashboard stats with period comparison, top products
  - Team management: list, invite, update permissions, remove
  - Admin operations: list all partners, review (approve/reject/suspend/ban)

### TypeScript Types
- **`lib/shop/types.ts`** (367 lines) — 13 type exports
  - Enums: `PartnerStatus`, `PartnerBusinessType`, `PartnerMemberRole`, `PartnerMemberStatus`
  - Interfaces: `ShopPartner`, `PartnerMember`, `PartnerWithMembership`, `PartnerProduct`, `PartnerOrder`, `PartnerOrderItem`, `DashboardStats`, `PartnerApplicationData`, `PartnerMemberPermissions`

### API Layer
- **22 route files** under `app/api/shop/partners/` — 32 HTTP method handlers
  - Partner profile, product CRUD, variants, images (signed URL upload), orders, analytics, team, admin review

### State Management
- **3 Zustand stores**:
  - `usePartnerStore.ts` (157 lines) — partner profile, dashboard stats, apply, update with optimistic rollback
  - `usePartnerProductStore.ts` (478 lines) — full product CRUD + variants + images (3-step signed URL upload)
  - `usePartnerOrderStore.ts` (150 lines) — orders list, detail, filters, status updates

### Frontend
- **14 components** under `components/shop/partner/` (~3,750 lines)
  - Layout: `PartnerLayout`, `PartnerSidebar`
  - Shared: `PartnerGuard`, `StatCard`, `EmptyState`, `LoadingSkeleton`
  - Dashboard: `DashboardView` (553 lines — metrics, charts, recent orders, top products)
  - Onboarding: `OnboardingForm` (537 lines — 4-step form with certificate upload)
  - Products: `ProductList` (294 lines), `ProductForm` (528 lines — variants + images inline)
  - Orders: `OrderList` (245 lines), `OrderDetail` (342 lines — status transitions)
  - Settings: `SettingsView` (273 lines), `TeamManagement` (415 lines)
- **11 pages** under `app/shop/partner/`

### Integration with Existing Shop
- Updated `components/shop/brand/Header.tsx` — cover_url banner, description display
- Updated `app/partner/page.tsx` — added Shop Partner Portal card (3-column grid)
- Updated `lib/shop/queries.ts` — `getBrands()`/`getBrandBySlug()` include new brand fields
- Updated `lib/shop/index.ts` — barrel re-exports for all partner code

---

## 3. Architecture Overview

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

### Data Flow

```
Frontend (Zustand store)
    | fetch()
    v
API Route (app/api/shop/partners/...)
    | auth() + getDbUserId()
    v
Business Logic (lib/shop/partner-queries.ts)
    | createServiceSupabaseClient()
    v
Supabase (Postgres + Storage)
```

### Auth Flow

```
User signs in (Clerk) -> clerkId
    -> getDbUserId(clerkId) -> userId (UUID from users table)
    -> getPartnerMembership(userId) -> looks up shop_partner_members
    -> Returns PartnerWithMembership (partner data + role + permissions)
```

### Two-Entity Design

| Entity | Purpose | Table |
|--------|---------|-------|
| **Shop Partner** | Business account (status, business details, commission, analytics) | `shop_partners` |
| **Brand** | Public storefront (name, logo, slug, shown to customers) | `brands` |

Linked via `shop_partners.brand_id` FK. When a partner applies, both are auto-created. Partner is auto-approved and brand is set to active immediately.

---

## 4. Complete File Inventory

### New Files (50 total)

#### Documentation (6 files)
```
docs/shop/SHOP_PARTNER_SYSTEM.md                         (678 lines — main technical doc)
docs/shop/partners/00-context-summary.md                  (existing shop architecture context)
docs/shop/partners/01-partner-requirements.md             (functional requirements)
docs/shop/partners/02-database-schema.sql.md              (database schema design)
docs/shop/partners/03-api-contract.md                     (API endpoint specifications)
docs/shop/partners/04-frontend-plan.md                    (frontend architecture plan)
docs/shop/partners/05-implementation-checklist.md         (implementation status tracker)
```

#### Database (1 file)
```
supabase/migrations/20260208_shop_partners.sql            (292 lines)
```

#### Business Logic (1 file)
```
lib/shop/partner-queries.ts                               (1,310 lines, 26 functions)
```

#### Zustand Stores (3 files)
```
store/usePartnerStore.ts                                  (157 lines)
store/usePartnerProductStore.ts                           (478 lines)
store/usePartnerOrderStore.ts                             (150 lines)
```

#### API Routes (22 files)
```
app/api/shop/partners/apply/route.ts                      POST
app/api/shop/partners/me/route.ts                         GET, PATCH
app/api/shop/partners/[slug]/route.ts                     GET
app/api/shop/partners/products/route.ts                   GET, POST
app/api/shop/partners/products/[id]/route.ts              GET, PATCH, DELETE
app/api/shop/partners/products/[id]/publish/route.ts      POST
app/api/shop/partners/products/[id]/archive/route.ts      POST
app/api/shop/partners/products/[id]/variants/route.ts     POST
app/api/shop/partners/products/[id]/variants/[variantId]/route.ts  PATCH, DELETE
app/api/shop/partners/products/[id]/images/[imageId]/route.ts      DELETE
app/api/shop/partners/products/[id]/images/reorder/route.ts        POST
app/api/shop/partners/upload/request/route.ts             POST (signed URL)
app/api/shop/partners/upload/confirm/route.ts             POST (DB record)
app/api/shop/partners/orders/route.ts                     GET
app/api/shop/partners/orders/[id]/route.ts                GET
app/api/shop/partners/orders/[id]/status/route.ts         PATCH
app/api/shop/partners/analytics/dashboard/route.ts        GET
app/api/shop/partners/analytics/top-products/route.ts     GET
app/api/shop/partners/team/route.ts                       GET
app/api/shop/partners/team/invite/route.ts                POST
app/api/shop/partners/team/[memberId]/route.ts            PATCH, DELETE
app/api/shop/partners/admin/review/route.ts               POST
```

#### Frontend Pages (11 files)
```
app/shop/partner/layout.tsx                               (18 lines)
app/shop/partner/page.tsx                                 (100 lines — landing/gate)
app/shop/partner/onboarding/page.tsx                      (8 lines)
app/shop/partner/dashboard/page.tsx                       (16 lines)
app/shop/partner/products/page.tsx                        (16 lines)
app/shop/partner/products/new/page.tsx                    (16 lines)
app/shop/partner/products/[id]/page.tsx                   (19 lines)
app/shop/partner/orders/page.tsx                          (16 lines)
app/shop/partner/orders/[id]/page.tsx                     (19 lines)
app/shop/partner/settings/page.tsx                        (16 lines)
app/shop/partner/settings/team/page.tsx                   (16 lines)
```

#### Frontend Components (14 files)
```
components/shop/partner/layout/PartnerLayout.tsx          (23 lines)
components/shop/partner/layout/PartnerSidebar.tsx         (250 lines)
components/shop/partner/shared/PartnerGuard.tsx           (192 lines)
components/shop/partner/shared/StatCard.tsx               (61 lines)
components/shop/partner/shared/EmptyState.tsx             (39 lines)
components/shop/partner/shared/LoadingSkeleton.tsx        (46 lines)
components/shop/partner/dashboard/DashboardView.tsx       (553 lines)
components/shop/partner/onboarding/OnboardingForm.tsx     (537 lines)
components/shop/partner/products/ProductList.tsx          (294 lines)
components/shop/partner/products/ProductForm.tsx          (528 lines)
components/shop/partner/orders/OrderList.tsx              (245 lines)
components/shop/partner/orders/OrderDetail.tsx            (342 lines)
components/shop/partner/settings/SettingsView.tsx         (273 lines)
components/shop/partner/settings/TeamManagement.tsx       (415 lines)
```

### Modified Existing Files (5 files)
```
lib/shop/types.ts                    — Added all partner-related types
lib/shop/index.ts                    — Added barrel re-exports for partner code
lib/shop/queries.ts                  — Updated getBrands/getBrandBySlug for new brand fields
components/shop/brand/Header.tsx     — Added cover_url banner and description display
app/partner/page.tsx                 — Added Shop Partner Portal card (3-column grid)
```

---

## 5. Database Schema

### New Tables

#### `shop_partners` (35 columns)
Partner business profiles with status tracking, business details, address, commission, analytics counters, and payout placeholders.

Key columns: `id`, `slug`, `business_name`, `display_name`, `status` (pending/approved/suspended/banned), `brand_id` (FK to `brands`), `product_count` (trigger-maintained), `commission_rate` (default 15%).

#### `shop_partner_members` (10 columns)
User-to-partner membership with roles and permissions.

Key columns: `partner_id`, `user_id`, `role` (owner/staff), `permissions` (jsonb: products, orders, analytics booleans), `status` (pending/active/removed). Unique constraint on `(partner_id, user_id)`.

#### `shop_partner_audit_logs` (11 columns)
Activity audit trail for compliance and debugging.

Key columns: `partner_id`, `actor_id`, `action`, `entity_type`, `entity_id`, `old_values`/`new_values` (jsonb).

### Table Modifications
- **`shop_products`**: Added `partner_id` (FK), `reviewed_by`, `reviewed_at`, `review_notes`. Status CHECK updated to include `'flagged'`.
- **`order_items`**: Added `partner_id` (FK) with index.

### Triggers
| Trigger | Purpose |
|---------|---------|
| `trg_update_partner_product_count` | Maintains `shop_partners.product_count` when products transition to/from `active` |
| `trg_order_items_set_partner` | Auto-populates `order_items.partner_id` from the product's `partner_id` on INSERT |
| `trg_shop_partners_updated_at` | Auto-sets `updated_at = now()` on UPDATE |

### RLS Policies
| Table | Policy | Rule |
|-------|--------|------|
| `shop_partners` | `shop_partners_public_read` | SELECT where `status = 'approved' AND deleted_at IS NULL` |
| `shop_partners` | `shop_partners_auth_insert` | INSERT: any authenticated user |
| `shop_partner_members` | `shop_partner_members_self_read` | SELECT: all (service role bypasses) |
| `shop_partner_audit_logs` | `shop_partner_audit_logs_read` | SELECT: all reads |

---

## 6. API Routes

### Response Format
All routes use consistent helpers from `lib/shop/utils.ts`:
```typescript
successResponse(data, message?, status?)       // { success: true, data }
paginatedResponse(data, total, page, limit)    // { success: true, data, pagination }
errorResponse(code, message, status, details?) // { success: false, error: { code, message, details } }
```

### Endpoints Summary

| Category | Route | Methods | Description |
|----------|-------|---------|-------------|
| Profile | `apply` | POST | Submit partner application |
| Profile | `me` | GET, PATCH | Get/update own profile |
| Profile | `[slug]` | GET | Public partner profile |
| Products | `products` | GET, POST | List/create products |
| Products | `products/[id]` | GET, PATCH, DELETE | Single product CRUD |
| Products | `products/[id]/publish` | POST | Publish (with validation) |
| Products | `products/[id]/archive` | POST | Archive product |
| Variants | `products/[id]/variants` | POST | Create variant |
| Variants | `products/[id]/variants/[variantId]` | PATCH, DELETE | Update/delete variant |
| Images | `products/[id]/images/[imageId]` | DELETE | Delete image |
| Images | `products/[id]/images/reorder` | POST | Reorder images |
| Upload | `upload/request` | POST | Get signed URL |
| Upload | `upload/confirm` | POST | Confirm upload + DB record |
| Orders | `orders` | GET | List partner orders |
| Orders | `orders/[id]` | GET | Order detail |
| Orders | `orders/[id]/status` | PATCH | Update order status |
| Analytics | `analytics/dashboard` | GET | Dashboard statistics |
| Analytics | `analytics/top-products` | GET | Top products by sales |
| Team | `team` | GET | List team members |
| Team | `team/invite` | POST | Invite team member |
| Team | `team/[memberId]` | PATCH, DELETE | Update/remove member |
| Admin | `admin/review` | POST | Approve/reject/suspend/ban |

---

## 7. Frontend Pages & Components

### Pages (`app/shop/partner/`)

| Route | Description |
|-------|-------------|
| `/shop/partner` | Landing/gate. Redirects approved -> dashboard. Shows status UI for pending/suspended/banned. CTA for non-partners. |
| `/shop/partner/onboarding` | 4-step onboarding form |
| `/shop/partner/dashboard` | Dashboard with metrics, charts, recent orders, quick actions |
| `/shop/partner/products` | Product list with search, filters, pagination |
| `/shop/partner/products/new` | Create new product |
| `/shop/partner/products/[id]` | Edit product (variants, images inline) |
| `/shop/partner/orders` | Order list with status/date filters |
| `/shop/partner/orders/[id]` | Order detail with status transitions |
| `/shop/partner/settings` | Profile settings (owner only) |
| `/shop/partner/settings/team` | Team management (owner only) |

### Components (`components/shop/partner/`)

| Component | Lines | Description |
|-----------|-------|-------------|
| `PartnerLayout` | 23 | Shell with sidebar + content area |
| `PartnerSidebar` | 250 | Collapsible sidebar, permission-based nav, "Back to Shop" link |
| `PartnerGuard` | 192 | Auth/status/role guard with loading/error states |
| `StatCard` | 61 | Animated stat card with change indicator |
| `EmptyState` | 39 | Empty state placeholder with optional action |
| `LoadingSkeleton` | 46 | Configurable skeleton loader |
| `DashboardView` | 553 | Full dashboard: metrics, store card, account details, orders, top products |
| `OnboardingForm` | 537 | 4-step form: business info -> contact -> certificates -> review |
| `ProductList` | 294 | Paginated list with search, status filter, sort, per-row actions |
| `ProductForm` | 528 | Create/edit with inline variant editor and image gallery |
| `OrderList` | 245 | Paginated list with status and date-range filters |
| `OrderDetail` | 342 | Status transitions, line items, customer info, financials |
| `SettingsView` | 273 | Editable profile fields + read-only business info |
| `TeamManagement` | 415 | Invite form, member list, permission toggles, remove actions |

---

## 8. Zustand Stores

### `usePartnerStore` (157 lines)
- **State**: `partner`, `dashboardStats`, loading/error states
- **Actions**: `fetchPartner()`, `fetchDashboardStats(period)`, `applyAsPartner(data)`, `updateProfile(data)` (optimistic), `reset()`

### `usePartnerProductStore` (478 lines)
- **State**: `products[]`, `total`, `currentProduct`, `filters`, pagination, loading states
- **Actions**: Full CRUD (`fetchProducts`, `createProduct`, `updateProduct`, `deleteProduct`), publish/archive, variants (`createVariant`, `updateVariant`, `deleteVariant`), images (`uploadImage` with 3-step signed URL flow, `deleteImage`, `reorderImages`), filters/pagination

### `usePartnerOrderStore` (150 lines)
- **State**: `orders[]`, `total`, `currentOrder`, `filters`
- **Actions**: `fetchOrders(params)`, `setFilters(filters)`, `fetchOrder(id)`, `updateOrderStatus(orderId, status)`

---

## 9. Key User Flows

### Partner Application Flow
```
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
```

### Product Creation Flow
```
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
```

### Order Management Flow
```
1. Customer places order containing partner's products
2. order_items trigger auto-sets partner_id from product
3. Partner sees order in /shop/partner/orders
4. Status transitions: pending -> processing -> shipped -> delivered
5. Each transition: PATCH /api/shop/partners/orders/[id]/status
6. Audit log entry created for each status change
```

### Auth & Access Control
```
1. Every API route: auth() -> clerkId -> getDbUserId() -> userId
2. requirePartnerAccess(userId, requiredRole?) checks:
   - User has membership -> else NOT_PARTNER (403)
   - Partner status is approved -> else PARTNER_PENDING/SUSPENDED/BANNED
   - User role matches requiredRole -> else INSUFFICIENT_ROLE (403)
3. Staff permissions checked per-action (products, orders, analytics)
4. Frontend: PartnerGuard component mirrors these checks
```

---

## 10. Bugs Fixed

| # | Bug | Root Cause | Fix |
|---|-----|-----------|-----|
| 1 | Blank page after partner application | `/shop/partner/page.tsx` used `<PartnerGuard requireApproved={false}>` which skipped pending/suspended/banned checks and rendered empty `<div />` | Added inline status-specific UI for pending/suspended/banned states inside the guard's children |
| 2 | Missing `Settings` import in DashboardView | `Settings` icon from lucide-react was used but not imported | Added `Settings` to the lucide-react import statement |
| 3 | `order_id` not in select query | `prevItems` select in `partner-queries.ts` was missing `order_id` but code accessed `i.order_id` | Added `order_id` to the select clause |

---

## 11. Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Two entities (partner + brand)** | Separation of concerns: partner = business/admin data, brand = public storefront. Allows a brand to exist independently or be linked to a partner. |
| **Auto-approval on apply** | Enables immediate testing. Future: AI certificate verification will gate approval. |
| **Brand auto-activated** | When partner is auto-approved, brand is set to `is_active: true` so the storefront is live immediately. |
| **Certificate upload as placeholder** | Files are selected locally with previews in the onboarding form, but actual upload to Supabase Storage is not implemented yet. User plans to add AI verification logic later. |
| **Service-role Supabase client** | All business logic uses the service-role client which bypasses RLS. RLS policies serve as baseline protection for any direct client access. |
| **Separate portal namespace** | Partner portal at `app/shop/partner/` is separate from existing hotel/restaurant portals at `app/partner/`. Different business domains, different UIs. |
| **Dynamic pages use `useParams()`** | Consistent with existing project pattern (e.g., `app/shop/product/[id]/page.tsx`). NOT `use(params)`. |
| **No shadcn Select/Tabs/Card** | Project uses custom `Card.tsx` and native `<select>`. Available shadcn components: button, input, label, dialog, badge, checkbox, skeleton, sheet, separator, popover, progress, scroll-area. |

---

## 12. What Remains

### Required for Deployment

| Task | Priority | Notes |
|------|----------|-------|
| Run migration: `npx supabase db push` | Critical | Creates 3 new tables, alters 2 existing tables, adds triggers + RLS |
| Create `shop-products` storage bucket in Supabase | Critical | Set to public, needed for image uploads |
| Add storage policies for partner uploads | Critical | Allow authenticated partners to upload to their path |
| Verify tables and triggers in Supabase Dashboard | Critical | Confirm migration ran correctly |

### Recommended Before Testing

| Task | Priority | Notes |
|------|----------|-------|
| Add `/shop/partner(.*)` to Clerk middleware protected routes | High | Ensures auth is enforced at middleware level |
| Add admin role check to `POST /api/shop/partners/admin/review` | High | Currently any authenticated user can approve/reject partners |
| Verify product visibility in public shop queries | High | Confirm `lib/shop/queries.ts` product listings include partner products with `status = 'active'` |
| End-to-end test: apply -> create product -> customer sees it | High | The user's primary testing goal |

### Post-MVP Enhancements

| Feature | Description |
|---------|-------------|
| Actual certificate upload | Upload files to Supabase Storage (currently local-only) |
| AI certificate verification | Automated verification of business certificates |
| Bulk product import/export | CSV/Excel import for large catalogs |
| Automated payouts | Integration with payment providers for partner payouts |
| Advanced analytics | Detailed reporting, charts, export |
| Multi-currency support | Price variants in different currencies |
| Inventory sync | Integration with external inventory systems |
| Content moderation | Flagging system for inappropriate products |

---

## 13. Continuation Prompt

Below is a detailed prompt for continuing this work in a new session. Copy everything between the `---` markers.

---

**PROJECT**: TripC Remade -- Next.js 14 App Router travel platform with a Shop/Marketplace module.
**ROOT**: `D:\react\TripC_Remade\Project\`
**GOAL**: Built a complete Shop Partner (vendor/seller) system end-to-end. Now testing the full flow and fixing issues.

### TECH STACK & PATTERNS

- **Framework**: Next.js 14 App Router, TypeScript
- **DB**: Supabase (Postgres), service-role client via `createServiceSupabaseClient()` from `lib/supabase-server`
- **Auth**: Clerk (`auth()`, `useUser()`, `getDbUserId(clerkId)`)
- **State**: Zustand stores (`create()` from `zustand`, `sonner` toasts for feedback)
- **UI**: Tailwind CSS, shadcn/ui (new-york style), Framer Motion, Lucide React icons, Sonner toasts
- **Theme**: `primary` = `#FF5E1F` (brand orange), `primary-hover` = `#E54810`
- **Response helpers** in `lib/shop/utils.ts`: `successResponse()`, `paginatedResponse()`, `errorResponse()`
- **`cn()` utility** in `lib/utils.ts` (clsx + twMerge)
- Available shadcn components: `button`, `input`, `label`, `dialog`, `badge`, `checkbox`, `skeleton`, `sheet`, `separator`, `popover`, `progress`, `scroll-area` (NO standard Select, Tabs, or Card -- project uses custom Card.tsx and native `<select>`)
- Dynamic `[id]` pages use `useParams()` hook pattern (see `app/shop/product/[id]/page.tsx` for reference), NOT `use(params)`

### ARCHITECTURE: Two Separate Entities

- **`shop_partners`** = business entity (partner account, status, business details, commission)
- **`brands`** = public storefront (name, logo, slug, shown to customers)
- Linked via `shop_partners.brand_id` FK. When partner applies -> auto-creates brand (active). Partner auto-approved on apply.
- Partner portal lives at `app/shop/partner/` (under shop namespace)
- Existing hotel/restaurant partner portals at `app/partner/` are separate systems

### DOCUMENTATION

Full technical doc at **`docs/shop/SHOP_PARTNER_SYSTEM.md`** (678 lines) covering all 50 new files, 5 modified files, database schema, types, API routes, stores, components, pages, key flows, and remaining work. **Read this file first** for complete context.

Additional planning docs in `docs/shop/partners/`:
- `00-context-summary.md`, `01-partner-requirements.md`, `02-database-schema.sql.md`, `03-api-contract.md`, `04-frontend-plan.md`, `05-implementation-checklist.md`

### WHAT IS COMPLETE

- Database migration SQL (not yet deployed)
- All TypeScript types (0 errors)
- Business logic: 26 functions in `partner-queries.ts` (1,310 lines)
- 22 API route files (32 HTTP handlers)
- 3 Zustand stores
- 14 frontend components (~3,750 lines)
- 11 frontend pages
- Integration with existing shop (brand header, partner page card, brand queries)
- 3 bug fixes (blank page, missing import, missing select field)

### WHAT NEEDS TO BE DONE

1. **Deploy**: Run migration, create storage bucket, add storage policies
2. **Test end-to-end**: Partner applies -> creates product -> customer sees it
3. **Potential issues**: Storage bucket may not exist, migration may not have run, product visibility in public queries needs verification

### NON-NEGOTIABLE RULES

- Reuse existing code; do NOT create duplicate flows
- Preserve current Shop UX (cart, checkout, product listing)
- Keep API response shapes consistent (`successResponse`, `paginatedResponse`, `errorResponse`)
- No mock data -- use real Supabase DB via API routes
- Follow existing patterns: Clerk auth, Zustand stores, Tailwind + shadcn/ui + Framer Motion + Lucide icons + Sonner toasts
- All pages are `"use client"` components
- Partner portal pages use `<PartnerGuard>` wrapper
- Dynamic `[id]` pages use `useParams<{ id: string }>()` hook

---
