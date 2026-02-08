# Shop Partner System - Requirements

> **Version**: 1.0  
> **Status**: Draft for Implementation

## 📋 Overview

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

```
Platform Admin (TripC Staff)
    │
    ├── Partner Owner (1 per partner)
    │       │
    │       └── Partner Staff (N per partner)
    │
    └── End User (shopper)
```

### Permission Matrix

| Action | Admin | Partner Owner | Partner Staff | End User |
|--------|:-----:|:-------------:|:-------------:|:--------:|
| **Partner Management** |
| Approve partner applications | ✅ | ❌ | ❌ | ❌ |
| Suspend/ban partner | ✅ | ❌ | ❌ | ❌ |
| Update partner profile | ✅ | ✅ | ❌ | ❌ |
| Update payout settings | ❌ | ✅ | ❌ | ❌ |
| Invite/remove staff | ❌ | ✅ | ❌ | ❌ |
| **Product Management** |
| Create product draft | ❌ | ✅ | ✅ | ❌ |
| Edit own products | ❌ | ✅ | ✅ | ❌ |
| Publish product | ❌ | ✅ | ❌ | ❌ |
| Delete product | ❌ | ✅ | ❌ | ❌ |
| Moderate any product | ✅ | ❌ | ❌ | ❌ |
| **Order Management** |
| View partner orders | ❌ | ✅ | ✅ | ❌ |
| Update order status | ❌ | ✅ | ✅ | ❌ |
| Process returns | ❌ | ✅ | ❌ | ❌ |
| View all orders | ✅ | ❌ | ❌ | ❌ |
| **Analytics** |
| View partner analytics | ❌ | ✅ | 👁️ | ❌ |
| View platform analytics | ✅ | ❌ | ❌ | ❌ |

👁️ = Read-only access

---

## 3. Partner Lifecycle

### 3.1 Onboarding Flow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  User visits    │───▶│  Fill application│───▶│  Submit for     │
│  /shop/partner  │    │  form + KYC docs │    │  review         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
                       ┌───────────────────────────────┴───────────────┐
                       ▼                                               ▼
              ┌─────────────────┐                          ┌───────────────────┐
              │  Admin reviews  │                          │  Auto-approve     │
              │  (manual queue) │                          │  (if criteria met)│
              └────────┬────────┘                          └─────────┬─────────┘
                       │                                             │
                       └────────────────────┬────────────────────────┘
                                            ▼
                              ┌─────────────────────────┐
                              │  Status: APPROVED       │
                              │  Email notification     │
                              │  Access to dashboard    │
                              └─────────────────────────┘
```

### 3.2 Partner Statuses

| Status | Description | Can Sell? |
|--------|-------------|:---------:|
| `pending` | Application submitted, awaiting review | ❌ |
| `approved` | Verified and active | ✅ |
| `suspended` | Temporarily disabled (policy violation) | ❌ |
| `banned` | Permanently disabled | ❌ |

---

## 4. Product Workflow

### 4.1 Product Statuses

```
┌─────────┐   Save    ┌──────────┐   Publish   ┌───────────┐
│  DRAFT  │──────────▶│  DRAFT   │────────────▶│ PUBLISHED │
└─────────┘           └──────────┘             └───────────┘
                            │                        │
                            │ Admin Flag             │ Partner Unpublish
                            ▼                        ▼
                      ┌───────────┐          ┌───────────────┐
                      │  FLAGGED  │          │   ARCHIVED    │
                      └───────────┘          └───────────────┘
```

| Status | Visible to Public? | Editable? |
|--------|:------------------:|:---------:|
| `draft` | ❌ | ✅ |
| `published` | ✅ | ✅ (with publish) |
| `archived` | ❌ | ✅ (can republish) |
| `flagged` | ❌ | ❌ (pending review) |

### 4.2 Required Fields for Publishing

| Field | Required | Validation |
|-------|:--------:|------------|
| Title | ✅ | 3-200 chars |
| Description | ✅ | 50-10000 chars |
| Category | ✅ | Valid category_id |
| Price | ✅ | At least 1 variant with price > 0 |
| Images | ✅ | At least 1 image |
| SKU | ✅ | Unique per variant |
| Inventory | ✅ | stock_on_hand >= 0 |

### 4.3 Slug Generation

```typescript
// Auto-generated from title, ensuring uniqueness
function generateSlug(title: string, partnerId: string): string {
  const base = slugify(title); // e.g., "travel-backpack-pro"
  const suffix = partnerId.slice(0, 6); // First 6 chars of partner UUID
  return `${base}-${suffix}`; // "travel-backpack-pro-a1b2c3"
}
```

---

## 5. Image Upload Requirements

### 5.1 Specifications

| Constraint | Value |
|------------|-------|
| Max file size | 5 MB |
| Allowed formats | JPEG, PNG, WebP |
| Min dimensions | 500 x 500 px |
| Max dimensions | 4000 x 4000 px |
| Max images per product | 10 |
| Storage path | `shop-products/{partner_id}/products/{product_id}/` |

### 5.2 Upload Flow

```
1. Client → POST /api/shop/partners/upload/request
   Body: { filename, contentType, productId }
   Response: { uploadUrl, key, expiresIn }

2. Client → PUT {uploadUrl}
   Body: File binary
   Response: 200 OK

3. Client → POST /api/shop/partners/upload/confirm
   Body: { key, productId, alt, isPrimary }
   Response: { imageId, url }
```

---

## 6. Anti-Abuse Measures

### 6.1 Rate Limits

| Resource | Limit | Window |
|----------|-------|--------|
| Partner applications | 3 | per IP per day |
| Product creations | 50 | per partner per hour |
| Image uploads | 100 | per partner per hour |
| API calls (general) | 1000 | per partner per hour |

### 6.2 Content Moderation

**Automated Checks:**
- Prohibited keywords in title/description
- Duplicate product detection (same images/title)
- Suspicious pricing (too low, too high)

**Manual Review Triggers:**
- First 3 products from new partner
- Products flagged by customers
- High-value items (> $500)

### 6.3 Prohibited Categories

- Weapons and ammunition
- Illegal substances
- Counterfeit goods
- Adult content
- Hazardous materials

---

## 7. Financial Considerations (Placeholder)

### 7.1 Commission Structure

| Tier | Monthly Sales | Commission |
|------|---------------|------------|
| Starter | $0 - $1,000 | 15% |
| Growth | $1,001 - $10,000 | 12% |
| Pro | $10,001+ | 10% |

### 7.2 Payout Settings

**Required for First Payout:**
- Bank account or PayPal verified
- Tax ID/Business registration
- Completed KYC

**Payout Schedule:**
- Weekly payouts for orders completed 7+ days ago
- Minimum payout: $50

> ⚠️ **Note**: Financial features are out of scope for MVP. Only schema placeholders will be created.

---

## 8. Edge Cases

### 8.1 Partner Deletion

**Scenario**: Partner requests account deletion

**Handling:**
1. Mark partner as `deleted` (soft delete)
2. Unpublish all products (status → `archived`)
3. Keep order history for compliance (7 years)
4. Anonymize PII after 30 days
5. Products not visible but referenced in past orders

### 8.2 Inventory Sync Issues

**Scenario**: Product sold out but order placed

**Handling:**
1. Order creation validates stock atomically
2. If race condition occurs:
   - Order marked `pending_stock`
   - Partner notified
   - Partner accepts or cancels within 24h
   - If no response → auto-cancel + refund

### 8.3 Disputed Orders

**Scenario**: Customer claims item not received

**Handling:**
1. Customer opens dispute via support
2. Admin holds partner payout
3. Both parties provide evidence
4. Admin resolves within 14 days
5. Outcome: refund, partial refund, or release to partner

---

## 9. Non-Goals (Out of Scope for MVP)

| Feature | Reason |
|---------|--------|
| Multi-currency pricing | Complexity; single currency (USD/VND) first |
| Real-time inventory sync | External integrations; manual for MVP |
| Automated payouts | Requires payment provider integration |
| Partner mobile app | Web-first approach |
| Product variants matrix | Simple 1-level options only |
| Affiliate tracking | Separate feature roadmap |
| Bulk import/export | Manual entry for MVP |

---

## 10. Success Criteria

### MVP Launch Criteria

- [ ] Partner can register and get approved
- [ ] Partner can create products with images
- [ ] Products appear in public shop listing
- [ ] Customers can purchase partner products
- [ ] Orders visible in partner dashboard
- [ ] Basic analytics (views, sales, revenue)

### Quality Metrics

| Metric | Target |
|--------|--------|
| Partner onboarding time | < 48 hours |
| Product publish time | < 5 minutes |
| Image upload success rate | > 99% |
| Dashboard page load | < 2 seconds |

---

## Summary

The Partner system transforms TripC Shop into a marketplace where vendors can:

1. **Register** with business details and verification
2. **Get Approved** through admin review
3. **Create Products** with variants, images, and inventory
4. **Sell** to end users through the existing shop experience
5. **Manage Orders** from a dedicated dashboard
6. **Track Performance** with basic analytics

All while following existing patterns from the Shop module and Partner portals.
