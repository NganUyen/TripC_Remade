# Entertainment Service - README

## Overview

The Entertainment Service provides a complete backend API for managing entertainment items including tours, shows, activities, attractions, and concerts. This service is built with Next.js 13+ App Router, TypeScript, Supabase (PostgreSQL), and Clerk authentication.

## Features

- ✅ Full CRUD operations for entertainment items
- ✅ Search and filtering capabilities
- ✅ Flexible JSONB metadata for extensibility
- ✅ Authentication via Clerk
- ✅ Row Level Security (RLS) in Supabase
- ✅ Health check endpoint
- ✅ Full-text search support
- ✅ Pagination support
- ✅ TypeScript type safety

## Tech Stack

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **ORM**: Supabase Client

## Project Structure

```
Project/
├── app/
│   └── api/
│       ├── entertainment/
│       │   ├── route.ts           # GET (list) & POST (create)
│       │   └── [id]/
│       │       └── route.ts       # GET, PUT, DELETE single item
│       └── ping/
│           └── route.ts           # Health check (updated with entertainment)
├── docs/
│   └── entertainment/
│       ├── README.md              # This file
│       ├── schema.md              # Database schema documentation
│       ├── api.md                 # API endpoint documentation
│       ├── migrations.sql         # Database migration script
│       └── tasks.txt              # Task checklist
└── lib/
    └── supabase-server.ts         # Supabase server client
```

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- A Supabase project (free tier works)
- A Clerk account for authentication
- Git (optional)

## Environment Variables

Create or update `.env.local` in your project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Optional: Convex (if using)
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Getting Your Keys

**Supabase:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy `URL`, `anon/public` key, and `service_role` key

**Clerk:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to API Keys
4. Copy the publishable and secret keys

## Installation & Setup

### 1. Install Dependencies

```bash
# If not already installed
npm install @supabase/supabase-js @clerk/nextjs
```

### 2. Run Database Migration

Navigate to your Supabase project:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New query"
5. Copy the entire contents of `docs/entertainment/migrations.sql`
6. Paste into the SQL editor
7. Click "Run" or press Ctrl+Enter

The migration will:
- Create the `entertainment_items` table
- Add indexes for performance
- Set up Row Level Security (RLS)
- Insert sample seed data (5 items)

### 3. Verify Database Setup

Run this query in Supabase SQL Editor to verify:

```sql
SELECT COUNT(*) FROM entertainment_items;
```

You should see 5 sample items.

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The server will start at `http://localhost:3000`

## Testing the API

### 1. Health Check

Test that all services are running:

```bash
curl http://localhost:3000/api/ping
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T12:00:00.000Z",
  "api": "ok",
  "services": {
    "flight_db": "ok",
    "hotel_db": "ok",
    "voucher_db": "ok",
    "transport_db": "ok",
    "dining_db": "ok",
    "shop_db": "ok",
    "entertainment_db": "ok"
  },
  "performance": {
    "api_response_time_ms": 45,
    "entertainment_db_response_time_ms": 12
  }
}
```

### 2. List Entertainment Items

```bash
# Get all items
curl http://localhost:3000/api/entertainment

# Search for "Paris"
curl "http://localhost:3000/api/entertainment?q=Paris"

# Filter by type
curl "http://localhost:3000/api/entertainment?type=tour"

# Get available shows with pagination
curl "http://localhost:3000/api/entertainment?type=show&available=true&limit=10"
```

### 3. Get Single Item

First, get an ID from the list endpoint, then:

```bash
curl http://localhost:3000/api/entertainment/{item-id}
```

### 4. Create New Item (Requires Auth)

You'll need to be authenticated with Clerk to perform write operations.

```bash
curl -X POST http://localhost:3000/api/entertainment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "Sydney Opera House Tour",
    "subtitle": "Behind the scenes experience",
    "type": "tour",
    "price": 75.00,
    "currency": "AUD",
    "location": {
      "city": "Sydney",
      "country": "Australia"
    }
  }'
```

### 5. Update Item (Requires Auth)

```bash
curl -X PUT http://localhost:3000/api/entertainment/{item-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "price": 80.00,
    "available": true
  }'
```

### 6. Delete Item (Requires Auth)

```bash
curl -X DELETE http://localhost:3000/api/entertainment/{item-id} \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

## Testing with Postman

1. Import the API endpoints into Postman
2. Set up authentication:
   - Go to Authorization tab
   - Type: Bearer Token
   - Token: Get from Clerk session
3. Test each endpoint

## Authentication

### Getting a Clerk Token

For testing authenticated endpoints:

1. Sign in to your app at `http://localhost:3000/sign-in`
2. Open browser DevTools → Application → Cookies
3. Find the `__session` cookie value
4. Use this as your Bearer token

### Programmatic Access

```typescript
import { auth } from '@clerk/nextjs/server';

// In an API route or server component
const { userId } = await auth();
if (!userId) {
  // User not authenticated
}
```

## API Documentation

Full API documentation is available in [api.md](./api.md)

Key endpoints:
- `GET /api/entertainment` - List items with search/filter
- `GET /api/entertainment/:id` - Get single item
- `POST /api/entertainment` - Create item (auth required)
- `PUT /api/entertainment/:id` - Update item (auth required)
- `DELETE /api/entertainment/:id` - Delete item (auth required)
- `GET /api/ping` - Health check

## Database Schema

Full schema documentation is available in [schema.md](./schema.md)

Main table: `entertainment_items`
- UUID primary key
- Title, subtitle, description
- Type (tour, show, activity, attraction, concert)
- Price and currency
- Availability flag
- JSONB location field
- JSONB metadata field
- Timestamps

## Troubleshooting

### Database Connection Fails

**Error**: "Failed to fetch entertainment items"

**Solutions**:
1. Check your Supabase URL and keys in `.env.local`
2. Verify the table exists: Run `SELECT * FROM entertainment_items LIMIT 1;` in Supabase SQL Editor
3. Check RLS policies are correctly set up
4. Ensure your Supabase project is not paused (free tier limitation)

### Authentication Fails

**Error**: "Unauthorized - Authentication required"

**Solutions**:
1. Verify Clerk keys in `.env.local`
2. Ensure you're signed in and have a valid session
3. Check the Bearer token is correctly formatted: `Authorization: Bearer <token>`
4. Test with a fresh sign-in

### CORS Issues

If you get CORS errors when testing from a different origin:

Update `next.config.js`:
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

### Migration Errors

If you get "relation already exists" errors:

```sql
-- Drop and recreate (WARNING: loses data)
DROP TABLE IF EXISTS entertainment_items CASCADE;
-- Then run the migration again
```

## Performance Optimization

### Indexes
The migration includes optimized indexes:
- B-tree indexes on `type` and `available`
- GIN index for full-text search

### Query Optimization Tips
- Use `limit` parameter for pagination
- Filter by `type` when possible
- Use `available=true` for public queries

### Caching (Future)
Consider implementing:
- Redis for frequently accessed items
- Next.js edge caching
- CDN for static content

## Security Best Practices

✅ **Implemented**:
- Row Level Security (RLS) in Supabase
- Authentication via Clerk
- Service role key stored server-side only
- Parameterized queries (SQL injection protection)

🔒 **Recommended for Production**:
- Rate limiting (using middleware or services like Upstash)
- Input validation (Zod or Yup)
- API key rotation
- Audit logging
- HTTPS only
- Environment variable validation

## Testing

### Manual Testing

Use the health check and API endpoints as shown above.

### Automated Testing (Future)

Consider adding:

```typescript
// __tests__/api/entertainment.test.ts
import { GET, POST } from '@/app/api/entertainment/route';

describe('Entertainment API', () => {
  it('should list entertainment items', async () => {
    const request = new Request('http://localhost:3000/api/entertainment');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data).toBeDefined();
  });
});
```

Run tests with:
```bash
npm test
# or
npm run test:watch
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Works with:
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted Node.js

Ensure environment variables are configured on your platform.

## Monitoring & Logging

Consider adding:
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay
- [Datadog](https://datadoghq.com) for APM
- Supabase Analytics for database insights

## Next Steps

### Immediate
- [ ] Run database migration
- [ ] Test all endpoints
- [ ] Review security settings
- [ ] Add your own entertainment items

### Future Enhancements
- [ ] Add booking functionality
- [ ] Implement reviews/ratings system
- [ ] Add availability calendar
- [ ] Integrate external providers (GetYourGuide, Viator)
- [ ] Add image upload support
- [ ] Implement real-time availability updates
- [ ] Add recommendation engine
- [ ] Create admin dashboard

## Support & Resources

- **API Documentation**: [api.md](./api.md)
- **Schema Documentation**: [schema.md](./schema.md)
- **Task Checklist**: [tasks.txt](./tasks.txt)
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Contributing

When adding new features:
1. Update the migration SQL if schema changes
2. Update API documentation
3. Add TypeScript types
4. Test all endpoints
5. Update this README

## License

[Add your license here]

## Authors

TripC Development Team

---

**Last Updated**: January 30, 2026
**Version**: 1.0.0
**Status**: MVP Complete ✅
