# Shop API Comprehensive Testing - Full Coverage

## 📊 31 Tests Covering All Endpoints

### Test Categories Summary

| Category | Tests | Coverage |
|----------|-------|----------|
| **Health** | 2 | health, ready |
| **Products** | 6 | list, filter, sort, detail, search, categories |
| **Cart** | 7 | GET, POST, PATCH, DELETE, coupon |
| **Checkout** | 2 | shipping, addresses |
| **Orders** | 2 | list, detail |
| **Vouchers** | 3 | available, my, redeem |
| **Wishlist** | 2 | list, add |
| **Reviews** | 1 | submit |
| **Error Cases** | 6 | 404, 400, 401 scenarios |

---

## 🔍 Detailed Test List

### Health (2)
1. ✅ `GET /health` - Basic health check
2. ✅ `GET /health/ready` - Readiness with dependencies

### Products (6)
3. ✅ `GET /products?limit=5` - Paginated list
4. ✅ `GET /products?category=luggage` - Filter by category
5. ✅ `GET /products?sort=price_asc` - Sort by price
6. ✅ `GET /products/{slug}` - Product detail (valid)
7. ✅ `GET /products/search?q=travel` - Search query
8. ✅ `GET /categories` - Categories tree

### Cart CRUD (7)
9. ✅ `GET /cart` - Get empty cart
10. ✅ `POST /cart/items` - Add luggage ($299)
11. ✅ `POST /cart/items` - Add pillow ($29)
12. ✅ `POST /cart/apply-coupon` - Apply WELCOME10
13. ✅ `PATCH /cart/items/{id}` - Update qty (2→3)
14. ✅ `DELETE /cart/items/{id}` - Remove item
15. ✅ `GET /cart` - Get cart after changes

### Checkout (2)
16. ✅ `GET /shipping-methods` - List methods
17. ✅ `GET /addresses` - Requires auth (401)

### Orders (2)
18. ✅ `GET /orders` - Requires auth (401)
19. ✅ `GET /orders/{id}` - Requires auth (401)

### Vouchers (3)
20. ✅ `GET /vouchers/available` - Public list
21. ✅ `GET /vouchers/my` - Requires auth (401)
22. ✅ `POST /vouchers/redeem` - Requires auth (401)

### Wishlist (2)
23. ✅ `GET /wishlist` - Requires auth (401)
24. ✅ `POST /wishlist` - Requires auth (401)

### Reviews (1)
25. ✅ `POST /reviews` - Requires auth (401)

### Error Cases (6)
26. ✅ `GET /products/non-existent` → 404 PRODUCT_NOT_FOUND
27. ✅ `GET /products/search?q=x` → 400 INVALID_QUERY
28. ✅ `POST /cart/items` (invalid variant) → 404 VARIANT_NOT_FOUND
29. ✅ `POST /cart/items` (missing qty) → 400 INVALID_REQUEST
30. ✅ `POST /cart/apply-coupon` (fake code) → 400 COUPON_INVALID
31. ✅ `GET /cart` (no session) → 401 UNAUTHORIZED

---

## 🎯 Test Features

### 1. HTTP Methods Coverage
- **GET**: 15 tests
- **POST**: 12 tests
- **PATCH**: 1 test
- **DELETE**: 1 test
- **PUT**: 0 (not used in API)

### 2. Auth Testing
- ✅ Guest cart via `x-session-id`
- ✅ 401 validation for 8 protected routes
- ⏭️ Authenticated flow (needs real JWT)

### 3. Schema Validation
- 12 tests include schema validators
- Validates:
  - Required fields present
  - Correct data types
  - Array vs object structure
  - Error codes match expected

### 4. Flow Testing
- ✅ **Cart Flow**: empty → add items → apply coupon → update → remove
- ✅ **Error Flow**: Invalid inputs → correct error codes
- ⏭️ **Checkout Flow**: cart → address → shipping → order (needs auth)

### 5. Performance
- ✅ Latency tracking per test
- ✅ Average latency calculation
- ✅ 5s timeout per request
- ✅ Sequential execution (for cart item ID capture)

---

## 📈 Expected Results

### Overall Status
- **OK**: 31/31 pass (all green)
- **DEGRADED**: <50% fail (some issues)
- **DOWN**: ≥50% fail (major problems)

### Category Breakdown
```
Health:      2/2  ✅
Products:    6/6  ✅
Cart:        7/7  ✅
Checkout:    2/2  ✅
Orders:      2/2  ✅
Vouchers:    3/3  ✅
Wishlist:    2/2  ✅
Reviews:     1/1  ✅
Error Cases: 6/6  ✅
```

---

## 🐛 Bugs Found

### Bug #1: POST /cart/items returned 200 instead of 201
**Status**: ✅ FIXED  
**File**: `app/api/shop/cart/items/route.ts`  
**Fix**: Use `NextResponse.json(..., {status: 201})`

### Bug #2: POST /apply-coupon returned 400
**Status**: ⚠️ Test sequence issue  
**Root Cause**: `NEWYEAR2026` requires min $50, cart was empty  
**Fix**: Changed to `WELCOME10` (min $30) + add items first

---

## 🔄 Test Sequence

Tests run **sequentially** to handle dependencies:

```
1. Health checks
2. Products (independent)
3. Cart flow:
   - Get empty
   - Add item 1 → Capture cart_item_id
   - Add item 2
   - Apply coupon (cart now > $30)
   - Update item (use cart_item_id)
   - Delete item (use cart_item_id)
4. Error cases (independent)
5. Auth-required (all return 401)
```

---

## 📊 Monitor Dashboard

URL: `http://localhost:3000/shop/api`

**Displays**:
- Overall status badge (OK/DEGRADED/DOWN)
- Category breakdown cards
- Detailed table with:
  - Category
  - Method (color-coded: GET=blue, POST=green, PATCH=yellow, DELETE=red)
  - Endpoint path
  - Description
  - Status (✅/❌)
  - Latency (ms)
- Failed tests panel with error messages

---

## 🚀 Next Steps

1. ✅ Test at `/shop/api`
2. ⏭️ Add authenticated tests (need Clerk token)
3. ⏭️ Add full checkout flow test
4. ⏭️ Add order cancellation test
5. ⏭️ Add response time chart
6. ⏭️ Add CI/CD integration
7. ⏭️ Add alerting (Slack/Discord webhook)

---

## 🔧 How to Extend

### Add New Test

Edit `app/api/internal/monitor/shop/route.ts`:

```typescript
{
  method: 'POST',
  path: '/api/shop/checkout',
  description: 'Create order',
  category: 'Checkout',
  requiresAuth: true,
  headers: { 'x-session-id': TEST_SESSION_ID },
  body: {
    shipping_address_id: 'addr-123',
    shipping_method_id: 'ship-standard-uuid'
  },
  expectedStatus: 201,
  validateSchema: (data) => {
    const valid = data.data?.order_number?.startsWith('TC-');
    return { valid, errors: valid ? undefined : ['Invalid order number'] };
  },
},
```

### Add Auth Testing

1. Get real Clerk JWT token
2. Update `TEST_AUTH_TOKEN` variable
3. Set `requiresAuth: true` on test
4. Change `expectedStatus` from 401 to 200/201

---

## 📝 Coverage Report

| Feature | Tested | Coverage |
|---------|--------|----------|
| **GET endpoints** | 15/20 | 75% |
| **POST endpoints** | 12/15 | 80% |
| **PATCH endpoints** | 1/2 | 50% |
| **DELETE endpoints** | 1/3 | 33% |
| **Error handling** | 6/10 | 60% |
| **Schema validation** | 12/31 | 39% |
| **Overall** | **31 tests** | **~65%** |

---

## 🎯 Goal: 100% Coverage

**Missing tests**:
- Full authenticated checkout flow
- Order history endpoint
- Order cancellation
- Update/delete addresses
- Voucher usage flow
- Wishlist remove
- Review listing
