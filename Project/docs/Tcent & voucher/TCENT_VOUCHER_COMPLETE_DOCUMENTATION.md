# TripC Tcent & Voucher System - Complete Documentation

**Version:** 2.0  
**Last Updated:** January 27, 2026  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Tcent Loyalty System](#tcent-loyalty-system)
4. [Voucher System](#voucher-system)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [Business Logic & Rules](#business-logic--rules)
9. [Integration Points](#integration-points)
10. [Security & Anti-Fraud](#security--anti-fraud)
11. [Deployment Guide](#deployment-guide)
12. [Known Issues & Edge Cases](#known-issues--edge-cases)

---

## Overview

### What is Tcent?

**Tcent** is TripC's virtual loyalty currency where:

- **1 Tcent = $0.01 USD** (or equivalent)
- Users earn Tcents through bookings, quests, and activities
- Tcents can be redeemed for vouchers or used to pay for services
- Maximum 30% of any booking can be paid with Tcent

### What are Vouchers?

**Vouchers** are digital discount codes that:

- Can be purchased with Tcent or received through promotions
- Provide percentage or fixed-amount discounts
- Are merchant-specific or platform-wide
- Have expiry dates and usage limits

### Key Metrics

```
Conversion Rate: 100 Tcent = $1.00 USD
Max Redemption: 30% of booking amount
Tier Multipliers: Bronze (1.0x), Silver (1.1x), Gold (1.2x), Platinum (1.5x)
Working Pass Bonus: 50% extra Tcent earnings
```

---

## System Architecture

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Activities                       │
│   (Bookings, Quests, Social Sharing, Referrals)        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Tcent Earning Engine                        │
│  • Calculate base Tcent                                  │
│  • Apply tier multipliers                                │
│  • Add Working Pass bonus                                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                Tcent Ledger                              │
│  Status: PENDING → AVAILABLE → SPENT                     │
└──────────────────┬──────────────────────────────────────┘
                   │
           ┌───────┴────────┐
           ▼                ▼
    ┌──────────┐     ┌──────────────┐
    │ Voucher  │     │   Payment    │
    │ Exchange │     │   Discount   │
    └──────────┘     └──────────────┘
```

### Technology Stack

- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion
- **Auth:** Clerk Authentication
- **Database:** PostgreSQL with PostGIS, pgvector
- **State:** Zustand, React Context

---

## Tcent Loyalty System

### Earning Mechanisms

#### 1. Booking Rewards

**Formula:**

```typescript
base_tcent = booking_amount_cents × partner_earn_rate
working_pass_bonus = base_tcent × 0.5 (if has Working Pass)
tier_bonus = base_tcent × (tier_multiplier - 1.0)
total_tcent = base_tcent + working_pass_bonus + tier_bonus
```

**Example:**

```
Booking: $200 hotel (20,000 cents)
Partner Rate: 5%
User: Gold tier with Working Pass

base_tcent = 20,000 × 0.05 = 1,000 TC
working_pass_bonus = 1,000 × 0.5 = 500 TC
tier_bonus = 1,000 × (1.2 - 1.0) = 200 TC
total_tcent = 1,000 + 500 + 200 = 1,700 TC
```

#### 2. Quest Rewards

| Quest Type     | Reward Range | Verification |
| -------------- | ------------ | ------------ |
| Onboarding     | 500-1000 TC  | Auto         |
| First Booking  | 1000-2000 TC | Auto         |
| Social Sharing | 250-500 TC   | Manual       |
| Video Review   | 500-1500 TC  | AI/Manual    |
| Referral       | 1000-3000 TC | Auto         |

#### 3. Event Rewards

- Special promotions
- Seasonal campaigns
- Partnership bonuses
- Achievement milestones

### Membership Tiers

| Tier         | Earn Multiplier  | Lifetime Spend Required |
| ------------ | ---------------- | ----------------------- |
| **Bronze**   | 1.0x             | $0 - $999               |
| **Silver**   | 1.1x (10% bonus) | $1,000 - $4,999         |
| **Gold**     | 1.2x (20% bonus) | $5,000 - $14,999        |
| **Platinum** | 1.5x (50% bonus) | $15,000+                |

### Tcent States

```
PENDING   → Earned but awaiting approval (quests)
AVAILABLE → Ready to use
SPENT     → Already redeemed
EXPIRED   → Past expiration date (if applicable)
CANCELLED → Clawback due to refund
```

### Redemption Rules

1. **Maximum Usage:** 30% of any booking amount
2. **Conversion Rate:** 1 Tcent = 1 cent = $0.01
3. **Minimum Balance:** Cannot redeem if balance < voucher price
4. **No Cash Value:** Tcent cannot be converted back to cash

---

## Voucher System

### Voucher Types

#### 1. Platform-Wide Vouchers

- Apply to all merchants/services
- Usually lower discount percentages
- Higher Tcent cost

#### 2. Merchant-Specific Vouchers

- Limited to specific partners
- Can offer deeper discounts
- May have minimum spend requirements

#### 3. Category Vouchers

- Valid for service categories (Hotels, Flights, Dining)
- Flexible within category
- Seasonal offerings

### Voucher Properties

```typescript
interface Voucher {
  id: UUID;
  code: string; // e.g., "HOTEL20"
  voucher_type: string; // "PERCENTAGE" | "FIXED_AMOUNT"
  discount_value: number; // 20 (for 20%) or 2000 (for $20)
  min_spend: number; // Minimum purchase amount
  tcent_price: number; // Cost in Tcent
  total_usage_limit: number; // Max redemptions allowed
  current_usage_count: number;
  is_purchasable: boolean;
  is_active: boolean;
  starts_at: timestamp;
  expires_at: timestamp;
}
```

### Purchase Flow

```
1. User browses marketplace → GET /api/v1/vouchers/marketplace
2. User selects voucher → Display details & price
3. User confirms purchase → POST /api/v1/vouchers/exchange
4. System validates:
   ✓ User has sufficient Tcent
   ✓ Voucher is active & in stock
   ✓ Voucher has not expired
5. Transaction executes:
   • Deduct Tcent from balance
   • Add voucher to user's wallet
   • Record in tcent_ledger
   • Increment usage count
6. Success response → Display new balance
```

### Redemption Flow

```
1. User adds voucher at checkout
2. System validates:
   ✓ Voucher belongs to user
   ✓ Voucher status = AVAILABLE
   ✓ Not expired
   ✓ Meets minimum spend
   ✓ Matches merchant/category
3. Apply discount to order
4. Mark voucher as USED
5. Record used_at timestamp
```

---

## Database Schema

### Core Tables

#### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,

  -- Tcent & Loyalty
  tcent_balance INT DEFAULT 0 NOT NULL,
  tcent_pending INT DEFAULT 0 NOT NULL,
  membership_tier VARCHAR(20) DEFAULT 'BRONZE',
  lifetime_spend DECIMAL(12,2) DEFAULT 0,

  -- Profile
  name VARCHAR(255),
  image_url VARCHAR(500),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_tier CHECK (membership_tier IN
    ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
  CONSTRAINT valid_tcent CHECK (tcent_balance >= 0 AND tcent_pending >= 0)
);
```

#### vouchers

```sql
CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,

  voucher_type VARCHAR(50) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_spend DECIMAL(10,2) DEFAULT 0,

  total_usage_limit INT,
  current_usage_count INT DEFAULT 0,

  is_purchasable BOOLEAN DEFAULT false,
  tcent_price INT,

  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vouchers_code ON vouchers(code);
```

#### user_vouchers

```sql
CREATE TABLE user_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voucher_id UUID NOT NULL REFERENCES vouchers(id),

  status VARCHAR(50) NOT NULL, -- AVAILABLE, USED, EXPIRED
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_vouchers_user ON user_vouchers(user_id);
```

#### tcent_ledger

```sql
CREATE TABLE tcent_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  amount INT NOT NULL,  -- Positive for EARN, Negative for SPEND
  transaction_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,  -- PENDING, AVAILABLE, CANCELLED

  balance_after INT,

  reference_type VARCHAR(50),  -- 'booking', 'quest', 'voucher_exchange'
  reference_id UUID,
  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tcent_ledger_user ON tcent_ledger(user_id);
CREATE INDEX idx_tcent_ledger_status ON tcent_ledger(status);
```

#### quests

```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(50) NOT NULL,  -- onboarding, transaction, social

  reward_amount INT NOT NULL,
  is_active BOOLEAN DEFAULT true,

  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### quest_submissions

```sql
CREATE TABLE quest_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES quests(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  submission_data JSONB NOT NULL,  -- Evidence: URLs, images, notes
  status VARCHAR(50) NOT NULL,  -- PENDING, APPROVED, REJECTED

  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quest_submissions_user ON quest_submissions(user_id);
```

### Database Triggers

#### Auto-update Tcent Balance

```sql
CREATE OR REPLACE FUNCTION update_tcent_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- When quest is approved, move from PENDING to AVAILABLE
  IF NEW.status = 'AVAILABLE' AND OLD.status = 'PENDING' THEN
    UPDATE users
    SET
      tcent_balance = tcent_balance + NEW.amount,
      tcent_pending = tcent_pending - NEW.amount
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tcent_status_change AFTER UPDATE ON tcent_ledger
  FOR EACH ROW EXECUTE FUNCTION update_tcent_balance();
```

---

## API Endpoints

### Voucher APIs

#### GET `/api/v1/vouchers/marketplace`

**Purpose:** List all purchasable vouchers

**Auth:** Public

**Response:**

```json
{
  "vouchers": [
    {
      "id": "uuid",
      "code": "HOTEL20",
      "voucher_type": "FIXED_AMOUNT",
      "discount_value": 20.0,
      "min_spend": 100.0,
      "tcent_price": 2000,
      "stock_remaining": 45,
      "expires_at": "2026-12-31T23:59:59Z"
    }
  ]
}
```

#### GET `/api/v1/vouchers/wallet`

**Purpose:** Get user's owned vouchers

**Auth:** Required (Clerk)

**Response:**

```json
{
  "vouchers": [
    {
      "id": "uuid",
      "voucher": {
        "code": "LOUNGE_VIP",
        "discount_value": 35.0
      },
      "status": "AVAILABLE",
      "acquired_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/v1/vouchers/exchange`

**Purpose:** Purchase voucher with Tcent

**Auth:** Required (Clerk)

**Request:**

```json
{
  "voucherId": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "newBalance": 3500
}
```

**Errors:**

- `401`: Unauthorized
- `400`: Insufficient balance / Out of stock
- `404`: Voucher not found
- `409`: Transaction conflict

### Quest APIs

#### GET `/api/v1/quests/available`

**Purpose:** List active quests

**Auth:** Public

**Response:**

```json
{
  "quests": [
    {
      "id": "uuid",
      "title": "First Booking Bonus",
      "description": "Complete your first hotel booking",
      "quest_type": "transaction",
      "reward_amount": 1000,
      "expires_at": null
    }
  ]
}
```

#### POST `/api/v1/quests/submit`

**Purpose:** Submit quest evidence

**Auth:** Required (Clerk)

**Request:**

```json
{
  "questId": "uuid",
  "evidence": {
    "url": "https://tiktok.com/@user/video/123",
    "notes": "Posted travel video"
  }
}
```

**Response:**

```json
{
  "success": true,
  "submission_id": "uuid",
  "status": "PENDING"
}
```

### User APIs

#### GET `/api/v1/user/status`

**Purpose:** Get user's Tcent balance and tier

**Auth:** Required (Clerk)

**Response:**

```json
{
  "tcent_balance": 5500,
  "tcent_pending": 1000,
  "membership_tier": "SILVER"
}
```

#### GET `/api/v1/user/ledger/history`

**Purpose:** Get transaction history

**Auth:** Required (Clerk)

**Response:**

```json
{
  "transactions": [
    {
      "id": "uuid",
      "amount": 1500,
      "transaction_type": "BOOKING_REWARD",
      "status": "AVAILABLE",
      "description": "Hotel booking at Marina Bay",
      "created_at": "2026-01-20T14:30:00Z"
    },
    {
      "amount": -2000,
      "transaction_type": "VOUCHER_PURCHASE",
      "description": "Redeemed: HOTEL20",
      "created_at": "2026-01-22T09:15:00Z"
    }
  ]
}
```

### Health Check

#### GET `/api/ping`

**Purpose:** System health monitoring

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-27T12:00:00Z",
  "services": {
    "flight_db": "ok",
    "hotel_db": "ok",
    "voucher_db": "ok"
  },
  "performance": {
    "voucher_db_response_time_ms": 45
  }
}
```

---

## Frontend Components

### Pages

#### `/rewards` - Rewards Dashboard

**Components:**

- `<BalanceHeader />` - Shows Tcent balance with history modal
- `<QuestCard />` - Active quests with submission UI
- `<VoucherSection />` - Featured vouchers carousel
- `<EarnList />` - Ways to earn Tcent
- `<UseGrid />` - How to use Tcent

**Features:**

- Real-time balance updates
- Transaction history modal
- Quest submission form
- Tier badge display

#### `/vouchers` - Voucher Marketplace

**Components:**

- `<VoucherHero />` - Header with Buy/Wallet toggle
- `<BalanceBanner />` - Current Tcent balance
- `<MarketplaceList />` - Grid of purchasable vouchers
- `<WalletList />` - User's owned vouchers

**Features:**

- Dual view: Marketplace vs Wallet
- Purchase drawer with confirmation
- Stock indicators
- Expiry warnings

### Component Library

#### Voucher Components (`components/vouchers/`)

**VoucherHero**

```tsx
<VoucherHero
  activeView="buy" | "wallet"
  onViewChange={(view) => {}}
/>
```

**MarketplaceList**

```tsx
<MarketplaceList
  vouchers={voucherData}
  userBalance={5500}
  onPurchase={(voucherId) => {}}
/>
```

**WalletList**

```tsx
<WalletList userVouchers={ownedVouchers} onApply={(voucherId) => {}} />
```

#### Reward Components (`components/rewards/`)

**BalanceHeader**

```tsx
<BalanceHeader
  balance={5500}
  pending={1000}
  tier="SILVER"
  onHistoryClick={() => {}}
/>
```

**QuestCard**

```tsx
<QuestCard quest={questData} onSubmit={(evidence) => {}} />
```

### Shared Types (`components/rewards/shared.ts`)

```typescript
export interface Voucher {
  id: string;
  code: string;
  voucher_type: string;
  discount_value: number;
  min_spend: number;
  tcent_price: number;
  stock_remaining?: number;
  expires_at?: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  reward_amount: number;
}

export type UserTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export const TIER_MULTIPLIERS: Record<UserTier, number> = {
  BRONZE: 1.0,
  SILVER: 1.1,
  GOLD: 1.2,
  PLATINUM: 1.5,
};
```

---

## Business Logic & Rules

### Tcent Calculation Logic

**File:** `lib/hotel/tcentCalculator.ts`

#### Calculate Tcent Earning

```typescript
export function calculateTcentEarning(
  booking_amount_cents: number,
  partner_earn_rate: number = 0.05,
  has_working_pass: boolean = false,
  user_tier: "standard" | "silver" | "gold" | "platinum" = "standard",
): TcentCalculation {
  // Base calculation (1 cent = 1 Tcent at partner rate)
  const base_tcent = Math.floor(booking_amount_cents * partner_earn_rate);

  // Working Pass bonus (50% extra)
  const working_pass_bonus = has_working_pass
    ? Math.floor(base_tcent * 0.5)
    : 0;

  // Tier bonus
  const tier_multipliers = {
    standard: 1.0,
    silver: 1.1,
    gold: 1.2,
    platinum: 1.5,
  };
  const tier_multiplier = tier_multipliers[user_tier];
  const tier_bonus =
    tier_multiplier > 1.0
      ? Math.floor(base_tcent * (tier_multiplier - 1.0))
      : 0;

  // Total
  const total_tcent = base_tcent + working_pass_bonus + tier_bonus;

  return {
    base_tcent,
    working_pass_bonus,
    tier_bonus,
    total_tcent,
  };
}
```

#### Calculate Tcent Redemption

```typescript
export function calculateTcentRedemption(
  booking_amount_cents: number,
  available_tcent: number,
  max_percentage: number = 0.3, // 30% max
): TcentRedemption {
  // Max redeemable (30% of booking)
  const max_redeemable_cents = Math.floor(
    booking_amount_cents * max_percentage,
  );
  const max_redeemable_tcent = Math.floor(max_redeemable_cents / 1.0);

  // Actual Tcent to use
  const tcent_to_use = Math.min(available_tcent, max_redeemable_tcent);
  const cents_value = Math.floor(tcent_to_use * 1.0);

  return {
    tcent_to_use,
    cents_value,
    max_redeemable: max_redeemable_tcent,
    max_percentage,
  };
}
```

#### Validation

```typescript
export function validateTcentRedemption(
  tcent_to_use: number,
  available_tcent: number,
  booking_amount_cents: number,
): { valid: boolean; error?: string } {
  if (tcent_to_use <= 0) {
    return { valid: false, error: "TCent amount must be positive" };
  }

  if (tcent_to_use > available_tcent) {
    return {
      valid: false,
      error: `Insufficient balance. Available: ${available_tcent}`,
    };
  }

  const max_redeemable = Math.floor(booking_amount_cents * 0.3);
  if (tcent_to_use > max_redeemable) {
    return {
      valid: false,
      error: `Maximum ${max_redeemable} TC (30% of booking)`,
    };
  }

  return { valid: true };
}
```

### Working Pass Integration

**File:** `lib/hotel/workingPassValidator.ts`

```typescript
export function validateWorkingPassBenefits(
  user_id: string,
  subscription_status: string,
): WorkingPassBenefits {
  const has_working_pass = subscription_status === "ACTIVE";

  if (!has_working_pass) {
    return {
      is_eligible: false,
      tcent_bonus_percentage: 0,
      benefits: [],
    };
  }

  const benefits = [
    "50% bonus TCent on all bookings",
    "10% discount on 3+ night stays",
    "Priority customer support",
    "Flexible cancellation",
  ];

  return {
    is_eligible: true,
    tcent_bonus_percentage: 0.5, // 50% bonus
    discount_percentage: 0.1, // 10% discount
    benefits,
  };
}
```

### Partner-Specific Rates

```typescript
export function getPartnerEarnRate(partner_code: string): number {
  const partner_rates: Record<string, number> = {
    DIRECT: 0.1, // 10% - Highest for direct bookings
    AGODA: 0.06, // 6%
    BOOKING: 0.05, // 5%
    EXPEDIA: 0.05, // 5%
    HOTELSCOM: 0.05, // 5%
  };

  return partner_rates[partner_code] || 0.05; // Default 5%
}
```

---

## Integration Points

### Flight Service Integration

**File:** `supabase/migrations/20260126_enhanced_flight_schema.sql`

```sql
CREATE TABLE flight_bookings (
  -- ... other fields

  -- Tcent Integration
  tcent_used INT DEFAULT 0,      -- Points redeemed
  tcent_earned INT DEFAULT 0,    -- Points earned
  payment_method TEXT,            -- CARD, TCENT, BANK_TRANSFER

  -- ... timestamps
);

CREATE TABLE flight_payments (
  -- ... other fields

  tcent_amount INT DEFAULT 0,    -- Partial payment with Tcent
  payment_method TEXT,

  -- ... timestamps
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID,

  amount INT NOT NULL,           -- Can be negative for redemption
  transaction_type TEXT NOT NULL, -- EARN, REDEEM

  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE loyalty_transactions IS 'Tcent points earning and redemption';
```

### Hotel Service Integration

Hotels use the same Tcent calculator for:

- Earning calculations on bookings
- Working Pass discount validation
- Redemption at checkout

### Booking Store Integration

**File:** `store/useBookingStore.ts`

```typescript
interface BookingState {
  // ... other fields
  useTcent: boolean;

  // ... methods
  toggleTcent: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  // ... other state
  useTcent: false,

  // ... other methods
  toggleTcent: () => set((state) => ({ useTcent: !state.useTcent })),
}));
```

### Shop Checkout Integration

**File:** `SHOP_USER_FLOW.md`

```markdown
## 4. Checkout (Payment & Shipping)

Key Interaction:

- **Payment**: Credit Card, TripC Wallet (Tcent), or Apple Pay
- **Promo Code**: Input voucher field
```

---

## Security & Anti-Fraud

### Abuse Prevention

#### 1. Referral Farming

**Risk:** Creating fake accounts to harvest referral bonuses

**Mitigation:**

- Track device fingerprints
- Require email/phone verification
- Limit referrals per IP address
- Manual review for suspicious patterns

#### 2. Double-Dip Prevention

**Risk:** Redeeming same voucher on multiple devices simultaneously

**Mitigation:**

- Optimistic locking on user balance updates
- Database constraint: `voucher_id + user_id` uniqueness
- Transaction-level isolation

**Code Example:**

```typescript
// Atomic balance update with optimistic locking
const { error } = await supabase
  .from("users")
  .update({ tcent_balance: user.tcent_balance - voucher_price })
  .eq("id", user.id)
  .eq("tcent_balance", user.tcent_balance); // Only update if unchanged

if (error) {
  return { error: "Balance changed, please retry" };
}
```

#### 3. Refund Gaming

**Risk:** Earning Tcent from booking, spending it, then cancelling booking

**Mitigation:**

- **Clawback Logic:** When booking is refunded, deduct earned Tcent
- **Pending Period:** Tcent from bookings stays PENDING for 24-48 hours
- **Negative Balance:** Allow temporary negative balance with recovery plan

**Implementation:**

```sql
-- Clawback trigger
CREATE OR REPLACE FUNCTION handle_booking_refund()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'REFUNDED' AND OLD.status != 'REFUNDED' THEN
    -- Find Tcent earned from this booking
    UPDATE users
    SET tcent_balance = tcent_balance - (
      SELECT COALESCE(SUM(amount), 0)
      FROM tcent_ledger
      WHERE reference_id = NEW.id
        AND reference_type = 'booking'
        AND amount > 0
    )
    WHERE id = NEW.user_id;

    -- Mark ledger entries as cancelled
    UPDATE tcent_ledger
    SET status = 'CANCELLED'
    WHERE reference_id = NEW.id
      AND reference_type = 'booking';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 4. Daily Earning Caps

**Rule:** Prevent bot farming

```typescript
async function validateDailyEarnings(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("tcent_ledger")
    .select("amount")
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00Z`)
    .eq("transaction_type", "QUEST_REWARD");

  const dailyTotal = data?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const DAILY_CAP = 5000; // 5000 Tcent = $50

  return dailyTotal < DAILY_CAP;
}
```

#### 5. Credential Stuffing

**Protection:**

- Clerk handles authentication security
- Rate limiting on API endpoints
- IP-based throttling
- 2FA for high-value accounts

### Row Level Security (RLS)

```sql
-- Users can only view their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON users
  FOR SELECT USING (clerk_id = auth.uid()::text);

CREATE POLICY "Users update own profile" ON users
  FOR UPDATE USING (clerk_id = auth.uid()::text);

-- Tcent ledger policies
ALTER TABLE tcent_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON tcent_ledger
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );
```

---

## Deployment Guide

### Database Setup

#### 1. Create Tables

```bash
# Connect to Supabase
psql -h db.xxx.supabase.co -U postgres -d postgres

# Run schema
\i Project/docs/SUPABASE_SCHEMA.sql
```

#### 2. Seed Initial Data

```bash
\i Project/docs/SEED_DATA.sql
```

**Sample Vouchers:**

- `HOTEL20` - $20 hotel credit (2000 TC)
- `LOUNGE_VIP` - VIP lounge access (3500 TC)
- `SPA_RETREAT` - $50 spa credit (5000 TC)
- `CONCERT_PASS` - Concert entry (8000 TC)
- `FLIGHT_DEAL` - $30 flight discount (4500 TC)

**Sample Quests:**

- Welcome to TripC - 500 TC
- First Booking - 1000 TC
- Social Sharer - 250 TC

#### 3. Verify Triggers

```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'tcent_status_change';

-- Test trigger
INSERT INTO tcent_ledger (user_id, amount, transaction_type, status)
VALUES ('test-user-id', 500, 'QUEST_REWARD', 'PENDING');

UPDATE tcent_ledger SET status = 'AVAILABLE' WHERE id = 'xxx';

-- Check user balance updated
SELECT tcent_balance, tcent_pending FROM users WHERE id = 'test-user-id';
```

### Environment Configuration

**File:** `.env.local`

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### API Deployment

1. **Verify Endpoints:**

```bash
curl https://yourapp.com/api/ping
curl https://yourapp.com/api/v1/vouchers/marketplace
```

2. **Test Authentication:**

```bash
# With Clerk token
curl -H "Authorization: Bearer $CLERK_TOKEN" \
     https://yourapp.com/api/v1/user/status
```

3. **Monitor Health:**

```bash
# Should return all services "ok"
curl https://yourapp.com/api/ping
```

### Production Checklist

- [ ] Database schema deployed
- [ ] Seed data loaded
- [ ] Triggers verified
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] RLS policies enabled
- [ ] Health check monitoring active
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] Backup strategy in place

---

## Known Issues & Edge Cases

### ✅ HANDLED

#### 1. Table Missing Scenarios

**Issue:** Vouchers table doesn't exist yet

**Solution:**

```typescript
if (error.code === "PGRST205") {
  console.warn("Vouchers table missing, returning empty list");
  return NextResponse.json({ vouchers: [] });
}
```

#### 2. Empty Request Bodies

**Issue:** `Unexpected end of JSON input`

**Solution:**

```typescript
let body;
try {
  const text = await req.text();
  body = text ? JSON.parse(text) : {};
} catch (parseError) {
  return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
}
```

#### 3. Race Conditions

**Issue:** Concurrent voucher purchases

**Solution:** Optimistic locking

```typescript
.update({ tcent_balance: newBalance })
.eq('id', userId)
.eq('tcent_balance', oldBalance)  // Only if unchanged
```

#### 4. User Auto-Creation

**Solution:**

```typescript
const { data: user, error: userError } = await supabase
  .from("users")
  .select("*")
  .eq("clerk_id", userId)
  .single();

if (userError?.code === "PGRST116") {
  // User doesn't exist, create
  await supabase.from("users").insert({
    clerk_id: userId,
    email: clerkUser.email,
    tcent_balance: 0,
    membership_tier: "BRONZE",
  });
}
```

### ⚠️ TODO

#### 1. Atomic Transactions

**Current:** Sequential updates (race condition possible)

**Needed:** Database functions for atomic operations

```sql
CREATE OR REPLACE FUNCTION exchange_voucher(
  p_user_id UUID,
  p_voucher_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Atomic transaction
  -- 1. Check & deduct balance
  -- 2. Issue voucher
  -- 3. Record ledger
  -- All or nothing

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
```

#### 2. Performance Optimization

- [ ] Add database connection pooling
- [ ] Cache voucher marketplace data (5 min TTL)
- [ ] Index optimization for queries
- [ ] Query result pagination

#### 3. Enhanced Monitoring

- [ ] Alert on failed transactions
- [ ] Track average redemption time
- [ ] Monitor Tcent circulation
- [ ] Fraud pattern detection

---

## Appendix

### File Locations

```
Project/
├── docs/
│   ├── SUPABASE_SCHEMA.sql          # Complete database schema
│   ├── SEED_DATA.sql                # Initial data
│   └── Tcent & voucher/
│       ├── VOUCHER_TCENT_INTEGRATION_REPORT.md
│       └── TCENT_VOUCHER_COMPLETE_DOCUMENTATION.md (this file)
│
├── app/
│   ├── rewards/
│   │   └── page.tsx                 # Rewards dashboard
│   ├── vouchers/
│   │   └── page.tsx                 # Voucher marketplace
│   └── api/
│       └── v1/
│           ├── vouchers/
│           │   ├── marketplace/route.ts
│           │   ├── wallet/route.ts
│           │   └── exchange/route.ts
│           ├── quests/
│           │   ├── available/route.ts
│           │   └── submit/route.ts
│           └── user/
│               ├── status/route.ts
│               └── ledger/history/route.ts
│
├── components/
│   ├── vouchers/
│   │   ├── VoucherHero.tsx
│   │   ├── MarketplaceList.tsx
│   │   ├── WalletList.tsx
│   │   └── BalanceBanner.tsx
│   └── rewards/
│       ├── BalanceHeader.tsx
│       ├── QuestCard.tsx
│       ├── VoucherSection.tsx
│       └── shared.ts
│
├── lib/
│   ├── hotel/
│   │   ├── tcentCalculator.ts      # Core Tcent calculations
│   │   └── workingPassValidator.ts # Working Pass logic
│   └── hooks/
│       └── useCurrentUser.ts       # User data hook
│
└── store/
    └── useBookingStore.ts          # Booking state with Tcent
```

### Quick Reference

**Conversion:**

- 100 Tcent = $1.00 USD
- 1 Tcent = 1 cent = $0.01

**Limits:**

- Max redemption: 30% of booking
- Daily quest cap: 5000 Tcent
- Max voucher uses: Varies per voucher

**Tier Multipliers:**

- Bronze: 1.0x
- Silver: 1.1x
- Gold: 1.2x
- Platinum: 1.5x

**Working Pass:**

- Earn bonus: +50% Tcent
- Discount: 10% on 3+ nights
- Requirement: Active subscription

### Support & Documentation

- **Main Docs:** `/docs/SUPABASE_SCHEMA.sql`
- **Integration Report:** `/docs/Tcent & voucher/VOUCHER_TCENT_INTEGRATION_REPORT.md`
- **API Testing:** Use `/api/ping` for health checks
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Supabase Dashboard:** https://app.supabase.com

---

**Status:** ✅ Production Ready  
**Last Review:** January 27, 2026  
**Next Review:** February 2026  
**Maintained By:** TripC Engineering Team
