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
import { type Message, getInitials } from "./chat-utils"
import { useRouter } from "next/navigation"
import {
  loadChatWithAllDataAction,
  sendTextMessageAction,
  markAsReadAction,
} from "@/app/home/chat/actions"
import { toast } from "sonner"
import type { ChatMessageWithSender } from "@/lib/supabase/chat"
import { useChatSubscription, type RealtimeMessage } from "@/hooks/use-chat-subscription"
import { useTypingIndicator } from "@/hooks/use-typing-indicator"

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
  }
}

export function ChatView({ chatId, showBackButton = false }: ChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
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

  const handleBack = () => {
    router.push('/home/chat')
  }

  // Auto-scroll zur neuesten Nachricht
  const scrollToBottom = (instant = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: instant ? "auto" : "smooth",
        block: "end"
      })
    }
  }

  // Load chat info and messages - OPTIMIZED: Single request with parallel queries
  React.useEffect(() => {
    async function loadChat() {
      setIsLoading(true)
      try {
        // Load all data in parallel (chat, messages, wallet) in ONE request
        const result = await loadChatWithAllDataAction(chatId)
        
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
          const uiMessages = result.messages.map(convertToUIMessage)
          setMessages(uiMessages)
          
          // Scroll to bottom after initial load (instant, no animation)
          setTimeout(() => {
            scrollToBottom(true)
            isInitialLoadRef.current = false
          }, 100)
        }

        // Set wallet balance
        if (result.walletBalance !== undefined) {
          setWalletBalance(result.walletBalance)
        }
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
      // Don't add if it's our own message (already added optimistically)
      if (realtimeMsg.sender_id === currentUserId) {
        return
      }

      // Check if message already exists (prevent duplicates)
      const exists = messages.some((m) => m.id === realtimeMsg.id)
      if (exists) return

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

      const uiMessage = convertToUIMessage(messageWithSender)
      setMessages((prev) => [...prev, uiMessage])

      // Mark as read
      await markAsReadAction(chatId)
    },
    [currentUserId, messages, chatId]
  )

  const { isConnected } = useChatSubscription({
    chatId,
    onMessage: handleRealtimeMessage,
    enabled: !isLoading && !!currentUserId,
  })

  const { typingUsers, sendTypingEvent } = useTypingIndicator({
    chatId,
    enabled: !isLoading && !!currentUserId,
  })


  // Scroll bei neuen Nachrichten (smooth, nicht beim initialen Laden)
  React.useEffect(() => {
    if (!isInitialLoadRef.current && messages.length > 0) {
      // Smooth scroll bei neuen Nachrichten
      setTimeout(() => scrollToBottom(false), 100)
    }
  }, [messages.length])

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isSending) return

    setIsSending(true)
    try {
      const result = await sendTextMessageAction(chatId, messageText)

      if (result.success && result.message) {
        // Add message to UI (optimistic update)
        const newMessage = convertToUIMessage(result.message)
        setMessages((prev) => [...prev, newMessage])

        // Update balance
        if (result.newBalance !== undefined) {
          setWalletBalance(result.newBalance)
        }

        toast.success("Nachricht gesendet (1 Credit abgezogen)")
      } else {
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
            {chatInfo.username && (
              <p className="text-xs text-muted-foreground">@{chatInfo.username}</p>
            )}
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
          {messages.map((message) => (
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
          onTyping={sendTypingEvent}
          disabled={isSending} 
        />
      </div>
    </div>
  )
}
