-- ============================================
-- CHAT SYSTEM - SUPABASE SCHEMA
-- ============================================
-- This schema supports a credit-based chat system with:
-- - One-on-one chats between creators and subscribers
-- - Text, image, and video messages
-- - Paid messages (premium content)
-- - Read receipts and typing indicators
-- - Integration with wallet system for monetization
-- ============================================

-- ============================================
-- 1. CHATS TABLE
-- ============================================
-- Stores chat threads between two users

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants (creator and subscriber)
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure unique chat pairs (no duplicates)
  CONSTRAINT unique_chat_pair UNIQUE (creator_id, subscriber_id),
  
  -- Ensure users don't chat with themselves
  CONSTRAINT different_users CHECK (creator_id != subscriber_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chats_creator ON chats(creator_id);
CREATE INDEX IF NOT EXISTS idx_chats_subscriber ON chats(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);

-- ============================================
-- 2. CHAT MESSAGES TABLE
-- ============================================
-- Stores all messages in chats

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Message content
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'paid_media')),
  content TEXT, -- Text content (NULL for media-only messages)
  media_url TEXT, -- URL to media in Supabase Storage (for image/video/paid_media)
  
  -- Paid messages (premium feature)
  price NUMERIC(10, 2) DEFAULT NULL, -- Price in credits (NULL = free message)
  unlocked_by JSONB DEFAULT '[]'::jsonb, -- Array of user_ids who unlocked this message
  
  -- Read receipts
  read_at TIMESTAMPTZ, -- When the message was read by recipient
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for chat_messages table
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

-- Composite index for efficient chat history queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_created 
  ON chat_messages(chat_id, created_at DESC);

-- ============================================
-- 3. CHAT PARTICIPANTS TABLE
-- ============================================
-- Tracks participant metadata (last read, notifications, etc.)

CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Participant settings
  last_read_at TIMESTAMPTZ, -- Last time user read messages in this chat
  notifications_enabled BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure unique participant per chat
  CONSTRAINT unique_chat_participant UNIQUE (chat_id, user_id)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat ON chat_participants(chat_id);

-- ============================================
-- 4. STORAGE BUCKET FOR CHAT MEDIA
-- ============================================
-- This needs to be created in Supabase Dashboard or via SQL:

-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'chat-media',
--   'chat-media',
--   false, -- Private bucket (RLS controlled)
--   52428800, -- 50MB limit
--   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
-- );

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CHATS POLICIES
-- ============================================

-- Users can view chats they are part of
CREATE POLICY "Users can view their own chats"
  ON chats FOR SELECT
  USING (
    auth.uid() = creator_id OR 
    auth.uid() = subscriber_id
  );

-- Users can create chats (will be validated in application logic)
CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id OR 
    auth.uid() = subscriber_id
  );

-- Users can update their own chats (for updated_at timestamp)
CREATE POLICY "Users can update their own chats"
  ON chats FOR UPDATE
  USING (
    auth.uid() = creator_id OR 
    auth.uid() = subscriber_id
  );

-- ============================================
-- CHAT MESSAGES POLICIES
-- ============================================

-- Users can view messages in their chats
CREATE POLICY "Users can view messages in their chats"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.creator_id = auth.uid() OR chats.subscriber_id = auth.uid())
    )
  );

-- Users can send messages in their chats
CREATE POLICY "Users can send messages in their chats"
  ON chat_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.creator_id = auth.uid() OR chats.subscriber_id = auth.uid())
    )
  );

-- Users can update their own messages (for read receipts)
CREATE POLICY "Users can update messages in their chats"
  ON chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_messages.chat_id
      AND (chats.creator_id = auth.uid() OR chats.subscriber_id = auth.uid())
    )
  );

-- ============================================
-- CHAT PARTICIPANTS POLICIES
-- ============================================

-- Users can view their own participant records
CREATE POLICY "Users can view their own participant records"
  ON chat_participants FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own participant records
CREATE POLICY "Users can create their own participant records"
  ON chat_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own participant records
CREATE POLICY "Users can update their own participant records"
  ON chat_participants FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- STORAGE POLICIES (for chat-media bucket)
-- ============================================
-- Run these in Supabase SQL Editor or Dashboard:

-- Allow authenticated users to upload to their own folders
-- CREATE POLICY "Users can upload chat media"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'chat-media'
--     AND auth.uid()::text = (storage.foldername(name))[1]
--   );

-- Users can view media in chats they are part of
-- CREATE POLICY "Users can view chat media"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'chat-media'
--     AND EXISTS (
--       SELECT 1 FROM chat_messages cm
--       JOIN chats c ON c.id = cm.chat_id
--       WHERE cm.media_url LIKE '%' || storage.objects.name
--       AND (c.creator_id = auth.uid() OR c.subscriber_id = auth.uid())
--     )
--   );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to update chat's updated_at timestamp when new message is added
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats
  SET updated_at = now()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update chat timestamp
DROP TRIGGER IF EXISTS trigger_update_chat_timestamp ON chat_messages;
CREATE TRIGGER trigger_update_chat_timestamp
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_timestamp();

-- Function to get unread message count for a user in a chat
CREATE OR REPLACE FUNCTION get_unread_count(p_chat_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_read_at TIMESTAMPTZ;
  v_unread_count INTEGER;
BEGIN
  -- Get last_read_at from chat_participants
  SELECT last_read_at INTO v_last_read_at
  FROM chat_participants
  WHERE chat_id = p_chat_id AND user_id = p_user_id;
  
  -- Count messages after last_read_at from other users
  SELECT COUNT(*)::INTEGER INTO v_unread_count
  FROM chat_messages
  WHERE chat_id = p_chat_id
    AND sender_id != p_user_id
    AND (v_last_read_at IS NULL OR created_at > v_last_read_at);
  
  RETURN COALESCE(v_unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

-- Already created above, but listing here for reference:
-- - idx_chats_creator
-- - idx_chats_subscriber
-- - idx_chats_updated_at
-- - idx_chat_messages_chat_id
-- - idx_chat_messages_created_at
-- - idx_chat_messages_sender
-- - idx_chat_messages_chat_created (composite)
-- - idx_chat_participants_user
-- - idx_chat_participants_chat

-- ============================================
-- 8. SETUP VERIFICATION
-- ============================================

-- After running this schema, verify with:
-- SELECT * FROM chats LIMIT 1;
-- SELECT * FROM chat_messages LIMIT 1;
-- SELECT * FROM chat_participants LIMIT 1;

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('chats', 'chat_messages', 'chat_participants');

