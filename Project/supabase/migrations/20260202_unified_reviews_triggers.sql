-- ============================================================
-- Unified Reviews Triggers
-- ============================================================
-- Automatically update parent entity ratings (beauty_venues, dining_venues)
-- when a review is added, updated, or deleted in the 'reviews' table.

-- Function to update generic entity rating
CREATE OR REPLACE FUNCTION update_entity_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating numeric;
  review_cnt integer;
  target_table text;
BEGIN
  -- Determine target table based on entity_type
  IF COALESCE(NEW.entity_type, OLD.entity_type) = 'beauty_venue' THEN
    target_table := 'beauty_venues';
  ELSIF COALESCE(NEW.entity_type, OLD.entity_type) = 'dining_venue' THEN
    target_table := 'dining_venues';
  ELSE
    -- For other types (e.g. services), currently no aggregation table, so just return
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate stats
  SELECT 
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO avg_rating, review_cnt
  FROM public.reviews
  WHERE entity_id = COALESCE(NEW.entity_id, OLD.entity_id)
    AND entity_type = COALESCE(NEW.entity_type, OLD.entity_type)
    AND status = 'published'; -- Assuming 'published' is the visible status (mapped from old 'approved')

  -- Update appropriate table
  IF target_table = 'beauty_venues' THEN
    UPDATE public.beauty_venues
    SET average_rating = ROUND(avg_rating::numeric, 1),
        review_count = review_cnt
    WHERE id = COALESCE(NEW.entity_id, OLD.entity_id);
  ELSIF target_table = 'dining_venues' THEN
    UPDATE public.dining_venues
    SET average_rating = ROUND(avg_rating::numeric, 1),
        review_count = review_cnt
    WHERE id = COALESCE(NEW.entity_id, OLD.entity_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_entity_rating ON reviews;
CREATE TRIGGER trigger_update_entity_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_entity_rating();
