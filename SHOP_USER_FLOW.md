# TripC Shop User Flow

This document outlines the standard user journey for purchasing items in the TripC Shop.

## 1. Discovery (Shop Home)
**Route:** `/shop`

*   **Goal**: Find products of interest.
*   **Key Interaction**:
    *   **Hero Section**: Highlights featured collections and promotions.
    *   **Search Console**: Users search by keywords (e.g., "Suitcase").
    *   **Categories**: Quick filter chips (Travel Gear, Souvenirs, Essentials).
    *   **Product Grid**: Browsing cards with quick "Add to Cart" or "View" actions.
*   **Next Step**: Click on a Product Card -> Go to **Product Detail**.

## 2. Selection (Product Detail)
**Route:** `/shop/[id]`

*   **Goal**: Configure item and add to purchase list.
*   **Key Interaction**:
    *   **Gallery**: View high-res images.
    *   **Configuration**: Select variants (Size, Color, Quantity).
    *   **Info**: Read description, specs, and reviews.
    *   **Action**: Click "Add to Cart" (Opens Cart Drawer) or "Buy Now" (Goes straight to Checkout).
*   **Next Step**: "Add to Cart" -> Open **Cart Drawer**.

## 3. Review (Cart Drawer / Modal)
**Component:** `CartDrawer` (Overlay)

*   **Goal**: Review selected items and subtotal.
*   **Key Interaction**:
    *   **List**: detailed list of items with thumbnails.
    *   **Edit**: Update quantity or remove items.
    *   **Summary**: View subtotal, estimated shipping.
    *   **Upsell**: "You might also like" recommendations.
*   **Next Step**: Click "Checkout" -> Go to **Checkout Page**.

## 4. Checkout (Payment & Shipping)
**Route:** `/checkout` (or `/shop/checkout`)

*   **Goal**: Finalize purchase details.
*   **Key Interaction**:
    *   **Shipping**: Enter address/contact info.
    *   **Delivery Method**: Standard vs Express.
    *   **Payment**: Credit Card, TripC Wallet (Tcent), or Apple Pay.
    *   **Promo Code**: Input voucher field.
*   **Next Step**: Click "Place Order" -> Go to **Confirmation**.

## 5. Confirmation (Order Success)
**Route:** `/shop/order/[id]`

*   **Goal**: Confirm receipt and provide tracking.
*   **Key Interaction**:
    *   **Status**: "Order Confirmed" success message.
    *   **Summary**: Order reference number, total paid.
    *   **Actions**: "Track Order" or "Continue Shopping".
*   **Post-Interaction**: Email confirmation sent to user.
