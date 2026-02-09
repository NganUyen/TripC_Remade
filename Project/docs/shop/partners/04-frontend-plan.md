# Shop Partner System - Frontend Plan

> **Route Base**: `/shop/partner`  
> **Component Base**: `components/shop/partner`

## 📋 Overview

Frontend architecture for Shop Partner Portal following existing hotel/restaurant portal patterns.

---

## 1. Route Structure

```
app/shop/partner/
├── page.tsx                        # Landing/onboarding
├── layout.tsx                      # Partner layout (sidebar)
├── dashboard/page.tsx              # Main dashboard
├── products/
│   ├── page.tsx                    # Product list
│   ├── new/page.tsx                # Create product
│   └── [id]/page.tsx               # Edit product
├── orders/
│   ├── page.tsx                    # Order list
│   └── [id]/page.tsx               # Order detail
├── analytics/page.tsx              # Analytics
├── settings/
│   ├── page.tsx                    # Settings
│   └── team/page.tsx               # Team management
└── onboarding/page.tsx             # Application form
```

---

## 2. Component Structure

```
components/shop/partner/
├── layout/
│   ├── PartnerLayout.tsx
│   ├── PartnerSidebar.tsx
│   └── PartnerHeader.tsx
├── dashboard/
│   ├── DashboardStats.tsx
│   ├── RevenueChart.tsx
│   └── RecentOrdersList.tsx
├── products/
│   ├── ProductList.tsx
│   ├── ProductForm.tsx
│   ├── ProductImageUpload.tsx
│   └── VariantEditor.tsx
├── orders/
│   ├── OrderList.tsx
│   ├── OrderDetail.tsx
│   └── OrderStatusUpdate.tsx
├── analytics/
│   ├── StatCard.tsx
│   └── TopProductsChart.tsx
├── onboarding/
│   └── OnboardingForm.tsx
└── shared/
    ├── PartnerGuard.tsx
    ├── EmptyState.tsx
    └── LoadingSkeleton.tsx
```

---

## 3. State Management

### Zustand Stores

```typescript
// store/usePartnerStore.ts
interface PartnerState {
  partner: ShopPartner | null;
  membership: PartnerMember | null;
  isLoading: boolean;
  fetchPartner: () => Promise<void>;
  updatePartner: (data: Partial<ShopPartner>) => Promise<void>;
}

// store/usePartnerProductStore.ts
interface PartnerProductState {
  products: PartnerProduct[];
  total: number;
  filters: { status: string; search: string; sort: string };
  fetchProducts: (params?: ProductFilters) => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<string>;
  updateProduct: (id: string, data: UpdateProductData) => Promise<void>;
  publishProduct: (id: string) => Promise<void>;
}
```

---

## 4. Access Control

```tsx
// PartnerGuard.tsx
export function PartnerGuard({ children, requiredRole }) {
  const { user } = useUser();
  const { partner, membership } = usePartnerStore();
  
  if (!user) return <SignInRedirect />;
  if (!partner) return <OnboardingCTA />;
  if (partner.status === 'pending') return <PendingBanner />;
  if (partner.status === 'suspended') return <SuspendedBanner />;
  if (requiredRole && membership?.role !== requiredRole) return <AccessDenied />;
  
  return children;
}
```

---

## 5. Integration Points

- Partner products appear in shop listing via `shop_products`
- Reuse shop components: `ProductCard`, `ImageGallery`, `PriceDisplay`
- Follow existing partner portal patterns (restaurant/hotel)

---

## Summary

| Category | Count |
|----------|-------|
| Routes | 11 |
| Components | ~45 |
| Zustand Stores | 3 |
