"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { chatDB } from "@/lib/indexeddb/chat-db"
import { getCacheMetadata, checkStorageQuota } from "@/lib/indexeddb/chat-cache"

interface CacheDebugPanelProps {
  chatId: string
}

/**
 * Debug panel to show IndexedDB cache status
 * Only visible in development mode
 */
export function CacheDebugPanel({ chatId }: CacheDebugPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [status, setStatus] = React.useState<{
    dbOpen: boolean
    messageCount: number
    chatCount: number
    metadata: any
    quota: any
    messagesInChat: number
  } | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const loadStatus = React.useCallback(async () => {
    setIsLoading(true)
    try {
      // Check database
      const dbOpen = chatDB.isOpen()
      
      // Count tables
      const messageCount = await chatDB.messages.count()
      const chatCount = await chatDB.chats.count()
      
      // Get metadata for this chat
      const metadata = await getCacheMetadata(chatId)
      
      // Get messages for this chat
      const messagesInChat = await chatDB.messages
        .where('chatId')
        .equals(chatId)
        .count()
      
      // Get quota
      const quota = await checkStorageQuota()
      
      setStatus({
        dbOpen,
        messageCount,
        chatCount,
        metadata,
        quota,
        messagesInChat
      })
    } catch (error) {
      console.error('Error loading cache status:', error)
    } finally {
      setIsLoading(false)
    }
  }, [chatId])

  const clearCache = async () => {
    if (confirm('Clear all cache?')) {
      await chatDB.messages.clear()
      await chatDB.chats.clear()
      await loadStatus()
    }
  }

  const clearChatCache = async () => {
    if (confirm(`Clear cache for this chat (${chatId})?`)) {
      await chatDB.messages.where('chatId').equals(chatId).delete()
      await chatDB.chats.delete(chatId)
      await loadStatus()
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      loadStatus()
    }
  }, [isOpen, loadStatus])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="shadow-lg"
        >
          🐛 Cache Debug
        </Button>
      ) : (
        <Card className="w-96 shadow-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">IndexedDB Cache Debug</CardTitle>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {isLoading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : status ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Database:</span>
                    <Badge variant={status.dbOpen ? "default" : "destructive"}>
                      {status.dbOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Messages:</span>
                    <Badge variant="outline">{status.messageCount}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Chats:</span>
                    <Badge variant="outline">{status.chatCount}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Messages (this chat):</span>
                    <Badge variant="outline">{status.messagesInChat}</Badge>
                  </div>
                </div>

                {status.metadata && (
                  <div className="space-y-1 rounded border p-2">
                    <div className="font-semibold">Chat Metadata:</div>
                    <div className="text-muted-foreground">
                      Last sync: {new Date(status.metadata.lastSyncAt).toLocaleString()}
                    </div>
                    <div className="text-muted-foreground">
                      Message count: {status.metadata.messageCount}
                    </div>
                    {status.metadata.lastMessageTimestamp && (
                      <div className="text-muted-foreground truncate">
                        Last message: {new Date(status.metadata.lastMessageTimestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1 rounded border p-2">
                  <div className="font-semibold">Storage Quota:</div>
                  <div className="text-muted-foreground">
                    Used: {(status.quota.usage / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="text-muted-foreground">
                    Total: {(status.quota.quota / 1024 / 1024).toFixed(2)} MB
                  </div>
                  <div className="text-muted-foreground">
                    Usage: {status.quota.percentage.toFixed(2)}%
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={loadStatus}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    🔄 Refresh
                  </Button>
                  <Button
                    onClick={clearChatCache}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    🗑️ Clear Chat
                  </Button>
                </div>

                <Button
                  onClick={clearCache}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  🗑️ Clear All Cache
                </Button>
              </>
            ) : (
              <div className="text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

