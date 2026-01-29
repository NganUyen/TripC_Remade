# TripC AI Chatbot - API Reference

Complete API documentation for integrating with the TripC AI Chatbot.

## Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

## Authentication

All API requests use Clerk authentication via session cookies. The API automatically extracts the user ID from the session.

### Headers

```http
Content-Type: application/json
Cookie: __session=<clerk-session-token>
```

## Endpoints

### POST /api/chat/messages

Send a message to the chatbot and receive a streaming response.

#### Request

```http
POST /api/chat/messages HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "messages": [
    {
      "role": "user" | "assistant" | "system",
      "content": "string"
    }
  ]
}
```

#### Request Body

| Field                | Type   | Required | Description                                    |
| -------------------- | ------ | -------- | ---------------------------------------------- |
| `messages`           | Array  | Yes      | Array of conversation messages                 |
| `messages[].role`    | String | Yes      | Message role: "user", "assistant", or "system" |
| `messages[].content` | String | Yes      | Message content                                |

#### Response

The API returns a Server-Sent Events (SSE) stream:

```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"content": "I'll"}
data: {"content": " search"}
data: {"content": " for"}
data: {"content": " hotels"}
data: {"content": " in"}
data: {"content": " Da Nang..."}
data: [DONE]
```

#### Response Format

Each `data:` line contains a JSON object:

**Streaming Content:**

```json
{
  "content": "string"
}
```

**Completion Signal:**

```
data: [DONE]
```

**Error:**

```json
{
  "error": "string"
}
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": "Messages array is required"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to process chat request",
  "details": "Detailed error message"
}
```

#### Example Usage

**JavaScript (Fetch API):**

```javascript
async function sendMessage(userMessage) {
  const response = await fetch("/api/chat/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let aiResponse = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") break;

        try {
          const parsed = JSON.parse(data);
          if (parsed.content) {
            aiResponse += parsed.content;
            console.log("Chunk:", parsed.content);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  }

  return aiResponse;
}
```

**React Hook:**

```typescript
import { useState } from "react";

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setIsLoading(true);

    const userMessage = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  aiResponse += parsed.content;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg?.role === "assistant") {
                      lastMsg.content = aiResponse;
                    } else {
                      newMessages.push({
                        role: "assistant",
                        content: aiResponse,
                      });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                // Skip
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
}
```

**Python:**

```python
import requests
import json

def send_message(message):
    url = 'http://localhost:3000/api/chat/messages'
    payload = {
        'messages': [
            {'role': 'user', 'content': message}
        ]
    }

    response = requests.post(
        url,
        json=payload,
        stream=True,
        headers={'Content-Type': 'application/json'}
    )

    ai_response = ''
    for line in response.iter_lines():
        if line:
            decoded = line.decode('utf-8')
            if decoded.startswith('data: '):
                data = decoded[6:]
                if data == '[DONE]':
                    break
                try:
                    parsed = json.loads(data)
                    if 'content' in parsed:
                        ai_response += parsed['content']
                        print(parsed['content'], end='', flush=True)
                except json.JSONDecodeError:
                    pass

    return ai_response
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Find hotels in Da Nang"
      }
    ]
  }' \
  --no-buffer
```

## Server-Sent Events (SSE) Format

The API uses Server-Sent Events for real-time streaming.

### SSE Message Format

```
data: <JSON object>\n\n
```

### Event Types

**Content Chunk:**

```
data: {"content": "Hello"}

```

**Completion:**

```
data: [DONE]

```

**Error:**

```
data: {"error": "Something went wrong"}

```

## Rate Limiting

**Development:**

- No rate limits

**Production (Recommended):**

- 20 messages per minute per user
- 100 messages per hour per user
- 500 messages per day per IP (unauthenticated)

### Rate Limit Headers

```http
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1643723400
```

### Rate Limit Error

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

## Conversation Context

The API maintains conversation context by accepting the full message history.

### Best Practices

1. **Include full history** - Send all previous messages for context
2. **Limit history length** - Keep last 20-30 messages to avoid token limits
3. **Persist on client** - Store conversation history in localStorage
4. **Server persistence** - Optionally save to database (schema provided)

### Example with History

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Find hotels in Da Nang"
    },
    {
      "role": "assistant",
      "content": "I found 5 hotels in Da Nang. Here are the top 3..."
    },
    {
      "role": "user",
      "content": "Show me the cheapest one"
    }
  ]
}
```

## Function Calling Flow

When the AI needs to call a tool, the flow is:

1. **User sends message** → API
2. **AI determines need for tool** → Deepseek decides
3. **API executes tool** → Handler function runs
4. **Tool returns result** → JSON response
5. **AI processes result** → Generates natural language
6. **Stream to user** → SSE chunks

### Example Function Call Sequence

```
1. User: "Book a hotel in Bangkok"
2. AI calls: check_auth_status()
3. Result: { authenticated: true, userId: "..." }
4. AI calls: search_hotels({ location: "Bangkok", ... })
5. Result: { hotels: [...] }
6. AI responds: "I found 5 hotels in Bangkok. Here are the top 3..."
```

## Error Handling

### Client-Side Error Handling

```typescript
try {
  const response = await fetch('/api/chat/messages', {...});

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment.');
    }
    throw new Error('Failed to get response');
  }

  // Process stream...
} catch (error) {
  console.error('Chat error:', error);
  showErrorMessage(error.message);
}
```

### Server-Side Error Handling

The API handles errors gracefully:

1. **AI API failures** → Fallback to error message
2. **Database errors** → Return error to client
3. **Tool execution errors** → AI explains to user
4. **Network issues** → Retry with exponential backoff

## Security

### Authentication

- Uses Clerk session cookies
- No need to pass JWT manually
- Automatically extracts user ID

### Authorization

- User can only access their own data
- Bookings require authentication
- RLS policies protect database

### Input Validation

- Message length: Max 2000 characters
- Messages array: Max 100 messages
- Zod schemas validate tool parameters

### CORS

**Development:**

```http
Access-Control-Allow-Origin: *
```

**Production:**

```http
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Monitoring & Analytics

### Recommended Tracking

```typescript
// Track message sent
analytics.track("chat_message_sent", {
  userId: user.id,
  messageLength: content.length,
  timestamp: Date.now(),
});

// Track tool usage
analytics.track("chat_tool_called", {
  userId: user.id,
  toolName: "search_hotels",
  success: true,
  duration: 1234,
});

// Track booking created
analytics.track("booking_created_via_chat", {
  userId: user.id,
  bookingType: "hotel",
  amount: 480,
});
```

### Logging

```typescript
console.log("[Chat API]", {
  userId: user.id,
  messageCount: messages.length,
  timestamp: new Date().toISOString(),
});
```

## Testing

### Unit Tests

```typescript
import { POST } from "./route";

describe("Chat API", () => {
  it("should return streaming response", async () => {
    const req = new Request("http://localhost:3000/api/chat/messages", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: "Hello" }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
  });
});
```

### Integration Tests

```bash
# Test basic message
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Test hotel search
curl -X POST http://localhost:3000/api/chat/messages \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Find hotels in Bangkok"}]}'
```

## Performance Optimization

### Client-Side

1. **Debounce input** - Wait 300ms before sending
2. **Cancel previous requests** - Use AbortController
3. **Local caching** - Cache search results
4. **Optimistic updates** - Show user message immediately

### Server-Side

1. **Connection pooling** - Reuse database connections
2. **Query optimization** - Use indexes
3. **Caching** - Cache frequent queries
4. **Streaming** - Always stream responses

### Example Debounce

```typescript
import { debounce } from "lodash";

const debouncedSend = debounce(sendMessage, 300);
```

## Troubleshooting

### Common Issues

**Issue:** Streaming not working

**Solution:** Check browser supports SSE, verify CORS headers

---

**Issue:** "User not authenticated" errors

**Solution:** Ensure Clerk session is valid, check cookies

---

**Issue:** Slow responses

**Solution:** Check Deepseek API latency, optimize database queries

---

**Issue:** Tool calls failing

**Solution:** Verify Supabase connection, check table schemas

## Changelog

### v1.0.0 (2026-01-28)

- Initial release
- 40+ tools across 11 categories
- Deepseek AI integration
- Streaming responses
- Full authentication support

---

For more information:

- [Architecture](./ARCHITECTURE.md)
- [Tools Reference](./TOOLS_REFERENCE.md)
- [README](./README.md)
