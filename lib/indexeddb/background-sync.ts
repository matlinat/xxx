import { chatDB } from './chat-db'
import { syncNewMessagesFromServer, cleanupOldCache, limitCacheSize } from './chat-cache'

/**
 * Background sync for all active chats
 */
export async function syncAllActiveChats(): Promise<void> {
  const activeChats = await chatDB.chats.toArray()
  
  for (const chat of activeChats) {
    try {
      await syncNewMessagesFromServer(chat.chatId)
    } catch (error) {
      console.error(`[BackgroundSync] Failed to sync chat ${chat.chatId}:`, error)
    }
  }
}

/**
 * Periodic cache maintenance
 */
export async function performCacheMaintenance(): Promise<void> {
  // Cleanup old cache
  const deletedCount = await cleanupOldCache()
  if (deletedCount > 0) {
    console.log(`[CacheMaintenance] Cleaned up ${deletedCount} old messages`)
  }
  
  // Limit cache size per chat
  const chats = await chatDB.chats.toArray()
  for (const chat of chats) {
    const limitedCount = await limitCacheSize(chat.chatId, 1000)
    if (limitedCount > 0) {
      console.log(`[CacheMaintenance] Limited chat ${chat.chatId} to 1000 messages, deleted ${limitedCount}`)
    }
  }
}

/**
 * Initialize background sync and maintenance
 * Run maintenance weekly, sync active chats periodically
 */
if (typeof window !== 'undefined') {
  // Check if maintenance needed (once per week)
  const lastMaintenance = localStorage.getItem('lastCacheMaintenance')
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  
  if (!lastMaintenance || parseInt(lastMaintenance) < weekAgo) {
    performCacheMaintenance().catch(console.error)
    localStorage.setItem('lastCacheMaintenance', Date.now().toString())
  }
  
  // Periodic background sync (every 5 minutes when tab is active)
  let syncInterval: NodeJS.Timeout | null = null
  
  const startBackgroundSync = () => {
    if (syncInterval) return
    
    syncInterval = setInterval(() => {
      if (!document.hidden) {
        syncAllActiveChats().catch(console.error)
      }
    }, 5 * 60 * 1000) // Every 5 minutes
  }
  
  const stopBackgroundSync = () => {
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
  }
  
  // Start sync when page becomes visible
  if (!document.hidden) {
    startBackgroundSync()
  }
  
  // Pause sync when tab is hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopBackgroundSync()
    } else {
      startBackgroundSync()
    }
  })
}

