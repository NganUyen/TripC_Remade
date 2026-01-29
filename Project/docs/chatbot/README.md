# TripC AI Chatbot Documentation

Welcome to the TripC AI Chatbot documentation! This intelligent conversational assistant helps users search, explore, and book travel services across the entire TripC platform.

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Documentation Index](#documentation-index)
4. [Architecture](#architecture)
5. [Features](#features)
6. [Installation](#installation)
7. [Configuration](#configuration)
8. [API Reference](#api-reference)
9. [Tool System](#tool-system)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

## Documentation Index

This directory contains comprehensive documentation:

- **[INSTALLATION.md](./INSTALLATION.md)** - Complete installation guide with troubleshooting
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, data flow, and design decisions
- **[TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md)** - All 40+ AI tools with examples
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Chat API endpoints, SSE streaming, integration examples
- **[DATABASE_SCHEMA.sql](./DATABASE_SCHEMA.sql)** - Chat persistence schema for Supabase

## Overview

The TripC AI Chatbot is powered by **Deepseek AI** and provides an intelligent, conversational interface for:

- 🏨 **Hotels** - Search and book hotel rooms
- ✈️ **Flights** - Search and book flights
- 🍽️ **Restaurants** - Search and book tables
- 💆 **Venues** - Book spa, wellness, beauty, and entertainment services
- 🎫 **Tickets** - Book tours, activities, attractions, and events
- 🚗 **Transport** - Book airport transfers, taxis, and car rentals
- 🛍️ **Shop** - Order products from the TripC shop
- 🎁 **Vouchers** - Search for and purchase vouchers/gift cards
- 🎉 **Promotions** - Discover active discounts and deals
- 💳 **Payments** - Generate payment links for bookings

## Quick Start

### Prerequisites

- Node.js 18+
- Next.js 14+
- Supabase account
- Clerk account
- Deepseek API key

### 1. Install Dependencies

```bash
cd Project
npm install
```

This will install the required packages:

- `openai` - For Deepseek API (OpenAI-compatible)
- `ai` - Vercel AI SDK
- `zod` - Schema validation

### 2. Set Up Database

Run the SQL schema in your Supabase database:

```bash
# Copy the schema from docs/chatbot/DATABASE_SCHEMA.sql
# and execute it in Supabase SQL Editor
```

This creates:

- `chat_conversations` table
- `chat_messages` table
- Triggers for auto-updating timestamps
- Row Level Security policies

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your keys:
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 4. Get Your Deepseek API Key

1. Visit https://platform.deepseek.com
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy the key to your `.env.local`

### 5. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and click the chat button in the bottom-right corner!

## Architecture

The chatbot follows a modular, scalable architecture:

```
User Interface (ChatWidget)
         ↓
API Route (/api/chat/messages)
         ↓
Deepseek AI Engine
         ↓
Tool Registry (11 categories, 40+ tools)
         ↓
Service Handlers
         ↓
Database (Supabase + Convex)
```

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Features

### ✅ Implemented

- **Real-time Streaming** - Messages stream in real-time as AI generates them
- **Function Calling** - AI can call 40+ tools to fetch data and perform actions
- **Authentication Integration** - Checks user login status before bookings
- **Multi-Service Support** - Works across all 11 service categories
- **Beautiful UI** - Glassmorphic design with smooth animations
- **Dark Mode** - Full dark mode support
- **Conversation History** - Stores conversations in database (schema ready)
- **Error Handling** - Graceful error handling with user-friendly messages
- **Rate Limiting Ready** - Architecture supports rate limiting

### 🚧 Planned Enhancements

- **Conversation Persistence** - Load previous conversations
- **Multi-language Support** - Vietnamese, English, Japanese
- **Voice Input/Output** - Speech-to-text and text-to-speech
- **Image Understanding** - Analyze hotel/venue photos
- **Personalized Recommendations** - ML-based suggestions
- **Collaborative Planning** - Multi-user trip planning

## Installation

### Dependencies Installed

```json
{
  "dependencies": {
    "openai": "^4.77.0", // Deepseek API client
    "ai": "^4.0.0", // Vercel AI SDK
    "zod": "^3.24.1", // Schema validation
    "@ai-sdk/openai": "^1.0.0" // AI SDK OpenAI adapter
  }
}
```

### File Structure

```
Project/
├── app/
│   └── api/
│       └── chat/
│           └── messages/
│               └── route.ts          # Main chat API endpoint
├── components/
│   └── ChatWidget.tsx                # Chat UI component
├── lib/
│   └── ai/
│       ├── tools.ts                  # Tool definitions (Zod schemas)
│       ├── handlers.ts               # Tool handlers (hotels, flights, etc.)
│       └── handlers-extended.ts      # Extended handlers (venues, shop, etc.)
└── docs/
    └── chatbot/
        ├── README.md                 # This file
        ├── ARCHITECTURE.md           # System architecture
        ├── DATABASE_SCHEMA.sql       # Database schema
        ├── API_REFERENCE.md          # API documentation
        └── TOOLS_REFERENCE.md        # Tool documentation
```

## Configuration

### Environment Variables

| Variable                            | Required | Description               |
| ----------------------------------- | -------- | ------------------------- |
| `DEEPSEEK_API_KEY`                  | ✅ Yes   | Your Deepseek API key     |
| `NEXT_PUBLIC_SUPABASE_URL`          | ✅ Yes   | Supabase project URL      |
| `SUPABASE_SERVICE_ROLE_KEY`         | ✅ Yes   | Supabase service role key |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes   | Clerk publishable key     |
| `CLERK_SECRET_KEY`                  | ✅ Yes   | Clerk secret key          |

### Deepseek Model Configuration

The chatbot uses the `deepseek-chat` model with these settings:

```typescript
{
  model: 'deepseek-chat',
  temperature: 0.7,        // Balanced creativity/consistency
  max_tokens: 2000,        // Maximum response length
  functions: [...],        // 40+ available tools
  function_call: 'auto'    // AI decides when to call tools
}
```

### System Prompt

The AI is configured with a comprehensive system prompt that defines:

- Role and personality
- Guidelines for user interaction
- Authentication requirements
- Response formatting standards
- Current date context

See `app/api/chat/messages/route.ts` for the full system prompt.

## API Reference

### POST /api/chat/messages

Send a message to the chatbot and receive a streaming response.

**Request:**

```typescript
POST /api/chat/messages
Content-Type: application/json

{
  "messages": [
    {
      "role": "user" | "assistant" | "system",
      "content": "Find hotels in Da Nang"
    }
  ]
}
```

**Response:**

```
Content-Type: text/event-stream

data: {"content": "I'll"}
data: {"content": " search"}
data: {"content": " for"}
data: {"content": " hotels..."}
data: [DONE]
```

**Authentication:**

- User authentication is handled via Clerk session
- Unauthenticated users can chat but cannot make bookings
- AI checks authentication before booking operations

**Rate Limits:**

- Development: No limits
- Production: Implement rate limiting based on your needs

For complete API documentation, see [API_REFERENCE.md](./API_REFERENCE.md).

## Tool System

The chatbot has access to 40+ tools across 11 categories:

### Authentication (2 tools)

- `check_auth_status` - Verify login status
- `get_user_profile` - Get user details

### Hotels (5 tools)

- `search_hotels` - Search for hotels
- `get_hotel_details` - Get hotel information
- `get_hotel_reviews` - Fetch reviews
- `check_room_availability` - Check availability
- `create_hotel_booking` - Book a room

### Flights (4 tools)

- `search_flights` - Search for flights
- `get_flight_details` - Get flight info
- `get_airline_rating` - Airline ratings
- `create_flight_booking` - Book a flight

### Restaurants (6 tools)

- `search_restaurants` - Search restaurants
- `get_restaurant_details` - Get details
- `get_restaurant_menu` - View menu
- `get_restaurant_reviews` - Read reviews
- `check_table_availability` - Check tables
- `create_restaurant_booking` - Book a table

### Plus 7 more categories...

For complete tool documentation, see [TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md).

## Deployment

### Development

```bash
npm run dev
```

### Production (Vercel)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Add AI chatbot"
   git push
   ```

2. **Deploy to Vercel**
   - Connect your repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Environment Variables in Vercel**
   - Go to Settings > Environment Variables
   - Add all required keys from `.env.local`
   - Redeploy

### Production Considerations

- **Rate Limiting** - Implement rate limiting to control costs
- **Monitoring** - Use Sentry or similar for error tracking
- **Analytics** - Track tool usage and conversation metrics
- **Caching** - Cache search results to reduce API calls
- **Error Recovery** - Implement retry logic for failed requests

## Troubleshooting

### Common Issues

#### 1. "Failed to get response" Error

**Cause:** Deepseek API key not set or invalid

**Solution:**

```bash
# Check your .env.local file
echo $DEEPSEEK_API_KEY

# Make sure it starts with "sk-"
# Get a new key from https://platform.deepseek.com
```

#### 2. "User not authenticated" Error

**Cause:** User trying to book without signing in

**Solution:** This is expected behavior. The AI will ask users to sign in before making bookings.

#### 3. Database Errors

**Cause:** Tables not created or RLS policies blocking access

**Solution:**

```sql
-- Run the schema again in Supabase SQL Editor
-- Check RLS policies are enabled
-- Verify Clerk-Supabase integration
```

#### 4. Streaming Not Working

**Cause:** Server-Sent Events blocked or CORS issues

**Solution:**

- Check browser console for errors
- Verify API route is accessible
- Check CORS headers in production

#### 5. Function Calls Failing

**Cause:** Handler functions not finding data

**Solution:**

- Verify Supabase tables exist and have data
- Check service role key has proper permissions
- Review handler error logs

### Debug Mode

Enable debug logging:

```typescript
// In app/api/chat/messages/route.ts
console.log("Received messages:", messages);
console.log("Function call:", choice.message.function_call);
console.log("Function result:", functionResult);
```

### Getting Help

1. Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
2. Review [TOOLS_REFERENCE.md](./TOOLS_REFERENCE.md) for tool details
3. See [API_REFERENCE.md](./API_REFERENCE.md) for API docs
4. Search existing GitHub issues
5. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment (dev/production)
   - Logs (remove sensitive data)

## Performance Tips

1. **Cache Search Results** - Cache hotel/flight searches for 5-10 minutes
2. **Optimize Queries** - Use database indexes for faster queries
3. **Limit Results** - Return max 10 results per search
4. **Stream Responses** - Always use streaming for better UX
5. **Batch Operations** - Combine multiple DB queries when possible

## Security Best Practices

1. **Never expose API keys** - Use environment variables
2. **Validate all inputs** - Use Zod schemas
3. **Check authentication** - Verify user before bookings
4. **Use RLS policies** - Protect user data in database
5. **Rate limit** - Prevent abuse and control costs
6. **Sanitize outputs** - Prevent XSS attacks
7. **Encrypt conversations** - Use Supabase encryption

## Cost Optimization

### Deepseek API Pricing

- **Free Tier:** 500 requests/day
- **Pro Tier:** $0.14 per 1M input tokens, $0.28 per 1M output tokens

### Tips to Reduce Costs

1. **Cache aggressively** - Reduce redundant API calls
2. **Use shorter prompts** - Minimize token usage
3. **Limit max_tokens** - Cap response length
4. **Implement rate limiting** - Control usage per user
5. **Monitor usage** - Track API calls and costs

## License

This chatbot is part of the TripC project. See main project LICENSE.

## Support

For support, please contact:

- Email: support@tripc.app
- GitHub Issues: [Create an issue](https://github.com/NganUyen/TripC_Remade/issues)

---

**Built with ❤️ by the TripC Team**
