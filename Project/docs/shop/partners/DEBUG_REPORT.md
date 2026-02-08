# Shop Partner System - Debug Report

> **Analysis Date**: 2026-02-08  
> **Status**: ✅ Most critical issues FIXED  
> **Analyzed By**: Antigravity AI
> **Last Updated**: 2026-02-08 18:42

---

## 🔴 Critical Bugs (Must Fix)

### BUG-001: Invalid UUID Validation for category_id ✅ FIXED
**Severity**: 🔴 Critical → ✅ Fixed  
**Location**: 
- `components/shop/partner/products/ProductForm.tsx` (line 395-402)
- `lib/shop/partner-queries.ts` (line 387-428)
- `app/api/shop/partners/products/route.ts`

**Fix Applied**: 
- Added UUID regex validation in `app/api/shop/partners/products/route.ts`
- Trims whitespace from category_id before validation
- Returns user-friendly error message if invalid UUID format

---

### BUG-002: Image Upload API Parameter Mismatch ✅ FIXED
**Severity**: 🔴 Critical → ✅ Fixed  
**Location**: 
- `store/usePartnerProductStore.ts` (line 371-380)
- `app/api/shop/partners/upload/request/route.ts` (line 37-41)

**Fix Applied**: 
- Added `filename: file.name` to the request body in `usePartnerProductStore.ts`

---

### BUG-003: Storage Bucket Name Mismatch ✅ FIXED
**Severity**: 🔴 Critical → ✅ Fixed  
**Location**:
- `app/api/shop/partners/upload/request/route.ts` (line 59)
- `app/api/shop/partners/upload/confirm/route.ts` (line 43)

**Fix Applied**: 
- Changed bucket name from `shop-images` to `shop-products` in both files to match documentation

---

## 🟠 High Priority Bugs

### BUG-004: Missing Category Picker UI ✅ FIXED
**Severity**: 🟠 High → ✅ Fixed  
**Location**: `components/shop/partner/products/ProductForm.tsx`

**Fix Applied**: 
- Added category fetching from `/api/shop/categories` on component mount
- Replaced text input with `<select>` dropdown showing parent categories with indented children
- Shows "Select a category (optional)" placeholder

---

### BUG-005: Images Can Only Be Added AFTER Product Creation
**Severity**: 🟠 High  
**Location**: `components/shop/partner/products/ProductForm.tsx` (line 324-375)

**Problem**: 
```tsx
{/* Images (only show after creation) */}
{isEditing && (
    <div className="bg-white ...">
```

**Impact**: 
- Counter-intuitive UX - users expect to add images during creation
- Publishing requirements need images but user can't add them in creation flow
- Forces extra save/redirect step

**Fix Required**:
- Allow image staging during creation (store locally)
- Upload images after product is created
- Or: Create product first (draft), then enable image upload immediately

---

### BUG-006: Missing Product Fields from Database Schema
**Severity**: 🟠 High  
**Location**: `components/shop/partner/products/ProductForm.tsx`

**Problem**: ProductForm only supports:
- title ✅
- description ✅
- category_id ✅
- product_type ✅

**Missing from database `shop_products` that should be editable**:
- `seo_title` - SEO optimization
- `seo_description` - SEO optimization  
- `tags` - Searchability
- `is_featured` - Promotion
- `weight`, `dimensions` - Shipping

**Impact**: Partners can't fully customize their products for SEO and shipping

**Fix Required**: Add form fields for these columns

---

## 🟡 Medium Priority Bugs

### BUG-007: Redundant Database Query in getPartnerProducts ✅ FIXED
**Severity**: 🟡 Medium → ✅ Fixed  
**Location**: `lib/shop/partner-queries.ts` (line 305-316)

**Fix Applied**: 
- Removed redundant first query that was immediately overwritten
- Now uses single clean query without incorrect `.is('reviewed_at', null)` filter

---

### BUG-008: No Validation on Variant Price ✅ FIXED
**Severity**: 🟡 Medium → ✅ Fixed  
**Location**: `lib/shop/partner-queries.ts` - `createVariant()`

**Fix Applied**: 
- Added validation that price must be > 0
- Added validation that compare_at_price must be > price (if provided)

---

### BUG-009: Missing Error Handling for Product Already Has Orders
**Severity**: 🟡 Medium  
**Location**: `lib/shop/partner-queries.ts` - `deletePartnerProduct()`

**Problem**: The check exists but error code `HAS_ORDERS` is not user-friendly

```typescript
if (count && count > 0) {
    throw new PartnerError('HAS_ORDERS', 'Cannot delete product with existing orders', 409);
}
```

**Fix Required**: Frontend should display a proper explanation with order count

---

### BUG-010: Upload Signed URL Uses Wrong Response Key ✅ FIXED
**Severity**: 🟡 Medium → ✅ Fixed  
**Location**: `store/usePartnerProductStore.ts` (line 388, 391)

**Fix Applied**: 
- Changed `uploadData.signed_url` to `uploadData.upload_url` to match API response

---

## 🔵 Performance Issues

### PERF-001: Multiple DB Calls Per Product Fetch
**Location**: `usePartnerProductStore.ts`

**Problem**: After every variant/image operation, the entire product is re-fetched:
```typescript
await get().fetchProduct(productId);  // Full refetch
```

**Impact**: 3 DB queries per small update (product + variants + images)

**Optimization**: Return updated data from API instead of requiring refetch

---

### PERF-002: No Pagination Limit Enforcement
**Location**: `app/api/shop/partners/products/route.ts`

**Problem**:
```typescript
const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
```

**Impact**: User can request up to 100 items per page which could be slow

**Recommendation**: Consider lower max (50) for better performance

---

## 📋 Implementation Checklist for Fixes

| Bug | Priority | Estimated Effort | Status |
|-----|----------|------------------|--------|
| BUG-001 | 🔴 Critical | 2 hours | ✅ Fixed |
| BUG-002 | 🔴 Critical | 15 mins | ✅ Fixed |
| BUG-003 | 🔴 Critical | 30 mins | ✅ Fixed |
| BUG-004 | 🟠 High | 2 hours | ✅ Fixed |
| BUG-005 | 🟠 High | 3 hours | ⏳ Pending |
| BUG-006 | 🟠 High | 2 hours | ⏳ Pending |
| BUG-007 | 🟡 Medium | 5 mins | ✅ Fixed |
| BUG-008 | 🟡 Medium | 30 mins | ✅ Fixed |
| BUG-009 | 🟡 Medium | 30 mins | ⏳ Pending |
| BUG-010 | 🟡 Medium | 10 mins | ✅ Fixed |

---

## Quick Wins ✅ COMPLETED

1. ✅ **BUG-002**: Add `filename: file.name` to upload request body
2. ✅ **BUG-007**: Delete redundant query lines 305-310
3. ✅ **BUG-010**: Fix `upload_url` → `signed_url` mismatch

---

## Report Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| 🔴 Critical | 3 | 3 ✅ |
| 🟠 High | 3 | 1 ✅ |
| 🟡 Medium | 4 | 3 ✅ |
| 🔵 Performance | 2 | 0 |
| **Total** | **12** | **7** |

**✅ All critical bugs have been fixed!**

The Partner Product system is now functional:
- Product creation validates UUID format for category_id
- Image uploads have correct parameters
- Storage bucket is configured correctly
- Category picker shows actual categories instead of raw UUID input
- Variant price validation prevents invalid data

**Remaining work (non-critical):**
- BUG-005: Image staging during creation
- BUG-006: Additional SEO fields
- BUG-009: Improved error messages
- Performance optimizations
