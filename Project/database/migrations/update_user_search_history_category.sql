ALTER TABLE user_search_history DROP CONSTRAINT IF EXISTS user_search_history_category_check;
ALTER TABLE user_search_history ADD CONSTRAINT user_search_history_category_check 
CHECK (category IN ('flight', 'flight_origin', 'flight_destination', 'hotel', 'vouchers', 'events', 'dining', 'activities', 'wellness', 'beauty', 'entertainment', 'shop', 'transport'));
