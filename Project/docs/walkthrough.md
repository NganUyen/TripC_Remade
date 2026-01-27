# TripC Pro: Tcent Rewards Walkthrough

## 1. Rewards Dashboard
The central hub for user loyalty.
- **Balance Header**: dynamic display of Tcent balance with Tier Multiplier.
- **Earn List**: Tasks users can complete to earn Tcents.
- **Voucher Marketplace**: Users can redeem points for vouchers.

## 2. Tcent History Feature
**Goal**: Allow users to track their earnings and spending.
- **History Button**: Located in the top-right of the Balance Banner on both the *Rewards* and *Vouchers* pages.
- **Interactive Modal**: Displays a scrollable list of transactions fetched from the database.
- **API**: `GET /api/v1/ledger/history` securely fetches user-specific ledger entries.

## 3. Voucher & Wallet System
**Goal**: A complete lifecycle for digital rewards.
- **Marketplace**: Browse active vouchers (Hotels, Transport, Wellness).
- **Purchase Flow**: Smart checks for balance and stock before deducting points.
- **My Vouchers (Wallet)**:
    - Dedicated view for purchased items.
    - **Global Expiry**: Displays specific expiry dates derived from the main voucher definition (`1/25/2027`).
    - **Consistent UI**: Unified card design across Marketplace and Wallet.

## 4. API Summary
| Method | Endpoint | Purpose |
| :--- | :--- | :--- |
| `GET` | `/api/v1/user/status` | Fetch Balance & Tier |
| `GET` | `/api/v1/ledger/history` | **[NEW]** Transaction History |
| `GET` | `/api/v1/vouchers/marketplace` | List purchasable vouchers |
| `GET` | `/api/v1/vouchers/wallet` | List user's purchased vouchers |
| `POST` | `/api/v1/vouchers/exchange` | Handle purchase transaction |

## Verification
- [x] **Redemption**: Verified users can buy vouchers (Balance decreases, Voucher appears in wallet).
- [x] **History**: Verified "Redeemed: [Code]" appears in history after purchase.
- [x] **Expiry**: Verified dates are correctly displayed from the global source.
