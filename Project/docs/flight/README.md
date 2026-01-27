# Flight Service MVP - README

## Overview

The Flight Service is a core component of the TripC SuperApp, providing flight search and booking capabilities. This MVP implementation includes:

- **Flight Search**: Search for available flights by route and date
- **Flight Booking**: Create bookings with passenger details
- **Booking Management**: View and cancel bookings
- **Health Monitoring**: Real-time API and database health checks

## Architecture

This MVP follows the architectural principles outlined in the TripC Platform Architecture document, adapted for rapid prototyping:

- **Database**: Supabase (PostgreSQL) with real-time capabilities
- **API**: Next.js App Router API routes (TypeScript)
- **Authentication**: Clerk for user authentication
- **Frontend**: React + Next.js 14 with Tailwind CSS

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account and project
- Clerk account for authentication
- npm or yarn package manager

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your credentials to `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

### Database Setup

1. Run the schema migration:
   ```bash
   psql YOUR_DATABASE_URL -f supabase/migrations/20260125_flight_service_schema.sql
   ```

   Or using Supabase CLI:
   ```bash
   supabase db push
   ```

2. Seed the database with sample data:
   ```bash
   psql YOUR_DATABASE_URL -f supabase/migrations/20260125_flight_service_seed.sql
   ```

### Start Development Server

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Verify Installation

1. Open `http://localhost:3000/ping` in your browser
2. You should see all services showing "ok" status
3. Try the search API:
   ```bash
   curl 'http://localhost:3000/api/flight/search?origin=SGN&destination=HAN&date=2026-02-20'
   ```

## API Endpoints

### Public Endpoints

- `GET /api/ping` - Health check
- `GET /api/flight/search` - Search flights

### Authenticated Endpoints (Require Clerk login)

- `POST /api/flight/book` - Create booking
- `GET /api/flight/booking/:id` - Get booking details
- `DELETE /api/flight/booking/:id` - Cancel booking

See [api.md](./api.md) for detailed endpoint documentation.

## Database Schema

The Flight Service uses 4 main tables:

- **flights**: Individual flight segments with schedules and pricing
- **flight_offers**: Precomputed offers with availability
- **flight_bookings**: Customer bookings with passenger details
- **flight_search_cache**: Search result caching (optional)

See [schema.md](./schema.md) for detailed schema documentation.

## Key Features

### Flight Search
- Search by origin, destination, and date
- Filter by cabin class (Economy, Business, First)
- Pagination support
- Results sorted by price

### Flight Booking
- Secure booking creation for authenticated users
- Automatic PNR generation
- Seat availability validation
- Passenger information collection
- Contact details capture

### Booking Management
- View booking details
- Cancel bookings with seat return
- Booking history tracking

### Health Monitoring
- Real-time API health checks
- Database connectivity monitoring
- Visual dashboard at `/ping`
- Auto-refresh capabilities

## Development Workflow

### Running Tests

```bash
# API tests (when implemented)
npm test

# Manual API testing
curl examples in docs/flight/api.md
```

### Database Migrations

When modifying the schema:

1. Create a new migration file in `supabase/migrations/`
2. Run the migration:
   ```bash
   supabase migration up
   ```

### Code Structure

```
Project/
├── app/
│   ├── api/
│   │   ├── ping/route.ts           # Health check
│   │   └── flight/
│   │       ├── search/route.ts     # Flight search
│   │       ├── book/route.ts       # Booking creation
│   │       └── booking/[id]/route.ts # Booking details
│   └── ping/
│       └── page.tsx                # Health monitor UI
├── lib/
│   └── flight/
│       ├── supabaseServerClient.ts # Supabase client
│       ├── clerkAuth.ts           # Auth helpers
│       └── utils.ts               # Utility functions
└── supabase/
    └── migrations/
        ├── 20260125_flight_service_schema.sql
        └── 20260125_flight_service_seed.sql
```

## Important Notes

### MVP Limitations

This is an MVP implementation with the following simplifications:

1. **Simulated GDS Integration**: No real external flight data sources
2. **Auto-confirmed Bookings**: Payment integration pending
3. **Basic Seat Locking**: No timeout/expiration logic
4. **No Price Revalidation**: Prices assumed stable
5. **Simple PNR**: Random 6-character generation

### Security Considerations

- **Service Role Key**: Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- **Authentication**: All booking operations require Clerk authentication
- **Input Validation**: All inputs are validated before database operations
- **Error Handling**: Errors are logged server-side, sanitized for client responses

### Performance Optimization

- Database indexes on frequently queried fields
- Search result caching table available (optional)
- Pagination for large result sets
- Connection pooling via Supabase

## Next Steps

See [tasks.md](./tasks.md) for:
- Completed features
- Improvement opportunities
- Integration points with other services

## Support

For issues or questions:
1. Check [api.md](./api.md) for API documentation
2. Review [schema.md](./schema.md) for database details
3. See [tasks.md](./tasks.md) for known limitations
4. Refer to the main TripC Platform Architecture document

## License

Proprietary - TripC Platform
