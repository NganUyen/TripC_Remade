-- Create search history table for all categories
-- This table stores user search history across different modules (flight, hotel, transport, beauty, restaurant)

CREATE TABLE IF NOT EXISTS user_search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('flight', 'hotel', 'vouchers', 'events', 'dining', 'activities', 'wellness', 'beauty', 'entertainment', 'shop', 'transport')),
    search_params JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying by user and category
CREATE INDEX idx_user_search_history_user_category 
ON user_search_history(user_id, category, created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own search history

-- Policy for SELECT: Users can view their own history
CREATE POLICY "Users view own history" 
ON user_search_history 
FOR SELECT 
USING (auth.uid()::text = user_id);

-- Policy for INSERT: Users can add their own history
CREATE POLICY "Users insert own history" 
ON user_search_history 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Policy for DELETE: Users can delete their own history
CREATE POLICY "Users delete own history" 
ON user_search_history 
FOR DELETE 
USING (auth.uid()::text = user_id);

-- Comments for documentation
COMMENT ON TABLE user_search_history IS 'Stores user search history across all categories (flight, hotel, vouchers, events, dining, activities, wellness, beauty, entertainment, shop, transport)';
COMMENT ON COLUMN user_search_history.category IS 'Category of search: flight, hotel, vouchers, events, dining, activities, wellness, beauty, entertainment, shop, or transport';
COMMENT ON COLUMN user_search_history.search_params IS 'JSON object containing category-specific search parameters';
