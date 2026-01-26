# Flight Service - Business Flow Analysis

**Date**: January 26, 2026  
**Analyst**: Senior BA & Fullstack Developer  
**Purpose**: Gap analysis between flowchart and current implementation

---

## Executive Summary

The current MVP implementation covers ~25% of the complete business flow. Critical gaps exist in:

- Supplier integration and offer normalization
- Fare rules and flexible booking options
- Payment processing and ticket issuance
- Post-booking management and notifications

---

## Flowchart Module Breakdown

### **MODULE A - SEARCH & SELECTION**

**Purpose**: Flight search and initial offer presentation

#### Current Implementation ✅

- ✅ Search Widget (basic form)
- ✅ Search API endpoint
- ✅ Database query for flights
- ✅ Basic filtering (origin, destination, date)

#### Missing Features ❌

- ❌ Long-poll API for supplier queries
- ❌ Multi-supplier integration (Amadeus, Sabre, etc.)
- ❌ Offer normalization across suppliers
- ❌ Advanced filtering (price range, carriers, stops)
- ❌ Sorting options (price, duration, departure time)
- ❌ Passenger count validation
- ❌ Date availability checking

**Business Impact**: Limited inventory, no real-time supplier data, poor user filtering experience

---

### **MODULE B - OFFERS & PRESENTATION**

**Purpose**: Display and filter available offers

#### Current Implementation ✅

- ✅ Basic offer storage (flight_offers table)
- ✅ Price and availability tracking

#### Missing Features ❌

- ❌ User preference storage (Clerk/AI check)
- ❌ Offer filtering UI/API (by cabin class, price, carrier)
- ❌ Sort functionality
- ❌ Offer expiration handling
- ❌ Multi-offer comparison
- ❌ Popular/Flexible flow differentiation

**Business Impact**: Poor conversion, no personalization, limited offer presentation

---

### **MODULE C - BOOKING & CHECKOUT & ISSUE**

**Purpose**: Complete booking with payment and ticketing

#### Current Implementation ✅

- ✅ Basic booking creation
- ✅ Passenger info storage (JSONB)
- ✅ PNR generation
- ✅ Booking status tracking

#### Missing Features ❌

**Critical Gaps:**

- ❌ Fare rules display and acceptance
- ❌ Payment integration (PayOS/Stripe)
- ❌ Payment status tracking
- ❌ Ticket issuance workflow
- ❌ Hold/Soft booking (time-based)
- ❌ Half-price/waive charges logic
- ❌ Failure compensation flow
- ❌ Email/SMS notifications
- ❌ Receipt/invoice generation
- ❌ Contact info validation
- ❌ Card payment processing

**Business Impact**: Cannot complete real bookings, no revenue generation, no customer confirmation

---

### **MODULE D - POST BOOKING/MANAGEMENT**

**Purpose**: Manage bookings after confirmation

#### Current Implementation ✅

- ✅ Get booking by ID
- ✅ Cancel booking (soft delete)
- ✅ User-specific booking retrieval

#### Missing Features ❌

- ❌ Retrieve booking segments
- ❌ Print/email check-in
- ❌ Inventory synchronization
- ❌ Prize/loyalty points integration
- ❌ Confirmation email with details
- ❌ Booking modification
- ❌ Refund processing
- ❌ Dispute management

**Business Impact**: Poor customer service, no self-service, manual operations

---

## Critical Database Schema Gaps

### Missing Tables:

1. **flight_suppliers** - Track external GDS/supplier connections
2. **offer_cache_normalized** - Normalized multi-supplier offers
3. **fare_rules** - Store cancellation/change policies per offer
4. **booking_payments** - Payment transactions and status
5. **booking_tickets** - Issued tickets with ticket numbers
6. **booking_segments** - Individual flight legs for multi-city
7. **booking_notifications** - Email/SMS notification log
8. **user_preferences** - Saved search preferences
9. **price_alerts** - User price monitoring
10. **loyalty_transactions** - Tcent earning/redemption

### Missing Columns in Existing Tables:

**flight_bookings:**

- hold_until (for soft bookings)
- fare_basis_code
- ticketing_deadline
- baggage_info (detailed)
- seat_assignments
- meal_preferences
- special_requests
- refund_amount
- modification_fee
- agent_id (for support)

**flight_offers:**

- supplier_id
- supplier_offer_id
- fare_family
- refundable (boolean)
- changeable (boolean)
- change_fee
- cancellation_fee
- baggage_included
- available_seats_count

---

## Priority Implementation Roadmap

### **PHASE 1: Core Business Flow (Weeks 1-2)**

**Goal**: Enable end-to-end booking with payment

1. Enhanced Schema
   - Add fare_rules table
   - Add booking_payments table
   - Add booking_tickets table
   - Enhance flight_offers with fare attributes

2. Payment Integration
   - PayOS/Stripe API integration
   - Payment webhook handlers
   - Payment status tracking
   - Refund processing

3. Ticket Issuance
   - Ticket number generation
   - Ticket status workflow
   - Email ticket delivery

**Business Value**: Revenue generation capability

---

### **PHASE 2: Supplier Integration (Weeks 3-4)**

**Goal**: Real-time supplier inventory

1. Supplier Framework
   - flight_suppliers table
   - Supplier API abstraction layer
   - Amadeus/Sabre connectors

2. Offer Normalization
   - Multi-supplier offer aggregation
   - Price comparison
   - Deduplication logic

3. Caching Strategy
   - Intelligent cache invalidation
   - Hot route optimization

**Business Value**: Competitive pricing, expanded inventory

---

### **PHASE 3: Enhanced User Experience (Weeks 5-6)**

**Goal**: Personalization and conversion optimization

1. Fare Rules Display
   - Rules API endpoint
   - Modal UI for acceptance
   - T&C checkboxes

2. Flexible Booking
   - Hold booking (soft booking)
   - Price lock mechanism
   - Hold expiration handling

3. User Preferences
   - Saved searches
   - Favorite routes
   - AI-powered recommendations

**Business Value**: Higher conversion, customer retention

---

### **PHASE 4: Post-Booking Excellence (Weeks 7-8)**

**Goal**: Customer service automation

1. Notifications
   - Transactional emails
   - SMS confirmations
   - Booking reminders

2. Self-Service
   - Online check-in
   - Seat selection
   - Meal preferences

3. Loyalty Integration
   - Tcent earning on bookings
   - Redemption for flights
   - Tier benefits

**Business Value**: Reduced support costs, loyalty engagement

---

## Immediate Action Items (Next 48 Hours)

### Critical Path:

1. ✅ Create comprehensive schema migration
2. ✅ Implement fare_rules table
3. ✅ Add payment integration foundation
4. ✅ Create ticket issuance workflow
5. ✅ Update API endpoints for new flows

### Quick Wins:

- Add fare rules display to booking flow
- Implement basic payment status tracking
- Create ticket generation logic
- Add email notification framework

---

## Technical Debt & Risks

### Current Risks:

1. **No payment processing** = Cannot generate revenue
2. **No ticket issuance** = Cannot fulfill bookings
3. **No supplier integration** = Limited inventory
4. **No fare rules** = Legal/compliance issues
5. **No notifications** = Poor customer experience

### Mitigation Strategy:

- Prioritize payment integration (highest revenue impact)
- Implement fare rules (legal compliance)
- Add basic notifications (customer satisfaction)
- Defer supplier integration to Phase 2 (use internal inventory initially)

---

## Success Metrics

### Phase 1 KPIs:

- [ ] Booking conversion rate > 3%
- [ ] Payment success rate > 95%
- [ ] Ticket issuance time < 5 minutes
- [ ] Email delivery rate > 98%

### Phase 2 KPIs:

- [ ] Supplier offers refreshed < 2 seconds
- [ ] Price competitiveness within 5% of market
- [ ] Inventory availability > 90%

### Phase 3 KPIs:

- [ ] User preference adoption > 20%
- [ ] Hold booking conversion > 40%
- [ ] Fare rule acceptance rate > 95%

### Phase 4 KPIs:

- [ ] Support ticket reduction by 50%
- [ ] Loyalty enrollment rate > 30%
- [ ] Net Promoter Score > 50

---

## Conclusion

The current MVP provides a foundation but lacks critical business functionality. The recommended approach:

1. **Immediate**: Implement payment + ticketing (Phase 1) - enables revenue
2. **Short-term**: Supplier integration (Phase 2) - competitive advantage
3. **Medium-term**: UX enhancements (Phase 3) - conversion optimization
4. **Long-term**: Post-booking automation (Phase 4) - operational efficiency

**Estimated Timeline**: 8 weeks to full business flow implementation  
**Estimated ROI**: 10x improvement in conversion and customer satisfaction
