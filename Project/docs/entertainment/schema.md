# Entertainment Service - Database Schema

## Overview
The Entertainment service uses a single primary table `entertainment_items` to store all entertainment-related data including tours, shows, activities, attractions, and concerts.

## Table: `entertainment_items`

### Description
Stores entertainment items with flexible metadata structure to accommodate various types of entertainment offerings.

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | uuid_generate_v4() | Primary key, auto-generated UUID |
| `title` | text | NO | - | Main title/name of the entertainment item |
| `subtitle` | text | YES | NULL | Secondary title or tagline |
| `description` | text | YES | NULL | Full description of the entertainment item |
| `type` | text | NO | - | Type of entertainment (tour, show, activity, attraction, concert) |
| `provider` | text | YES | NULL | Name of the provider/operator |
| `price` | numeric(10,2) | YES | NULL | Base price for the item |
| `currency` | varchar(3) | YES | 'USD' | Currency code (ISO 4217) |
| `available` | boolean | YES | true | Availability status |
| `location` | jsonb | YES | NULL | Location information (see structure below) |
| `metadata` | jsonb | YES | '{}'::jsonb | Flexible metadata (see structure below) |
| `created_at` | timestamptz | NO | now() | Record creation timestamp |
| `updated_at` | timestamptz | NO | now() | Record last update timestamp |

### Indexes

- **Primary Key**: `id` (uuid)
- **idx_entertainment_type**: B-tree index on `type` for filtering by entertainment type
- **idx_entertainment_available**: B-tree index on `available` for filtering available items
- **idx_entertainment_title_gin**: GIN index on full-text search across `title`, `subtitle`, and `description`

### Triggers

- **update_entertainment_items_updated_at**: Automatically updates `updated_at` column on record modification

### Row Level Security (RLS)

The table has RLS enabled with the following policies:

1. **Public read access for available items**: Anonymous users can read items where `available = true`
2. **Authenticated users can read all items**: Authenticated users can read all items regardless of availability
3. **Authenticated users can insert**: Authenticated users can create new items
4. **Authenticated users can update**: Authenticated users can modify existing items
5. **Authenticated users can delete**: Authenticated users can delete items

## JSONB Structures

### `location` (JSONB)
```json
{
  "city": "Paris",
  "country": "France",
  "lat": 48.8566,
  "lng": 2.3522,
  "address": "123 Example Street"
}
```

### `metadata` (JSONB)
```json
{
  "images": ["image1.jpg", "image2.jpg"],
  "duration": "2 hours",
  "capacity": 50,
  "rating": 4.8,
  "tags": ["night tour", "sightseeing", "landmarks"],
  "min_age": 18,
  "max_group_size": 10,
  "includes": ["Guide", "Transportation", "Refreshments"],
  "languages": ["English", "French", "Spanish"]
}
```

**Note**: The `metadata` field is flexible and can accommodate additional fields as needed for specific entertainment types.

## Entertainment Types

Common values for the `type` column:
- `tour` - Guided tours (walking, bus, boat, etc.)
- `show` - Theater, performances, concerts
- `activity` - Interactive experiences (classes, workshops, adventures)
- `attraction` - Museums, landmarks, theme parks
- `concert` - Music events
- `sport` - Sporting events and activities

## Example Queries

### Get all available tours
```sql
SELECT * FROM entertainment_items
WHERE type = 'tour' AND available = true
ORDER BY created_at DESC;
```

### Search by text
```sql
SELECT * FROM entertainment_items
WHERE to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, ''))
  @@ plainto_tsquery('english', 'Paris Eiffel Tower')
ORDER BY created_at DESC;
```

### Get items by location (city)
```sql
SELECT * FROM entertainment_items
WHERE location->>'city' = 'Paris'
AND available = true;
```

### Get items with rating above 4.5
```sql
SELECT * FROM entertainment_items
WHERE (metadata->>'rating')::numeric > 4.5
ORDER BY (metadata->>'rating')::numeric DESC;
```

## Migrations

The full migration script is available in [migrations.sql](./migrations.sql)

## Future Enhancements

Potential schema improvements for future iterations:
- Separate `entertainment_bookings` table for reservation management
- `entertainment_reviews` table for user reviews and ratings
- `entertainment_availability` table for time-slot based availability
- `entertainment_pricing` table for dynamic pricing based on date/time
- `entertainment_providers` table to normalize provider information
- Relationships with users, bookings, and payment tables
