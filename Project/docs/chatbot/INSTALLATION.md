# TripC AI Chatbot - Installation Guide

Step-by-step guide to install and configure the AI chatbot.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project
- Clerk account and application
- Deepseek API account (get from https://platform.deepseek.com)

## Step 1: Install Dependencies

Navigate to the Project directory and install the required packages:

```bash
cd Project
npm install
```

This will install:

- `openai` ^4.77.0 - Deepseek API client
- `ai` ^4.0.0 - Vercel AI SDK
- `@ai-sdk/openai` ^1.0.0 - OpenAI provider for AI SDK
- `zod` ^3.24.1 - Schema validation

Or install manually:

```bash
npm install openai@^4.77.0 ai@^4.0.0 @ai-sdk/openai@^1.0.0 zod@^3.24.1
```

## Step 2: Configure Environment Variables

Create or update `.env.local` file in the `Project` directory:

```bash
# Copy example file
cp .env.local.example .env.local
```

Add the following variables:

```env
# Deepseek AI API Key
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Custom Deepseek API endpoint (defaults to official endpoint)
# DEEPSEEK_API_BASE_URL=https://api.deepseek.com

# Clerk (should already exist)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Getting Deepseek API Key

1. Visit https://platform.deepseek.com
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)
6. Add to `.env.local` as `DEEPSEEK_API_KEY`

**Important:** Keep your API key secure and never commit it to version control.

## Step 3: Set Up Database Schema

Execute the chatbot database schema in Supabase:

### Option 1: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `docs/chatbot/DATABASE_SCHEMA.sql`
4. Copy the contents
5. Paste into SQL Editor
6. Click **Run** to execute

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push --db-url "your-database-url"
```

### Option 3: Manual psql

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"

# Execute the schema file
\i docs/chatbot/DATABASE_SCHEMA.sql
```

### Verify Tables Created

Run this query in SQL Editor to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'chat_%';
```

You should see:

- `chat_conversations`
- `chat_messages`

## Step 4: Verify Installation

### Check Dependencies

```bash
npm list openai ai @ai-sdk/openai zod
```

Expected output:

```
├── openai@4.77.0
├── ai@4.0.0
├── @ai-sdk/openai@1.0.0
└── zod@3.24.1
```

### Test Environment Variables

Create a test script `test-env.js`:

```javascript
const fs = require("fs");
const path = require("path");

// Load .env.local
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

console.log("Environment Check:");
console.log(
  "✓ DEEPSEEK_API_KEY:",
  process.env.DEEPSEEK_API_KEY ? "Set" : "❌ Missing",
);
console.log(
  "✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:",
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Set" : "❌ Missing",
);
console.log(
  "✓ NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "❌ Missing",
);
```

Run:

```bash
node test-env.js
```

### Test Deepseek API Connection

Create `test-deepseek.js`:

```javascript
const OpenAI = require("openai");
require("dotenv").config({ path: ".env.local" });

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

async function test() {
  try {
    const response = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "user", content: "Hello! Just testing the connection." },
      ],
    });

    console.log("✓ Deepseek API connected successfully!");
    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("❌ Deepseek API error:", error.message);
  }
}

test();
```

Run:

```bash
node test-deepseek.js
```

Expected output:

```
✓ Deepseek API connected successfully!
Response: Hello! The connection is working. How can I help you?
```

## Step 5: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and look for the chat widget in the bottom-right corner.

## Step 6: Test the Chatbot

### Basic Test

Click the chat widget and try:

```
Hello!
```

Expected: AI responds with a greeting.

### Authentication Test

```
Am I logged in?
```

Expected: AI checks authentication status and responds accordingly.

### Hotel Search Test

```
Find hotels in Da Nang
```

Expected: AI searches the database and returns hotel listings.

### Flight Search Test

```
I need a flight from Hanoi to Ho Chi Minh City
```

Expected: AI searches flights and shows options.

### Booking Test (requires authentication)

First sign in, then:

```
Book the first hotel for tomorrow, 2 nights
```

Expected: AI creates a booking and confirms.

## Common Installation Issues

### Issue: "Cannot find module 'openai'"

**Solution:**

```bash
npm install openai@^4.77.0
```

---

### Issue: "DEEPSEEK_API_KEY is not defined"

**Solution:**

1. Check `.env.local` exists in Project directory
2. Verify variable name is exactly `DEEPSEEK_API_KEY`
3. Restart dev server after adding environment variables

---

### Issue: "Failed to fetch chat response"

**Causes:**

- Invalid API key
- Network issues
- Deepseek API rate limit

**Solution:**

1. Verify API key is correct
2. Check Deepseek API status
3. Check network connection
4. Review browser console for detailed errors

---

### Issue: "Database error when saving conversation"

**Solution:**

1. Verify DATABASE_SCHEMA.sql was executed
2. Check Supabase connection strings
3. Verify RLS policies are set up correctly

---

### Issue: "User not authenticated" for all requests

**Solution:**

1. Ensure Clerk is properly configured
2. Check session cookies are being sent
3. Verify middleware.ts is working

---

### Issue: Chat widget not appearing

**Solution:**

1. Check `components/ChatWidget.tsx` is imported in layout
2. Verify no CSS conflicts hiding the widget
3. Check browser console for errors

## Performance Tuning

### Optimize API Response Time

1. **Enable Streaming:** Already enabled by default
2. **Connection Pooling:** Configure Supabase connection pool
3. **Caching:** Add Redis for frequent queries

### Database Optimization

```sql
-- Add indexes for better query performance
CREATE INDEX idx_hotels_location ON hotels(city, country);
CREATE INDEX idx_flights_route ON flights(departure_airport, arrival_airport);
CREATE INDEX idx_bookings_user ON bookings(user_id, created_at DESC);
```

### Rate Limiting

Add rate limiting middleware in `middleware.ts`:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
});

export async function middleware(request: NextRequest) {
  // Existing middleware...

  if (request.nextUrl.pathname.startsWith("/api/chat")) {
    const identifier = request.ip ?? "anonymous";
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
  }
}
```

## Production Deployment

### Environment Variables for Production

```env
# Production Deepseek API Key
DEEPSEEK_API_KEY=sk-prod-xxxxxxxxxxxxx

# Production Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Optional: Enable analytics
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DEEPSEEK_API_KEY
vercel env add CLERK_SECRET_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to production
vercel --prod
```

### Deploy to Other Platforms

**Railway:**

```bash
railway up
railway variables set DEEPSEEK_API_KEY=sk-xxxxx
```

**Netlify:**

```bash
netlify deploy --prod
netlify env:set DEEPSEEK_API_KEY sk-xxxxx
```

### Health Check Endpoint

Add `app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  const checks = {
    deepseek: !!process.env.DEEPSEEK_API_KEY,
    clerk: !!process.env.CLERK_SECRET_KEY,
    supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  };

  const healthy = Object.values(checks).every((v) => v);

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
```

Access at: `https://your-domain.com/api/health`

## Monitoring

### Set Up Error Tracking

Install Sentry:

```bash
npm install @sentry/nextjs
```

Configure in `app/api/chat/messages/route.ts`:

```typescript
import * as Sentry from "@sentry/nextjs";

export async function POST(req: Request) {
  try {
    // Existing code...
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: "chat-api" },
      extra: { userId, messageCount },
    });

    // Return error response...
  }
}
```

### Analytics Tracking

```typescript
import { track } from "@vercel/analytics";

// Track chat usage
track("chat_message_sent", {
  userId: user.id,
  hasTools: toolCalls.length > 0,
});
```

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update specific packages
npm update openai ai @ai-sdk/openai zod

# Update all packages
npm update
```

### Backup Database

```bash
# Backup chat conversations
supabase db dump -f backup-$(date +%Y%m%d).sql

# Restore from backup
supabase db reset --db-url "your-db-url" -f backup.sql
```

### Monitor API Usage

Check Deepseek dashboard for:

- API call volume
- Token usage
- Costs
- Error rates

## Next Steps

1. **Customize System Prompt** - Edit prompt in `app/api/chat/messages/route.ts`
2. **Add More Tools** - Extend `lib/ai/tools.ts` with new functions
3. **Improve UI** - Enhance `components/ChatWidget.tsx` design
4. **Add Voice Input** - Integrate Web Speech API
5. **Multi-language** - Add i18n support for Vietnamese/Japanese

## Support

For issues or questions:

- Review [Troubleshooting Guide](./README.md#troubleshooting)
- Check [API Reference](./API_REFERENCE.md)
- Review [Architecture](./ARCHITECTURE.md)
- Check Deepseek documentation: https://platform.deepseek.com/docs

---

Installation complete! Your AI chatbot is ready to use. 🚀
