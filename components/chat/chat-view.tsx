"use client"

import * as React from "react"
import { Video, Phone, PhoneOff, MoreVertical, ArrowLeft } from "lucide-react"
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
import {
  generateDummyChats,
  generateDummyMessages,
  type Message,
} from "./chat-utils"
import { useRouter } from "next/navigation"

interface ChatViewProps {
  chatId: string
  showBackButton?: boolean
}

export function ChatView({ chatId, showBackButton = false }: ChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const router = useRouter()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const chats = generateDummyChats()
  const chat = chats.find((c) => c.id === chatId)

  const handleBack = () => {
    // Direkt zur Liste navigieren ohne Animation
    router.push('/home/chat')
  }

  // Auto-scroll zur neuesten Nachricht
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    if (chatId) {
      setMessages(generateDummyMessages(chatId))
    }
  }, [chatId])

  // Scroll beim Laden und bei neuen Nachrichten
  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = (messageText: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      type: "text",
      content: messageText,
      timestamp: new Date(),
      read: false,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  if (!chat) {
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
              {chat.participant.avatar ? (
                <AvatarImage src={chat.participant.avatar} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {chat.participant.initials}
              </AvatarFallback>
            </Avatar>
            {chat.participant.online && (
              <div className="absolute bottom-0 right-0 size-3 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{chat.participant.name}</h3>
            <p className="text-xs text-green-500">Online</p>
          </div>
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
      <div className="flex-1 overflow-y-auto pb-[180px] md:pb-4">
        <div className="min-h-full flex flex-col justify-end py-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {/* Scroll-Anker für Auto-Scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Sticky am unteren Rand auf Mobile */}
      <div className="fixed md:relative bottom-16 md:bottom-0 left-0 right-0 md:left-auto md:right-auto z-40">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  )
}
