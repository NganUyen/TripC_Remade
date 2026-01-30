# 💳 PayPal Payment Integration - Complete Guide

> **Comprehensive documentation for integrating PayPal payment gateway in full-stack applications (Node.js + Next.js/React)**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture & Flow](#architecture--flow)
3. [Backend Implementation (Node.js)](#backend-implementation-nodejs)
4. [Frontend Implementation (React/Next.js TSX)](#frontend-implementation-reactnextjs-tsx)
5. [Environment Configuration](#environment-configuration)
6. [Database Schema](#database-schema)
7. [Security Best Practices](#security-best-practices)
8. [Error Handling](#error-handling)
9. [Testing & Debugging](#testing--debugging)
10. [Production Checklist](#production-checklist)

---

## 🎯 Overview

### What This Covers

This PayPal integration supports:
- ✅ **Multiple payment modes**: Cart checkout, Buy-now, Retry payments, Custom tours, Tour requests
- ✅ **Currency conversion**: VND ↔ USD with precise rounding
- ✅ **Voucher/Promotion system**: Discount codes and calculations
- ✅ **Idempotent operations**: Prevent duplicate bookings
- ✅ **Real-time updates**: Socket.io for payment status
- ✅ **Seat management**: Hold and confirm seats during payment
- ✅ **Failed payment recovery**: Restore cart items on failure
- ✅ **Multi-language support**: Vietnamese & English

### Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React/Next.js (TypeScript/JSX), React Router
- **Payment**: PayPal REST API v2
- **Real-time**: Socket.io
- **Auth**: JWT Bearer tokens

---

## 🏗️ Architecture & Flow

### Payment Flow Diagram

```
┌─────────────┐
│   User      │
│  Checkout   │
└──────┬──────┘
       │
       │ 1. Click "Pay with PayPal"
       ▼
┌─────────────────────────────────────────┐
│  Frontend (CheckoutForm.jsx)            │
│  - Validates form (name, address, etc)  │
│  - Applies voucher discount             │
│  - Prepares payment payload             │
└──────┬──────────────────────────────────┘
       │
       │ 2. POST /api/paypal/create-order
       ▼
┌─────────────────────────────────────────┐
│  Backend (paypal.controller.js)         │
│  ┌────────────────────────────────────┐ │
│  │ createOrder():                     │ │
│  │  - buildChargeForUser()            │ │
│  │  - Calculate VND → USD             │ │
│  │  - getAccessToken()                │ │
│  │  - Create PayPal Order             │ │
│  │  - Save PaymentSession to DB       │ │
│  │  - Hold seats temporarily          │ │
│  │  - Return orderID                  │ │
│  └────────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       │ 3. Returns { orderID: "..." }
       ▼
┌─────────────────────────────────────────┐
│  Frontend                               │
│  - Redirects to PayPal checkout page    │
│    sandbox.paypal.com/checkoutnow       │
└──────┬──────────────────────────────────┘
       │
       │ 4. User approves/cancels on PayPal
       ▼
┌─────────────────────────────────────────┐
│  PayPal Payment Page                    │
│  - User logs in to PayPal               │
│  - Reviews order details                │
│  - Confirms payment                     │
└──────┬──────────────────────────────────┘
       │
       │ 5. Redirect to return_url?token=ORDER_ID
       ▼
┌─────────────────────────────────────────┐
│  Frontend (PaymentCallback.jsx)         │
│  - Detects PayPal token param           │
│  - Shows "Processing..." UI             │
└──────┬──────────────────────────────────┘
       │
       │ 6. POST /api/paypal/capture
       ▼
┌─────────────────────────────────────────┐
│  Backend (paypal.controller.js)         │
│  ┌────────────────────────────────────┐ │
│  │ captureOrder():                    │ │
│  │  - Check duplicate booking         │ │
│  │  - Load PaymentSession from DB     │ │
│  │  - getAccessToken()                │ │
│  │  - Capture payment via PayPal API  │ │
│  │  - Update PaymentSession status    │ │
│  │  - Mark voucher as used            │ │
│  │  - Confirm held seats              │ │
│  │  - Create Booking record           │ │
│  │  - Clear cart items                │ │
│  │  - Emit Socket.io events           │ │
│  │  - Track analytics                 │ │
│  │  - Return { success, bookingId }   │ │
│  └────────────────────────────────────┘ │
└──────┬──────────────────────────────────┘
       │
       │ 7. Returns success response
       ▼
┌─────────────────────────────────────────┐
│  Frontend (PaymentCallback.jsx)         │
│  - Shows success UI                     │
│  - Refreshes cart (remove items)        │
│  - Provides navigation buttons          │
└─────────────────────────────────────────┘
```

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| **Controller** | `paypal.controller.js` | Core payment logic |
| **Routes** | `paypal.routes.js` | API endpoints |
| **Helpers** | `paymentHelpers.js` | Shared utilities (booking, cart, seats) |
| **Frontend Form** | `CheckoutForm.jsx` | Payment UI & form validation |
| **Callback Handler** | `PaymentCallback.jsx` | Process return from PayPal |
| **Models** | `PaymentSession.js`, `Booking.js` | Data persistence |

---

## 🔧 Backend Implementation (Node.js)

### 1. Package Installation

```bash
npm install node-fetch @paypal/checkout-server-sdk mongoose express
```

**Key Dependencies:**
- `node-fetch`: HTTP client for PayPal API calls
- `mongoose`: MongoDB ODM for data persistence
- `express`: Web framework for API routes

### 2. PayPal Controller (`controller/paypal.controller.js`)

#### 2.1 Environment & Constants

```javascript
const fetch = global.fetch || ((...args) => import("node-fetch").then(({default: f}) => f(...args)));
const mongoose = require("mongoose");
const { Cart, CartItem } = require("../models/Carts");
const Tour = require("../models/agency/Tours");
const Booking = require("../models/Bookings");
const PaymentSession = require("../models/PaymentSession");

// Import unified helpers
const { 
  createBookingFromSession, 
  clearCartAfterPayment, 
  markBookingAsPaid, 
  markBookingAsFailed, 
  FX_VND_USD 
} = require("../utils/paymentHelpers");

// Exchange rate (VND → USD)
const FX = FX_VND_USD; // Example: 0.000039 (1 VND = 0.000039 USD)

// PayPal API base URL (sandbox vs live)
const PAYPAL_BASE = process.env.PAYPAL_MODE === "live" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

const isProd = process.env.NODE_ENV === 'production';
```

#### 2.2 Helper Functions

##### Currency Conversion

```javascript
/**
 * Convert VND to USD with 2 decimal precision
 * PayPal requires exactly 2 decimal places
 */
function toUSD(vnd) {
  const usd = (Number(vnd) || 0) * FX;
  return (Math.round(usd * 100) / 100).toFixed(2);
}
```

##### OAuth Token Generation

```javascript
/**
 * Get PayPal OAuth access token
 * Required for all PayPal API calls
 * Token expires in ~9 hours (cache if needed)
 */
async function getAccessToken() {
  const client = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET || process.env.PAYPAL_CLIENT_SECRET;

  if (!client || !secret) {
    throw Object.assign(new Error("MISSING_PAYPAL_CREDENTIALS"), { 
      status: 500, 
      detail: { hasClient: !!client, hasSecret: !!secret } 
    });
  }

  const auth = Buffer.from(`${client}:${secret}`).toString("base64");
  
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw Object.assign(new Error("PAYPAL_OAUTH_FAILED"), { 
      status: res.status, 
      raw: text 
    });
  }

  const data = await res.json();
  return data.access_token;
}
```

##### Build Payment Data

```javascript
/**
 * Build charge data based on payment mode
 * Supports: cart, buy-now, retry-payment, custom-tour, tour-request
 */
async function buildChargeForUser(userId, body) {
  const mode = body?.mode;

  // MODE 1: Cart checkout (selected items)
  if (mode === "cart") {
    const cart = await Cart.findOne({ userId });
    if (!cart) return { currency: "USD", items: [], totalVND: 0, cartItems: [] };

    const lines = await CartItem.find({ cartId: cart._id, selected: true });
    const items = [];
    const cartItems = [];
    let totalVND = 0;

    for (const line of lines) {
      const { name, image, unitPriceAdult, unitPriceChild } = 
        await getPricesAndMeta(line.tourId, line.date);
      
      const adults = Math.max(0, Number(line.adults) || 0);
      const children = Math.max(0, Number(line.children) || 0);
      const amt = unitPriceAdult * adults + unitPriceChild * children;
      totalVND += amt;

      items.push({
        sku: `${line.tourId}-${line.date}`,
        name: `${name} • ${line.date.slice(0, 10)}`,
        quantity: 1,
        unit_amount_vnd: amt,
        image,
      });

      cartItems.push({
        tourId: line.tourId,
        date: line.date.slice(0, 10),
        name,
        image,
        adults,
        children,
        unitPriceAdult,
        unitPriceChild
      });
    }

    return { currency: "USD", items, totalVND, cartItems };
  }

  // MODE 2: Buy-now (single item, skip cart)
  if (mode === "buy-now") {
    const item = body?.item || {};
    const tourId = item.tourId || item.id;
    if (!tourId || !item.date) {
      throw Object.assign(new Error("MISSING_TOUR_DATA"), { status: 400 });
    }

    const { name, image, unitPriceAdult, unitPriceChild } = 
      await getPricesAndMeta(tourId, item.date);
    
    const adults = Math.max(0, Number(item.adults) || 0);
    const children = Math.max(0, Number(item.children) || 0);
    const amt = unitPriceAdult * adults + unitPriceChild * children;

    return {
      currency: "USD",
      items: [{
        sku: `${tourId}-${item.date}`,
        name: `${name} • ${item.date}`,
        quantity: 1,
        unit_amount_vnd: amt,
        image,
      }],
      totalVND: amt,
      _buyNowMeta: { tourId, date: item.date, name, image, adults, children, unitPriceAdult, unitPriceChild }
    };
  }

  // MODE 3: Retry payment (failed booking)
  if (mode === "retry-payment") {
    const retryItems = body?.retryItems || [];
    if (!retryItems.length) {
      throw Object.assign(new Error("NO_RETRY_ITEMS"), { status: 400 });
    }

    const items = [];
    let totalVND = 0;

    for (const item of retryItems) {
      const adults = Math.max(0, Number(item.adults) || 0);
      const children = Math.max(0, Number(item.children) || 0);
      const amt = item.unitPriceAdult * adults + item.unitPriceChild * children;
      totalVND += amt;

      items.push({
        sku: `${item.tourId}-${item.date}`,
        name: `${item.name} • ${item.date}`,
        quantity: 1,
        unit_amount_vnd: amt,
        image: item.image,
      });
    }

    return {
      currency: "USD",
      items,
      totalVND,
      cartItems: retryItems,
      retryBookingId: body?.retryBookingId
    };
  }

  // MODE 4: Custom tour (pre-created booking)
  if (mode === "custom-tour") {
    const bookingId = body?.bookingId;
    if (!bookingId) {
      throw Object.assign(new Error("MISSING_BOOKING_ID"), { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking || booking.userId.toString() !== userId.toString()) {
      throw Object.assign(new Error("UNAUTHORIZED_BOOKING"), { status: 403 });
    }

    if (booking.payment?.status !== 'pending') {
      throw Object.assign(new Error("BOOKING_NOT_PENDING"), { status: 400 });
    }

    const totalVND = booking.payment.totalVND;
    const items = booking.items.map(item => ({
      sku: `custom-tour-${bookingId}`,
      name: item.name,
      quantity: 1,
      unit_amount_vnd: item.priceVND,
      image: booking.customTourRequest?.itineraryId?.thumbnail || '',
    }));

    return { currency: "USD", items, totalVND, cartItems: [], bookingId };
  }

  // MODE 5: Tour request (guide negotiation)
  if (mode === "tour-request") {
    const TourCustomRequest = require("../models/TourCustomRequest");
    const requestId = body?.requestId;
    
    if (!requestId) {
      throw Object.assign(new Error("MISSING_REQUEST_ID"), { status: 400 });
    }

    const tourRequest = await TourCustomRequest.findById(requestId);
    if (!tourRequest || tourRequest.userId.toString() !== userId.toString()) {
      throw Object.assign(new Error("UNAUTHORIZED_REQUEST"), { status: 403 });
    }

    if (tourRequest.status !== 'accepted') {
      throw Object.assign(new Error("REQUEST_NOT_ACCEPTED"), { status: 400 });
    }

    const finalAmount = tourRequest.latestOffer?.amount || tourRequest.initialBudget?.amount;
    if (!finalAmount) {
      throw Object.assign(new Error("NO_VALID_AMOUNT"), { status: 400 });
    }

    const items = [{
      sku: `tour-request-${requestId}`,
      name: tourRequest.title || 'Custom Tour Request',
      quantity: 1,
      unit_amount_vnd: finalAmount,
      image: tourRequest.thumbnail || '',
    }];

    return {
      currency: "USD",
      items,
      totalVND: finalAmount,
      cartItems: [],
      customRequestId: requestId
    };
  }

  throw Object.assign(new Error("UNSUPPORTED_MODE"), { status: 400 });
}
```

#### 2.3 Create Order Endpoint

```javascript
/**
 * POST /api/paypal/create-order
 * Creates PayPal order and payment session
 */
exports.createOrder = async (req, res) => {
  let stage = 'start';
  
  try {
    const userId = req.user.sub; // From JWT middleware
    const { mode } = req.body;

    // Build payment items based on mode
    stage = 'buildCharge';
    const { items, totalVND, currency, _buyNowMeta, cartItems, customRequestId } = 
      await buildChargeForUser(userId, req.body);

    // Apply discount from voucher/promotion
    const discountAmount = Number(req.body.discountAmount) || 0;
    const finalTotalVND = Math.max(0, totalVND - discountAmount);

    // Validation
    if (!items.length) {
      throw Object.assign(new Error("EMPTY_ITEMS"), { status: 400 });
    }

    if (finalTotalVND <= 0) {
      throw Object.assign(new Error("INVALID_AMOUNT"), { 
        status: 400, 
        detail: { finalTotalVND, totalVND, discountAmount } 
      });
    }

    // Get PayPal OAuth token
    stage = 'oauth';
    const accessToken = await getAccessToken();

    // ⚠️ CRITICAL: Consistent rounding to avoid price mismatch errors
    // Convert each line item to USD cents (integer), sum them, then convert back
    const lineCents = items.map(i => {
      const usd = Number(toUSD(i.unit_amount_vnd));
      return Math.round(usd * 100) * (i.quantity || 1);
    });
    
    const itemTotalCents = lineCents.reduce((a, b) => a + b, 0);
    const discountCents = Math.round(Number(toUSD(discountAmount)) * 100);
    const finalAmountCents = Math.max(0, itemTotalCents - discountCents);

    const itemsTotalUSD = (itemTotalCents / 100).toFixed(2);
    const discountUSD = (discountCents / 100).toFixed(2);
    const finalAmountUSD = (finalAmountCents / 100).toFixed(2);

    // Build PayPal order request body
    const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/+$/, '');
    
    const breakdown = {
      item_total: {
        currency_code: currency,
        value: itemsTotalUSD,
      },
    };

    if (discountCents > 0) {
      breakdown.discount = {
        currency_code: currency,
        value: discountUSD,
      };
    }

    const orderBody = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: finalAmountUSD,
          breakdown: breakdown
        },
      }],
      application_context: {
        return_url: `${CLIENT_URL}/payment/callback`,
        cancel_url: `${CLIENT_URL}/shoppingcarts`,
        brand_name: "Your Brand Name",
        shipping_preference: "NO_SHIPPING", // Digital goods
      },
    };

    // Create PayPal order
    stage = 'createOrder';
    const resp = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `order-${userId}-${Date.now()}` // Idempotency key
      },
      body: JSON.stringify(orderBody),
    });

    const respText = await resp.text();
    let data;
    
    try {
      data = respText ? JSON.parse(respText) : {};
    } catch (parseErr) {
      data = respText;
      console.warn("PayPal response not JSON:", respText);
    }

    if (!resp.ok) {
      console.error("PayPal create order failed:", data);
      throw Object.assign(new Error('PAYPAL_API_ERROR'), {
        status: resp.status,
        detail: isProd ? {} : { stage, status: resp.status, data }
      });
    }

    // ✅ CRITICAL: Save PaymentSession to database BEFORE returning orderID
    // This enables idempotency and recovery on capture
    let paymentSession;
    try {
      paymentSession = await PaymentSession.create({
        userId,
        provider: "paypal",
        orderId: data.id,
        requestId: `order-${userId}-${Date.now()}`,
        amount: finalTotalVND,
        status: "pending",
        mode: mode || 'cart',
        retryBookingId: req.body?.retryBookingId,
        customRequestId: customRequestId,
        items: items.map((i, idx) => {
          const tourId = i.sku?.split('-')[0];
          const date = _buyNowMeta?.date || i.sku?.substring(tourId?.length + 1);
          const cartItem = cartItems?.[idx];
          
          return {
            name: i.name,
            price: i.unit_amount_vnd,
            tourId: tourId && mongoose.isValidObjectId(tourId) ? tourId : undefined,
            meta: {
              date: date,
              adults: cartItem?.adults ?? _buyNowMeta?.adults ?? 0,
              children: cartItem?.children ?? _buyNowMeta?.children ?? 0,
              unitPriceAdult: cartItem?.unitPriceAdult ?? _buyNowMeta?.unitPriceAdult ?? 0,
              unitPriceChild: cartItem?.unitPriceChild ?? _buyNowMeta?.unitPriceChild ?? 0,
              image: i.image || cartItem?.image || _buyNowMeta?.image || ''
            }
          };
        }),
        voucherCode: req.body.promotionCode || req.body.voucherCode || undefined,
        discountAmount: discountAmount,
        rawCreateResponse: data,
      });

      // Hold seats temporarily (released after 10 minutes if not captured)
      const { holdSeatsForPayment } = require("../controller/payment.controller");
      await holdSeatsForPayment(paymentSession);
      
      console.log(`[PayPal] Payment session created: ${data.id}`);
    } catch (dbErr) {
      console.error("Failed to persist PayPal payment session:", dbErr);
      return res.status(500).json({ 
        error: "SESSION_PERSIST_FAILED", 
        detail: dbErr.message 
      });
    }

    // Return orderID to frontend for redirect
    res.json({ orderID: data.id });

  } catch (e) {
    console.error("createOrder error:", e.stack || e);
    res.status(e.status || 500).json({
      error: "CREATE_ORDER_FAILED",
      ...(isProd ? {} : { 
        debug: { 
          message: e.message, 
          code: e.code, 
          stage, 
          detail: e.detail 
        } 
      })
    });
  }
};
```

#### 2.4 Capture Order Endpoint

```javascript
/**
 * POST /api/paypal/capture
 * Captures approved PayPal payment and creates booking
 */
exports.captureOrder = async (req, res) => {
  const mongoSession = await mongoose.startSession();

  try {
    const userId = req.user.sub;
    const orderID = req.body.orderID;

    console.log("🔍 PAYPAL CAPTURE START - orderID:", orderID);

    // ✅ IDEMPOTENCY: Check if booking already exists
    const existingBooking = await Booking.findOne({ "payment.orderId": orderID });
    if (existingBooking) {
      console.log("✅ Booking already exists (idempotent):", existingBooking._id);
      return res.json({ success: true, bookingId: existingBooking._id });
    }

    // Load payment session from database
    let paymentSession = await PaymentSession.findOne({ 
      orderId: orderID, 
      provider: 'paypal' 
    });

    // Fallback: Try alternate lookups if not found
    if (!paymentSession) {
      console.warn("⚠️ PaymentSession not found by orderId, trying fallbacks...");
      
      // Try rawCreateResponse.id field
      paymentSession = await PaymentSession.findOne({ 
        'rawCreateResponse.id': orderID, 
        provider: 'paypal' 
      });

      // Last resort: Find recent pending session for this user
      if (!paymentSession) {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        paymentSession = await PaymentSession.findOne({
          provider: 'paypal',
          userId: userId,
          status: 'pending',
          createdAt: { $gte: tenMinutesAgo }
        }).sort({ createdAt: -1 });
      }
    }

    if (!paymentSession) {
      console.error("❌ Payment session not found after fallbacks");
      throw Object.assign(new Error("PAYMENT_SESSION_NOT_FOUND"), { status: 400 });
    }

    console.log("✅ Found payment session:", paymentSession._id);

    // Execute all operations in a transaction
    await mongoSession.withTransaction(async () => {
      // 1. Capture payment from PayPal
      const accessToken = await getAccessToken();
      const captureUrl = `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`;
      
      const captureRes = await fetch(captureUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const captureData = await captureRes.json();

      if (!captureRes.ok) {
        console.error("❌ PayPal capture failed:", captureData);
        throw Object.assign(new Error("PAYPAL_CAPTURE_FAILED"), { status: 422 });
      }

      console.log("✅ PayPal capture successful:", captureData.id);

      // 2. Update payment session
      paymentSession.status = 'paid';
      paymentSession.paymentStatus = 'completed';
      paymentSession.paidAt = new Date();
      paymentSession.rawCreateResponse = { 
        ...paymentSession.rawCreateResponse, 
        capture: captureData 
      };
      await paymentSession.save();

      // 3. Mark voucher as used (if applicable)
      if (paymentSession.voucherCode && paymentSession.userId) {
        try {
          const User = require("../models/Users");
          const Promotion = require("../models/Promotion");

          const promotion = await Promotion.findOne({
            code: paymentSession.voucherCode.toUpperCase(),
          });

          if (promotion) {
            // Increment usage count
            await Promotion.findByIdAndUpdate(
              promotion._id,
              { $inc: { usageCount: 1 } },
              { session: mongoSession }
            );

            // Mark user as having used this voucher
            await User.findByIdAndUpdate(
              paymentSession.userId,
              {
                $addToSet: {
                  usedPromotions: {
                    promotionId: promotion._id,
                    code: promotion.code,
                    usedAt: new Date(),
                  },
                },
              },
              { session: mongoSession }
            );

            console.log(`✅ Marked voucher ${paymentSession.voucherCode} as used`);
          }
        } catch (voucherError) {
          console.error("Voucher marking error:", voucherError);
          // Don't fail payment if voucher marking fails
        }
      }

      // 4. Confirm held seats
      console.log("🎫 Confirming held seats...");
      const { confirmSeatsForPayment } = require("../controller/payment.controller");
      await confirmSeatsForPayment(paymentSession);

      // 5. Create or update booking
      console.log("💾 Creating booking...");
      let booking;

      if (paymentSession.retryBookingId) {
        // Retry payment: update existing failed booking
        booking = await Booking.findById(paymentSession.retryBookingId);
        if (booking) {
          booking.status = 'paid';
          booking.payment.status = 'completed';
          booking.payment.paidAt = new Date();
          booking.payment.transactionId = captureData.id;
          booking.payment.paypalData = {
            captureId: captureData.id,
            payerId: captureData.payer?.payer_id,
            payerEmail: captureData.payer?.email_address,
            raw: captureData
          };
          await booking.save();
          console.log(`✅ Updated retry booking ${booking._id}`);
        } else {
          // Fallback to create new booking
          booking = await createBookingFromSession(paymentSession, { 
            capture: captureData,
            sessionId: paymentSession._id 
          });
        }
      } else {
        // Normal payment: create new booking
        booking = await createBookingFromSession(paymentSession, { 
          capture: captureData,
          sessionId: paymentSession._id 
        });
      }

      console.log("✅ Booking created:", booking._id);

      // 6. Update TourCustomRequest if applicable
      if (booking && booking.customTourRequest?.requestId) {
        try {
          const TourCustomRequest = require("../models/TourCustomRequest");
          await TourCustomRequest.findByIdAndUpdate(
            booking.customTourRequest.requestId,
            {
              $set: {
                paymentStatus: "paid",
                "payment.provider": "paypal",
                "payment.orderId": orderID,
                "payment.transactionId": captureData.id,
                "payment.status": "completed",
                "payment.paidAt": new Date(),
                "payment.amount": booking.totalAmount,
                "payment.currency": booking.currency,
                bookingId: booking._id,
                status: "accepted"
              }
            },
            { new: true, session: mongoSession }
          );
          console.log(`✅ Updated TourCustomRequest ${booking.customTourRequest.requestId}`);
        } catch (updateErr) {
          console.warn("TourCustomRequest update failed:", updateErr);
        }
      }

      // 7. Mark booking as paid (unified helper)
      console.log("💳 Marking booking as paid...");
      try {
        await markBookingAsPaid(orderID, {
          transactionId: captureData.id,
          paypal: {
            captureId: captureData.id,
            status: captureData.status,
            payer: captureData.payer
          }
        });

        // Track analytics (non-blocking)
        try {
          const TourInteraction = require('../models/TourInteraction');
          const crypto = require('crypto');
          
          for (const item of paymentSession.items) {
            const interaction = new TourInteraction({
              userId: paymentSession.userId,
              tourId: item.tourId,
              action: 'booking',
              bookingData: {
                adults: item.adults || 0,
                children: item.children || 0,
                totalPrice: item.subtotal || 0,
                departureDate: item.date || null
              },
              sessionId: `sess_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`
            });
            await interaction.save();
          }
        } catch (trackError) {
          console.error("Analytics tracking error:", trackError);
        }
      } catch (markError) {
        console.error("Booking mark-paid error:", markError);
      }

      // 8. Emit real-time Socket.io events
      try {
        const io = req.app?.get('io') || global.io;
        if (io && booking) {
          // Notify guide
          if (booking.customTourRequest?.guideId) {
            io.to(`user-${booking.customTourRequest.guideId}`).emit('paymentSuccessful', {
              bookingId: booking._id,
              requestId: booking.customTourRequest?.requestId,
              amount: booking.totalAmount,
              status: 'paid',
              message: 'Khách hàng đã thanh toán xong'
            });
          }
          
          // Notify traveller
          io.to(`user-${booking.userId}`).emit('paymentConfirmed', {
            bookingId: booking._id,
            status: 'paid',
            message: 'Thanh toán thành công'
          });
        }
      } catch (socketErr) {
        console.warn("Socket emit error:", socketErr);
      }

      console.log("✅ PAYPAL CAPTURE SUCCESS");
      res.json({ success: true, bookingId: booking._id });
    });

  } catch (e) {
    console.error("❌ PAYPAL CAPTURE FAILED:", e.message);
    
    // Mark session as failed and restore cart
    try {
      const paymentSession = await PaymentSession.findOne({ 
        orderId: req.body.orderID, 
        provider: 'paypal' 
      });
      
      if (paymentSession && paymentSession.status !== 'failed') {
        paymentSession.status = 'failed';
        await paymentSession.save();
        
        // Restore cart items
        const { restoreCartFromPaymentSession } = require("./payment.controller");
        await restoreCartFromPaymentSession(paymentSession);
        
        // Release held seats
        const { releaseSeatsForPayment } = require("../controller/payment.controller");
        await releaseSeatsForPayment(paymentSession);
        
        // Create failed booking record
        await markBookingAsFailed(req.body.orderID, {
          transactionId: req.body.orderID,
          paypal: {
            orderId: req.body.orderID,
            status: 'failed',
            error: e.message,
            failedAt: new Date()
          }
        });
      }
    } catch (failError) {
      console.error("Failed to record failure:", failError);
    }
    
    res.status(e.status || 500).json({ error: e.message || "CAPTURE_FAILED" });
  } finally {
    mongoSession.endSession();
  }
};
```

#### 2.5 Get Config Endpoint

```javascript
/**
 * GET /api/paypal/config
 * Returns PayPal client configuration for frontend
 */
exports.getConfig = (req, res) => {
  res.json({
    clientId: process.env.PAYPAL_CLIENT_ID,
    currency: "USD"
  });
};
```

### 3. PayPal Routes (`routes/paypal.routes.js`)

```javascript
const express = require("express");
const authJwt = require("../middlewares/authJwt");
const { createOrder, captureOrder, getConfig } = require("../controller/paypal.controller");

const router = express.Router();

// Get PayPal config (clientId, currency) for frontend
router.get("/config", getConfig);

// Create order on PayPal (cart or buy-now)
router.post("/create-order", authJwt, createOrder);

// Capture after user approves payment
router.post("/capture", authJwt, captureOrder);

module.exports = router;
```

### 4. Register Routes in Main Server

```javascript
// server.js or app.js
const paypalRoutes = require('./routes/paypal.routes');

app.use('/api/paypal', paypalRoutes);
```

---

## 💻 Frontend Implementation (React/Next.js TSX)

### 1. Package Installation

```bash
npm install @paypal/react-paypal-js axios react-router-dom lucide-react
```

### 2. Checkout Form Component (`components/CheckoutForm.jsx`)

```tsx
import React, { useState, useEffect } from "react";
import { Lock, CreditCard, Wallet } from "lucide-react";
import { useAuth } from "@/auth/context";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function CheckoutForm({ 
  mode = "cart", 
  buyNowItem = null,
  totalAmount = 0,
  summaryItems = []
}) {
  const { user, withAuth } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(totalAmount);
  
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    provinceId: "",
    wardId: "",
    addressLine: "",
  });

  // Update final total when voucher changes
  useEffect(() => {
    setFinalTotal(totalAmount - discountAmount);
  }, [totalAmount, discountAmount]);

  const isFormValid = 
    userInfo.name && 
    userInfo.email && 
    userInfo.phone &&
    userInfo.provinceId && 
    userInfo.wardId && 
    userInfo.addressLine;

  const handlePayment = async () => {
    // Prevent double-click
    if (isProcessingPayment) {
      console.log("⚠️ Payment already in progress");
      return;
    }

    if (!user?.token) {
      alert("Vui lòng đăng nhập để tiếp tục");
      return;
    }

    if (!isFormValid) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (!selectedPayment) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (selectedPayment === "paypal") {
      try {
        setIsProcessingPayment(true);

        const payload = {
          mode,
          ...(mode === "buy-now" && { item: buyNowItem }),
          ...(appliedVoucher && {
            promotionCode: appliedVoucher.code,
            discountAmount: discountAmount,
            finalAmount: finalTotal,
          }),
        };

        console.log("📦 Creating PayPal order:", payload);
        
        const respJson = await withAuth('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const { orderID } = respJson || {};

        if (!orderID) {
          throw new Error("Không nhận được orderID từ server");
        }

        console.log("✅ Order created, redirecting to PayPal:", orderID);

        // Redirect to PayPal
        const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderID}`;
        window.location.href = paypalUrl;

      } catch (error) {
        console.error("❌ PayPal payment error:", error);
        const serverBody = error?.body || error?.detail || {};
        const userMsg = serverBody?.error || error.message || 'Lỗi khi tạo đơn PayPal';
        alert(`Lỗi thanh toán: ${userMsg}`);
        setIsProcessingPayment(false);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl">
      <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>

      {/* User info form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Thông tin người đặt</h2>
        {/* Add form inputs for name, email, phone, address... */}
      </div>

      {/* Payment methods */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Phương thức thanh toán
        </h2>

        <div className="space-y-3">
          {/* PayPal */}
          <div
            onClick={() => setSelectedPayment("paypal")}
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              selectedPayment === "paypal" 
                ? "border-blue-500 bg-blue-50" 
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPayment === "paypal" ? "border-blue-500" : "border-gray-300"
                }`}>
                  {selectedPayment === "paypal" && (
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  )}
                </div>
                <CreditCard className="w-6 h-6 text-gray-700" />
                <span className="font-medium text-gray-900">PayPal</span>
              </div>
              <img
                src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg"
                alt="PayPal"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment button */}
      <button
        onClick={handlePayment}
        disabled={!selectedPayment || !isFormValid || isProcessingPayment}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          selectedPayment && isFormValid && !isProcessingPayment
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {isProcessingPayment 
          ? "Đang xử lý..." 
          : `Thanh toán ${finalTotal.toLocaleString('vi-VN')}₫`
        }
      </button>
    </div>
  );
}
```

### 3. Payment Callback Page (`pages/PaymentCallback.jsx`)

```tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/context";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_BASE_ROOT = String(API_BASE).replace(/\/api\/?$/i, '');

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const [bookingId, setBookingId] = useState(null);
  const [provider, setProvider] = useState(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const run = async () => {
      // Detect PayPal callback
      const paypalOrderId = searchParams.get('token');

      if (paypalOrderId) {
        try {
          setStatus('processing');
          setProvider('paypal');
          setMessage('Đang xác nhận thanh toán PayPal...');

          const resp = await fetch(`${API_BASE_ROOT}/api/paypal/capture`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.token}`,
            },
            credentials: 'include',
            body: JSON.stringify({ orderID: paypalOrderId })
          });

          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            throw new Error(err.error || 'Thanh toán thất bại');
          }

          const data = await resp.json();

          if (data.success && data.bookingId) {
            setStatus('success');
            setMessage('Thanh toán PayPal thành công!');
            setBookingId(data.bookingId);
          } else {
            throw new Error('Không thể hoàn tất thanh toán');
          }
        } catch (e) {
          console.error('PayPal callback error:', e);
          setStatus('error');
          setMessage(e.message || 'Lỗi thanh toán PayPal');
        }
        return;
      }

      // No supported params
      setStatus('error');
      setMessage('Thiếu tham số nhận kết quả thanh toán');
    };

    run();
  }, [searchParams, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {status === "processing" && (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thành công!</h2>
              <p className="text-gray-600 mb-4">{message}</p>
              {bookingId && (
                <p className="text-sm text-gray-500 mb-6">Mã đặt chỗ: {bookingId}</p>
              )}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate("/profile/booking-history")}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Xem vé của tôi
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50"
                >
                  Về trang chủ
                </button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thất bại</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <button
                onClick={() => navigate("/shoppingcarts")}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Quay lại giỏ hàng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 4. Setup Routes

```tsx
// App.tsx or router config
import PaymentCallback from "./pages/PaymentCallback";

<Route path="/payment/callback" element={<PaymentCallback />} />
```

---

## ⚙️ Environment Configuration

### Backend `.env`

```bash
# ==========================================
# PayPal Configuration
# Get from: https://developer.paypal.com/dashboard/
# ==========================================
PAYPAL_CLIENT_ID=YOUR_PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET=YOUR_PAYPAL_CLIENT_SECRET
PAYPAL_MODE=sandbox  # Use 'live' for production

# ==========================================
# Exchange Rate (VND to USD)
# Update daily for accurate conversion
# ==========================================
FX_VND_USD=0.000039  # 1 VND = 0.000039 USD (example)

# ==========================================
# Frontend URL (for return/cancel URLs)
# ==========================================
CLIENT_URL=http://localhost:5173  # Production: https://yourdomain.com

# ==========================================
# Database
# ==========================================
MONGO_URI=mongodb://localhost:27017/your_database
```

### Frontend `.env`

```bash
# API Base URL
VITE_API_URL=http://localhost:4000

# For production
# VITE_API_URL=https://api.yourdomain.com
```

### Getting PayPal Credentials

1. **Create PayPal Developer Account**
   - Go to [developer.paypal.com](https://developer.paypal.com)
   - Sign up or log in

2. **Create Sandbox App**
   - Navigate to Dashboard → My Apps & Credentials
   - Create New App under "Sandbox"
   - Copy **Client ID** and **Secret**

3. **Testing Credentials**
   - Use Sandbox Business Account for testing
   - Test credit cards: [PayPal Sandbox Cards](https://developer.paypal.com/tools/sandbox/card-testing/)

4. **Production Setup**
   - Create app under "Live" environment
   - Submit for review if required
   - Update `PAYPAL_MODE=live`

---

## 📊 Database Schema

### PaymentSession Model

```javascript
const mongoose = require('mongoose');

const PaymentSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  provider: { 
    type: String, 
    enum: ['paypal', 'momo', 'vnpay'], 
    required: true 
  },
  orderId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  requestId: String,
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'expired'], 
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  mode: { 
    type: String, 
    enum: ['cart', 'buy-now', 'retry-payment', 'custom-tour', 'tour-request'], 
    default: 'cart' 
  },
  items: [{
    name: String,
    price: Number,
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
    meta: {
      date: String,
      adults: Number,
      children: Number,
      unitPriceAdult: Number,
      unitPriceChild: Number,
      image: String
    }
  }],
  voucherCode: String,
  discountAmount: { type: Number, default: 0 },
  retryBookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  customRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'TourCustomRequest' },
  paidAt: Date,
  rawCreateResponse: mongoose.Schema.Types.Mixed,
}, { 
  timestamps: true 
});

// Index for cleanup jobs
PaymentSessionSchema.index({ createdAt: 1, status: 1 });

module.exports = mongoose.model('PaymentSession', PaymentSessionSchema);
```

### Booking Model

```javascript
const BookingSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bookingCode: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  items: [{
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' },
    name: String,
    image: String,
    date: String,
    adults: Number,
    children: Number,
    unitPriceAdult: Number,
    unitPriceChild: Number,
  }],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  originalAmount: Number,
  discountAmount: { type: Number, default: 0 },
  currency: { 
    type: String, 
    default: 'VND' 
  },
  voucherCode: String,
  payment: {
    provider: { 
      type: String, 
      enum: ['paypal', 'momo', 'vnpay'],
      required: true
    },
    orderId: { 
      type: String, 
      required: true,
      index: true
    },
    transactionId: String,
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'], 
      default: 'pending' 
    },
    paidAt: Date,
    paypalData: mongoose.Schema.Types.Mixed,
    raw: mongoose.Schema.Types.Mixed,
  },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'cancelled', 'completed', 'refunded'], 
    default: 'pending' 
  },
  customTourRequest: {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'TourCustomRequest' },
    guideId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    itineraryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' }
  },
  totalVND: Number,
  totalUSD: Number,
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Booking', BookingSchema);
```

---

## 🔒 Security Best Practices

### 1. **Never Expose Secrets on Frontend**
```javascript
// ❌ WRONG
const secret = 'your_paypal_secret';

// ✅ CORRECT - Keep on backend only
const secret = process.env.PAYPAL_CLIENT_SECRET;
```

### 2. **Validate User Authorization**
```javascript
// Check user owns the resource
if (booking.userId.toString() !== userId.toString()) {
  throw Object.assign(new Error("UNAUTHORIZED"), { status: 403 });
}
```

### 3. **Use HTTPS in Production**
```javascript
// Enforce HTTPS redirect
if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
  return res.redirect('https://' + req.hostname + req.url);
}
```

### 4. **Implement Idempotency**
```javascript
// Prevent duplicate bookings
const existingBooking = await Booking.findOne({ "payment.orderId": orderID });
if (existingBooking) {
  return res.json({ success: true, bookingId: existingBooking._id });
}
```

### 5. **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many payment requests, please try again later'
});

router.post('/create-order', paymentLimiter, authJwt, createOrder);
```

### 6. **Sanitize User Input**
```javascript
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>\"']/g, ''); // Remove HTML/script tags
};
```

### 7. **Secure Session Storage**
```javascript
// Use secure cookies in production
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

---

## ⚠️ Error Handling

### Common Errors & Solutions

#### 1. **INVALID_AMOUNT - Item total mismatch**

**Error:**
```json
{
  "error": "PAYPAL_API_ERROR",
  "detail": {
    "name": "INVALID_REQUEST",
    "message": "Request is not well-formed, syntactically incorrect, or violates schema.",
    "details": [{
      "issue": "ITEM_TOTAL_MISMATCH",
      "description": "Should equal item total + tax + shipping - discount"
    }]
  }
}
```

**Solution:**
```javascript
// Use consistent cent-based rounding
const lineCents = items.map(i => {
  const usd = Number(toUSD(i.unit_amount_vnd));
  return Math.round(usd * 100) * (i.quantity || 1);
});

const itemTotalCents = lineCents.reduce((a, b) => a + b, 0);
const itemsTotalUSD = (itemTotalCents / 100).toFixed(2);

// Ensure breakdown.item_total === amount.value (after discount)
```

#### 2. **PAYMENT_SESSION_NOT_FOUND**

**Error:**
```json
{
  "error": "PAYMENT_SESSION_NOT_FOUND"
}
```

**Solution:**
```javascript
// Implement fallback lookups
let paymentSession = await PaymentSession.findOne({ orderId: orderID });

if (!paymentSession) {
  // Try alternate field
  paymentSession = await PaymentSession.findOne({ 
    'rawCreateResponse.id': orderID 
  });
}

if (!paymentSession) {
  // Find recent pending session for user
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  paymentSession = await PaymentSession.findOne({
    userId: userId,
    status: 'pending',
    createdAt: { $gte: tenMinutesAgo }
  }).sort({ createdAt: -1 });
}
```

#### 3. **AUTHENTICATION_FAILURE (401)**

**Error:**
```json
{
  "error": "PAYPAL_OAUTH_FAILED",
  "status": 401
}
```

**Solution:**
```javascript
// Check credentials format
const client = process.env.PAYPAL_CLIENT_ID;
const secret = process.env.PAYPAL_CLIENT_SECRET;

console.log('Client ID length:', client?.length); // Should be ~80 chars
console.log('Secret length:', secret?.length); // Should be ~80 chars

// Ensure no trailing spaces
const auth = Buffer.from(`${client.trim()}:${secret.trim()}`).toString("base64");
```

#### 4. **Duplicate Booking Prevention**

```javascript
// Idempotent capture
const existingBooking = await Booking.findOne({ "payment.orderId": orderID });
if (existingBooking) {
  console.log("✅ Booking already exists (idempotent):", existingBooking._id);
  return res.json({ success: true, bookingId: existingBooking._id });
}
```

#### 5. **Transaction Rollback on Failure**

```javascript
const mongoSession = await mongoose.startSession();

try {
  await mongoSession.withTransaction(async () => {
    // All operations here...
    // If any throws, entire transaction rolls back
  });
} catch (e) {
  // Session auto-aborts, changes rolled back
  console.error("Transaction failed:", e);
} finally {
  mongoSession.endSession();
}
```

---

## 🧪 Testing & Debugging

### Test Cards (Sandbox)

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4032039674389219 | 123 | Any future date |
| MasterCard | 5425233430109903 | 123 | Any future date |
| Amex | 374245455400126 | 1234 | Any future date |

### Test Scenarios

#### 1. **Cart Checkout Flow**
```javascript
// Test data
const payload = {
  mode: "cart",
  discountAmount: 50000,
  promotionCode: "SUMMER2024"
};

// Expected: Creates order, holds seats, redirects to PayPal
// After approval: Creates booking, clears cart, confirms seats
```

#### 2. **Buy-Now Flow**
```javascript
const payload = {
  mode: "buy-now",
  item: {
    tourId: "65abc123def456789",
    date: "2024-12-25",
    adults: 2,
    children: 1
  }
};

// Expected: Direct payment without cart interaction
```

#### 3. **Retry Failed Payment**
```javascript
const payload = {
  mode: "retry-payment",
  retryBookingId: "65xyz789abc123def",
  retryItems: [
    {
      tourId: "65abc123def456789",
      date: "2024-12-25",
      name: "Hạ Long Bay Tour",
      adults: 2,
      children: 1,
      unitPriceAdult: 500000,
      unitPriceChild: 250000,
      image: "https://..."
    }
  ]
};

// Expected: Updates existing failed booking to paid
```

### Debug Logging

```javascript
// Enable detailed logging
console.log("🔍 Creating PayPal order:");
console.log("   userId:", userId);
console.log("   mode:", mode);
console.log("   items:", JSON.stringify(items, null, 2));
console.log("   totalVND:", totalVND);
console.log("   discountAmount:", discountAmount);
console.log("   finalAmountUSD:", finalAmountUSD);
console.log("   breakdown:", JSON.stringify(breakdown, null, 2));
```

### Postman Collection

```json
{
  "info": {
    "name": "PayPal Integration Tests"
  },
  "item": [
    {
      "name": "Get Config",
      "request": {
        "method": "GET",
        "url": "{{API_BASE}}/api/paypal/config"
      }
    },
    {
      "name": "Create Order - Cart",
      "request": {
        "method": "POST",
        "url": "{{API_BASE}}/api/paypal/create-order",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{JWT_TOKEN}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"mode\": \"cart\",\n  \"discountAmount\": 0\n}"
        }
      }
    },
    {
      "name": "Capture Order",
      "request": {
        "method": "POST",
        "url": "{{API_BASE}}/api/paypal/capture",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{JWT_TOKEN}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"orderID\": \"{{PAYPAL_ORDER_ID}}\"\n}"
        }
      }
    }
  ]
}
```

---

## ✅ Production Checklist

### Pre-Launch

- [ ] **Environment Variables**
  - [ ] `PAYPAL_MODE=live`
  - [ ] Live `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
  - [ ] Correct `CLIENT_URL` (production domain)
  - [ ] Update `FX_VND_USD` exchange rate

- [ ] **Security**
  - [ ] Enable HTTPS/SSL certificate
  - [ ] Set secure cookies (`secure: true`)
  - [ ] Enable CORS whitelist (remove `*`)
  - [ ] Implement rate limiting
  - [ ] Add Helmet.js security headers
  - [ ] Sanitize all user inputs

- [ ] **Database**
  - [ ] Create indexes on `PaymentSession.orderId`, `Booking.payment.orderId`
  - [ ] Set up daily backups
  - [ ] Test MongoDB transaction support
  - [ ] Configure replica set (for transactions)

- [ ] **Monitoring**
  - [ ] Set up error tracking (Sentry, Rollbar)
  - [ ] Configure logging (Winston, Morgan)
  - [ ] Add payment analytics tracking
  - [ ] Set up uptime monitoring

- [ ] **Testing**
  - [ ] Test complete payment flow end-to-end
  - [ ] Verify email notifications work
  - [ ] Test failed payment recovery
  - [ ] Verify seat hold/release logic
  - [ ] Test with various discount scenarios
  - [ ] Load test with concurrent payments

- [ ] **Documentation**
  - [ ] Update API documentation
  - [ ] Create runbook for payment issues
  - [ ] Document refund process
  - [ ] Prepare support FAQ

### Go-Live

- [ ] **Gradual Rollout**
  - [ ] Enable for internal team first
  - [ ] Beta test with select users
  - [ ] Monitor error rates closely
  - [ ] Full public launch

- [ ] **Post-Launch**
  - [ ] Monitor first 100 transactions
  - [ ] Track conversion rates
  - [ ] Review error logs daily
  - [ ] Optimize performance bottlenecks

### Maintenance

- [ ] **Daily**
  - [ ] Monitor failed payments
  - [ ] Review error logs
  - [ ] Check exchange rate accuracy

- [ ] **Weekly**
  - [ ] Clean up expired payment sessions
  - [ ] Review analytics dashboard
  - [ ] Update documentation

- [ ] **Monthly**
  - [ ] PayPal reconciliation
  - [ ] Security audit
  - [ ] Performance review

---

## 📚 Additional Resources

### Official Documentation
- [PayPal REST API Reference](https://developer.paypal.com/api/rest/)
- [PayPal Orders v2](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal Webhooks](https://developer.paypal.com/api/rest/webhooks/)

### Best Practices
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [12-Factor App](https://12factor.net/)

### Tools
- [PayPal Sandbox](https://developer.paypal.com/tools/sandbox/)
- [Postman API Testing](https://www.postman.com/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

---

## 🎓 Key Takeaways

### What Makes This Implementation Production-Ready

1. **Idempotency** - Prevents duplicate charges even if user refreshes
2. **Atomic Transactions** - MongoDB sessions ensure data consistency
3. **Seat Management** - Hold seats during payment, release on failure
4. **Multiple Payment Modes** - Cart, buy-now, retry, custom tours
5. **Voucher Support** - Discount codes with validation
6. **Error Recovery** - Restore cart on failure, create failed bookings
7. **Real-time Updates** - Socket.io for instant status changes
8. **Analytics Tracking** - Record user interactions for recommendations
9. **Security First** - JWT auth, input validation, HTTPS enforcement
10. **Developer Experience** - Comprehensive logging, clear error messages

### Common Pitfalls to Avoid

- ❌ Not using cent-based rounding (causes ITEM_TOTAL_MISMATCH)
- ❌ Exposing PayPal secret on frontend
- ❌ Not implementing idempotency (duplicate bookings)
- ❌ Missing transaction rollback (inconsistent data)
- ❌ Hard-coded URLs (breaks in different environments)
- ❌ No seat hold mechanism (overselling)
- ❌ Ignoring currency conversion precision
- ❌ Not validating user authorization

---

## 📞 Support & Contribution

**Created by:** Your Development Team  
**Last Updated:** January 2026  
**Version:** 2.0.0

For questions or improvements, please:
- Open an issue in the project repository
- Contact the development team
- Check PayPal Developer Community

---

**Happy Coding! 🚀**
