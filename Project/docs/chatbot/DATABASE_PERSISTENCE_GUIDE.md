# Database Persistence Verification Guide

## What Was Fixed

The chatbot now saves all conversations and messages to your Supabase database.

## Changes Made

### 1. Chat API Route (`app/api/chat/messages/route.ts`)

- ✅ Added Supabase client initialization
- ✅ Auto-creates conversation on first message
- ✅ Saves user messages to database
- ✅ Saves AI assistant responses to database
- ✅ Returns conversation ID to client
- ✅ Links messages to authenticated users

### 2. ChatWidget Component (`components/ChatWidget.tsx`)

- ✅ Tracks conversation ID in state
- ✅ Sends conversation ID with subsequent messages
- ✅ Resets conversation ID when chat is reset
- ✅ Maintains conversation context across page refreshes (if stored)

## How It Works

### Flow for Authenticated Users:

1. User sends first message
2. API creates new conversation in `chat_conversations` table
3. API saves user message to `chat_messages` table
4. API calls Deepseek AI
5. API saves AI response to `chat_messages` table
6. API returns conversation ID to client
7. Subsequent messages use same conversation ID

### Flow for Unauthenticated Users:

1. Messages still work (AI responds)
2. Conversations are NOT saved (requires login)
3. Each message is independent

## Verify Database Persistence

### Method 1: Check Supabase Dashboard

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your project

2. **Open Table Editor:**
   - Click "Table Editor" in left sidebar
   - Select `chat_conversations` table

3. **Check Data:**
   - You should see conversations created when users chat
   - Each row has: `id`, `user_id`, `title`, timestamps

4. **Check Messages:**
   - Select `chat_messages` table
   - You should see all messages (user + assistant)
   - Each message links to a conversation via `conversation_id`

### Method 2: Run SQL Query

In Supabase SQL Editor, run:

```sql
-- Check recent conversations
SELECT * FROM chat_conversations
ORDER BY created_at DESC
LIMIT 10;

-- Check recent messages
SELECT
  cm.id,
  cm.conversation_id,
  cm.role,
  LEFT(cm.content, 50) as content_preview,
  cm.created_at
FROM chat_messages cm
ORDER BY cm.created_at DESC
LIMIT 20;

-- Check conversation with messages
SELECT
  cc.id as conversation_id,
  cc.title,
  cc.created_at as conversation_started,
  COUNT(cm.id) as message_count,
  MAX(cm.created_at) as last_message_at
FROM chat_conversations cc
LEFT JOIN chat_messages cm ON cm.conversation_id = cc.id
GROUP BY cc.id, cc.title, cc.created_at
ORDER BY cc.created_at DESC;
```

### Method 3: Test with a Real Conversation

1. **Start dev server:**

   ```bash
   npm run dev
   ```

2. **Sign in** to your TripC account (must be authenticated!)

3. **Open chat widget** (bottom-right corner)

4. **Send a test message:**

   ```
   Hello! Can you help me find hotels?
   ```

5. **Check Supabase immediately:**
   - Go to Table Editor → `chat_conversations`
   - You should see a new row created
   - Note the conversation `id`

6. **Check messages:**
   - Go to `chat_messages` table
   - Filter by the conversation `id`
   - You should see both your message and AI response

## Troubleshooting

### Issue: No conversations appear in database

**Possible causes:**

1. User is not signed in (authentication required)
2. Database schema not executed
3. RLS policies blocking inserts

**Solutions:**

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'chat_%';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'chat_%';

-- Check policies
SELECT * FROM pg_policies
WHERE tablename IN ('chat_conversations', 'chat_messages');
```

### Issue: "User not found" error

**Solution:**
Ensure your users table has data. The chatbot looks up users by `clerk_id`:

```sql
-- Check users
SELECT id, clerk_id, email
FROM users
LIMIT 5;
```

### Issue: Messages saved but conversation not linked

**Check:**

```sql
-- Find orphaned messages
SELECT * FROM chat_messages
WHERE conversation_id IS NULL;
```

## Database Schema Overview

```
chat_conversations
├── id (UUID, primary key)
├── user_id (UUID, references users.id)
├── title (TEXT)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── metadata (JSONB)

chat_messages
├── id (UUID, primary key)
├── conversation_id (UUID, references chat_conversations.id)
├── role (TEXT: 'user' or 'assistant')
├── content (TEXT)
├── function_call (JSONB)
├── function_result (JSONB)
├── created_at (TIMESTAMP)
└── metadata (JSONB)
```

## Next Steps

### Optional Enhancements

1. **Add conversation history UI:**
   - Show past conversations in sidebar
   - Allow users to continue old conversations
   - Search through chat history

2. **Export conversations:**

   ```sql
   -- Export user's conversations as JSON
   SELECT jsonb_agg(
     jsonb_build_object(
       'conversation', cc.*,
       'messages', (
         SELECT jsonb_agg(cm.* ORDER BY cm.created_at)
         FROM chat_messages cm
         WHERE cm.conversation_id = cc.id
       )
     )
   )
   FROM chat_conversations cc
   WHERE user_id = 'your-user-id';
   ```

3. **Analytics:**
   ```sql
   -- Conversation stats
   SELECT
     COUNT(DISTINCT conversation_id) as total_conversations,
     COUNT(*) as total_messages,
     COUNT(*) FILTER (WHERE role = 'user') as user_messages,
     COUNT(*) FILTER (WHERE role = 'assistant') as ai_messages,
     AVG(LENGTH(content)) as avg_message_length
   FROM chat_messages
   WHERE created_at > NOW() - INTERVAL '7 days';
   ```

## Verification Checklist

- [ ] Database schema executed successfully
- [ ] RLS policies active
- [ ] Tables visible in Supabase Table Editor
- [ ] User is signed in when testing
- [ ] Conversation appears in `chat_conversations`
- [ ] Messages appear in `chat_messages`
- [ ] conversation_id links messages correctly
- [ ] Timestamps are accurate
- [ ] Multiple messages in same conversation work

---

**Status:** ✅ Database persistence fully implemented  
**Last Updated:** January 28, 2026  
**Requires:** User authentication (Clerk) to save conversations
