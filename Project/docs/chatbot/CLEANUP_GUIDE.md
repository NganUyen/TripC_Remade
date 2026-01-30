# Chat Conversation Cleanup Guide

Complete guide for deleting old conversations and managing chat history.

## Quick Start

### Delete Conversations via UI

**In the ChatWidget:**

1. Click the **trash icon** (🗑️) in the header
2. Confirm deletion
3. Conversation and all messages are permanently deleted

**New Chat:**

- Click the **reset icon** (↻) to start a fresh conversation without deleting

---

## API Endpoints

### 1. Delete Specific Conversation

**Endpoint:** `DELETE /api/chat/conversations/:id`

**Usage:**

```javascript
const response = await fetch(`/api/chat/conversations/${conversationId}`, {
  method: "DELETE",
});

const result = await response.json();
// { success: true, message: "Conversation deleted successfully" }
```

**Requirements:**

- User must be authenticated
- User must own the conversation

---

### 2. List Your Conversations

**Endpoint:** `GET /api/chat/conversations`

**Usage:**

```javascript
const response = await fetch("/api/chat/conversations?limit=50&offset=0");
const data = await response.json();
// { conversations: [...], total: 10 }
```

**Parameters:**

- `limit` (optional): Number of conversations to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "Hotel search in Da Nang",
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T11:30:00Z",
      "message_count": 12,
      "last_message": {
        "role": "assistant",
        "content": "I found 5 hotels...",
        "created_at": "2026-01-15T11:30:00Z"
      }
    }
  ],
  "total": 10
}
```

---

### 3. Bulk Cleanup (Preview or Delete)

**Endpoint:** `POST /api/chat/conversations/cleanup`

**Preview what would be deleted:**

```javascript
const response = await fetch("/api/chat/conversations/cleanup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    days: 90,
    action: "preview",
  }),
});

const result = await response.json();
// {
//   action: "preview",
//   conversations_to_delete: 15,
//   conversations: [...]
// }
```

**Actually delete old conversations:**

```javascript
const response = await fetch("/api/chat/conversations/cleanup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    days: 90,
    action: "delete",
  }),
});

const result = await response.json();
// {
//   action: "delete",
//   deleted_count: 15,
//   message: "Deleted 15 conversation(s) older than 90 days"
// }
```

---

### 4. Delete All Conversations

**Endpoint:** `DELETE /api/chat/conversations`

⚠️ **WARNING:** This deletes ALL your conversations permanently!

**Usage:**

```javascript
const response = await fetch("/api/chat/conversations", {
  method: "DELETE",
});

const result = await response.json();
// {
//   success: true,
//   deleted_count: 25,
//   message: "Deleted all 25 conversation(s)"
// }
```

---

## Database Cleanup (SQL)

For administrators and maintenance tasks.

### Execute Cleanup Functions

First, run the cleanup functions from `DATABASE_CLEANUP.sql`:

```bash
# In Supabase SQL Editor, execute:
docs/chatbot/DATABASE_CLEANUP.sql
```

### Common Cleanup Tasks

**Delete conversations older than 90 days:**

```sql
SELECT * FROM delete_old_conversations(90);
```

**Delete empty conversations:**

```sql
SELECT delete_empty_conversations();
```

**Cleanup for specific user:**

```sql
-- Find user ID first
SELECT id FROM users WHERE email = 'user@example.com';

-- Then cleanup
SELECT * FROM cleanup_user_conversations('user-uuid-here', 30);
```

**Preview before deleting:**

```sql
-- See what would be deleted (90+ days old)
SELECT
  cc.id,
  cc.title,
  cc.created_at,
  cc.updated_at,
  COUNT(cm.id) as message_count,
  AGE(NOW(), cc.updated_at) as age
FROM chat_conversations cc
LEFT JOIN chat_messages cm ON cm.conversation_id = cc.id
WHERE cc.updated_at < NOW() - INTERVAL '90 days'
GROUP BY cc.id, cc.title, cc.created_at, cc.updated_at
ORDER BY cc.updated_at DESC;
```

---

## Automated Cleanup

### Option 1: Scheduled API Calls

Create a cron job or scheduled task:

**Daily Cleanup Script (Node.js):**

```javascript
// cleanup-old-chats.js
const CLEANUP_DAYS = 90;

async function cleanupOldConversations() {
  // Preview first
  const preview = await fetch(
    "https://your-domain.com/api/chat/conversations/cleanup",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_ADMIN_TOKEN",
      },
      body: JSON.stringify({
        days: CLEANUP_DAYS,
        action: "preview",
      }),
    },
  );

  const previewData = await preview.json();
  console.log(
    `Would delete ${previewData.conversations_to_delete} conversations`,
  );

  // If count looks reasonable, proceed
  if (
    previewData.conversations_to_delete > 0 &&
    previewData.conversations_to_delete < 1000
  ) {
    const deleteResult = await fetch(
      "https://your-domain.com/api/chat/conversations/cleanup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_ADMIN_TOKEN",
        },
        body: JSON.stringify({
          days: CLEANUP_DAYS,
          action: "delete",
        }),
      },
    );

    const result = await deleteResult.json();
    console.log(`Deleted ${result.deleted_count} conversations`);
  }
}

cleanupOldConversations();
```

**Schedule with cron (Linux/Mac):**

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/project && node cleanup-old-chats.js
```

**Schedule with Task Scheduler (Windows):**

```powershell
# Create scheduled task
schtasks /create /tn "CleanupOldChats" /tr "node C:\path\to\cleanup-old-chats.js" /sc daily /st 02:00
```

---

### Option 2: Supabase SQL Scheduled Jobs

If using Supabase with pg_cron extension:

```sql
-- Enable pg_cron (run once)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2 AM UTC
SELECT cron.schedule(
  'cleanup-old-conversations',
  '0 2 * * *',
  $$SELECT delete_old_conversations(90)$$
);

-- Schedule weekly cleanup of empty conversations
SELECT cron.schedule(
  'cleanup-empty-conversations',
  '0 3 * * 0',
  $$SELECT delete_empty_conversations()$$
);

-- View scheduled jobs
SELECT * FROM cron.job;

-- Unschedule a job
SELECT cron.unschedule('cleanup-old-conversations');
```

---

## Recommended Cleanup Schedule

### Daily

- Delete empty conversations (no messages)

```sql
SELECT delete_empty_conversations();
```

### Weekly

- Preview conversations older than 180 days

```sql
-- Just preview, don't delete yet
SELECT * FROM chat_conversations
WHERE updated_at < NOW() - INTERVAL '180 days';
```

### Monthly

- Delete conversations older than 90 days

```sql
SELECT * FROM delete_old_conversations(90);
```

### Quarterly

- Review and optimize database

```sql
VACUUM ANALYZE chat_conversations;
VACUUM ANALYZE chat_messages;

-- Check table sizes
SELECT
  pg_size_pretty(pg_total_relation_size('chat_conversations')) as conv_size,
  pg_size_pretty(pg_total_relation_size('chat_messages')) as msg_size;
```

---

## User Controls

### Add Settings Page for Users

Create a page where users can manage their chat history:

**Example UI Component:**

```tsx
import { useState } from "react";

export function ChatHistorySettings() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    const res = await fetch("/api/chat/conversations?limit=100");
    const data = await res.json();
    setConversations(data.conversations);
  };

  const deleteConversation = async (id: string) => {
    if (!confirm("Delete this conversation?")) return;

    await fetch(`/api/chat/conversations/${id}`, { method: "DELETE" });
    loadConversations(); // Reload list
  };

  const deleteOldConversations = async (days: number) => {
    if (!confirm(`Delete all conversations older than ${days} days?`)) return;

    await fetch("/api/chat/conversations/cleanup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days, action: "delete" }),
    });

    loadConversations(); // Reload list
  };

  const deleteAllConversations = async () => {
    if (!confirm("Delete ALL conversations? This cannot be undone!")) return;

    await fetch("/api/chat/conversations", { method: "DELETE" });
    setConversations([]);
  };

  return (
    <div className="space-y-4">
      <h2>Chat History</h2>

      <div className="flex gap-2">
        <button onClick={() => deleteOldConversations(30)}>
          Delete 30+ days old
        </button>
        <button onClick={() => deleteOldConversations(90)}>
          Delete 90+ days old
        </button>
        <button onClick={deleteAllConversations} className="text-red-600">
          Delete All
        </button>
      </div>

      <div className="space-y-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="flex justify-between items-center p-4 border rounded"
          >
            <div>
              <h3>{conv.title}</h3>
              <p className="text-sm text-gray-500">
                {conv.message_count} messages • Last updated:{" "}
                {new Date(conv.updated_at).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => deleteConversation(conv.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Storage Management

### Check Storage Usage

```sql
-- Total storage used by chat tables
SELECT
  pg_size_pretty(pg_total_relation_size('chat_conversations')) as conversations_size,
  pg_size_pretty(pg_total_relation_size('chat_messages')) as messages_size,
  pg_size_pretty(
    pg_total_relation_size('chat_conversations') +
    pg_total_relation_size('chat_messages')
  ) as total_chat_size;

-- Count of records
SELECT
  (SELECT COUNT(*) FROM chat_conversations) as total_conversations,
  (SELECT COUNT(*) FROM chat_messages) as total_messages;
```

### Optimize Tables

```sql
-- Reclaim space after large deletions
VACUUM FULL chat_conversations;
VACUUM FULL chat_messages;

-- Update statistics for better query planning
ANALYZE chat_conversations;
ANALYZE chat_messages;
```

---

## Best Practices

1. **Always preview before bulk delete**
   - Use `action: 'preview'` first
   - Review what will be deleted
   - Then use `action: 'delete'`

2. **Set appropriate retention periods**
   - 30 days: Aggressive cleanup
   - 90 days: Recommended default
   - 180 days: Conservative approach

3. **Archive instead of delete (optional)**
   - Move old data to archive tables
   - Keep for compliance/analytics
   - See `DATABASE_CLEANUP.sql` for archive examples

4. **Monitor storage regularly**
   - Check table sizes monthly
   - Set up alerts for excessive growth
   - Plan cleanup schedules accordingly

5. **User communication**
   - Inform users about retention policy
   - Allow users to export their data
   - Provide clear deletion controls

---

## Troubleshooting

### Issue: Can't delete conversation

**Check ownership:**

```sql
SELECT cc.id, cc.user_id, u.email
FROM chat_conversations cc
JOIN users u ON u.id = cc.user_id
WHERE cc.id = 'conversation-id-here';
```

### Issue: Deletion is slow

**Add indexes (if not exist):**

```sql
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_cleanup
ON chat_conversations(updated_at)
WHERE updated_at < NOW() - INTERVAL '30 days';
```

### Issue: Foreign key violations

**Check cascade settings:**

```sql
-- Should show ON DELETE CASCADE
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'chat_messages';
```

---

## Files Reference

- **DATABASE_CLEANUP.sql** - SQL cleanup functions and queries
- **app/api/chat/conversations/route.ts** - List and bulk operations API
- **app/api/chat/conversations/[id]/route.ts** - Individual conversation API
- **components/ChatWidget.tsx** - UI with delete button

---

**Last Updated:** January 28, 2026  
**Status:** ✅ Fully implemented with UI and API endpoints
