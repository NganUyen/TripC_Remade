-- TripC AI Chatbot - Database Schema
-- Add these tables to your Supabase database

-- ============================================================================
-- Chat Conversations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast user conversation lookup
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_updated_at ON chat_conversations(updated_at DESC);

-- ============================================================================
-- Chat Messages Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'function')),
  content TEXT,
  function_call JSONB,
  function_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for fast message retrieval
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- ============================================================================
-- Function to auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_chat_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_conversation_timestamp
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversation_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
    )
  );

-- Users can only create their own conversations
CREATE POLICY "Users can create own conversations"
  ON chat_conversations
  FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
    )
  );

-- Users can only update their own conversations
CREATE POLICY "Users can update own conversations"
  ON chat_conversations
  FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
    )
  );

-- Users can only delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON chat_conversations
  FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
    )
  );

-- Users can only see messages from their conversations
CREATE POLICY "Users can view own messages"
  ON chat_messages
  FOR SELECT
  USING (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE user_id IN (
        SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
      )
    )
  );

-- Users can only create messages in their conversations
CREATE POLICY "Users can create own messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    conversation_id IN (
      SELECT id FROM chat_conversations 
      WHERE user_id IN (
        SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub'
      )
    )
  );

-- ============================================================================
-- Helpful Views
-- ============================================================================

-- View to get recent conversations with last message
CREATE OR REPLACE VIEW chat_conversations_with_last_message AS
SELECT 
  c.id,
  c.user_id,
  c.title,
  c.created_at,
  c.updated_at,
  c.metadata,
  (
    SELECT jsonb_build_object(
      'role', m.role,
      'content', m.content,
      'created_at', m.created_at
    )
    FROM chat_messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) as last_message,
  (
    SELECT COUNT(*)
    FROM chat_messages m
    WHERE m.conversation_id = c.id
  ) as message_count
FROM chat_conversations c;

-- ============================================================================
-- Sample Queries
-- ============================================================================

-- Get all conversations for a user (ordered by most recent)
-- SELECT * FROM chat_conversations 
-- WHERE user_id = 'user-uuid-here'
-- ORDER BY updated_at DESC;

-- Get all messages in a conversation
-- SELECT * FROM chat_messages
-- WHERE conversation_id = 'conversation-uuid-here'
-- ORDER BY created_at ASC;

-- Get recent conversations with last message
-- SELECT * FROM chat_conversations_with_last_message
-- WHERE user_id = 'user-uuid-here'
-- ORDER BY updated_at DESC
-- LIMIT 10;

-- Create a new conversation
-- INSERT INTO chat_conversations (user_id, title)
-- VALUES ('user-uuid-here', 'Hotel search in Da Nang')
-- RETURNING *;

-- Add a message to conversation
-- INSERT INTO chat_messages (conversation_id, role, content)
-- VALUES ('conversation-uuid-here', 'user', 'Find me hotels in Da Nang')
-- RETURNING *;

-- Delete old conversations (optional maintenance)
-- DELETE FROM chat_conversations
-- WHERE updated_at < NOW() - INTERVAL '90 days';
