# **BUSINESS ANALYSIS SPECIFICATION: BEAUTY & WELLNESS (TripC.AI — Beauty & Wellness)**

---

## **1\. OVERVIEW & SCOPE**

**Product:** Search, discovery, booking, and management platform for beauty & wellness services (salons, spas, hairdressers, massage, yoga/fitness classes, wellness packages, mobile therapists).  
**Model(s):** Direct-book (real-time availability & instant confirmation), Request-to-book (provider accepts), Package & membership sales, Voucher/Giftcard redemption, In-person and on-demand (mobile) fulfilment.  
**Core objective:** Let Guests/Members discover providers, compare services, check availability, book appointments or classes, pay securely, manage appointments (reschedule/cancel), buy packages/memberships/vouchddders, and review experiences — all while integrating with provider calendars, POS, and promotions.

---

## **2\. BUSINESS PROCESS FLOW**

### **2.1. Happy path (Guest Booking — end-to-end)**

1. Search / Discover: Guest searches by location/date/service type, or browses categories (spa, haircut, manicure, yoga).  
2. Results: System returns matching providers / classes with price range, duration, top available slots, rating, and badges (instant-book, verified).  
3. Select: Guest opens provider & service detail, selects staff preference (optional), date & time slot.  
4. Add-ons: Selects add-on services, product add-ons, or package options.  
5. Payment: Guest pays (or chooses pay-at-location if allowed). Payment link created (tokenized).  
6. Confirmation: Appointment created in system and (if integrated) provider calendar; confirmation email/SMS \+ calendar invite sent.  
7. Fulfillment: Guest attends service (or receives mobile therapist). POS integration records service completion and product sales.  
8. Post-service: Send feedback request, collect review, apply loyalty points, update analytics.  
9. Post-booking management: Guest may reschedule, cancel, or claim refunds per policies; provider may confirm/cancel if request-to-book flow.

---

## **3\. DETAILED FUNCTIONAL REQUIREMENTS**

### **Module A: Search & Catalog (Discovery)**

Goal: Surface relevant providers & services with accurate, local availability.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| BW\_FR\_01 | Input Validation & Facets | Required/optional search fields: location (geo), service category, date/time range, price range, duration, staff gender/language, accessibility needs. | Geocoding/autocomplete for address/area. |
| BW\_FR\_02 | Relevance & Ranking | Rank by: availability (slots in selected window), rating, proximity, verified provider status, price, promotions. Boost providers with instant-book capability. | Provide filters and “sort by” options. |
| BW\_FR\_03 | Category & Service Taxonomy | Canonical taxonomy (e.g., Hair → Cut, Color; Spa → Massage, Facial; Wellness → Yoga, Pilates). Services have attributes: typical duration, equipment requirements, gender suitability, min/max participants (for classes). | Schema-driven, extensible. |
| BW\_FR\_04 | Availability Snapshot | Show next available slots (top 3\) and “view full calendar” (daily/weekly). Cache short-lived availability snapshots; always revalidate at booking commit. | For classes, show recurring schedules and capacity. |
| BW\_FR\_05 | Location & Fulfilment Type | Filter: in-salon, mobile/home visit, virtual (tele-wellness). Show travel radius & surcharges for mobile. | Show ETA for mobile therapists. |

### **Module B: Provider & Service Profile**

Goal: Provide rich provider pages to help conversion.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| BW\_FR\_06 | Provider Profile | Name, address, opening hours, photos, services list, staff list & bios, certifications, health & safety policies, languages, cancellation rules, POS/booking integration status, partner badges (verified, chain). | Support multiple outlets per brand. |
| BW\_FR\_07 | Service Definition | Per-service SKU: name, description, duration, base price, refundable flag, add-ons (with mapping to supplier codes), required resources (room/staff), participant capacity. | Support tiered pricing (weekday/weekend/peak). |
| BW\_FR\_08 | Staff & Resource View | Staff specializations, working hours, skills, calendar sync status (2-way), average ratings per staff. Allow “no preference” or select specific staff. | Staff-level pricing/availability supported. |
| BW\_FR\_09 | Health & Safety / COVID | Fields for sanitation protocol, mask rules, vaccination requirement (if applicable), required forms. | Shown prominently where required. |

### **Module C: Availability & Inventory**

Goal: Prevent double-booking, respect staff and room constraints, manage consumables.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| BW\_FR\_10 | Real-time Calendar Sync | Integrations: Google Calendar, provider PMS (Fresha, Vagaro, Mindbody), ICS/webhooks; support provider push/pull. | Fallback to provider-portal polling for non-integrated partners. |
| BW\_FR\_11 | Resource Allocation | Bookings reserve staff and room resources for the full service duration \+ buffer time (configurable). Prevent overlapping bookings. | Buffer configurable per service and per provider. |
| BW\_FR\_12 | Capacity Management (Classes) | Track seats, waitlist, auto-promote from waitlist when a spot opens. | Support class packages and recurring passes. |
| BW\_FR\_13 | Consumables Inventory | Track product SKUs used in services (e.g., hair color, oil); flag low stock and prevent booking of services requiring out-of-stock consumables. | Optional for providers; sync with POS/inventory. |

### **Module D: Booking Orchestration & Business Logic**

Goal: Create robust booking flows: instant-book, request-to-book, and group/class bookings.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| BW\_FR\_14 | create\_booking | Booking API accepts provider\_id, service\_id, staff\_id (optional), start\_time, duration, customer info, addons, payment preference. Returns booking\_id, status (CONFIRMED / PENDING / REJECTED), provider\_ref. | Use idempotency keys for safe retries. |
| BW\_FR\_15 | Booking Modes | Instant-Book: if provider calendar integrated & slot free \-\> CONFIRMED. Request-to-Book: create PENDING and notify provider to accept/reject within TTL. | TTL configurable (e.g., 30 minutes). |
| BW\_FR\_16 | Payment Options | Pay-now (prepaid), deposit, pay-at-location, subscription/membership charging. Support POS link for in-person charge. | Comply with PCI; use Payment Service for tokenization. |
| BW\_FR\_17 | Reschedule / Cancel | Enforce provider cancellation/reschedule rules; show penalties. Allow provider-side reschedule with guest notification and auto-offer alternatives. | Rule engine to compute refunds/fees. |
| BW\_FR\_18 | Group & Recurring Bookings | Support group bookings for classes (multiple participants), series bookings (weekly massages), with bulk discounts & package consumption. | Provide “manage series” UI. |

### **Module E: Promotions, Packages & Vouchers**

Goal: Flexible promotions, packages, memberships, vouchers and loyalty.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| BW\_FR\_19 | Promotions API | Campaign rules: date ranges, eligibility (new customer, repeat customer), service/category scope, time-of-day discounts, coupon codes, stackability rules. | Integrate with Promotions Service (central). |
| BW\_FR\_20 | Packages & Memberships | Define N-session packages, auto-expiry, roll-over rules, member pricing, scheduled pre-booking privileges. | Allow provider-managed or TripC-managed packages. |
| BW\_FR\_21 | Vouchers / Giftcards | Issue & redeem vouchers; single/multi-use codes, expiry, partial redemption. | Vouchers stored in voucher service; redemption reduces payable amount. |

### **Module F: Reviews, Ratings & Moderation**

Goal: Collect structured feedback and surface trust signals.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| BW\_FR\_22 | Post-Service Review | On completion, send review request. Allow star rating \+ structured tags (cleanliness, punctuality, staff), optional photo. | Rate-limiting and anti-fraud. |
| BW\_FR\_23 | Moderation & Sentiment | Auto-moderate via NLP, flag for manual review. Support provider responses. | Use abusive content filters & appeal flows. |

### **Module G: Notifications & Reminders**

Goal: Reduce no-shows and improve guest experience.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| BW\_FR\_24 | Confirmation & Reminders | Email/SMS/push calendar invite on booking confirm. Reminders (configurable windows: 24h, 4h, 30m). | Option for guests to confirm attendance (quick reply). |
| BW\_FR\_25 | Provider Alerts | Notify providers of new booking / cancellation / reschedule; include guest notes & forms. | Include pre-service checklist. |

---

## **4\. DATA MODEL (SCHEMA) — Suggested SQL deltas**

`-- bookings table (extend)`  
`ALTER TABLE bookings`  
`ADD COLUMN bw_offer_id VARCHAR(128),               -- canonical service-offer reference`  
`ADD COLUMN provider_id UUID,`  
`ADD COLUMN provider_outlet_id UUID,                -- specific salon location`  
`ADD COLUMN service_id UUID,                        -- the chosen service SKU`  
`ADD COLUMN staff_id UUID,                          -- allocated staff (nullable)`  
`ADD COLUMN start_at TIMESTAMP WITH TIME ZONE,`  
`ADD COLUMN end_at TIMESTAMP WITH TIME ZONE,`  
`ADD COLUMN booking_status VARCHAR(32),             -- CONFIRMED / PENDING / CANCELLED / COMPLETED`  
`ADD COLUMN fulfillment_type VARCHAR(16),           -- in_salon / mobile / virtual`  
`ADD COLUMN addons JSONB,                           -- [{id, code, price}]`  
`ADD COLUMN total_breakdown JSONB,                  -- {"base":..., "tax":..., "service_fee":..., "discounts":...}`  
`ADD COLUMN provider_ref JSONB,                     -- provider system ids / PMS refs`  
`ADD COLUMN voucher_applied JSONB,                  -- {voucher_code, amount}`  
`ADD COLUMN cancellation_policy_snapshot JSONB;     -- store provider policy at time of booking`

`-- providers table (new or extended)`  
`CREATE TABLE providers (`  
  `id UUID PRIMARY KEY,`  
  `name VARCHAR,`  
  `brand VARCHAR,`  
  `outlets JSONB,             -- list of outlet ids or embedded outlet objects`  
  `verification_status VARCHAR,`  
  `contact JSONB,`  
  `created_at TIMESTAMP WITH TIME ZONE`  
`);`

`-- services table (per outlet)`  
`CREATE TABLE services (`  
  `id UUID PRIMARY KEY,`  
  `provider_id UUID REFERENCES providers(id),`  
  `outlet_id UUID,              -- which outlet`  
  `sku VARCHAR,`  
  `title VARCHAR,`  
  `description TEXT,`  
  `duration_minutes INT,`  
  `base_price DECIMAL,`  
  `refundable BOOLEAN,`  
  `resource_requirements JSONB,  -- rooms, equipment`  
  `addons JSONB,`  
  `created_at TIMESTAMP WITH TIME ZONE`  
`);`

`-- staff & calendars`  
`CREATE TABLE staff (`  
  `id UUID PRIMARY KEY,`  
  `provider_id UUID,`  
  `outlet_id UUID,`  
  `name VARCHAR,`  
  `qualifications JSONB,`  
  `calendar_sync_status VARCHAR,`  
  `avg_rating DECIMAL`  
`);`

`-- availability/slots (optional materialized)`  
`CREATE TABLE availability_slots (`  
  `id UUID PRIMARY KEY,`  
  `outlet_id UUID,`  
  `staff_id UUID,`  
  `start_at TIMESTAMP WITH TIME ZONE,`  
  `end_at TIMESTAMP WITH TIME ZONE,`  
  `is_blocked BOOLEAN,`  
  `source VARCHAR -- calendar sync or internal`  
`);`

`-- reviews`  
`CREATE TABLE bw_reviews (`  
  `id UUID PRIMARY KEY,`  
  `booking_id UUID REFERENCES bookings,`  
  `provider_id UUID,`  
  `rating INT,`  
  `comments TEXT,`  
  `tags JSONB,`  
  `created_at TIMESTAMP WITH TIME ZONE`  
`);`

---

## **5\. BUSINESS RULES (HARD CONSTRAINTS / VALIDATIONS)**

* **Slot Integrity:** A slot is reserved when booking enters CONFIRMED. All calendar writes must be idempotent.  
* **Buffer Rules:** Provider-configured pre/post buffer (minutes) must be applied to block adjacent slots.  
* **Mobile Travel Radius & Fees:** Mobile bookings outside provider radius either disallowed or require travel fee. Travel fee applied automatically.  
* **Cancellation Windows:** Provider defines cancellation windows (e.g., full refund if cancelled \>24h, 50% refund 4–24h, no refund \<4h). Capture snapshot at booking.  
* **Package Consumption:** Booking of a package decrements available sessions; record per-session consumption and expiry.  
* **No-show Handling:** No-show flagged after provider confirms non-attendance; apply fees and loyalty penalties per policy.  
* **Age & Consent:** For age-restricted services (e.g., certain treatments), validate guest DOB and require guardian consent if under threshold.  
* **Health Declarations:** For treatments requiring pre-screening (e.g., chemical peels), require completion prior to confirmation. If not completed, booking may remain PENDING.  
* **Payment & Idempotency:** Use idempotency keys for payment & booking to avoid duplicates. Support partial-payment flows (deposit \+ balance at salon).  
* **Refunds:** Follow provider cancellation policy snapshot, but TripC may mediate disputed refunds. Log all decisions and approvals.

---

## **6\. EVENTING & INTEGRATION (ASYNC FLOWS)**

**Event bus events (publish/subscribe):**

* `BW_Appointment_Created` — booking created (status).  
* `BW_Appointment_Confirmed` — provider confirmed.  
* `BW_Appointment_Cancelled` — cancelled by guest or provider.  
* `BW_Payment_Successful` / `BW_Payment_Failed`.  
* `BW_Inventory_Low` — consumable low.  
* `BW_Review_Submitted`.

**External integrations:**

* Provider PMS / POS (Fresha, Mindbody, Vagaro) — 2-way calendar & sales sync.  
* Payment Gateways — tokenization, deposits, refunds.  
* Notification Service — email/SMS/push templates.  
* Promotions Service — central rule engine for discounts.  
* Analytics / BI — events into Kafka for reporting.

---

## **7\. API SURFACE (Representative)**

* `search_beauty_services(location, service_category, date_range, filters)`  
* `get_provider_details(provider_id)`  
* `get_service_availability(provider_id, service_id, date)`  
* `create_booking(payload)` — returns booking\_id & status.  
* `confirm_booking(booking_id)` — used by provider to accept request-to-book.  
* `reschedule_booking(booking_id, new_time)`  
* `cancel_booking(booking_id)`  
* `get_active_promotions(provider_id, service_id)`  
* `redeem_voucher(code, booking_id)`  
* `create_payment_link(booking_id, amount)`  
* `webhook/provider_calendar_update` — provider \-\> TripC

---

## **8\. UI/UX QUICK WINS (IMMEDIATE IMPROVEMENTS)**

* On results cards show: next available slot(s), clear price, duration, staff rating, instant-book badge, and distance.  
* Booking widget: inline calendar with available times, staff thumbnails, required consent checkbox (health forms), and price breakdown (including travel fee).  
* Pre-checkout: show cancellation rules & any deposit amounts with clear “You will be charged X now; Y at provider”.  
* Reminders: two auto reminders (24h & 2h) with “Confirm / Cancel” action buttons for guests.  
* Post-visit: one-tap review flow in SMS/email with star \+ 1-sentence reason.  
* Provider dashboard: daily agenda, quick check-in (mark guest arrived), mark service completed, sell product add-ons (POS link).

---

## **9\. SCREEN-BY-SCREEN REQUIREMENTS (SUMMARY)**

### **9.1. Search / Discovery Page**

* Fields: location autocomplete, service category, date, price slider, duration, staff preference, fulfilment type.  
* Results: list/grid with grouping (recommended, instant-book, promos). Filters state persisted in URL.

### **9.2. Provider Page**

* Header: photos, rating, verified badge, open hours, address & map.  
* Services: each service card shows duration, base price, add-ons, instant-book flag.  
* Staff: filter by staff, view staff profiles & ratings.  
* Calendar: availability calendar \+ “book now” CTA.

### **9.3. Booking Flow (Checkout)**

* Customer fields (name, phone, email), health forms, optional notes, payment method, voucher application, accept cancellation policy (checkbox).  
* Price breakdown, deposit vs full-pay, quote expiry timer (if slot reserved for TTL).  
* Confirmation screen with booking details, provider\_ref, calendar invite link, and manage booking link.

### **9.4. Provider Dashboard (for partners)**

* New requests (PENDING), confirmed bookings, reschedule requests, daily agenda, revenue summary, inventory warnings, review moderation.

---

## **10\. VALIDATION & BOOKING CHECKS (narrative)**

1. **When user clicks “Book”:**  
   * Validate required guest fields, health declarations, age constraints.  
   * Re-check availability from canonical calendar source (PMS / internal).  
   * Reserve resources (staff/room) and mark slot as TEMP\_RESERVED with TTL.  
2. **Payment step (if required):**  
   * Create payment link via Payment Service; on success set booking to CONFIRMED and commit to provider calendar (if integrated). If provider requires manual acceptance (request-to-book), keep PENDING and notify provider.  
3. **On failure:**  
   * If commit to provider fails, show clear reason and either rollback payment (refund) or present alternative slots. Persist audit trail.  
4. **Post-confirmation:**  
   * Publish `BW_Appointment_Created`, send notifications, schedule reminders, and update analytics.

---

## **11\. DESIGNER & IMPLEMENTATION NOTES**

* Use microcopy to reduce no-shows: show “How to prepare” checklist and expected duration (service \+ buffer).  
* Visualize time-sensitive slots with countdown if TTL is active.  
* For classes, show seat map / current attendees & waitlist.  
* Collect minimal PII up-front; request additional docs only when mandatory.  
* For mobile therapists show travel path & ETA in provider app and notify guest when therapist is en route.

---

## **12\. KPIs & ANALYTICS (examples)**

* Conversion: search → booking rate per category.  
* No-show rate per provider / service.  
* Avg lead time between booking creation and appointment start.  
* Revenue per provider, package uptake, voucher redemption rate.  
* Customer satisfaction (NPS, avg rating) and repeat booking rate.

---

## **13\. RISKS & MITIGATIONS**

* **Double-booking risk:** enforce atomic reservation with provider calendar sync and TTL. Fallback: block slot on booking attempt (optimistic lock).  
* **Provider reliability:** show verification badges and performance SLAs; remove low-performing providers after threshold.  
* **Payment disputes / chargebacks:** store full audit (policy snapshot \+ cancellation), require signature where needed.  
* **Regulatory & safety (e.g., medical procedures):** restrict services that require medical licensing; require provider verification and additional documentation.

---

## **14\. NEXT STEPS (roadmap items)**

* MVP scope: discovery, instant-book for integrated providers, prepaid & pay-on-site options, reminders, reviews.  
* Phase 2: PMS/POS deep integrations, package management, loyalty, provider self-onboarding flow.  
* Phase 3: marketplace features — dynamic pricing by demand, advanced scheduling optimizer, AI-based provider recommendations.

---

### **Appendix — Reference**

This document's structure and level-of-detail follows the Flight Booking BRD you provided for TripC, used as a format template.

Ally Dev \- Note

