# Hotel Database Seed Instructions

## Overview
This guide explains how to populate your hotel database with 25 hotels across Vietnam.

## Prerequisites
- Supabase project set up
- Migration `001_create_hotel_schema.sql` already run
- Access to Supabase SQL Editor

## Steps to Seed Database

### 1. Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Seed Script
1. Open the file: `docs/hotel/migrations/002_add_more_hotels.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** button (or press Ctrl+Enter / Cmd+Enter)

### 3. Verify the Results
Run this verification query:

```sql
-- Check hotel counts by city
SELECT 
  address->>'city' as city,
  COUNT(*) as hotel_count
FROM hotels
WHERE status = 'active'
GROUP BY address->>'city'
ORDER BY hotel_count DESC;

-- Check total counts
SELECT 
  (SELECT COUNT(*) FROM hotels) as total_hotels,
  (SELECT COUNT(*) FROM hotel_rooms) as total_rooms,
  (SELECT COUNT(*) FROM hotel_rates WHERE date >= CURRENT_DATE) as active_rates,
  (SELECT COUNT(*) FROM hotel_partner_listings) as partner_listings;
```

Expected results:
- **Total hotels**: 25 (3 original + 22 new)
- **Total rooms**: 97 (9 original + 88 new)
- **Active rates**: ~29,100 (rates for next 60 days)
- **Partner listings**: 125 (25 hotels × 5 partners)

## Hotels by City

After running the seed script, you should have hotels in these cities:

| City | Number of Hotels |
|------|------------------|
| Hanoi | 6 |
| Ho Chi Minh City | 6 |
| Da Nang | 5 |
| Nha Trang | 3 |
| Hoi An | 2 |
| Phu Quoc | 2 |
| Da Lat | 2 |

## Testing the API

After seeding, test the API endpoints:

```bash
# Test Hanoi hotels
curl "http://localhost:3001/api/hotels?city=Hanoi"

# Test Ho Chi Minh City hotels
curl "http://localhost:3001/api/hotels?city=Ho%20Chi%20Minh%20City"

# Test Da Nang hotels
curl "http://localhost:3001/api/hotels?city=Da%20Nang"

# Test with filters
curl "http://localhost:3001/api/hotels?city=Hanoi&min_rating=5"
```

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: Run `001_create_hotel_schema.sql` first to create the tables.

### Issue: "duplicate key value violates unique constraint"
**Solution**: The seed script uses `ON CONFLICT DO NOTHING`, so it's safe to run multiple times. Existing hotels won't be duplicated.

### Issue: No hotels returned from API
**Possible causes**:
1. Check the city name spelling (case-sensitive)
2. Verify the `status` field is 'active'
3. Check the API logs for errors

### Issue: Frontend shows "0 Properties Found"
**Possible causes**:
1. Dev server not running (`npm run dev`)
2. API endpoint not working
3. City name mismatch (check address->>'city' format)

## Next Steps

After successfully seeding:
1. Test the frontend search functionality
2. Verify hotel detail pages work
3. Test price comparison across partners
4. Verify rate availability for bookings
