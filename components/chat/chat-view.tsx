"use client"

import * as React from "react"
import { Video, Phone, PhoneOff, MoreVertical, ArrowLeft, Loader2, Coins } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { CacheDebugPanel } from "./cache-debug-panel"
import { type Message, type MessageStatus, getInitials } from "./chat-utils"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  sendTextMessageAction,
  markAsReadAction,
} from "@/app/home/chat/actions"
import { toast } from "sonner"
import type { ChatMessageWithSender } from "@/lib/supabase/chat"
import { useChatSubscription, type RealtimeMessage } from "@/hooks/use-chat-subscription"
import { useTypingIndicator } from "@/hooks/use-typing-indicator"
import { usePresence } from "@/hooks/use-presence"
import { formatRelativeTime } from "./chat-utils"
import { 
  getCachedMessagesSafe, 
  cacheMessagesSafe, 
  isCacheStale, 
  syncNewMessagesFromServer,
  logCacheMetrics,
  type CacheMetrics
} from "@/lib/indexeddb/chat-cache"
// Initialize background sync (runs automatically on import)
import "@/lib/indexeddb/background-sync"

// Initialize debug tools in development (runs automatically on import)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import("@/lib/indexeddb/debug-cache").then(() => {
    console.log('[DEBUG] 🐛 Debug tools loaded')
  })
}

interface ChatViewProps {
  chatId: string
  showBackButton?: boolean
}

// Convert DB message to UI message format
function convertToUIMessage(dbMessage: ChatMessageWithSender): Message {
  return {
    id: dbMessage.id,
    type: dbMessage.message_type as "text" | "video" | "image_gallery",
    content: dbMessage.content || "",
    timestamp: new Date(dbMessage.created_at),
    read: !!dbMessage.read_at,
    senderId: dbMessage.sender_id,
    videoUrl: dbMessage.message_type === "video" ? dbMessage.media_url || undefined : undefined,
    images: dbMessage.message_type === "image" && dbMessage.media_url ? [dbMessage.media_url] : undefined,
    status: dbMessage.read_at ? 'read' : 'sent',
    isOptimistic: false,
  }
}

export function ChatView({ chatId, showBackButton = false }: ChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [optimisticMessages, setOptimisticMessages] = React.useState<Message[]>([])
  const [chatInfo, setChatInfo] = React.useState<{
    id: string
    name: string
    avatar: string | null
    username: string | null
  } | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSending, setIsSending] = React.useState(false)
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null)
  const [walletBalance, setWalletBalance] = React.useState<number | null>(null)
  const router = useRouter()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const isInitialLoadRef = React.useRef(true)
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Combine real and optimistic messages for display
  const displayMessages = React.useMemo(() => {
    return [...messages, ...optimisticMessages].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    )
  }, [messages, optimisticMessages])

  const handleBack = () => {
    router.push('/home/chat')
  }

  // Auto-scroll zur neuesten Nachricht (robust mit Retry)
  const scrollToBottom = React.useCallback((instant = false, retry = 0) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: instant ? "auto" : "smooth",
        block: "end"
      })
    } else if (retry < 3) {
      // Retry wenn DOM noch nicht ready ist
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom(instant, retry + 1)
      }, 50)
    }
  }, [])

  // Load chat info and messages - CACHE-FIRST: Instant from IndexedDB, sync in background
  React.useEffect(() => {
    // Reset initial load flag when chat changes
    isInitialLoadRef.current = true
    
    async function loadChat() {
      const clientPerfStart = performance.now()
      setIsLoading(true)
      
      try {
        // STEP 1: Load from cache INSTANTLY
        const cacheStart = performance.now()
        const cachedMessages = await getCachedMessagesSafe(chatId, 50)
        const cacheTime = performance.now() - cacheStart
        console.log(`[CACHE] ⚡ Loaded from cache: ${cacheTime.toFixed(0)}ms`)
        
        if (cachedMessages.length > 0) {
          // Show cached messages immediately
          const uiMessages = cachedMessages.map(convertToUIMessage)
          console.log(`[CACHE] 📋 Showing ${uiMessages.length} cached messages:`, {
            first: uiMessages[0]?.content?.substring(0, 30),
            last: uiMessages[uiMessages.length - 1]?.content?.substring(0, 30)
          })
          setMessages(uiMessages)
          setIsLoading(false) // UI ready!
          
          // Scroll to bottom instantly (with retry)
          scrollToBottom(true)
        }
        
        // STEP 2: Check if cache is stale
        const isStale = await isCacheStale(chatId, 5 * 60 * 1000) // 5 min
        
        let serverSyncTime = 0
        let cacheHit = cachedMessages.length > 0
        
        if (isStale || cachedMessages.length === 0) {
          // STEP 3: Sync with server in background
          const syncStart = performance.now()
          const response = await fetch(`/api/chat/${chatId}/data`)
          const result = await response.json()
          serverSyncTime = performance.now() - syncStart
          console.log(`[CACHE] 🔄 Server sync: ${serverSyncTime.toFixed(0)}ms`)
          
          // Log server-side performance breakdown
          if (result._perf) {
            console.log(`[PERF SERVER] 🔐 Auth: ${result._perf.auth}ms`)
            console.log(`[PERF SERVER] 🔒 Access check: ${result._perf.accessCheck}ms`)
            console.log(`[PERF SERVER] 💬 Chat fetch: ${result._perf.chatFetch}ms`)
            console.log(`[PERF SERVER] ⚡ Parallel queries (messages + wallet + profile): ${result._perf.parallelQueries}ms`)
            console.log(`[PERF SERVER] ✅ Server total: ${result._perf.total}ms`)
          }
          
          if (!result.success || !result.chat) {
            toast.error(result.error || "Chat nicht gefunden")
            router.push('/home/chat')
            return
          }

          // Set current user ID
          if (result.currentUserId) {
            setCurrentUserId(result.currentUserId)
          }

          // Set chat info
          setChatInfo({
            id: result.chat.otherUser.id,
            name: result.chat.otherUser.name,
            avatar: result.chat.otherUser.avatar_url,
            username: result.chat.otherUser.username,
          })

          // Set messages
          if (result.messages) {
            console.log(`[SERVER] 📨 Received ${result.messages.length} messages from server`)
            
            // Update cache
            await cacheMessagesSafe(chatId, result.messages)
            
            // Update UI if different
            const uiMessages = result.messages.map(convertToUIMessage)
            console.log(`[SERVER] 📋 Updating UI with ${uiMessages.length} messages`)
            setMessages(uiMessages)
            
            // Scroll to bottom after server messages load
            if (cachedMessages.length === 0) {
              // First load (no cache), scroll instantly
              scrollToBottom(true)
            }
          }

          // Set wallet balance
          if (result.walletBalance !== undefined) {
            setWalletBalance(result.walletBalance)
          }
        } else {
          // Cache is fresh, only sync new messages incrementally
          const syncStart = performance.now()
          const newMessages = await syncNewMessagesFromServer(chatId)
          serverSyncTime = performance.now() - syncStart
          
          if (newMessages.length > 0) {
            console.log(`[CACHE] 🔄 Incremental sync: ${newMessages.length} new messages in ${serverSyncTime.toFixed(0)}ms`)
            const uiMessages = newMessages.map(convertToUIMessage)
            setMessages(prev => [...prev, ...uiMessages])
          }
          
          // Still need to fetch chat info and wallet balance
          const response = await fetch(`/api/chat/${chatId}/data`)
          const result = await response.json()
          
          if (result.success && result.chat) {
            if (result.currentUserId) {
              setCurrentUserId(result.currentUserId)
            }
            
            setChatInfo({
              id: result.chat.otherUser.id,
              name: result.chat.otherUser.name,
              avatar: result.chat.otherUser.avatar_url,
              username: result.chat.otherUser.username,
            })
            
            if (result.walletBalance !== undefined) {
              setWalletBalance(result.walletBalance)
            }
          }
        }
        
        // Log cache metrics
        const totalTime = performance.now() - clientPerfStart
        const metrics: CacheMetrics = {
          cacheHit: cacheHit,
          cacheLoadTime: cacheTime,
          serverSyncTime: serverSyncTime,
          totalTime: totalTime,
          messageCount: cachedMessages.length || 0
        }
        logCacheMetrics(metrics)
        
        console.log(`[CACHE] ✅ TOTAL: ${totalTime.toFixed(0)}ms`)
      } catch (error) {
        console.error("Error loading chat:", error)
        toast.error("Fehler beim Laden des Chats")
      } finally {
        setIsLoading(false)
      }
    }

    if (chatId) {
      loadChat()
    }
  }, [chatId, router])

  // Realtime subscription
  const handleRealtimeMessage = React.useCallback(
    async (realtimeMsg: RealtimeMessage) => {
      console.log('[REALTIME] 📨 New message received:', {
        id: realtimeMsg.id,
        sender: realtimeMsg.sender_id,
        content: realtimeMsg.content?.substring(0, 50),
        isOwnMessage: realtimeMsg.sender_id === currentUserId
      })
      
      // Check if message already exists by ID (prevent duplicates)
      const existsInMessages = messages.some((m) => m.id === realtimeMsg.id)
      
      if (existsInMessages) {
        console.log('[REALTIME] ⏭️ Message already exists, skipping')
        return
      }
      
      // If it's our own message, remove any matching optimistic message
      if (realtimeMsg.sender_id === currentUserId) {
        console.log('[REALTIME] 👤 Own message detected')
        const hasOptimistic = optimisticMessages.some((m) => 
          m.isOptimistic && m.content === realtimeMsg.content
        )
        
        if (hasOptimistic) {
          console.log('[REALTIME] 🔄 Removing optimistic message')
          setOptimisticMessages(prev => 
            prev.filter(m => !(m.isOptimistic && m.content === realtimeMsg.content))
          )
        }
        
        // Don't add - message was already added directly after send
        console.log('[REALTIME] ✅ Skipping (already added after send)')
        return
      }

      // Load sender profile
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: profile } = await supabase
        .from("creator_profiles")
        .select("user_id, display_name, avatar_url, username")
        .eq("user_id", realtimeMsg.sender_id)
        .single()

      const messageWithSender: ChatMessageWithSender = {
        ...realtimeMsg,
        unlocked_by: [],
        read_at: null,
        price: null,
        sender: {
          id: realtimeMsg.sender_id,
          name: profile?.display_name || "Unknown User",
          avatar_url: profile?.avatar_url || null,
          username: profile?.username || null,
        },
      }

      // Cache the new message
      await cacheMessagesSafe(chatId, [messageWithSender])
      
      // Update UI
      const uiMessage = convertToUIMessage(messageWithSender)
      setMessages((prev) => [...prev, uiMessage])

      // Mark as read
      await markAsReadAction(chatId)
    },
    [currentUserId, messages, optimisticMessages, chatId]
  )

  const { isConnected } = useChatSubscription({
    chatId,
    onMessage: handleRealtimeMessage,
    enabled: !isLoading && !!currentUserId,
  })

  const { typingUsers, sendTypingEvent } = useTypingIndicator({
    chatId,
    enabled: !isLoading && !!currentUserId,
    currentUserId: currentUserId || undefined,
  })

  // Presence system for online/offline status
  const { isOnline, getLastSeen } = usePresence(chatId, currentUserId || undefined)
  
  const otherUserOnline = chatInfo?.id ? isOnline(chatInfo.id) : false
  const otherUserLastSeen = chatInfo?.id ? getLastSeen(chatInfo.id) : null

  // Handle typing event with userName
  const handleTyping = React.useCallback(() => {
    if (chatInfo?.name) {
      sendTypingEvent(chatInfo.name)
    }
  }, [sendTypingEvent, chatInfo?.name])


  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (displayMessages.length > 0) {
      if (isInitialLoadRef.current) {
        // Initial load: instant scroll (with small delay for animations)
        setTimeout(() => {
          scrollToBottom(true)
        }, 100)
        // Mark initial load as done after a short delay
        setTimeout(() => {
          isInitialLoadRef.current = false
        }, 500)
      } else {
        // Subsequent updates: smooth scroll
        scrollToBottom(false)
      }
    }
  }, [displayMessages.length, scrollToBottom])
  
  // Force scroll to bottom when loading completes
  React.useEffect(() => {
    if (!isLoading && displayMessages.length > 0) {
      // Ensure scroll after loading is done (handles edge cases)
      setTimeout(() => {
        scrollToBottom(true)
      }, 150)
    }
  }, [isLoading, scrollToBottom])
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isSending || !currentUserId) return

    const tempId = `temp-${Date.now()}-${Math.random()}`
    
    // Create optimistic message immediately
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId,
      type: 'text',
      content: messageText.trim(),
      timestamp: new Date(),
      read: false,
      status: 'sending',
      isOptimistic: true
    }

    // Add to optimistic state immediately (instant UI update)
    setOptimisticMessages(prev => [...prev, optimisticMessage])
    setIsSending(true)

    try {
      const result = await sendTextMessageAction(chatId, messageText.trim())

      if (result.success && result.message) {
        // Remove optimistic message
        setOptimisticMessages(prev => 
          prev.filter(m => m.id !== tempId)
        )
        
        console.log('[SEND] ✅ Message sent successfully:', result.message.id)
        
        // Add real message directly (don't wait for Realtime)
        const realMessage: Message = {
          id: result.message.id,
          senderId: result.message.sender_id,
          type: result.message.message_type as "text" | "video" | "image_gallery",
          content: result.message.content || "",
          timestamp: new Date(result.message.created_at),
          read: !!result.message.read_at,
          status: 'sent',
          isOptimistic: false,
        }
        setMessages(prev => [...prev, realMessage])
        console.log('[SEND] 📝 Message added to UI')
        
        // Cache the message (result.message already has sender info)
        await cacheMessagesSafe(chatId, [result.message])
        console.log('[SEND] 💾 Message cached')
        
        // Update wallet balance
        if (result.newBalance !== undefined) {
          setWalletBalance(result.newBalance)
        }

        toast.success("Nachricht gesendet (1 Credit abgezogen)")
      } else {
        // Mark optimistic message as failed
        setOptimisticMessages(prev =>
          prev.map(m => m.id === tempId 
            ? { ...m, status: 'failed' as MessageStatus }
            : m
          )
        )

        // Check if it's a rate limit error
        if (result.rateLimitReset) {
          const resetDate = new Date(result.rateLimitReset)
          const now = new Date()
          const secondsUntilReset = Math.ceil((resetDate.getTime() - now.getTime()) / 1000)
          
          if (secondsUntilReset > 60) {
            const minutesUntilReset = Math.ceil(secondsUntilReset / 60)
            toast.error(
              `${result.error} Versuche es in ${minutesUntilReset} Minute${minutesUntilReset > 1 ? 'n' : ''} erneut.`,
              { duration: 5000 }
            )
          } else {
            toast.error(
              `${result.error} Versuche es in ${secondsUntilReset} Sekunde${secondsUntilReset > 1 ? 'n' : ''} erneut.`,
              { duration: 5000 }
            )
          }
        } else {
          toast.error(result.error || "Fehler beim Senden")
        }
      }
    } catch (error) {
      // Mark optimistic message as failed
      setOptimisticMessages(prev =>
        prev.map(m => m.id === tempId 
          ? { ...m, status: 'failed' as MessageStatus }
          : m
        )
      )
      console.error("Error sending message:", error)
      toast.error("Fehler beim Senden der Nachricht")
    } finally {
      setIsSending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!chatInfo) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Chat nicht gefunden</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background relative" data-chat-page>
      {/* Debug Panel (only in development) */}
      <CacheDebugPanel chatId={chatId} />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile: Zurück-Button */}
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="md:hidden flex-shrink-0"
            >
              <ArrowLeft className="size-5" />
            </Button>
          )}
          
          <div className="relative flex-shrink-0">
            <Avatar className="size-10">
              {chatInfo.avatar ? (
                <AvatarImage src={chatInfo.avatar} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(chatInfo.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{chatInfo.name}</h3>
            <div className="flex items-center gap-1">
              {chatInfo.username && (
                <p className="text-xs text-muted-foreground">@{chatInfo.username}</p>
              )}
              {/* Online status */}
              <div className="flex items-center gap-1">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  otherUserOnline ? "bg-green-500" : "bg-gray-300"
                )} />
                <span className="text-xs text-muted-foreground">
                  {otherUserOnline 
                    ? "online" 
                    : otherUserLastSeen 
                      ? `zuletzt gesehen ${formatRelativeTime(otherUserLastSeen)}`
                      : "offline"
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          {walletBalance !== null && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
              <Coins className="size-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {walletBalance.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Video className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <PhoneOff className="size-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profil anzeigen</DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden">Video-Anruf</DropdownMenuItem>
              <DropdownMenuItem className="sm:hidden">Anrufen</DropdownMenuItem>
              <DropdownMenuItem>Chat löschen</DropdownMenuItem>
              <DropdownMenuItem>Benachrichtigungen stummschalten</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area - WhatsApp Style: neueste unten */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-end py-4">
          {displayMessages.map((message) => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              isOwnMessage={message.senderId === currentUserId}
            />
          ))}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-4 mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
                </div>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} schreibt...`
                    : `${typingUsers.length} Personen schreiben...`}
                </span>
              </div>
            </div>
          )}
          
          {/* Scroll-Anker für Auto-Scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Sticky am unteren Rand */}
      <div className="border-t border-border flex-shrink-0">
        <ChatInput 
          onSend={handleSend} 
          onTyping={handleTyping}
          disabled={isSending} 
        />
      </div>
    </div>
  )
}
