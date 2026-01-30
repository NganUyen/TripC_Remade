# Hotel Booking Flow - Business Analysis & Technical Specification

## 1. BUSINESS REQUIREMENTS

### 1.1 User Flow
1. User browses hotels and selects a hotel
2. User views hotel details page
3. User selects:
   - Check-in date
   - Check-out date
   - Number of guests (adults, children)
   - Room type
4. User clicks "Reserve Sanctuary" button
5. System validates availability
6. System calculates total price
7. User confirms booking details
8. System processes payment (if required)
9. System creates booking record
10. System sends confirmation email
11. User receives confirmation code

### 1.2 Business Rules
- **Minimum Stay**: 1 night
- **Maximum Stay**: 30 nights
- **Check-in Time**: Default 15:00 (from hotel policies)
- **Check-out Time**: Default 12:00 (from hotel policies)
- **Cancellation**: Based on hotel policies (flexible, moderate, strict)
- **Booking Status Flow**: pending → confirmed → checked_in → checked_out
- **Payment**: Can be pending initially, must be confirmed before check-in

### 1.3 Pricing Calculation
```
Base Price = room nightly rate × number of nights
Tax = Base Price × tax rate (10%)
Service Fee = Base Price × service fee rate (5%)
TCent Discount = (TCent used) × TCent value rate
Working Pass Discount = calculated if applied
Total = Base Price + Tax + Service Fee - Discounts
TCent Earned = Total × earn rate (5-10%)
```

## 2. TECHNICAL ARCHITECTURE

### 2.1 Database Schema
**Table: hotel_bookings**
- Primary Key: uuid
- Foreign Keys: hotel_id, room_id, partner_id
- User Reference: user_id (Clerk ID)
- Booking Details: dates, guests, pricing
- Status Tracking: booking status, payment status

### 2.2 API Endpoints

#### POST /api/bookings
**Purpose**: Create a new hotel booking
**Authentication**: Required (Clerk)
**Request Body**:
```json
{
  "hotel_id": "uuid",
  "room_id": "uuid",
  "partner_id": "uuid",
  "check_in_date": "2026-05-12",
  "check_out_date": "2026-05-15",
  "guest": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "adults": 2,
    "children": 0,
    "infants": 0
  },
  "special_requests": "Late check-in",
  "tcent_used": 0,
  "working_pass_applied": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "booking_id": "uuid",
    "confirmation_code": "ABC12345",
    "status": "confirmed",
    "total_amount": 2520.00,
    "currency": "USD",
    "tcent_earned": 126
  }
}
```

#### GET /api/bookings/:id
**Purpose**: Get booking details
**Authentication**: Required (must be booking owner)

#### PATCH /api/bookings/:id
**Purpose**: Modify booking (dates, room, etc.)
**Authentication**: Required (must be booking owner)

#### POST /api/bookings/:id/cancel
**Purpose**: Cancel booking
**Authentication**: Required (must be booking owner)

### 2.3 Frontend Components

#### BookingSidebar Component
**State Management**:
- checkInDate
- checkOutDate
- adults
- children
- selectedRoomId
- isBooking (loading state)
- bookingError

**Functions**:
- handleDateChange()
- handleGuestChange()
- handleRoomTypeChange()
- validateBooking()
- createBooking()
- handlePayment()

#### BookingConfirmation Component (New)
- Displays booking summary
- Shows confirmation code
- Provides next steps
- Email confirmation link

## 3. VALIDATION RULES

### 3.1 Frontend Validation
- Check-in date must be today or future
- Check-out date must be after check-in date
- At least 1 adult required
- Maximum 4 adults + 2 children per room
- Room type must be selected

### 3.2 Backend Validation
- User must be authenticated
- Hotel must exist and be active
- Room must exist and belong to hotel
- Room must be available for selected dates
- Price calculation must match rate from database
- Payment method must be valid (if payment required)

## 4. AVAILABILITY CHECKING

### 4.1 Room Availability Logic
```sql
-- Check if room is available for date range
SELECT COUNT(*) = 0 as is_available
FROM hotel_bookings
WHERE room_id = :room_id
  AND status NOT IN ('cancelled', 'no_show')
  AND check_out_date > :check_in
  AND check_in_date < :check_out
```

### 4.2 Rate Availability
```sql
-- Get available rates for date range
SELECT MIN(price_cents) as best_price
FROM hotel_rates
WHERE room_id = :room_id
  AND date >= :check_in
  AND date < :check_out
  AND available_rooms > 0
```

## 5. CONFIRMATION CODE GENERATION

**Format**: 8 alphanumeric characters (uppercase)
**Pattern**: AAANNNN (3 letters + 5 numbers)
**Example**: TRP45789
**Uniqueness**: Must check database for duplicates

## 6. NOTIFICATIONS

### 6.1 Email Notifications
1. **Booking Confirmation**: Sent immediately after successful booking
2. **Pre-Arrival Reminder**: Sent 24 hours before check-in
3. **Check-in Instructions**: Sent on check-in day
4. **Post-Stay Survey**: Sent after check-out

### 6.2 SMS Notifications (Optional)
- Booking confirmation with code
- Check-in reminder

## 7. ERROR HANDLING

### 7.1 Common Errors
- `ROOM_NOT_AVAILABLE`: Selected room is not available
- `INVALID_DATES`: Date range is invalid
- `PAYMENT_FAILED`: Payment processing failed
- `RATE_NOT_FOUND`: No rate available for dates
- `HOTEL_INACTIVE`: Hotel is not accepting bookings
- `USER_NOT_AUTHENTICATED`: User session expired

### 7.2 Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ROOM_NOT_AVAILABLE",
    "message": "This room is not available for the selected dates",
    "details": {
      "check_in": "2026-05-12",
      "check_out": "2026-05-15",
      "alternative_dates": []
    }
  }
}
```

## 8. TESTING REQUIREMENTS

### 8.1 Unit Tests
- Confirmation code generation
- Price calculation
- Date validation
- Availability checking

### 8.2 Integration Tests
- Complete booking flow
- Payment processing
- Email sending
- Database transactions

### 8.3 End-to-End Tests
- User journey from search to confirmation
- Cancellation flow
- Modification flow

## 9. SECURITY CONSIDERATIONS

### 9.1 Authentication & Authorization
- All booking operations require authenticated user
- Users can only access their own bookings
- Admin users can access all bookings

### 9.2 Data Protection
- PII encryption for guest information
- Secure payment token handling
- Rate limiting on booking creation (5 bookings per hour per user)

### 9.3 Audit Trail
- Log all booking status changes
- Track modification history
- Record cancellation reasons

## 10. PERFORMANCE OPTIMIZATION

### 10.1 Database Optimization
- Index on user_id, hotel_id, check_in_date
- Partition bookings by year
- Cache frequently accessed hotels and rates

### 10.2 API Optimization
- Rate limiting
- Response caching for hotel details
- Async email sending
- Background job for confirmation emails

## 11. FUTURE ENHANCEMENTS

- Multi-room booking support
- Group booking functionality
- Installment payment options
- Dynamic pricing based on demand
- Loyalty program integration
- AI-powered date suggestions
- Virtual room tours
- Chatbot for booking assistance
