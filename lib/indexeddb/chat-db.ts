import Dexie, { Table } from 'dexie'
import type { ChatMessageWithSender } from '@/lib/supabase/chat'

// Extended message type with cache metadata
export interface CachedMessage extends ChatMessageWithSender {
  chatId: string
  cachedAt: number // timestamp when cached
}

// Chat metadata for sync tracking
export interface ChatMetadata {
  chatId: string
  lastSyncAt: number
  lastMessageId: string | null
  lastMessageTimestamp: string | null
  messageCount: number
  version: number // for schema migrations
}

class ChatDatabase extends Dexie {
  messages!: Table<CachedMessage, string>
  chats!: Table<ChatMetadata, string>

  constructor() {
    super('ChatCache')
    
    // Version 1: Initial schema
    this.version(1).stores({
      // Indexes for efficient queries
      // chatId index for filtering by chat
      // Compound index [chatId+created_at] for potential future range queries
      messages: 'id, chatId, sender_id, [chatId+created_at], cachedAt',
      chats: 'chatId'
    })
  }
}

// Singleton instance
export const chatDB = new ChatDatabase()

