-- Unified Reviews Table
-- ============================================================================
-- This table stores reviews for any entity type (dining_venue, beauty_venue, etc.)
-- using a polymorphic design (entity_type + entity_id).

DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Polymorphic relation
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'beauty_venue', 'dining_venue', 'beauty_service'
    
    -- Review content
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    photos TEXT[], -- Array of photo URLs
    
    -- Metrics
    helpful_count INTEGER DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT false, -- Verified purchase/visit
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'archived')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    -- Allow one review per user per entity
    UNIQUE(user_id, entity_id, entity_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_timestamp
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();
