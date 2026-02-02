# Flight Module - Issues Tracker

> **Danh sách tất cả issues cần fix cho module Flight**  
> Last updated: 27/01/2026

---

## 📊 Summary

**Total Issues**: 43  
**Status Breakdown**:
- 🔴 Critical: 10 issues (23%)
- 🟠 High: 11 issues (26%)
- 🟡 Medium: 13 issues (30%)
- 🟢 Low: 9 issues (21%)

**Estimated Total Effort**: ~120 hours (≈15 days)

---

## 🔴 CRITICAL ISSUES (Must Fix Before Production)

### API-01: Flight Search Not Using Real API
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: API Integration  
**Effort**: 2-3 hours

**Problem**: Search page uses mock `generateFlights()` instead of real API endpoint.

**Files**:
- `app/flights/search/page.tsx` (line 17, 50-55)
- `lib/mock/flights.ts`

**Impact**: Users cannot search real flights from database.

**Solution**: Replace mock with `GET /api/flight/search` call. See [`api_integration_status.md`](file:///C:/Users/LENONO/.gemini/antigravity/brain/d626031d-d8cf-47ab-a42d-bce0530d1a82/api_integration_status.md) for implementation.

---

### API-02: Booking Creation Not Integrated
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: API Integration  
**Effort**: 3-4 hours

**Problem**: Payment step uses `setTimeout` mock instead of calling `POST /api/flight/book`.

**Files**:
- `components/flights/booking/steps/StepPayment.tsx` (line 13-34)

**Impact**: No real bookings created, no PNR generated, no database records.

**Solution**: Implement real booking API call with proper error handling.

---

### UI-01: Airport Selector Non-Functional
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: UI Component  
**Effort**: 2 hours

**Problem**: Airport input is read-only with empty onClick handler.

**Files**:
- `components/flights/FlightSearchForm.tsx` (line 204-213)
- `components/flights/FlightsHero.tsx` (line 183-202)

**Impact**: Users cannot select airports, blocking flight search.

**Solution**: 
```tsx
const [showAirportPicker, setShowAirportPicker] = useState<'from' | 'to' | null>(null)

<SelectPopup isOpen={showAirportPicker === 'from'}>
  {/* Airport search and selection UI */}
</SelectPopup>
```

---

### UI-02: Travel Class Dropdown Non-Functional
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: UI Component  
**Effort**: 1.5 hours

**Problem**: Travel class shows text only, no dropdown interaction.

**Files**:
- `components/flights/FlightSearchForm.tsx` (line 167-172)

**Impact**: Users cannot change cabin class.

**Solution**: Implement dropdown with class options (Economy, Premium Economy, Business, First).

---

### UI-03: Flight Filters Non-Functional
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: UI Component  
**Effort**: 3 hours

**Problem**: All filter controls lack state management and event handlers.

**Files**:
- `components/flights/search/FlightFilterSidebar.tsx`

**Impact**: Users cannot filter search results by stops, price, time, airlines.

**Solution**: Implement filter state and apply to results list.

---

### LOGIC-01: Review Step Incomplete
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: Booking Flow  
**Effort**: 3 hours

**Problem**: Review only shows passenger names, missing all other booking details.

**Files**:
- `components/flights/booking/steps/StepReview.tsx` (line 15-20)

**Impact**: Users cannot verify booking before payment - potential legal issue.

**Solution**: Display flight details, passengers, seats, extras, insurance, total price with edit links.

---

### LOGIC-02: Extras State Not Persisted
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: State Management  
**Effort**: 2 hours

**Problem**: Baggage/meal selections use local `useState` instead of Zustand store.

**Files**:
- `components/flights/booking/steps/StepExtras.tsx` (line 10-11)

**Impact**: Selections lost when navigating between steps, not included in booking.

**Solution**: Connect to `selectBaggage()` and `selectMeal()` store actions.

---

### LOGIC-03: Missing Inter-Step Validation
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: Validation  
**Effort**: 2 hours

**Problem**: Can proceed to next step without completing requirements (e.g., seat selection).

**Files**:
- `components/flights/booking/steps/StepSeats.tsx`
- `components/flights/booking/steps/StepExtras.tsx`

**Impact**: Incomplete bookings, potential payment failures.

**Solution**: Add validation before allowing step progression.

---

### LOGIC-04: Flight ID Not Handled from URL
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: Data Flow  
**Effort**: 2 hours

**Problem**: Booking page doesn't extract `flightIdOutbound` from URL params.

**Files**:
- `app/flights/book/page.tsx` (line 22-40)

**Impact**: Cannot retrieve selected flight details or validate booking.

**Solution**: Parse `flightIdOutbound` and `flightIdReturn` from URL, fetch flight data.

---

### API-03: Payment Gateway Not Integrated
**Priority**: 🔴 Critical  
**Status**: ❌ Open  
**Category**: Payment  
**Effort**: 4-6 hours

**Problem**: No real payment processing, only mock.

**Files**:
- `components/flights/booking/steps/StepPayment.tsx`
- Need to create: `app/api/payment/create-payos-link/route.ts`

**Impact**: Cannot accept real payments.

**Solution**: Integrate PayOS SDK and create payment link endpoint.

---

## 🟠 HIGH PRIORITY ISSUES

### UI-04: Multi-City "Add Flight" Non-Functional
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: UI Feature  
**Effort**: 2 hours

**Files**: `components/flights/FlightsHero.tsx` (line 352-355)

**Solution**: Implement add/remove flight functions with state management.

---

### UI-05: Inconsistent Date Handling
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: Data Format  
**Effort**: 2 hours

**Problem**: Mix of `Date` objects and strings across components.

**Files**: `FlightSearchForm.tsx`, `FlightsHero.tsx`

**Solution**: Standardize on `Date` objects internally, convert to ISO strings for API only.

---

### UI-06: Missing Validation Visual Feedback
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: UX  
**Effort**: 2 hours

**Problem**: Validation errors only show as toasts, no field-level indicators.

**Solution**: Add red borders and error text below invalid fields.

---

### UI-07: No Loading States
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: UX  
**Effort**: 2 hours

**Problem**: No loading indicators during searches or navigation.

**Solution**: Add `isLoading` state with spinner UI.

---

### LOGIC-05: Promo Code Not Functional
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: Feature  
**Effort**: 2 hours

**Files**: `components/flights/booking/steps/StepPayment.tsx` (line 47-62)

**Solution**: Create `POST /api/promo/validate` endpoint and integrate.

---

### LOGIC-06: Seat Deselection Broken
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: UI Logic  
**Effort**: 1.5 hours

**Files**: 
- `components/flights/booking/steps/StepSeats.tsx` (line 84)
- `store/useBookingStore.ts`

**Solution**: Add `removeSeat()` action to store.

---

### LOGIC-07: Saved Travelers Not Implemented
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: Feature  
**Effort**: 3 hours

**Files**: `components/flights/booking/steps/StepPassengers.tsx` (line 66-82)

**Solution**: Implement with localStorage or create API endpoint.

---

### API-04: No Real-Time Price Updates
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: API  
**Effort**: 2 hours

**Problem**: Prices don't update if offer expires during booking.

**Solution**: Add polling or websocket for price changes.

---

### API-05: Missing Promo Code API
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: API  
**Effort**: 2 hours

**Need to create**: `app/api/promo/validate/route.ts`

---

### API-06: No Saved Travelers API
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: API  
**Effort**: 3 hours

**Need to create**: `app/api/user/travelers/route.ts` (GET, POST, DELETE)

---

### API-07: No Email Confirmation
**Priority**: 🟠 High  
**Status**: ❌ Open  
**Category**: Notification  
**Effort**: 3 hours

**Solution**: Integrate with notification service after booking creation.

---

## 🟡 MEDIUM PRIORITY ISSUES

### UI-08: Poor Mobile UX
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: Mobile UX  
**Effort**: 2 hours

**Problem**: Edit button opens full form in same view instead of sheet/modal.

**Files**: `components/flights/FlightSearchForm.tsx`

**Solution**: Use Sheet component for mobile editing.

---

### UI-09: Accessibility Issues
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: Accessibility  
**Effort**: 4 hours

**Problems**:
- Missing ARIA labels
- Poor keyboard navigation
- No focus management

**Solution**: Add ARIA attributes, keyboard handlers, focus traps in modals.

---

### UI-10: Inconsistent Design Tokens
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: Design System  
**Effort**: 2 hours

**Problem**: Mix of `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-[2rem]`.

**Solution**: Create design tokens file with standardized values.

---

### UI-11: No Error States
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: Error Handling  
**Effort**: 1.5 hours

**Problem**: No UI for API errors or network failures.

**Solution**: Add Error Alert components.

---

### UI-12: Sort Bar Needs Better UI
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: UI Component  
**Effort**: 2 hours

**Files**: `components/flights/search/FlightSortBar.tsx`

**Solution**: Add clear sort buttons with icons (Price, Duration, Departure).

---

### LOGIC-08: No Loading States in Booking
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: UX  
**Effort**: 1 hour

**Solution**: Add loading spinners for async operations.

---

### LOGIC-09: Inaccurate Price Calculation
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: Pricing  
**Effort**: 2 hours

**Files**: `components/flights/booking/PriceSummary.tsx` (line 12-14)

**Problem**: Mock prices don't reflect actual selections.

**Solution**: Create price lookup tables and calculate based on actual selections.

---

### LOGIC-10: No Data Persistence
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: Data Persistence  
**Effort**: 1.5 hours

**Problem**: All booking data lost on page refresh.

**Solution**: Add Zustand persist middleware with localStorage.

---

### LOGIC-11: Accessibility in Booking Steps
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: Accessibility  
**Effort**: 3 hours

**Solution**: Add ARIA labels to seat map, form fields, step indicators.

---

### LOGIC-12: Wrong Back Button Navigation
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: Navigation  
**Effort**: 5 minutes

**Files**: `components/flights/booking/steps/StepPayment.tsx` (line 127)

**Problem**: Back button goes to Step 4 instead of Step 5.

**Solution**: Change `setStep(4)` to `setStep(5)`.

---

### API-08: No Seat Map API
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: API  
**Effort**: 4-5 hours

**Solution**: Create endpoint to fetch real seat maps from airline APIs (optional enhancement).

---

### API-09: Missing Booking Status Updates
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: API  
**Effort**: 2 hours

**Solution**: Add webhooks or polling for flight status changes.

---

### API-10: No Booking Management API
**Priority**: 🟡 Medium  
**Status**: ❌ Open  
**Category**: API  
**Effort**: 4 hours

**Need to create**: 
- `GET /api/bookings/[id]` - View booking
- `PUT /api/bookings/[id]/cancel` - Cancel booking
- `GET /api/bookings/user` - List user bookings

---

## 🟢 LOW PRIORITY ISSUES

### UI-13: Mock Data Duplication
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: Code Quality  
**Effort**: 30 minutes

**Problem**: Airport data hardcoded in multiple files.

**Solution**: Extract to `lib/constants/airports.ts`.

---

### UI-14: Commented Code
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: Code Quality  
**Effort**: 15 minutes

**Solution**: Remove all commented-out imports and code.

---

### UI-15: Spacing Inconsistency
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: Styling  
**Effort**: 1 hour

**Solution**: Use design token spacing values consistently.

---

### UI-16: Recent Searches Not Functional
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: Feature  
**Effort**: 1.5 hours

**Solution**: Implement with localStorage.

---

### UI-17: Change Search Button Non-Functional
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: UI  
**Effort**: 30 minutes

**Files**: `components/flights/detail/FlightSummaryCard.tsx`

**Solution**: Add onClick handler to navigate to search page.

---

### UI-18: Icon Library Inconsistency
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: UI  
**Effort**: 1 hour

**Problem**: Mix of Lucide React and Google Material Symbols.

**Solution**: Standardize on Lucide React.

---

### UI-19: Generic Empty State
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: UX  
**Effort**: 30 minutes

**Solution**: Add helpful suggestions when no flights found.

---

### UI-20: Price Range Labels Not Dynamic
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: UI  
**Effort**: 15 minutes

**Files**: `components/flights/search/FlightFilterSidebar.tsx`

**Solution**: Display current selected price range values.

---

### LOGIC-13: Inconsistent Button Styling
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: UI Consistency  
**Effort**: 1 hour

**Solution**: Create reusable `BookingButton` component.

---

### LOGIC-14: Hardcoded Price in Payment Button
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: UI  
**Effort**: 15 minutes

**Files**: `components/flights/booking/steps/StepPayment.tsx` (line 132)

**Problem**: Shows `$1,144` hardcoded.

**Solution**: Use `calculateFinalPrice()` function.

---

### LOGIC-15: Limited Gender Options
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: Form  
**Effort**: 5 minutes

**Files**: `components/flights/booking/steps/StepPassengers.tsx` (line 117-124)

**Problem**: Missing "Other" option from interface.

**Solution**: Add `<option value="other">Other/Prefer not to say</option>`.

---

### LOGIC-16: Hardcoded TCent Balance
**Priority**: 🟢 Low  
**Status**: ❌ Open  
**Category**: User Data  
**Effort**: 1 hour

**Files**: `components/flights/booking/steps/StepPayment.tsx` (line 73)

**Solution**: Fetch real balance from user profile API.

---

## 📋 Issue Categories Breakdown

### By Type
- **API Integration**: 10 issues (23%)
- **UI Components**: 12 issues (28%)
- **Booking Logic**: 10 issues (23%)
- **UX/Accessibility**: 6 issues (14%)
- **Code Quality**: 5 issues (12%)

### By Sprint Priority
**Sprint 1 (Week 1)** - Critical Issues:
- API-01, API-02, API-03
- UI-01, UI-02, UI-03
- LOGIC-01, LOGIC-02, LOGIC-03, LOGIC-04

**Sprint 2 (Week 2)** - High Priority:
- UI-04, UI-05, UI-06, UI-07
- LOGIC-05, LOGIC-06, LOGIC-07
- API-04, API-05, API-06, API-07

**Sprint 3 (Week 3-4)** - Medium Priority:
- All Medium issues (UI-08 through API-10)

**Sprint 4 (Polish)** - Low Priority:
- All Low issues (UI-13 through LOGIC-16)

---

## 🎯 Quick Action Items (Today/This Week)

1. ⚡ **[API-01]** Integrate flight search API (~2h)
2. ⚡ **[API-02]** Integrate booking creation API (~3h)
3. ⚡ **[UI-01]** Fix airport selector (~2h)
4. ⚡ **[UI-02]** Fix travel class dropdown (~1.5h)
5. ⚡ **[LOGIC-01]** Complete review step (~3h)

**Total Quick Wins**: ~11.5 hours to unblock core functionality

---

## 📚 Related Documentation

- **Full Analysis**: [`flight_complete_analysis.md`](file:///C:/Users/LENONO/.gemini/antigravity/brain/d626031d-d8cf-47ab-a42d-bce0530d1a82/flight_complete_analysis.md)
- **UI/UX Deep Dive**: [`flight_uiux_analysis.md`](file:///C:/Users/LENONO/.gemini/antigravity/brain/d626031d-d8cf-47ab-a42d-bce0530d1a82/flight_uiux_analysis.md)
- **Booking Flow**: [`booking_flow_analysis.md`](file:///C:/Users/LENONO/.gemini/antigravity/brain/d626031d-d8cf-47ab-a42d-bce0530d1a82/booking_flow_analysis.md)
- **API Integration**: [`api_integration_status.md`](file:///C:/Users/LENONO/.gemini/antigravity/brain/d626031d-d8cf-47ab-a42d-bce0530d1a82/api_integration_status.md)

---

**Last Updated**: 27/01/2026  
**Next Review**: After Sprint 1 completion
