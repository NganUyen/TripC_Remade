-- docs/entertainment/migrations.sql
-- Entertainment Service Database Schema
-- Purpose: Store entertainment items (tours, shows, activities, attractions)
-- Date: January 30, 2026

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main entertainment items table
CREATE TABLE IF NOT EXISTS public.entertainment_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  subtitle text,
  description text,
  type text NOT NULL,                 -- e.g. "tour", "show", "activity", "attraction", "concert"
  provider text,                      -- external provider or owner
  price numeric(10,2),                -- optional base price
  currency varchar(3) DEFAULT 'USD',
  available boolean DEFAULT true,
  location jsonb,                     -- structure: { city, country, lat, lng, address }
  metadata jsonb DEFAULT '{}'::jsonb, -- flexible fields (images, capacity, tags, duration, rating)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entertainment_type ON public.entertainment_items (type);
CREATE INDEX IF NOT EXISTS idx_entertainment_available ON public.entertainment_items (available);
CREATE INDEX IF NOT EXISTS idx_entertainment_title_gin ON public.entertainment_items 
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(subtitle, '') || ' ' || coalesce(description, '')));

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entertainment_items_updated_at BEFORE UPDATE ON public.entertainment_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.entertainment_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to available items
CREATE POLICY "Public read access for available items"
  ON public.entertainment_items FOR SELECT
  USING (available = true);

-- Policy: Allow authenticated users to read all items
CREATE POLICY "Authenticated users can read all items"
  ON public.entertainment_items FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert"
  ON public.entertainment_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Authenticated users can update"
  ON public.entertainment_items FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
  ON public.entertainment_items FOR DELETE
  TO authenticated
  USING (true);

-- Sample seed data (optional, for testing)
INSERT INTO public.entertainment_items (title, subtitle, description, type, provider, price, currency, available, location, metadata)
VALUES 
  (
    'Paris Night Bus Tour',
    'Experience the City of Lights at night',
    'A magical 2-hour bus tour through illuminated Paris, visiting iconic landmarks including the Eiffel Tower, Arc de Triomphe, and Notre-Dame Cathedral.',
    'tour',
    'Paris Tours Inc',
    45.00,
    'EUR',
    true,
    '{"city": "Paris", "country": "France", "lat": 48.8566, "lng": 2.3522, "address": "Place de la Concorde"}',
    '{"images": ["paris-night-1.jpg", "paris-night-2.jpg"], "duration": "2 hours", "capacity": 50, "rating": 4.8, "tags": ["night tour", "sightseeing", "landmarks"]}'
  ),
  (
    'Broadway Show: Hamilton',
    'An American Musical',
    'The revolutionary story of Alexander Hamilton, one of America''s founding fathers, told through hip-hop, jazz, and R&B music.',
    'show',
    'Broadway Productions',
    120.00,
    'USD',
    true,
    '{"city": "New York", "country": "USA", "lat": 40.7580, "lng": -73.9855, "address": "Richard Rodgers Theatre, 226 W 46th St"}',
    '{"images": ["hamilton-1.jpg"], "duration": "2 hours 45 minutes", "capacity": 1319, "rating": 4.9, "tags": ["broadway", "musical", "theater"]}'
  ),
  (
    'Tokyo Robot Restaurant Experience',
    'Futuristic dinner show',
    'A spectacular robot cabaret show featuring neon lights, giant robots, dancers, and a unique dining experience in the heart of Shinjuku.',
    'show',
    'Robot Restaurant Tokyo',
    80.00,
    'JPY',
    true,
    '{"city": "Tokyo", "country": "Japan", "lat": 35.6938, "lng": 139.7034, "address": "1-7-7 Kabukicho, Shinjuku"}',
    '{"images": ["robot-show.jpg"], "duration": "90 minutes", "capacity": 150, "rating": 4.5, "tags": ["unique", "entertainment", "dinner show"]}'
  ),
  (
    'Grand Canyon Helicopter Tour',
    'Aerial adventure over natural wonder',
    'Soar above the majestic Grand Canyon on a thrilling helicopter ride with stunning aerial views of one of the world''s natural wonders.',
    'activity',
    'Canyon Tours',
    299.00,
    'USD',
    true,
    '{"city": "Las Vegas", "country": "USA", "lat": 36.1069, "lng": -112.1129, "address": "Grand Canyon West"}',
    '{"images": ["canyon-heli-1.jpg", "canyon-heli-2.jpg"], "duration": "70 minutes", "capacity": 6, "rating": 5.0, "tags": ["adventure", "aerial", "nature"]}'
  ),
  (
    'Great Wall of China Private Tour',
    'Explore ancient history',
    'A private guided tour of the Mutianyu section of the Great Wall with hotel pickup, lunch, and expert commentary on Chinese history.',
    'tour',
    'China Heritage Tours',
    150.00,
    'CNY',
    true,
    '{"city": "Beijing", "country": "China", "lat": 40.4319, "lng": 116.5704, "address": "Mutianyu, Huairou District"}',
    '{"images": ["great-wall.jpg"], "duration": "8 hours", "capacity": 10, "rating": 4.9, "tags": ["historical", "unesco", "guided tour"]}'
  );

-- Comments
COMMENT ON TABLE public.entertainment_items IS 'Entertainment items including tours, shows, activities, and attractions';
COMMENT ON COLUMN public.entertainment_items.type IS 'Type of entertainment: tour, show, activity, attraction, concert, etc.';
COMMENT ON COLUMN public.entertainment_items.location IS 'JSONB containing city, country, lat, lng, and address';
COMMENT ON COLUMN public.entertainment_items.metadata IS 'JSONB for flexible fields: images, duration, capacity, rating, tags, etc.';
