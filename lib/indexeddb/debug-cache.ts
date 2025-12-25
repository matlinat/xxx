/**
 * Debug utilities for IndexedDB cache
 * Use in browser console to diagnose cache issues
 */

import { chatDB } from './chat-db'
import { getCachedMessages, getCacheMetadata, checkStorageQuota } from './chat-cache'

/**
 * Print cache status for a specific chat
 */
export async function debugChatCache(chatId: string) {
  console.group('🔍 Cache Debug for Chat:', chatId)
  
  try {
    // Check if database exists and is open
    console.log('📊 Database info:', {
      name: chatDB.name,
      isOpen: chatDB.isOpen(),
      verno: chatDB.verno
    })
    
    // Check tables
    const messageCount = await chatDB.messages.count()
    const chatCount = await chatDB.chats.count()
    console.log('📈 Table counts:', {
      totalMessages: messageCount,
      totalChats: chatCount
    })
    
    // Check specific chat metadata
    const metadata = await getCacheMetadata(chatId)
    console.log('💾 Chat metadata:', metadata)
    
    // Check messages for this chat
    const messages = await getCachedMessages(chatId, 100)
    console.log('💬 Cached messages:', {
      count: messages.length,
      firstMessage: messages[messages.length - 1],
      lastMessage: messages[0]
    })
    
    // Check storage quota
    const quota = await checkStorageQuota()
    console.log('💽 Storage quota:', {
      usage: `${(quota.usage / 1024 / 1024).toFixed(2)} MB`,
      quota: `${(quota.quota / 1024 / 1024).toFixed(2)} MB`,
      percentage: `${quota.percentage.toFixed(2)}%`
    })
    
    // List all messages for this chat (detailed)
    const allMessages = await chatDB.messages
      .where('chatId')
      .equals(chatId)
      .toArray()
    
    console.log('📋 All messages in cache:', allMessages)
    
  } catch (error) {
    console.error('❌ Error debugging cache:', error)
  }
  
  console.groupEnd()
}

/**
 * Print full cache status (all chats)
 */
export async function debugFullCache() {
  console.group('🔍 Full Cache Debug')
  
  try {
    // Database info
    console.log('📊 Database:', {
      name: chatDB.name,
      isOpen: chatDB.isOpen(),
      version: chatDB.verno
    })
    
    // All tables
    const messageCount = await chatDB.messages.count()
    const chatCount = await chatDB.chats.count()
    console.log('📈 Totals:', {
      messages: messageCount,
      chats: chatCount
    })
    
    // All chats
    const allChats = await chatDB.chats.toArray()
    console.log('💾 All cached chats:', allChats)
    
    // Messages per chat
    for (const chat of allChats) {
      const messages = await chatDB.messages
        .where('chatId')
        .equals(chat.chatId)
        .toArray()
      
      console.log(`  Chat ${chat.chatId}:`, {
        messageCount: messages.length,
        lastSync: new Date(chat.lastSyncAt).toISOString(),
        lastMessage: chat.lastMessageTimestamp
      })
    }
    
    // Storage quota
    const quota = await checkStorageQuota()
    console.log('💽 Storage:', {
      used: `${(quota.usage / 1024 / 1024).toFixed(2)} MB`,
      total: `${(quota.quota / 1024 / 1024).toFixed(2)} MB`,
      percent: `${quota.percentage.toFixed(2)}%`
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
  
  console.groupEnd()
}

/**
 * Clear all cache (for testing)
 */
export async function clearAllCache() {
  console.log('🗑️ Clearing all cache...')
  
  try {
    await chatDB.messages.clear()
    await chatDB.chats.clear()
    console.log('✅ Cache cleared successfully')
  } catch (error) {
    console.error('❌ Error clearing cache:', error)
  }
}

/**
 * Test cache write/read
 */
export async function testCacheOperations(chatId: string) {
  console.group('🧪 Testing Cache Operations')
  
  try {
    // Test write
    console.log('📝 Testing write...')
    const testMessages = [
      {
        id: 'test-1',
        chat_id: chatId,
        sender_id: 'test-user',
        message_type: 'text' as const,
        content: 'Test message 1',
        media_url: null,
        price: null,
        unlocked_by: [],
        read_at: null,
        created_at: new Date().toISOString(),
        sender: {
          id: 'test-user',
          name: 'Test User',
          avatar_url: null,
          username: 'testuser'
        }
      }
    ]
    
    await chatDB.transaction('rw', chatDB.messages, chatDB.chats, async () => {
      // Insert message
      await chatDB.messages.bulkPut(
        testMessages.map(msg => ({
          ...msg,
          chatId,
          cachedAt: Date.now()
        }))
      )
      
      // Update metadata
      await chatDB.chats.put({
        chatId,
        lastSyncAt: Date.now(),
        lastMessageId: testMessages[0].id,
        lastMessageTimestamp: testMessages[0].created_at,
        messageCount: 1,
        version: 1
      })
    })
    console.log('✅ Write successful')
    
    // Test read
    console.log('📖 Testing read...')
    const readMessages = await getCachedMessages(chatId, 10)
    console.log('✅ Read successful:', readMessages)
    
    // Verify
    const metadata = await getCacheMetadata(chatId)
    console.log('✅ Metadata:', metadata)
    
    console.log('🎉 All tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
  
  console.groupEnd()
}

/**
 * Make debug functions available globally in development
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugCache = {
    chat: debugChatCache,
    full: debugFullCache,
    clear: clearAllCache,
    test: testCacheOperations,
    db: chatDB
  }
  
  console.log('🐛 Cache debug tools loaded. Use window.debugCache:')
  console.log('  - debugCache.chat(chatId) - Debug specific chat')
  console.log('  - debugCache.full() - Debug all cache')
  console.log('  - debugCache.clear() - Clear all cache')
  console.log('  - debugCache.test(chatId) - Test cache operations')
  console.log('  - debugCache.db - Direct database access')
}

