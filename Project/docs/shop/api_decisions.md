# API Decisions & Assumptions

> **Date**: January 25, 2026  
> **OpenAPI Version**: 1.0.0

This document tracks decisions made when creating the Shop API spec where documentation was ambiguous or incomplete.

---

## Assumptions Made

### 1. Pagination
| Decision | Default `limit=20`, `offset=0`, max `limit=100` |
|----------|------------------------------------------------|
| **Source** | Not specified in docs |
| **Rationale** | Standard REST practice |
| **To Change** | Update `LimitParam` and `OffsetParam` in OpenAPI |

### 2. Guest Cart Authentication
| Decision | Use `x-session-id` header for guest carts |
|----------|-------------------------------------------|
| **Source** | Schema has `session_id` column but no auth spec |
| **Rationale** | Headers are cleaner than cookies for API |
| **To Change** | Modify `SessionAuth` security scheme |

### 3. Money Format
| Decision | Integer cents + currency string |
|----------|--------------------------------|
| **Source** | Schema uses `INT` for prices |
| **Rationale** | Avoids floating-point errors |
| **Example** | `{ "amount": 29900, "currency": "USD" }` = $299.00 |

### 4. Order Cancellation
| Decision | Only `pending` orders can be cancelled |
|----------|----------------------------------------|
| **Source** | Not specified in docs |
| **Rationale** | Conservative - shipped orders need refund flow |
| **To Change** | Add `processing` to cancellable statuses if needed |

### 5. Product Search Endpoint
| Decision | Separate `/products/search` endpoint |
|----------|-------------------------------------|
| **Source** | Docs mention "Text + semantic search" |
| **Rationale** | Allows different caching/rate limiting |
| **To Change** | Could merge into `/products?q=` query param |

### 6. Voucher vs Coupon
| Decision | Separate flows |
|----------|----------------|
| **Source** | Schema has `voucher_templates` + `shop_user_vouchers` vs `coupons` |
| **Rationale** | Vouchers require redeem step, coupons apply directly |
| **Vouchers** | User redeems with TripCent → owns voucher → applies to cart |
| **Coupons** | User enters code → applies directly |

### 7. Review Moderation
| Decision | Reviews created with `status = 'pending'` |
|----------|------------------------------------------|
| **Source** | Schema has pending/approved/rejected |
| **Rationale** | Prevent spam/abuse |
| **To Change** | Auto-approve verified purchases if desired |

### 8. Wishlist Duplicate Handling
| Decision | Return 409 if product already in wishlist |
|----------|------------------------------------------|
| **Source** | Schema has `UNIQUE(user_id, product_id)` |
| **Rationale** | Make duplicate handling explicit |
| **Alternative** | Could silently ignore duplicates (200) |

---

## Gaps Found in Documentation

### 1. Cart Merge on Login
| Gap | How to merge guest cart with user cart on login? |
|-----|--------------------------------------------------|
| **Assumed** | Not in MVP API - handle client-side or separate endpoint |
| **Recommendation** | Add `/cart/merge` POST endpoint later |

### 2. Stock Validation Timing
| Gap | When to validate stock - add to cart or checkout? |
|-----|---------------------------------------------------|
| **Assumed** | Both: warn at cart add, fail at checkout |
| **Recommendation** | Document expected behavior in checkout endpoint |

### 3. TripCent Integration
| Gap | How to deduct TripCent for voucher redemption? |
|-----|------------------------------------------------|
| **Assumed** | Separate TripCent service - mock in MVP |
| **Recommendation** | Define `/api/tcent/*` endpoints when ready |

### 4. Payment Flow
| Gap | How does payment integrate? |
|-----|------------------------------|
| **Assumed** | `payment_intents` table exists but flow not defined |
| **Recommendation** | Add `/checkout/pay` or integrate Stripe/etc |

### 5. Admin Endpoints
| Gap | No admin endpoints for product/order management |
|-----|------------------------------------------------|
| **Assumed** | Out of scope for MVP |
| **Recommendation** | Add `/api/admin/shop/*` namespace later |

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `PRODUCT_NOT_FOUND` | 404 | Product slug does not exist |
| `VARIANT_NOT_FOUND` | 404 | Variant ID does not exist |
| `CART_EMPTY` | 400 | Cannot checkout empty cart |
| `CART_ITEM_NOT_FOUND` | 404 | Cart item ID not in cart |
| `INSUFFICIENT_STOCK` | 409 | Not enough stock for quantity |
| `COUPON_INVALID` | 400 | Coupon code not found or inactive |
| `COUPON_EXPIRED` | 400 | Coupon past end date |
| `COUPON_LIMIT_REACHED` | 400 | User already used coupon max times |
| `COUPON_MIN_NOT_MET` | 400 | Order below minimum spend |
| `ORDER_NOT_FOUND` | 404 | Order number/ID not found |
| `ORDER_CANNOT_CANCEL` | 400 | Order not in pending status |
| `ADDRESS_NOT_FOUND` | 404 | Address ID not found |
| `VOUCHER_NOT_AVAILABLE` | 400 | Voucher template out of stock |
| `INSUFFICIENT_TCENT` | 400 | Not enough TripCent to redeem |
| `ALREADY_IN_WISHLIST` | 409 | Product already wishlisted |
| `UNAUTHORIZED` | 401 | Missing or invalid auth token |

---

## Future Considerations

1. **Real-time stock updates** - WebSocket for cart page
2. **Order tracking** - Integrate with shipping providers
3. **Product recommendations** - AI-based suggestions
4. **Multi-currency** - Support VND, USD, etc.
5. **Seller dashboard** - Enterprise feature
