# Entertainment Service - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Run the Migration (2 min)

1. Go to https://supabase.com/dashboard
2. Select your project → SQL Editor → New query
3. Copy/paste from `docs/entertainment/migrations.sql`
4. Click Run

### 2. Test the API (3 min)

```bash
# Health check
curl http://localhost:3000/api/ping

# List items
curl http://localhost:3000/api/entertainment

# Search
curl "http://localhost:3000/api/entertainment?q=Paris"
```

## 📋 Common Tasks

### List Entertainment Items

```bash
# All items
GET /api/entertainment

# Filter by type
GET /api/entertainment?type=tour

# Search
GET /api/entertainment?q=Paris

# Paginate
GET /api/entertainment?limit=10&offset=0
```

### Get Single Item

```bash
GET /api/entertainment/{id}
```

### Create Item (Auth Required)

```bash
POST /api/entertainment
Content-Type: application/json
Authorization: Bearer {clerk_token}

{
  "title": "New Tour",
  "type": "tour",
  "price": 50.00
}
```

### Update Item (Auth Required)

```bash
PUT /api/entertainment/{id}
Authorization: Bearer {clerk_token}

{
  "price": 60.00,
  "available": false
}
```

### Delete Item (Auth Required)

```bash
DELETE /api/entertainment/{id}
Authorization: Bearer {clerk_token}
```

## 🔑 Authentication

### Get Clerk Token

1. Sign in at `/sign-in`
2. DevTools → Application → Cookies → `__session`
3. Use as Bearer token

## 🗄️ Database

### Table Structure

```sql
entertainment_items (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL,
  price numeric(10,2),
  location jsonb,
  metadata jsonb,
  ...
)
```

### Common Queries

```sql
-- Get all tours
SELECT * FROM entertainment_items WHERE type = 'tour';

-- Search by city
SELECT * FROM entertainment_items
WHERE location->>'city' = 'Paris';

-- Get highly rated items
SELECT * FROM entertainment_items
WHERE (metadata->>'rating')::numeric > 4.5;
```

## 🧪 Testing Checklist

- [ ] `/api/ping` returns entertainment_db: "ok"
- [ ] List all items works
- [ ] Search works
- [ ] Filter by type works
- [ ] Get single item works
- [ ] Create requires auth
- [ ] Update requires auth
- [ ] Delete requires auth

## 🔧 Troubleshooting

### "Failed to fetch entertainment items"

→ Check Supabase URL/keys in `.env.local`
→ Run migration in Supabase SQL Editor
→ Check table exists: `SELECT * FROM entertainment_items`

### "Unauthorized"

→ Check Clerk keys in `.env.local`
→ Sign in and get fresh token
→ Format: `Authorization: Bearer {token}`

### CORS Errors

→ Add CORS headers in `next.config.js`

## 📁 File Locations

```
Project/
├── app/api/entertainment/
│   ├── route.ts              # List & Create
│   └── [id]/route.ts         # Get, Update, Delete
├── docs/entertainment/
│   ├── README.md             # Full documentation
│   ├── api.md                # API reference
│   ├── schema.md             # Database schema
│   ├── migrations.sql        # Database setup
│   ├── TESTING.md            # Test examples
│   └── tasks.txt             # Task checklist
├── types/
│   └── entertainment.ts      # TypeScript types
└── .env.local                # Environment variables
```

## 🌐 Endpoints Summary

| Method | Endpoint                 | Auth | Description  |
| ------ | ------------------------ | ---- | ------------ |
| GET    | `/api/entertainment`     | No   | List items   |
| GET    | `/api/entertainment/:id` | No   | Get single   |
| POST   | `/api/entertainment`     | Yes  | Create       |
| PUT    | `/api/entertainment/:id` | Yes  | Update       |
| DELETE | `/api/entertainment/:id` | Yes  | Delete       |
| GET    | `/api/ping`              | No   | Health check |

## 💡 Tips

- Use `limit` and `offset` for pagination
- Filter by `type` for better performance
- Search works on title, subtitle, and description
- `metadata` field is flexible - add any JSON data
- `location` should include city, country, lat, lng
- Price is stored as numeric(10,2) - cents included

## 🔗 Resources

- Full README: `docs/entertainment/README.md`
- API Docs: `docs/entertainment/api.md`
- Schema: `docs/entertainment/schema.md`
- Types: `types/entertainment.ts`

## 📊 Sample Data

Migration includes 5 sample items:

1. Paris Night Bus Tour
2. Broadway Show: Hamilton
3. Tokyo Robot Restaurant
4. Grand Canyon Helicopter Tour
5. Great Wall of China Tour

## ⚡ Next Steps

1. Run migration
2. Test health check
3. Test list endpoint
4. Create your own item
5. Integrate with frontend
6. Add more features (bookings, reviews, etc.)

---

**Need Help?** Check `docs/entertainment/README.md` for detailed instructions.
