-- ============================================
-- SUPABASE REALTIME SETUP FOR CHAT SYSTEM
-- ============================================
-- Run this in Supabase SQL Editor to enable Realtime for chat_messages

-- ============================================
-- 1. Enable Realtime for chat_messages table
-- ============================================

-- First, check if the publication exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add chat_messages to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================
-- 2. Set REPLICA IDENTITY for chat_messages
-- ============================================
-- This ensures that the full row data is sent in realtime events

ALTER TABLE chat_messages REPLICA IDENTITY FULL;

-- ============================================
-- 3. Verify Realtime is enabled
-- ============================================

-- Check which tables are in the realtime publication
SELECT 
    schemaname,
    tablename
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
    AND tablename IN ('chat_messages', 'chats', 'chat_participants');

-- ============================================
-- 4. (Optional) Add other chat tables to Realtime
-- ============================================
-- Uncomment if you want realtime updates for these too:

-- ALTER PUBLICATION supabase_realtime ADD TABLE chats;
-- ALTER TABLE chats REPLICA IDENTITY FULL;

-- ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
-- ALTER TABLE chat_participants REPLICA IDENTITY FULL;

-- ============================================
-- DONE!
-- ============================================
-- Now Realtime should work for chat_messages
-- Test by inserting a message and listening in the client

