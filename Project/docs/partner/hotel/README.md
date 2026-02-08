# Hotel Partner Portal - Documentation Index

## 📚 Complete Documentation Suite

Welcome to the Hotel Partner Portal documentation. This comprehensive guide covers all aspects of the hotel partner system, from database design to business logic, workflows, and API specifications.

## 📖 Documentation Structure

### Core Documents

1. **[00_OVERVIEW.md](./00_OVERVIEW.md)** - Executive Summary & System Architecture
   - Purpose and key features
   - High-level architecture
   - Partner types and revenue model
   - Success criteria and metrics
   - **Start here** for a comprehensive understanding

2. **[01_DATABASE_SCHEMA.md](./01_DATABASE_SCHEMA.md)** - Database Design
   - Complete entity relationship diagrams
   - Detailed table definitions
   - Indexes and constraints
   - Row-level security policies
   - Database functions and triggers
   - **Essential for** backend developers

3. **[02_BUSINESS_LOGIC.md](./02_BUSINESS_LOGIC.md)** - Business Rules & Calculations
   - Validation rules for all entities
   - Pricing and rate calculations
   - TCent earning and redemption logic
   - Booking status transitions
   - Cancellation and refund policies
   - Review moderation rules
   - **Critical for** understanding system behavior

4. **[03_WORKFLOWS_FLOWS.md](./03_WORKFLOWS_FLOWS.md)** - Process Flows
   - Partner onboarding flow
   - Property listing process
   - Room configuration flow
   - Rate management workflow
   - Booking management process
   - Check-in/check-out procedures
   - Analytics and reporting flow
   - **Useful for** understanding operational processes

5. **[04_API_SPECIFICATION.md](./04_API_SPECIFICATION.md)** - API Reference
   - Complete API endpoint documentation
   - Request/response examples
   - Authentication and authorization
   - Error handling
   - Webhook integration
   - **Required for** integration development

## 🎯 Quick Start by Role

### For Product Managers
Start with:
1. [00_OVERVIEW.md](./00_OVERVIEW.md) - Understand features and goals
2. [03_WORKFLOWS_FLOWS.md](./03_WORKFLOWS_FLOWS.md) - Learn operational processes
3. [02_BUSINESS_LOGIC.md](./02_BUSINESS_LOGIC.md) - Understand business rules

### For Backend Developers
Start with:
1. [01_DATABASE_SCHEMA.md](./01_DATABASE_SCHEMA.md) - Database structure
2. [02_BUSINESS_LOGIC.md](./02_BUSINESS_LOGIC.md) - Validation and calculations
3. [04_API_SPECIFICATION.md](./04_API_SPECIFICATION.md) - API implementation

### For Frontend Developers
Start with:
1. [00_OVERVIEW.md](./00_OVERVIEW.md) - System overview
2. [03_WORKFLOWS_FLOWS.md](./03_WORKFLOWS_FLOWS.md) - User flows
3. [04_API_SPECIFICATION.md](./04_API_SPECIFICATION.md) - API endpoints

### For QA Engineers
Start with:
1. [02_BUSINESS_LOGIC.md](./02_BUSINESS_LOGIC.md) - Validation rules
2. [03_WORKFLOWS_FLOWS.md](./03_WORKFLOWS_FLOWS.md) - Test scenarios
3. [04_API_SPECIFICATION.md](./04_API_SPECIFICATION.md) - API testing

### For Partners (Hotel Owners/Managers)
Start with:
1. [00_OVERVIEW.md](./00_OVERVIEW.md) - Features and benefits
2. [03_WORKFLOWS_FLOWS.md](./03_WORKFLOWS_FLOWS.md) - How to use the portal

## 🏗️ System Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                  Hotel Partner Portal                        │
│                   (Next.js Frontend)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Next.js API Routes)                  │
│  • Authentication & Authorization                            │
│  • Business Logic Validation                                 │
│  • Data Transformation                                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              Database (Supabase PostgreSQL)                  │
│  • hotel_partners          • hotels                          │
│  • hotel_rooms            • hotel_rates                      │
│  • hotel_bookings         • hotel_reviews                    │
│  • partner_users          • partner_analytics                │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Key Features Overview

### Property Management
- Multi-property support for hotel chains
- Comprehensive property details management
- Photo upload and management
- Amenities configuration
- Policies and contact information

### Room Management
- Multiple room types per property
- Detailed room specifications
- Room photos and virtual tours
- Amenity configuration per room type
- Inventory management

### Rate Management
- Daily rate configuration
- Seasonal pricing
- Dynamic pricing capabilities
- Rate plans (standard, non-refundable, early bird)
- Bulk rate updates
- Channel-specific rates

### Booking Management
- Real-time booking notifications
- Booking status tracking
- Check-in/check-out management
- Modification handling
- Cancellation processing
- Guest communication

### Channel Management
- Direct bookings (TripC)
- OTA integrations (Booking.com, Agoda, Expedia)
- Rate parity maintenance
- Inventory synchronization
- Commission tracking

### Analytics & Reporting
- Occupancy reports
- Revenue analytics
- ADR and RevPAR tracking
- Channel performance
- Booking pace analysis
- Custom report generation

### Review Management
- Review collection and aggregation
- Response management
- Rating tracking
- Sentiment analysis
- Reputation monitoring

## 💰 Revenue Model

### Commission Structure
- **Direct Bookings**: 10% commission
- **OTA Bookings**: 15-18% commission (varies by partner)
- **Volume Discounts**: Available for high-volume partners
- **Monthly Payouts**: Automated payout processing

### TCent Integration
- **Earning**: Guests earn 5% of booking value in TCent
- **Redemption**: Guests can use TCent for discounts (up to 30%)
- **Tiered Earning**: Higher tiers earn more TCent
- **Partner Benefits**: TCent usage increases booking conversion

## 🔐 Security & Authentication

### Partner Authentication
- **Separate Auth System**: Not using Clerk for partners
- **JWT-based**: Token authentication
- **Multi-factor Auth**: Optional for sensitive operations
- **Role-based Access**: Admin, Manager, Staff roles
- **Permission System**: Granular resource permissions

### Data Security
- **Encryption**: Data encrypted at rest and in transit
- **Row Level Security**: PostgreSQL RLS policies
- **Audit Logging**: All sensitive operations logged
- **PCI Compliance**: Payment data handled securely

## 📊 Database Overview

### Core Tables
- **hotel_partners**: Partner organizations (10 fields)
- **hotel_partner_listings**: Hotel-partner relationships (12 fields)
- **hotels**: Hotel properties (14 fields)
- **hotel_rooms**: Room types (21 fields)
- **hotel_rates**: Daily pricing & availability (22 fields)
- **hotel_bookings**: Customer reservations (50+ fields)
- **hotel_reviews**: Customer feedback (19 fields)

### Supporting Tables
- **partner_users**: Partner portal users (13 fields)
- **partner_permissions**: Access control (6 fields)
- **partner_analytics**: Pre-calculated metrics (15 fields)
- **partner_payouts**: Commission payments (15 fields)
- **hotel_booking_modifications**: Change history (12 fields)

Total: **12 tables**, **250+ fields**

## 🔄 Key Workflows

### 1. Partner Onboarding
```
Registration → Email Verification → Partner Info → 
Agreement → Admin Review → Approval → Property Setup → Go Live
```
**Timeline**: 1-3 business days

### 2. Property Listing
```
Basic Info → Description → Policies → Photos → 
Room Setup → Rate Setup → Submit → Review → Live
```
**Timeline**: 30-60 minutes (partner effort)

### 3. Booking Process
```
Customer Search → Selection → Payment → Confirmation →
Partner Notification → Pre-arrival → Check-in → 
Stay → Check-out → Review
```
**Timeline**: Varies (booking to checkout)

### 4. Monthly Payout
```
Calculate (Day 1) → Statement (Day 3) → 
Disputes (Day 8) → Payment (Day 10) → Received (Day 15)
```
**Timeline**: 15 days per cycle

## 📈 Key Metrics

### For Partners
- **Occupancy Rate**: % of rooms booked
- **ADR**: Average Daily Rate per room
- **RevPAR**: Revenue Per Available Room
- **Booking Conversion**: % of searches that convert
- **Review Score**: Average guest rating
- **Response Rate**: % of reviews responded to

### For Platform
- **Active Partners**: Number of active partners
- **Listed Properties**: Total properties on platform
- **Monthly Bookings**: Total bookings processed
- **Commission Revenue**: Platform earnings
- **Customer Satisfaction**: Net Promoter Score

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Library**: Custom components + shadcn/ui
- **State**: React Context + Hooks
- **Forms**: React Hook Form + Zod
- **Data Fetching**: SWR

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Custom JWT (separate from customer auth)
- **Storage**: Supabase Storage
- **Email**: SendGrid
- **SMS**: Twilio

### Integration
- **Payment**: Stripe Connect
- **OTA APIs**: Booking.com, Agoda, Expedia
- **Calendar**: iCal format
- **Analytics**: Custom solution + Google Analytics

## 🚀 Implementation Priorities

### Phase 1 (MVP) - Completed
✅ Database schema design  
✅ Business logic specification  
✅ Workflow documentation  
✅ API specification  

### Phase 2 (Implementation) - Next Steps
- [ ] Authentication system
- [ ] Hotel management APIs
- [ ] Room management APIs
- [ ] Rate management APIs
- [ ] Booking management APIs
- [ ] Partner dashboard UI
- [ ] Property listing UI
- [ ] Rate management UI

### Phase 3 (Advanced Features)
- [ ] Analytics dashboard
- [ ] Review management
- [ ] Channel integrations
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] AI-powered pricing

## 📝 API Quick Reference

### Base URL
```
https://tripc.com/api/partner/hotel
```

### Authentication
```http
POST /api/partner/auth/login
Authorization: Bearer {token}
```

### Key Endpoints
```
GET    /api/partner/hotels                 # List hotels
POST   /api/partner/hotels                 # Create hotel
GET    /api/partner/hotels/:id             # Get hotel details
PATCH  /api/partner/hotels/:id             # Update hotel

GET    /api/partner/hotels/:id/rooms       # List rooms
POST   /api/partner/hotels/:id/rooms       # Create room

GET    /api/partner/bookings               # List bookings
GET    /api/partner/bookings/:id           # Get booking details
PATCH  /api/partner/bookings/:id/status    # Update status

GET    /api/partner/analytics/dashboard    # Dashboard metrics
GET    /api/partner/reviews                # List reviews
GET    /api/partner/payouts                # List payouts
```

See [04_API_SPECIFICATION.md](./04_API_SPECIFICATION.md) for complete documentation.

## 🧪 Testing Strategy

### Unit Tests
- Business logic validation
- Calculation functions
- Data transformations
- Utility functions

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flows
- Payment processing

### End-to-End Tests
- Partner onboarding flow
- Property listing flow
- Booking management flow
- Rate update flow

### Performance Tests
- API response times
- Database query optimization
- Concurrent booking handling
- Rate sync performance

## 📞 Support & Resources

### For Partners
- **Portal URL**: https://tripc.com/partner/hotel
- **Support Email**: partner-support@tripc.com
- **Phone**: +84-123-456-789
- **Help Center**: https://help.tripc.com/partner

### For Developers
- **API Documentation**: [04_API_SPECIFICATION.md](./04_API_SPECIFICATION.md)
- **Database Schema**: [01_DATABASE_SCHEMA.md](./01_DATABASE_SCHEMA.md)
- **GitHub**: (internal repository)
- **Slack Channel**: #hotel-partner-dev

## 🎓 Best Practices

### For Partners
1. **Keep rates updated**: Update at least weekly
2. **Respond to reviews**: Within 48 hours
3. **Maintain availability**: Keep inventory accurate
4. **Use quality photos**: High-resolution, well-lit
5. **Complete profile**: Fill all property details

### For Developers
1. **Follow schema**: Use defined database structure
2. **Implement validation**: Use business logic rules
3. **Handle errors**: Proper error responses
4. **Test thoroughly**: Cover edge cases
5. **Document code**: Clear comments and docs

## 🔄 Version History

- **v1.0** (2026-02-08): Initial documentation
  - Complete database schema
  - Business logic specification
  - Workflow documentation
  - API specification

## 📄 License & Copyright

© 2026 TripC Platform. All rights reserved.

This documentation is proprietary and confidential. Unauthorized copying or distribution is prohibited.

---

## Navigation

- **Previous**: [Main Docs](../../README.md)
- **Next**: [00_OVERVIEW.md](./00_OVERVIEW.md) - Start reading

---

**Last Updated**: February 8, 2026  
**Maintained By**: TripC Development Team  
**Documentation Version**: 1.0
