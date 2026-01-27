# 📦 TripC Shop Schema MVP - Hướng Dẫn Chi Tiết

> **Version**: 1.0.2 FINAL | **Date**: January 25, 2026

---

## 🎯 Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────┐
│  SECTION 1-2: CATALOG & CART (Khách hàng)  │
├─────────────────────────────────────────────┤
│  SECTION 3-5: ORDERS & PAYMENT (Giao dịch) │
├─────────────────────────────────────────────┤
│  SECTION 6: USER FEATURES (Tương tác)      │
├─────────────────────────────────────────────┤
│  SECTION 7-10: LOGIC & PERFORMANCE         │
└─────────────────────────────────────────────┘
```

| Section | Tables | Mục đích |
|---------|:------:|----------|
| 1. Catalog | 6 | Sản phẩm, danh mục, thương hiệu |
| 2. Cart | 4 | Giỏ hàng, địa chỉ, shipping |
| 3. Orders | 3 | Đơn hàng, order items, history |
| 4. Vouchers | 4 | Voucher, coupon, tracking |
| 5. Payments | 1 | Payment intents |
| 6. User | 2 | Wishlist, reviews |
| **Total** | **18** | |

---

## 📦 SECTION 1: CATALOG

### 1.1 Categories (Danh Mục Phân Cấp)

```sql
parent_id UUID REFERENCES categories(id)  -- Tự tham chiếu
```

**Cấu trúc cây:**
```
Travel (parent_id = NULL)
  ├─ Luggage (parent_id = Travel.id)
  │   ├─ Carry-on
  │   └─ Checked Bags
  └─ Accessories
```

### 1.2 Products + Variants

```
Product: Samsonite Omni PC Spinner
  ├─ Variant 1: 28-inch, Black, $299 (SKU: SAM-OMNI-28-BLK)
  ├─ Variant 2: 28-inch, Silver, $299
  └─ Variant 3: 24-inch, Black, $249
```

**Giá lưu bằng CENTS (tránh floating-point error):**
```sql
price = 29900  -- $299.00
```

### 1.3 Variant Options

```sql
-- Lưu thuộc tính biến thể
option_name: "Size",  option_value: "28-inch"
option_name: "Color", option_value: "Black"
```

---

## 🛒 SECTION 2: CART

### 2.1 Guest Cart vs User Cart

```sql
-- Guest (chưa login)
user_id = NULL, session_id = "abc123"

-- User đã login
user_id = "uuid-xxx", session_id = NULL
```

### 2.2 Cart Status

| Status | Ý nghĩa |
|--------|---------|
| `active` | Đang mua sắm |
| `converted` | Đã checkout → thành order |
| `abandoned` | Bỏ giỏ > 7 ngày |

### 2.3 Snapshot Pattern

```sql
-- Cart Items lưu snapshot giá tại thời điểm add
unit_price INT       -- Giá khi add to cart
title_snapshot       -- Tên sản phẩm lúc đó
```

**Tại sao?** Giá có thể thay đổi → snapshot đảm bảo user thấy đúng giá đã chọn.

---

## 💰 SECTION 3: ORDERS

### 3.1 Order Status vs Payment Status

```sql
status VARCHAR          -- Trạng thái vận đơn
payment_status VARCHAR  -- Trạng thái thanh toán
```

**Ví dụ thực tế:**

| Scenario | status | payment_status |
|----------|--------|----------------|
| COD đang ship | `shipped` | `pending` |
| Thanh toán lỗi | `pending` | `failed` |
| Đã giao, hoàn tiền | `delivered` | `refunded` |

### 3.2 Cấu Trúc Giá

```sql
subtotal = 548        -- Tổng tiền hàng
discount_total = -50  -- Voucher giảm
shipping_total = 20   -- Phí ship
grand_total = 518     -- Tổng thanh toán
```

### 3.3 TripCent

```sql
tcent_used = 1000     -- Dùng 1000 điểm = -$10
tcent_earned = 518    -- Mua $518 → nhận 518 điểm
```

### 3.4 Order Status History (Audit Trail)

```
Order TC-260125-100001:
  10:00 AM: pending → processing (system)
  11:30 AM: processing → shipped (admin: John)
  01/27: shipped → delivered (system)
```

---

## 🎟️ SECTION 4: VOUCHERS & COUPONS

### 4.1 Voucher vs Coupon

| | Voucher | Coupon |
|--|---------|--------|
| **Nguồn** | Dùng Tcent mua | Code công khai |
| **Ví dụ** | Voucher -$50 (4000 Tcent) | NEWYEAR2026 |
| **Flow** | Redeem → Own → Apply | Apply trực tiếp |

### 4.2 Voucher Flow

```
1. User có 5000 Tcent
2. Mua voucher -$50 (cost: 4000 Tcent)
   → INSERT shop_user_vouchers
   → status = 'active'
   → unique_code = "V-A3F8D9E2"

3. Checkout, áp dụng voucher
   → status = 'used'
   → used_on_order_id = order.id
```

### 4.3 Coupon Usage Tracking

```sql
-- coupon_usages table đảm bảo:
-- 1 user chỉ dùng coupon X lần theo usage_limit_per_user
```

---

## 👤 SECTION 6: USER FEATURES

### 6.1 Wishlist

```sql
UNIQUE(user_id, product_id)  -- 1 product chỉ có 1 lần trong wishlist
```

### 6.2 Reviews + Rating Cache

```sql
-- shop_reviews: User đánh giá sản phẩm
rating INT CHECK (rating >= 1 AND rating <= 5)
is_verified_purchase BOOLEAN  -- Badge "Đã mua hàng"

-- shop_products: Cache rating (tự động update bởi trigger)
rating_avg DECIMAL(3,2)  -- 4.75
review_count INT         -- 128 đánh giá
```

---

## ⚡ SECTION 7-10: FUNCTIONS & PERFORMANCE

### 7.1 Key Functions

| Function | Mục đích |
|----------|----------|
| `generate_order_number()` | Tạo TC-YYMMDD-XXXXXX |
| `generate_voucher_code()` | Tạo V-XXXXXXXX |
| `decrement_stock()` | Trừ tồn kho (atomic) |
| `can_use_coupon()` | Kiểm tra coupon hợp lệ |
| `is_product_available()` | Check variant có sẵn |

### 7.2 Key Triggers

| Trigger | On Table | Action |
|---------|----------|--------|
| `order_status_changed` | shop_orders | Log vào history |
| `update_product_ratings` | shop_reviews | Update rating_avg |
| `coupon_used` | coupon_usages | Increment usage count |

### 7.3 Performance Indexes

```sql
-- Text search với trigram
idx_shop_products_title_trgm USING gin(title gin_trgm_ops)

-- Composite indexes
idx_shop_orders_user_created (user_id, created_at DESC)
idx_product_variants_available (product_id, stock_on_hand)
```

---

## 🔐 RLS Policies

| Table | Policy | Logic |
|-------|--------|-------|
| `cart_items` | Users manage own | `cart_id IN user's carts` |
| `shop_orders` | Users view own | `user_id = current_user` |
| `addresses` | Users manage own | `user_id = current_user` |
| `shop_user_vouchers` | Users view own | `user_id = current_user` |

---

## 📁 Files

| File | Description |
|------|-------------|
| `shop_schema_mvp.sql` | v1.0.2 FINAL (18 tables, 879 lines) |
| `shop_schema_enterprise.sql` | Full Shopee-level (55+ tables) |
| `SHOP_SCHEMA_GUIDE.md` | Hướng dẫn chi tiết (this file) |
| `SHOP_MVP_FIXES_REVIEW.md` | Review các fixes |
