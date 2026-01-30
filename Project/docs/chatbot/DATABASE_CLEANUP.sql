-- TripC AI Chatbot - Cleanup and Maintenance Utilities
-- Functions and queries for managing old conversations

-- ============================================================================
-- Function: Delete old conversations
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_old_conversations(days_old INTEGER DEFAULT 90)
RETURNS TABLE (
  deleted_count INTEGER,
  deleted_message_count INTEGER
) AS $$
DECLARE
  conv_count INTEGER;
  msg_count INTEGER;
BEGIN
  -- Count messages that will be deleted
  SELECT COUNT(*) INTO msg_count
  FROM chat_messages
  WHERE conversation_id IN (
    SELECT id FROM chat_conversations
    WHERE updated_at < NOW() - (days_old || ' days')::INTERVAL
  );
  
  -- Delete old conversations (messages will cascade)
  WITH deleted AS (
    DELETE FROM chat_conversations
    WHERE updated_at < NOW() - (days_old || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO conv_count FROM deleted;
  
  RETURN QUERY SELECT conv_count, msg_count;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM delete_old_conversations(90); -- Delete conversations older than 90 days

-- ============================================================================
-- Function: Delete empty conversations
-- ============================================================================
CREATE OR REPLACE FUNCTION delete_empty_conversations()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM chat_conversations
    WHERE id NOT IN (
      SELECT DISTINCT conversation_id 
      FROM chat_messages
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT delete_empty_conversations(); -- Delete conversations with no messages

-- ============================================================================
-- Function: Clean up user's old conversations
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_user_conversations(
  p_user_id UUID,
  days_to_keep INTEGER DEFAULT 30
)
RETURNS TABLE (
  deleted_conversations INTEGER,
  deleted_messages INTEGER
) AS $$
DECLARE
  conv_count INTEGER;
  msg_count INTEGER;
BEGIN
  -- Count messages that will be deleted
  SELECT COUNT(*) INTO msg_count
  FROM chat_messages
  WHERE conversation_id IN (
    SELECT id FROM chat_conversations
    WHERE user_id = p_user_id
    AND updated_at < NOW() - (days_to_keep || ' days')::INTERVAL
  );
  
  -- Delete old conversations for specific user
  WITH deleted AS (
    DELETE FROM chat_conversations
    WHERE user_id = p_user_id
    AND updated_at < NOW() - (days_to_keep || ' days')::INTERVAL
    RETURNING id
  )
  SELECT COUNT(*) INTO conv_count FROM deleted;
  
  RETURN QUERY SELECT conv_count, msg_count;
END;
$$ LANGUAGE plpgsql;

-- Usage: SELECT * FROM cleanup_user_conversations('user-uuid-here', 30);

-- ============================================================================
-- Scheduled Cleanup Queries
-- ============================================================================

-- Delete conversations older than 90 days
-- Run this as a cron job or scheduled task
/*
DELETE FROM chat_conversations
WHERE updated_at < NOW() - INTERVAL '90 days';
*/

-- Delete conversations older than 180 days with fewer than 5 messages
/*
DELETE FROM chat_conversations cc
WHERE cc.updated_at < NOW() - INTERVAL '180 days'
AND (
  SELECT COUNT(*) FROM chat_messages cm 
  WHERE cm.conversation_id = cc.id
) < 5;
*/

-- Archive old conversations (move to archive table instead of deleting)
/*
-- Create archive table first
CREATE TABLE IF NOT EXISTS chat_conversations_archive (LIKE chat_conversations INCLUDING ALL);
CREATE TABLE IF NOT EXISTS chat_messages_archive (LIKE chat_messages INCLUDING ALL);

-- Archive conversations older than 1 year
WITH archived_conversations AS (
  INSERT INTO chat_conversations_archive
  SELECT * FROM chat_conversations
  WHERE updated_at < NOW() - INTERVAL '365 days'
  RETURNING id
),
archived_messages AS (
  INSERT INTO chat_messages_archive
  SELECT cm.* FROM chat_messages cm
  WHERE cm.conversation_id IN (SELECT id FROM archived_conversations)
  RETURNING conversation_id
)
DELETE FROM chat_conversations
WHERE id IN (SELECT id FROM archived_conversations);
*/

-- ============================================================================
-- Maintenance Queries
-- ============================================================================

-- Find conversations to review before deletion
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

-- Find inactive conversations (no activity in X days)
SELECT 
  cc.id,
  cc.user_id,
  cc.title,
  cc.updated_at,
  AGE(NOW(), cc.updated_at) as inactive_for
FROM chat_conversations cc
WHERE cc.updated_at < NOW() - INTERVAL '60 days'
ORDER BY cc.updated_at ASC
LIMIT 100;

-- Get storage size of chat tables
SELECT 
  pg_size_pretty(pg_total_relation_size('chat_conversations')) as conversations_size,
  pg_size_pretty(pg_total_relation_size('chat_messages')) as messages_size,
  (SELECT COUNT(*) FROM chat_conversations) as total_conversations,
  (SELECT COUNT(*) FROM chat_messages) as total_messages;

-- Find largest conversations (by message count)
SELECT 
  cc.id,
  cc.title,
  COUNT(cm.id) as message_count,
  cc.updated_at
FROM chat_conversations cc
JOIN chat_messages cm ON cm.conversation_id = cc.id
GROUP BY cc.id, cc.title, cc.updated_at
ORDER BY message_count DESC
LIMIT 20;

-- ============================================================================
-- User-Specific Cleanup
-- ============================================================================

-- Delete all conversations for a specific user
/*
DELETE FROM chat_conversations
WHERE user_id = 'user-uuid-here';
*/

-- Delete specific conversation
/*
DELETE FROM chat_conversations
WHERE id = 'conversation-uuid-here';
*/

-- Keep only last N conversations per user
/*
WITH ranked_conversations AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
  FROM chat_conversations
)
DELETE FROM chat_conversations
WHERE id IN (
  SELECT id FROM ranked_conversations WHERE rn > 10 -- Keep last 10 per user
);
*/

-- ============================================================================
-- Recommended Maintenance Schedule
-- ============================================================================

/*
Daily:
- Delete empty conversations
- SELECT delete_empty_conversations();

Weekly:
- Check for very old conversations (180+ days)
- Review and optionally delete

Monthly:
- Delete conversations older than 90 days
- SELECT * FROM delete_old_conversations(90);

Quarterly:
- Archive conversations older than 1 year
- Optimize database tables
- VACUUM ANALYZE chat_conversations;
- VACUUM ANALYZE chat_messages;
*/

-- ============================================================================
-- Emergency Cleanup (if database is too large)
-- ============================================================================

-- CAUTION: These delete large amounts of data. Use carefully!

-- Delete conversations with only 1-2 messages older than 30 days
/*
DELETE FROM chat_conversations cc
WHERE (
  SELECT COUNT(*) FROM chat_messages cm 
  WHERE cm.conversation_id = cc.id
) <= 2
AND cc.updated_at < NOW() - INTERVAL '30 days';
*/

-- Keep only the most recent 1000 conversations
/*
WITH old_conversations AS (
  SELECT id FROM chat_conversations
  ORDER BY updated_at DESC
  OFFSET 1000
)
DELETE FROM chat_conversations
WHERE id IN (SELECT id FROM old_conversations);
*/

-- ============================================================================
-- Indexes for Better Cleanup Performance
-- ============================================================================

-- These indexes help cleanup queries run faster
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at_cleanup 
  ON chat_conversations(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_updated 
  ON chat_conversations(user_id, updated_at DESC);
