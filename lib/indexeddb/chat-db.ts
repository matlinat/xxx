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
    
    console.log('[CACHE DB] 🗄️ Initializing ChatCache database...')
    
    // Version 1: Initial schema
    this.version(1).stores({
      // Indexes for efficient queries
      // chatId index for filtering by chat
      // Compound index [chatId+created_at] for potential future range queries
      messages: 'id, chatId, sender_id, [chatId+created_at], cachedAt',
      chats: 'chatId'
    })
    
    // Log when database is opened
    this.on('ready', () => {
      console.log('[CACHE DB] ✅ Database ready')
    })
    
    // Log errors
    this.on('blocked', () => {
      console.warn('[CACHE DB] ⚠️ Database blocked - close other tabs')
    })
    
    this.on('versionchange', () => {
      console.log('[CACHE DB] 🔄 Database version changed')
    })
  }
}

// Singleton instance
export const chatDB = new ChatDatabase()

// Test database on init (only in browser)
if (typeof window !== 'undefined') {
  chatDB.open().then(() => {
    console.log('[CACHE DB] ✅ Database opened successfully')
    console.log('[CACHE DB] 📊 Version:', chatDB.verno)
    console.log('[CACHE DB] 📋 Tables:', chatDB.tables.map(t => t.name))
  }).catch(error => {
    console.error('[CACHE DB] ❌ Failed to open database:', error)
  })
}

