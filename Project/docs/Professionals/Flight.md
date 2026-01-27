📄 BUSINESS ANALYSIS SPECIFICATION: FLIGHT BOOKING SYSTEM (TripC.AI)

---

1. OVERVIEW & SCOPE  
   Product: Flight search, compare and booking engine (Online Travel Agency — Flight bookings).  
   Model: Pre-booking, facilitated booking (book & issue e-ticket) across multiple suppliers (GDS / NDC / Direct Airline APIs / Meta).  
   Core objective: Let Guests/Members search, compare, select and purchase air travel itineraries (one-way / round-trip / multi-city) reliably, with clear fare rules and ancillaries; ensure bookings are issued (PNR / e-ticket), passengers receive confirmations and that post-booking management (change, cancel, refund) is supported.

---

2. BUSINESS PROCESS FLOW

2.1. Happy path (Guest Booking — end-to-end)  
Search: Guest provides origin, destination, dates, cabin, passengers (ADT/CHD/INF), optional filters (direct only, airlines).  
Aggregation: System queries suppliers (GDS/NDC/airline APIs), normalizes offers to canonical schema (itineraries, fares, rules).  
Results: System presents grouped, comparable offers (price, duration, stops, baggage, fare family).  
Selection: Guest opens offer detail, reviews fare rules, selects fare & ancillaries (bags, seats, meals).  
Passenger data: Guest inputs passenger names and required docs (passport, DOB, frequent flyer).  
Payment: Secure payment (tokenized, 3DS where applicable). Use idempotency key.  
Booking & issuance: System reserves/creates booking with supplier (PNR) and issues e-tickets (ticket numbers).  
Confirmation: Send email \+ SMS with booking summary, itinerary, e-ticket(s), link to manage booking (magic link for guest).  
Post-booking: Handle notifications (schedule changes), allow manage actions (seat changes, ancillaries, refunds) per fare rules.

---

3. DETAILED FUNCTIONAL REQUIREMENTS

Module A: Search & Validation (Search Engine)  
Goal: Prevent mismatches and surface valid offers.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| FR\_01 | Input Validation | Required fields: Origin, Destination, Date(s), Pax counts by type. Validate adult/child/infant ratios (e.g., infant must have adult). | Early form validation, disable search until valid. |
| FR\_02 | Passenger Type Logic | Passenger breakdown: ADT, CHD, INF (lap). Infant must be \<= ADT count. | UI shows passenger breakdown and explanatory tooltip. |
| FR\_03 | Lead Time Check | For issuance-sensitive fares (some suppliers require min lead time) validate departure \> NOW() \+ MinLeadTime (configurable per supplier/market). | Config per market/supplier. Show clear message if blocked. |
| FR\_04 | Route & Calendar Info | Show distance, estimated flight duration, and fare calendar (cheapest date). Use supplier fare/calendar endpoints. | Cache fare calendar per route for 12–24h to reduce calls. |
| FR\_05 | Multi-City Validation | Validate connecting airports and minimum connecting times (MCT) for self-connect warnings. | Provide warning when connections are tight (e.g. \< 90-120 min depending on airport). |

Module B: Offers & Presentation (Result List & Grouping)  
Goal: Present comparable offers with clear fare attributes.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| FR\_06 | Group By Itinerary / Fare Family | Group similar offers by itinerary \+ fare family. Show representative price for group and expand to list alternatives (other airlines / times). | Avoid duplicate itineraries; show “Lowest in this group” label. |
| FR\_07 | Fare Attributes Display | Each offer shows: total price (all taxes & fees), breakdown (base \+ taxes \+ supplier fees), baggage allowance, refundability, change fee, fare family icons. | Use standardized icons and 1-line fare rule summary; expand for full rules. |
| FR\_08 | Filter & Sort | Filters: stops, departure/arrival window, duration, airline alliance, refundable only, baggage included. Sort: price, duration, departure time, arrival time, best value. | Combine filters with counts and active filter chips. |
| FR\_09 | Price Guarantee / Quote Timestamp | Display quote timestamp and expiry (e.g., fares may be valid for X seconds). If supplier requires immediate re-price at booking, show “Price not guaranteed” label. | Implement reprice flow at checkout if required. |

Module C: Booking & Passenger Data (Checkout & Issue)  
Goal: Collect required info, keep PNR integrity, handle ancillaries.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| FR\_10 | Pax Data & Name Format | Collect full name as per passport/ID, DOB, gender (if required), passport number & expiry for international travel, nationality. Validate for disallowed characters. | Provide clear guidance: names must match travel documents. Use structured fields. |
| FR\_11 | Ancillaries Selection | Allow baggage, seat selection, meals, extra legroom, priority boarding. Ancillaries must be mapped to supplier codes (SSR/OSI or NDC ancillary). | Show ancillary price per segment and per passenger. |
| FR\_12 | Fare Rules & Acceptance | Show full fare rules (max 25 words summary \+ “See full rules”). Require guest to accept fare rules before payment (checkbox). | Persist accepted rule snapshot in booking record. |
| FR\_13 | Payment & Idempotency | Support card (tokenized), wallet, alternate payments; implement idempotency to prevent duplicate bookings. Integrate 3DS/3DS2 flows where required. | Never store raw card data; use PCI-compliant gateway. |
| FR\_14 | Booking Confirmation & Ticketing | After successful payment, create PNR with supplier and issue e-tickets (ticket numbers). Save supplier references and ticket numbers in booking. | Implement retry/exponential backoff and compensate on partial failure (refund if tickets not issued). |
| FR\_15 | Guest Access (Magic Link) | Send booking email with secure guest access link (token). Allow manage without registration. | Token expiry and one-time regen options. |

Module D: Post-Booking Management & Notifications  
Goal: Provide easy management and handle supplier events.

| ID | Name | Description & Logic | Dev Notes |
| ----- | ----- | ----- | ----- |
| FR\_16 | Change / Cancel Flow | Allow change/cancel per fare rules. Show change fee and reprice delta before confirming change. Auto-refund/partial refund per policy. | Implement workflows for supplier change requests and CRM escalation for complex cases. |
| FR\_17 | Flight Alerts & Reaccommodation | Monitor supplier notifications (schedule change, cancellations). Notify passengers and provide rebooking options. | Integrate webhooks and supplier notifications; create auto-offer rules (e.g., rebook to next flight). |
| FR\_18 | Check-in Links & Documents | Provide airline check-in link and downloadable itinerary / invoice / e-ticket PDF. | Auto-generate PDF attachments with branding. |
| FR\_19 | Support & Dispute | In-app/phone support, dispute process for chargebacks or failed issuance. | Link to CRM ticket with booking context (PNR, tickets, audit logs). |

---

4. DATA MODEL (SCHEMA)  
   Suggested SQL deltas to extend existing TripC schema for flight booking:

Table: bookings — add flight/offer specific fields

ALTER TABLE bookings  
ADD COLUMN offer\_id VARCHAR(128),               \-- normalized offer reference  
ADD COLUMN supplier\_refs JSONB,                 \-- supplier PNRs & refs {"amadeus":"ABC123"}  
ADD COLUMN ticket\_numbers JSONB,                \-- issued ticket numbers per pax  
ADD COLUMN fare\_rules\_snapshot JSONB,           \-- store fare rules at time of booking  
ADD COLUMN total\_breakdown JSONB,               \-- {"base":..., "taxes":..., "fees":...}  
ADD COLUMN quote\_expires\_at TIMESTAMP WITH TIME ZONE;

Table: passengers — ensure travel doc fields

ALTER TABLE passengers  
ADD COLUMN pax\_type VARCHAR(10),                \-- ADT/CHD/INF  
ADD COLUMN passport\_number VARCHAR(64),  
ADD COLUMN passport\_nationality VARCHAR(4),  
ADD COLUMN passport\_expiry DATE,  
ADD COLUMN date\_of\_birth DATE;

Table: offers (new) — normalized search offers

CREATE TABLE offers (  
  id VARCHAR PRIMARY KEY,  
  itinerary JSONB,           \-- segments array  
  fare\_family VARCHAR(64),  
  price\_total DECIMAL,  
  currency VARCHAR(8),  baggage\_allowance JSONB,   \-- per passenger/segment  
  refundable BOOLEAN,  
  supplier\_origin VARCHAR(64),  
  created\_at TIMESTAMP WITH TIME ZONE  
);

Table: ancillaries (new)

CREATE TABLE ancillaries (  
  id SERIAL PRIMARY KEY,  
  offer\_id VARCHAR REFERENCES offers(id),  
  type VARCHAR,             \-- baggage/seat/meal  
  code VARCHAR,             \-- supplier ancillary code  
  price DECIMAL,  
  refundable BOOLEAN  
);

---

5. BUSINESS RULES (HARD CONSTRAINTS / VALIDATIONS)

Fare & Ticketing Rules

* Rules snapshot: Save fare\_rules\_snapshot in booking at time of purchase. All post-booking actions reference this snapshot.  
* Refund & Change: Enforce refundability and change penalties exactly as fare\_rules\_snapshot states. If supplier enforces different rule after issuance, escalate to CS and log discrepancy.

Passenger Name & Document Rule

* Name must exactly match travel document (passport/ID) for international bookings. Block issuance if mismatch detected by airline response. Provide correction flow (paid change if required).

Baggage & Ancillary Rule

* Baggage included in fare must be displayed per passenger and per segment. If guest selects extra baggage, add associated ancillary to booking and map to supplier code.

Lead Time Rule

* Booking must be allowed only if departure\_time \> NOW() \+ Min\_Lead\_Time (configurable per market/supplier). For very last-minute fares, show special warnings and attempt direct supplier hold.

Price Guarantee / Reprice Rule

* Some offers are cached and must be re-priced before issuance. If price changes at payment, show delta and require guest confirmation. Always use idempotency keys to avoid duplicate charges.

Inventory / Lock Rule

* On checkout (after selecting offer), place a soft hold (if supplier supports) and reserve price for N seconds (e.g., 120s). After payment success, commit to supplier (PNR) and issue tickets. If issuance fails, refund automatically.

Cancellation Policy (Example)

* Refundable fares: Full refund per supplier rules, minus processing fee.  
* Non-refundable: No refund; show exact penalty from rules snapshot.  
* Auto No-Show: If passenger no-shows, no refund (per fare).

Fraud & Payment Rules

* High-value bookings require additional verification (3DS, document verification). Flag high-risk IPs, mismatched card country vs. passenger country.

---

6. QUICK WINS (UI/UX IMMEDIATE IMPROVEMENTS)

Search Widget

* Add passenger type controls (ADT/CHD/INF) and separate field for infants (lap vs seat). Add clear tooltip: “Infant (lap) does not receive a seat.”  
* Add cabin selector (Economy/Premium/Business/First) visible upfront.

Results / Offer Card

* Show fare family badges (e.g., BASIC / FLEX / BUSINESS) and baggage icons (🎒1 / 🧳1) on top of card.  
* Add “Fare rules at glance” line: Refundable / Change fee / Seat included. Provide “View full rules” modal.

Checkout / Booking Form

* Inline validation for passenger name vs allowed characters and length.  
* Show price breakup and refundability checkbox. Show quote expiry countdown near total price.  
* If offer requires re-price at booking, show a prominent warning before payment.

Post-booking

* Email: Include e-ticket PDF, supplier PNR, manage booking magic link (token).  
* Mobile/SMS: Send short itinerary \+ PNR; include link to view full details.

Designer notes

* Use card grouping for itineraries (group by category: cheapest, fastest, best) — reduce cognitive load versus flat lists.  
* Add visual state for time-sensitive prices (countdown badge).  
* Show supplier logos clearly; never show real passenger names or PII in preview cards.

---

BUSINESS REQUIREMENT DOCUMENT (BRD) — Key Highlights

1. PRODUCT LOGIC PRINCIPLES  
* Normalize supplier variance: multiple suppliers for the same itinerary should be unified into canonical offers so users compare apples-to-apples (itinerary \+ fare family \+ ancillaries).  
* Avoid duplicate listings (same itinerary, same supplier, same fare) — dedupe.  
* Show human-readable, concise fare rules and force explicit acceptance on checkout.  
2. SCREEN-BY-SCREEN REQUIREMENTS (SUMMARY)

2.1. Search Form  
Fields & Rules:

* Trip type: One-way / Round-trip / Multi-city.  
* Origin / Destination: autocomplete with airport/city type flag. If airport selected, show relevant airport code and country.  
* Dates: validate that return date \>= outbound date.  
* Passengers: ADT/CHD/INF breakdown with limits. Infant count \<= adult count.  
* Cabin: display available cabin classes.

2.2. Search Results Page (Major fixes)  
Display Logic:

* Group by itinerary & fare family; show representative cheapest option per group.  
* Provide filters with counts and keep applied state in URL for shareability.  
  Card Info:  
* Itinerary summary (segments), total price (all-in), duration, stops, baggage summary, fare family badges, supplier logo, CTA: “Select” / “View details”.

2.3. Booking & Checkout Page  
Operational fields:

* Passenger details per pax type, document capture (passport for international), seat & baggage per segment.  
* Fare rules acceptance required.  
* Price revalidation before final payment; display any delta.  
* Payment: show payment methods and require acceptance of T\&Cs.  
3. HIDDEN RULE FLOWS (BACKEND)

Pricing Rule:

* Price \= Base \+ Taxes \+ SupplierFees \+ ServiceFee \+ (Night/Peak Surcharges if any). Display breakdown.

Inventory Lock:

* Use supplier holds if available; otherwise implement ephemeral local quote with expiry and reprice at commit.  
4. SEARCH & GROUPING LOGIC (narrative)  
   User: inputs origin, destination, dates, pax.  
   System:  
* Step 1: Query suppliers, normalize offers.  
* Step 2: Filter out unavailable or expired offers.  
* Step 3: Group by itinerary \+ fare family.  
* Step 4: Calculate final price with local service fee & taxes.  
* Step 5: Present top groups (e.g., "Cheapest", "Fastest", "Best") — 3–4 representative cards.  
5. VALIDATION & BOOKING CHECKS (narrative)  
   User selects offer and clicks Book.  
   System checks:  
* Pax vs infant rules, passenger documents presence for international travel, lead time (\> MinLeadTime).  
* Fare rules acceptance captured.  
* Reprice with supplier if offer is volatile.  
  If all checks pass → proceed to payment → on success call supplier to create PNR and issue ticket(s). If any step fails, communicate clear error and recommended action (change passenger name, select different fare, increase lead time).  
6. DESIGNER IMPLEMENTATION NOTES  
* Warning states: inline red text under passenger/name fields for mismatches; modal for important errors (e.g., “price changed”).  
* Conditional Inputs: passport fields enabled only for international itineraries; seat selection only after ticketing (or if supplier supports pre-assignment).  
* Offer Card Design: make clear this is a representative fare for a fare family and not a specific aircraft or seat.

---

