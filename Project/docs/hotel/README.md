# Hotel Service MVP - Complete Documentation

## 📋 Overview

The Hotel Service is a comprehensive backend service for managing hotel listings, rooms, rates, bookings, and reviews. Built with Next.js 14 App Router, Supabase PostgreSQL, and Clerk authentication, it follows the same architectural patterns as the Flight Service.

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Clerk (JWT-based)
- **ORM**: Direct Supabase client (no Prisma)
- **API**: RESTful serverless functions

### Database Schema

5 core tables with full relational integrity:

- `hotels` - Hotel properties
- `hotel_rooms` - Room types per hotel
- `hotel_rates` - Daily pricing and availability
- `hotel_bookings` - Customer reservations
- `hotel_reviews` - Guest feedback

See [schema.md](./schema.md) for detailed table structures.

### Directory Structure

```
Project/
├── app/api/hotels/
│   ├── route.ts                    # GET /api/hotels (list), POST (create)
│   ├── [slug]/route.ts             # GET /api/hotels/[slug] (details)
│   ├── [slug]/rooms/route.ts       # GET/POST rooms
│   ├── [slug]/rates/route.ts       # GET rates by date range
│   └── bookings/route.ts           # POST /api/hotels/bookings (create)
├── lib/hotel/
│   ├── supabaseServerClient.ts     # Server-side Supabase client
│   ├── clerkAuth.ts                # Authentication helpers
│   └── utils.ts                    # Hotel-specific utilities
└── docs/hotel/
    ├── migrations/
    │   └── 001_create_hotel_schema.sql
    ├── README.md (this file)
    ├── schema.md
    ├── api.md
    └── tasks.md
```

## 🚀 Quick Start

### 1. Database Setup

```bash
# Navigate to migrations folder
cd docs/hotel/migrations

# Run migration in Supabase SQL editor
# Copy contents of 001_create_hotel_schema.sql
# Execute in Supabase dashboard
```

### 2. Environment Variables

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### 3. Test Health Check

```bash
# Start dev server
npm run dev

# Visit health monitor
open http://localhost:3000/ping

# Or curl the API
curl http://localhost:3000/api/ping
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-02-01T10:00:00.000Z",
  "uptime": "5m 23s",
  "environment": "development",
  "services": [
    {
      "name": "Flight Database",
      "status": "healthy",
      "responseTime": 45
    },
    {
      "name": "Hotel Database",
      "status": "healthy",
      "responseTime": 38
    }
  ]
}
```

### 4. Test Hotel Endpoints

```bash
# List hotels
curl http://localhost:3000/api/hotels

# Get hotel details
curl http://localhost:3000/api/hotels/luxury-bangkok-hotel

# Get rooms
curl http://localhost:3000/api/hotels/luxury-bangkok-hotel/rooms

# Get rates
curl "http://localhost:3000/api/hotels/luxury-bangkok-hotel/rates?start=2025-02-01&end=2025-02-05"
```

## 📚 API Documentation

See [api.md](./api.md) for comprehensive API reference including:

- Request/response formats
- Query parameters
- Authentication requirements
- Error codes
- Example requests

## 🔐 Authentication

### Public Endpoints

- `GET /api/hotels` - List hotels
- `GET /api/hotels/[slug]` - Hotel details
- `GET /api/hotels/[slug]/rooms` - List rooms
- `GET /api/hotels/[slug]/rates` - Get rates

### Protected Endpoints (Require Clerk Auth)

- `POST /api/hotels` - Create hotel
- `POST /api/hotels/[slug]/rooms` - Create room
- `POST /api/hotels/bookings` - Create booking

### Authentication Flow

1. Client authenticates with Clerk
2. Clerk issues JWT token
3. Token sent in request headers
4. `verifyClerkAuth()` validates token
5. User ID extracted from session
6. User ID stored in booking records

## 🧪 Testing

### Manual Testing

Use the health monitor page at `/ping` to test all endpoints visually.

### Automated Tests

```bash
# Run Jest tests
npm test

# Run specific test suite
npm test -- hotels.test.ts

# Watch mode
npm test -- --watch
```

See `__tests__/api/hotels.test.ts` for test examples.

## 📊 Monitoring & Health Checks

### Health Check Endpoint

`GET /api/ping` monitors:

- API server responsiveness
- Flight database connectivity
- Hotel database connectivity
- Response times for each service
- System uptime

### Health Monitor UI

Navigate to `/ping` for real-time dashboard showing:

- Overall system status
- Individual service health
- Response time metrics
- Auto-refresh every 30 seconds

## 🔄 Migration Guide

### Running Migrations

1. Copy SQL from `docs/hotel/migrations/001_create_hotel_schema.sql`
2. Open Supabase dashboard → SQL Editor
3. Paste and execute
4. Verify tables created in Table Editor

### Rollback Plan

```sql
-- Drop all tables (cascade deletes references)
DROP TABLE IF EXISTS hotel_reviews CASCADE;
DROP TABLE IF EXISTS hotel_bookings CASCADE;
DROP TABLE IF EXISTS hotel_rates CASCADE;
DROP TABLE IF EXISTS hotel_rooms CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
```

## 🐛 Troubleshooting

### Common Issues

**1. Database connection fails**

- Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
- Check Supabase project is active
- Ensure RLS policies allow service role access

**2. Authentication errors**

- Verify Clerk keys are correct
- Check JWT token is being sent in headers
- Ensure user is signed in on client

**3. Rate availability issues**

- Verify `hotel_rates` table has data
- Check date range overlaps with available rates
- Ensure `available_rooms > 0`

**4. Booking creation fails**

- Verify hotel and room IDs are valid
- Check date range is valid (check-out > check-in)
- Ensure sufficient room availability

### Debug Mode

Enable verbose logging:

```typescript
// In lib/hotel/supabaseServerClient.ts
export const supabaseServerClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
    db: { schema: "public" },
    global: { headers: { "x-debug": "true" } },
  },
);
```

## 📈 Performance Optimization

### Database Indexes

All critical queries are indexed:

- `hotels.slug` (unique)
- `hotel_rooms.hotel_id + code`
- `hotel_rates.room_id + date`
- `hotel_bookings.user_id + status`

### Query Optimization

- Use `.select('specific, columns')` instead of `SELECT *`
- Add `.limit()` to list endpoints
- Use `.single()` when expecting one result
- Implement pagination for large datasets

### Caching Strategy

Consider adding:

- Server-side caching with Redis
- Client-side caching with SWR/React Query
- CDN caching for static hotel data

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- Service role bypasses RLS (server-side operations)
- Public read access for active hotels/rooms/rates
- User-scoped write access for bookings
- Admin-only access for creating hotels/rooms

### Data Validation

- Server-side validation in API routes
- Type safety with TypeScript
- Database constraints (NOT NULL, UNIQUE, CHECK)
- Input sanitization

### Rate Limiting

Consider implementing:

```typescript
// Example with upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

## 🚢 Deployment

### Prerequisites

- Supabase project in production mode
- Clerk production instance
- Environment variables configured

### Deployment Steps

1. **Verify Environment**

   ```bash
   npm run build
   npm run start
   ```

2. **Run Migrations**
   - Execute `001_create_hotel_schema.sql` in production Supabase

3. **Seed Data (Optional)**
   - Migration includes 3 sample hotels
   - For production, remove seed data or add real hotels

4. **Deploy to Vercel**

   ```bash
   vercel --prod
   ```

5. **Post-Deployment Checks**
   - Visit `/ping` to verify all services healthy
   - Test critical endpoints
   - Monitor error logs

### Environment-Specific Config

```typescript
// lib/config.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // Don't log service role key in production
  logLevel: process.env.NODE_ENV === "production" ? "error" : "debug",
};
```

## 📞 Support

### Internal Team Contacts

- Backend Lead: [Contact info]
- Database Admin: [Contact info]
- DevOps: [Contact info]

### Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TripC Architecture Docs](../ARCHITECTURE.md)

## 📝 License

Internal use only - TripC Platform

---

**Last Updated**: 2025-02-01  
**Version**: 1.0.0 (MVP)  
**Status**: Production Ready ✅
