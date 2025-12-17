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
import { motion, useMotionValue, useTransform, PanInfo } from "motion/react"

interface ChatViewProps {
  chatId: string
  showBackButton?: boolean
}

export function ChatView({ chatId, showBackButton = false }: ChatViewProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isExiting, setIsExiting] = React.useState(false)
  const router = useRouter()
  const chats = generateDummyChats()
  const chat = chats.find((c) => c.id === chatId)

  // Swipe-Back-Geste für Mobile
  const x = useMotionValue(0)
  const opacity = useTransform(x, [0, 150], [1, 0.3])

  const handleBack = () => {
    // Animation starten
    setIsExiting(true)
    // Nach Animation zur Liste navigieren
    setTimeout(() => {
      router.push('/home/chat')
    }, 300) // Match transition duration
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Nur auf Mobile (md:hidden)
    if (window.innerWidth >= 768) return
    
    // Wenn nach rechts gewischt (>150px), zurück zur Liste
    if (info.offset.x > 150) {
      handleBack()
    }
  }

  React.useEffect(() => {
    if (chatId) {
      setMessages(generateDummyMessages(chatId))
    }
  }, [chatId])

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
    <motion.div 
      className="flex flex-col h-full bg-background"
      style={{ x: isExiting ? '100%' : x, opacity }}
      animate={isExiting ? { x: '100%', opacity: 0 } : {}}
      transition={isExiting ? { type: 'tween', duration: 0.3, ease: 'easeInOut' } : {}}
      drag={showBackButton && !isExiting ? "x" : false}
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={{ left: 0, right: 0.2 }}
      onDragEnd={handleDragEnd}
      dragDirectionLock
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto py-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSend} />
    </motion.div>
  )
}
