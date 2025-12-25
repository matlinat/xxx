import { chatDB, type CachedMessage, type ChatMetadata } from './chat-db'
import type { ChatMessageWithSender } from '@/lib/supabase/chat'

// ============================================
// BASIC CACHE OPERATIONS
// ============================================

/**
 * Load messages from cache (instant)
 */
export async function getCachedMessages(
  chatId: string,
  limit = 50
): Promise<CachedMessage[]> {
  return await chatDB.messages
    .where('chatId').equals(chatId)
    .orderBy('[chatId+created_at]')
    .reverse()
    .limit(limit)
    .toArray()
}

/**
 * Save messages to cache
 */
export async function cacheMessages(
  chatId: string,
  messages: ChatMessageWithSender[]
): Promise<void> {
  await chatDB.transaction('rw', chatDB.messages, chatDB.chats, async () => {
    // Batch insert with chatId
    const cachedMessages = messages.map(msg => ({
      ...msg,
      chatId,
      cachedAt: Date.now()
    }))
    
    await chatDB.messages.bulkPut(cachedMessages)
    
    // Update chat metadata - find most recent message
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const lastMessage = sortedMessages[0] // Most recent
    
    await chatDB.chats.put({
      chatId,
      lastSyncAt: Date.now(),
      lastMessageId: lastMessage?.id || null,
      lastMessageTimestamp: lastMessage?.created_at || null,
      messageCount: messages.length,
      version: 1
    })
  })
}

/**
 * Check if cache needs refresh
 */
export async function isCacheStale(
  chatId: string,
  maxAge = 5 * 60 * 1000 // 5 minutes default
): Promise<boolean> {
  const metadata = await chatDB.chats.get(chatId)
  if (!metadata) return true
  
  return Date.now() - metadata.lastSyncAt > maxAge
}

/**
 * Get cache metadata for a chat
 */
export async function getCacheMetadata(
  chatId: string
): Promise<ChatMetadata | undefined> {
  return await chatDB.chats.get(chatId)
}

// ============================================
// INCREMENTAL SYNC FUNCTIONS
// ============================================

/**
 * Get messages newer than a specific message (for incremental sync)
 */
export async function getNewMessages(
  chatId: string,
  afterMessageId: string
): Promise<CachedMessage[]> {
  const afterMessage = await chatDB.messages.get(afterMessageId)
  if (!afterMessage) return []
  
  return await chatDB.messages
    .where('[chatId+created_at]')
    .above([chatId, afterMessage.created_at])
    .toArray()
}

/**
 * Fetch only new messages from server
 */
export async function syncNewMessagesFromServer(
  chatId: string
): Promise<ChatMessageWithSender[]> {
  const metadata = await getCacheMetadata(chatId)
  
  if (!metadata?.lastMessageTimestamp) {
    // No cache, fetch all
    return []
  }
  
  try {
    // API call to get messages after lastMessageTimestamp
    const response = await fetch(
      `/api/chat/${chatId}/messages?after=${metadata.lastMessageTimestamp}`
    )
    
    if (!response.ok) {
      console.error('[Cache] Failed to sync new messages:', response.statusText)
      return []
    }
    
    const newMessages = await response.json()
    
    if (newMessages.length > 0) {
      await cacheMessages(chatId, newMessages)
    }
    
    return newMessages
  } catch (error) {
    console.error('[Cache] Error syncing new messages:', error)
    return []
  }
}

// ============================================
// PAGINATION FUNCTIONS
// ============================================

/**
 * Load older messages from cache (for infinite scroll)
 */
export async function loadOlderMessages(
  chatId: string,
  beforeMessageId: string,
  limit = 50
): Promise<CachedMessage[]> {
  const beforeMessage = await chatDB.messages.get(beforeMessageId)
  if (!beforeMessage) return []
  
  return await chatDB.messages
    .where('[chatId+created_at]')
    .below([chatId, beforeMessage.created_at])
    .reverse()
    .limit(limit)
    .toArray()
}

/**
 * Load older messages from server if not in cache
 */
export async function loadOlderMessagesFromServer(
  chatId: string,
  beforeMessageId: string,
  limit = 50
): Promise<ChatMessageWithSender[]> {
  const beforeMessage = await chatDB.messages.get(beforeMessageId)
  if (!beforeMessage) return []
  
  try {
    const response = await fetch(
      `/api/chat/${chatId}/messages?before=${beforeMessage.created_at}&limit=${limit}`
    )
    
    if (!response.ok) {
      console.error('[Cache] Failed to load older messages:', response.statusText)
      return []
    }
    
    const messages = await response.json()
    
    if (messages.length > 0) {
      await cacheMessages(chatId, messages)
    }
    
    return messages
  } catch (error) {
    console.error('[Cache] Error loading older messages:', error)
    return []
  }
}

// ============================================
// CACHE CLEANUP FUNCTIONS
// ============================================

/**
 * Remove messages older than maxAge
 */
export async function cleanupOldCache(
  maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
): Promise<number> {
  const cutoff = Date.now() - maxAge
  const oldMessages = await chatDB.messages
    .where('cachedAt')
    .below(cutoff)
    .toArray()
  
  const ids = oldMessages.map(m => m.id)
  await chatDB.messages.bulkDelete(ids)
  
  return ids.length
}

/**
 * Keep only last N messages per chat
 */
export async function limitCacheSize(
  chatId: string,
  maxMessages = 1000
): Promise<number> {
  const allMessages = await chatDB.messages
    .where('chatId').equals(chatId)
    .orderBy('[chatId+created_at]')
    .toArray()
  
  if (allMessages.length <= maxMessages) return 0
  
  const toDelete = allMessages.slice(0, allMessages.length - maxMessages)
  const ids = toDelete.map(m => m.id)
  await chatDB.messages.bulkDelete(ids)
  
  return ids.length
}

/**
 * Clear all cached data for a chat
 */
export async function clearChatCache(chatId: string): Promise<void> {
  await chatDB.transaction('rw', chatDB.messages, chatDB.chats, async () => {
    await chatDB.messages.where('chatId').equals(chatId).delete()
    await chatDB.chats.delete(chatId)
  })
}

// ============================================
// ERROR HANDLING (Safe wrappers)
// ============================================

/**
 * Safe wrapper for getCachedMessages with error handling
 */
export async function getCachedMessagesSafe(
  chatId: string,
  limit = 50
): Promise<CachedMessage[]> {
  try {
    return await getCachedMessages(chatId, limit)
  } catch (error) {
    console.error('[Cache] Error loading from cache:', error)
    // Fallback to empty array, will fetch from server
    return []
  }
}

/**
 * Safe wrapper for cacheMessages with error handling
 */
export async function cacheMessagesSafe(
  chatId: string,
  messages: ChatMessageWithSender[]
): Promise<void> {
  try {
    await cacheMessages(chatId, messages)
  } catch (error) {
    console.error('[Cache] Error caching messages:', error)
    // Non-critical, continue without cache
  }
}

// ============================================
// QUOTA MANAGEMENT
// ============================================

/**
 * Check storage quota usage
 */
export async function checkStorageQuota(): Promise<{
  usage: number
  quota: number
  percentage: number
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentage: estimate.quota 
        ? (estimate.usage || 0) / estimate.quota * 100 
        : 0
    }
  }
  return { usage: 0, quota: 0, percentage: 0 }
}

/**
 * Auto-cleanup if quota > 80%
 */
export async function autoCleanupIfNeeded(): Promise<void> {
  const quota = await checkStorageQuota()
  
  if (quota.percentage > 80) {
    console.warn('[Cache] Storage quota > 80%, cleaning up...')
    await cleanupOldCache(7 * 24 * 60 * 60 * 1000) // 7 days
    
    // Limit all chats to 500 messages
    const chats = await chatDB.chats.toArray()
    for (const chat of chats) {
      await limitCacheSize(chat.chatId, 500)
    }
  }
}

// ============================================
// PERFORMANCE METRICS
// ============================================

export interface CacheMetrics {
  cacheHit: boolean
  cacheLoadTime: number
  serverSyncTime: number
  totalTime: number
  messageCount: number
}

export function logCacheMetrics(metrics: CacheMetrics) {
  console.log(`[CACHE METRICS]`, {
    hit: metrics.cacheHit,
    cacheTime: `${metrics.cacheLoadTime}ms`,
    syncTime: `${metrics.serverSyncTime}ms`,
    total: `${metrics.totalTime}ms`,
    messages: metrics.messageCount
  })
}

