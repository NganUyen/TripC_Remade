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
- [x] Run `npx tsc --noEmit` — 0 errors in shop/partner code
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
